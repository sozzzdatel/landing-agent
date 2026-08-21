// api/generate.js — бриф → конфиг лендинга.
// Если указан URL сайта-референса и задан OPENROUTER_KEY: агент делает бесплатный
// ПОЛНОРАЗМЕРНЫЙ скриншот сайта (microlink.io) и отдаёт его Claude Haiku (vision,
// через OpenRouter) — модель реально смотрит на всю страницу и возвращает не только
// цвета, но и композицию: какие блоки есть, в каком порядке, сколько колонок,
// выравнивание. Это реально меняет сборку лендинга, а не только красит его.
// Без ключа — тихий откат на анализ CSS-кода (грубее, но тоже бесплатно).

const { BRANDS, renderLanding, configFromPreset } = require("../lib/engine");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const VISION_MODEL = "anthropic/claude-haiku-4.5"; // дешёвый анализ цветов/стиля
const LAYOUT_MODEL = "anthropic/claude-sonnet-5"; // сильная модель для реальной композиции вёрстки

// Бесплатный ПОЛНОРАЗМЕРНЫЙ скриншот через microlink.io (без ключа, публичный API).
async function screenshotUrl(url) {
  const api = "https://api.microlink.io/?url=" + encodeURIComponent(url)
    + "&screenshot=true&meta=false&viewport.width=1280&viewport.height=2600&waitForTimeout=1500";
  const r = await fetch(api, { signal: AbortSignal.timeout(20000) });
  const d = await r.json();
  if (d.status !== "success" || !d.data?.screenshot?.url) throw new Error("Не удалось получить скриншот");
  return d.data.screenshot.url;
}

// Реальный визуальный анализ композиции скриншота через Claude Haiku (vision).
async function analyzeWithVision(imageUrl) {
  const prompt = `Это полный скриншот лендинга (вся страница сверху донизу). Разбери его КОМПОЗИЦИЮ, а не только цвета.
Верни СТРОГО JSON без markdown и пояснений:
{
  "acc":"#hex основной фирменный цвет кнопок/акцентов",
  "acc2":"#hex второй акцентный цвет",
  "bg":"#hex ФОН ИМЕННО ПЕРВОГО ЭКРАНА (hero, самый верх страницы) — не усредняй по всей странице! Если верх фиолетовый/цветной/градиент — так и пиши, даже если ниже на странице фон белый",
  "bgGradient": true или false — фон это градиент из 2 цветов,
  "bg2":"#hex второй цвет градиента фона, если bgGradient true",
  "radius":"sharp или rounded",
  "heroAlign":"center или left",
  "heroHasVisual": true или false — есть ли в первом экране картинка/иллюстрация рядом с текстом,
  "heroVisualPrompt":"если heroHasVisual true — короткое описание НА АНГЛИЙСКОМ для генерации похожей картинки нейросетью, 6-10 слов, в стиле референса (напр. '3d abstract purple gradient product mockup neon accents floating shapes')",
  "featureColumns": 2 или 3 или 4,
  "density":"compact или spacious",
  "blocksOrder": ["массив из подмножества и в том порядке, как реально идут на странице ПОСЛЕ первого экрана: stats, logos, features, steps, testimonials, faq, pricing, cta — включай только то, что реально видишь, в реальном порядке"]
}`;
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      }],
      max_tokens: 500,
    }),
  });
  const d = await r.json();
  const text = d.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json/gi, "").replace(/```/g, "");
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(s, e + 1));
}

// Бесплатный запасной вариант без ключа: реальные цвета из CSS-кода сайта (без композиции).
async function analyzeSiteCss(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; LandingAgent/1.0)" } });
  clearTimeout(timer);
  const html = await r.text();
  let cssText = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join("\n");
  const linkHrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const href of linkHrefs.slice(0, 2)) {
    try {
      const abs = new URL(href, url).href;
      const cr = await fetch(abs, { signal: AbortSignal.timeout(4000) });
      cssText += "\n" + (await cr.text());
    } catch (_) {}
  }
  const hexes = cssText.match(/#[0-9a-fA-F]{6}\b/g) || [];
  const freq = {};
  for (const h of hexes) {
    const c = h.toLowerCase();
    if (["#ffffff", "#000000"].includes(c)) continue;
    freq[c] = (freq[c] || 0) + 1;
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);
  if (!top.length) return null;
  return { acc: top[0], acc2: top[1] || top[0], method: "css" };
}

// Второй проход: модель САМА пишет HTML для середины лендинга, максимально повторяя
// композицию референса (карточки людей с фото-заглушками, таблетки-фильтры и т.д.),
// используя реальный текст бренда. Если не получится — тихий откат на блочный движок.
//
// ДВА ШАГА (важно для точности): сначала модель СЛОВАМИ описывает каждый нестандартный
// виджет, который видит (карусель, разноцветная сетка, шаги со скриншотами и т.д.) —
// это заставляет её реально всмотреться, а не сразу писать привычный типовой HTML.
// Второй шаг — реализация ИМЕННО того, что описано в плане.

async function planComposition(imageUrl) {
  const prompt = `Посмотри на скриншот лендинга (вся страница). Опиши СЛОВАМИ, секция за секцией, сверху вниз (после первого экрана, до футера), что там РЕАЛЬНО находится.
Для каждой секции укажи: точный фон (hex или "белый"/"чёрный"/градиент), и КОНКРЕТНЫЙ тип виджета — не обобщай, называй прямо то, что видишь:
"карусель с точками-индикаторами и стрелками", "сетка 2x2 где 2 карточки ярко-жёлтые/выделены, а 2 обычные белые", "3 шага, в каждом реальный скриншот интерфейса в рамке с тенью", "чат-виджет с иконками функций в ряд", "простой текст в две колонки без рамок", "бегущая строка логотипов", "аккордеон вопрос-ответ" и т.п. — то есть максимально конкретно и честно, даже если это необычный виджет.
Не пропускай необычные детали (индикаторы-точки, стрелки навигации, выделение цветом отдельных элементов в группе, реальные скриншоты/фото внутри блоков).
Верни обычным текстом, списком по секциям, без HTML и без JSON — просто чёткое словесное ТЗ для верстальщика.`;
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(40000),
    body: JSON.stringify({
      model: LAYOUT_MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      }],
      max_tokens: 1500,
    }),
  });
  const d = await r.json();
  const text = d.choices?.[0]?.message?.content || "";
  if (!text || text.length < 30) throw new Error("Пустой план композиции");
  return text;
}

async function generateCustomBody(imageUrl, content) {
  const plan = await planComposition(imageUrl);

  const prompt = `Ты верстальщик. Вот словесное ТЗ по композиции референса (ниже) и текстовый контент бренда (JSON ниже).
Реализуй ТОЧНО то, что описано в ТЗ — HTML для СЕРЕДИНЫ страницы (между hero и футером).

СЛОВЕСНОЕ ТЗ ПО КОМПОЗИЦИИ (реализуй буквально каждый пункт, ничего не упрощай до типовой сетки карточек, если в ТЗ описано иначе):
${plan}

КАК РЕАЛИЗОВАТЬ НЕСТАНДАРТНЫЕ ВИДЖЕТЫ (это реальный работающий HTML/CSS, без JS-фреймворков):
- Карусель: <div style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:20px">...карточки со style="scroll-snap-align:center;flex:0 0 100%"...</div>, точки-индикаторы — просто ряд маленьких <span> кружков под каруселью (визуально, без логики).
- Разноцветная сетка (часть карточек выделена): задавай РАЗНЫЙ background каждой карточке явно (например 2 карточки var(--acc2) или яркий hex, остальные var(--soft)) — именно так, как в ТЗ.
- Шаги со скриншотами: картинка-заглушка внутри рамки: <img src="https://placehold.co/500x320/f2f2f2/999?text=Screenshot" style="width:100%;border-radius:var(--radius);box-shadow:0 8px 24px rgba(0,0,0,.15)">.
- Чат/иконки в ряд: просто flex-ряд из emoji+подпись.

ТЕХНИЧЕСКИЕ ПРАВИЛА:
- Кнопки/CTA — background:var(--acc), color:var(--acc-ink).
- Каждой секции — явный background-color (как описано в ТЗ) и явный color текста с читаемым контрастом на этом фоне.
- Если в ТЗ есть карточки людей — фото https://i.pravatar.cc/300?img=N (N от 1 до 70, разное на каждой).
- Заголовки секций — <h2 class="h2"> с явным color. Не используй <h1> в середине.
- Используй РЕАЛЬНЫЙ текст бренда из JSON ниже — не выдумывай другой оффер, только повторяй структуру из ТЗ.
- Включи хотя бы один явный CTA (кнопка со ссылкой ${content.ref}).
- Каждая секция — <section style="padding:64px 0;background:..."><div style="max-width:1100px;margin:0 auto;padding:0 22px">...</div></section>.
- Верни ТОЛЬКО HTML-фрагмент. Без markdown, без \`\`\`, без <html>/<head>/<body>/<script>, без пояснений.

JSON контента бренда:
${JSON.stringify(content)}`;
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(55000),
    body: JSON.stringify({
      model: LAYOUT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
    }),
  });
  const d = await r.json();
  let html = d.choices?.[0]?.message?.content || "";
  html = html.replace(/```html/gi, "").replace(/```/g, "").trim();
  if (!html || html.length < 100 || /<script/i.test(html)) throw new Error("Пустой или небезопасный ответ");
  return html;
}

async function analyzeSite(url) {
  if (!url) return null;
  if (process.env.OPENROUTER_KEY) {
    try {
      const shot = await screenshotUrl(url);
      const vis = await analyzeWithVision(shot);
      return { ...vis, method: "vision", screenshot: shot };
    } catch (e) {
      try { const css = await analyzeSiteCss(url); return { ...(css||{}), visionError: e.message }; } catch (_) { return { error: e.message }; }
    }
  }
  try { return await analyzeSiteCss(url); } catch (e) { return { error: e.message }; }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const brief = req.body || {};
    const config = configFromPreset(brief);

    const site = await analyzeSite(brief.url);
    if (site && (site.acc || site.acc2)) {
      config.styleOverride = {};
      if (site.acc) config.styleOverride.acc = site.acc;
      if (site.acc2) config.styleOverride.acc2 = site.acc2;
      if (site.bg && !/^#(ffffff|fff)$/i.test(site.bg)) config.styleOverride.bg = site.bg;
      if (site.bgGradient && site.bg2) config.styleOverride.bg2 = site.bg2;
      if (site.heroHasVisual && site.heroVisualPrompt) {
        config.heroImage = "https://image.pollinations.ai/prompt/" + encodeURIComponent(site.heroVisualPrompt) + "?width=800&height=800&nologo=true";
      }
      if (site.radius === "sharp") config.styleOverride.radius = "6px";
      if (site.radius === "rounded") config.styleOverride.radius = "22px";
      if (site.heroAlign === "center") config.styleOverride.heroAlign = "center";
      if ([2, 3, 4].includes(site.featureColumns)) config.styleOverride.featureColumns = site.featureColumns;
      if (site.density === "spacious") config.styleOverride.spacious = true;
      if (Array.isArray(site.blocksOrder) && site.blocksOrder.length) config.styleOverride.blocksOrder = site.blocksOrder;

      // Второй проход: пробуем сгенерировать реальную кастомную вёрстку под референс.
      // Если не получится (таймаут/ошибка/мусор) — тихо остаёмся на надёжном блочном движке.
      if (process.env.OPENROUTER_KEY && site.screenshot) {
        try {
          config.customMiddleHtml = await generateCustomBody(site.screenshot, {
            ref: config.ref, promo: config.promo, discount: config.discount,
            h1: config.h1, sub: config.sub, cta: config.cta,
            toolsTitle: config.toolsTitle, toolsDesc: config.toolsDesc, tools: config.tools,
            stats: config.stats, steps: config.steps, faq: config.faq, finalTitle: config.finalTitle,
          });
        } catch (_) { /* остаёмся на блочном движке */ }
      }
    }

    const html = renderLanding(config, true);
    return res.status(200).json({ config, html, siteAnalysis: site });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
