// api/generate.js — бриф → конфиг лендинга.
// Если указан URL сайта-референса и задан OPENROUTER_KEY: агент делает бесплатный
// ПОЛНОРАЗМЕРНЫЙ скриншот сайта (microlink.io) и отдаёт его Claude Haiku (vision,
// через OpenRouter) — модель реально смотрит на всю страницу и возвращает не только
// цвета, но и композицию: какие блоки есть, в каком порядке, сколько колонок,
// выравнивание. Это реально меняет сборку лендинга, а не только красит его.
// Без ключа — тихий откат на анализ CSS-кода (грубее, но тоже бесплатно).

const { BRANDS, renderLanding, configFromPreset } = require("../lib/engine");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const VISION_MODEL = "anthropic/claude-haiku-4.5";

// Бесплатный ПОЛНОРАЗМЕРНЫЙ скриншот через microlink.io (без ключа, публичный API).
async function screenshotUrl(url) {
  const api = "https://api.microlink.io/?url=" + encodeURIComponent(url)
    + "&screenshot=true&meta=false&viewport.width=800&viewport.height=2400&waitForTimeout=1200";
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
async function generateCustomBody(imageUrl, content) {
  const prompt = `Ты верстальщик-копировщик. Вот скриншот лендинга-референса (вся страница сверху вниз) и текстовый контент бренда (JSON ниже).

ТВОЯ ЗАДАЧА: пройди по скриншоту СЕКЦИЯ ЗА СЕКЦИЕЙ сверху вниз (после первого экрана, который уже сделан отдельно, и до футера) и для КАЖДОЙ секции:
1. Определи её РЕАЛЬНЫЙ тип композиции, глядя на картинку (не выбирай "по умолчанию"):
   - plain — просто заголовок+текст без рамок/карточек (два столбца или один), если так на референсе;
   - cards — сетка карточек с рамкой/фоном/тенью (только если на референсе ДЕЙСТВИТЕЛЬНО видны отдельные карточки);
   - big-panel — один-два больших цветных блока на всю ширину/половину экрана с текстом и картинкой внутри (частый паттерн у продуктовых лендингов);
   - tabs — переключаемые вкладки/пилюли над контентом;
   - ticker — бегущая строка логотипов/названий;
   - people — карточки людей с фото;
   - faq — аккордеон вопрос-ответ.
2. Определи ТОЧНЫЙ фон и цвет текста именно этой секции по картинке (у разных секций referencа фон часто РАЗНЫЙ: белый/чёрный/лайм/фиолетовый чередуются — повтори это чередование, не заливай всё одним цветом).
3. Воспроизведи именно этот тип композиции с этим фоном, наполнив его РЕАЛЬНЫМ текстом бренда из JSON (не референса — только структуру и стиль референса, текст — бренда).

ВАЖНО, ЧАСТЫЕ ОШИБКИ, КОТОРЫХ НЕ ДОЛЖНО БЫТЬ:
- НЕ превращай всё подряд в одинаковую сетку из мелких белых карточек с иконкой — это НЕПРАВИЛЬНО, если на референсе большие цветные блоки, вкладки или простой текст без рамок.
- Если на референсе секция — это два больших цветных блока (например, фиолетовый и лаймовый) с крупным заголовком и текстом внутри — сделай именно два больших <div style="background:#hex;border-radius:var(--radius);padding:40px"> блока рядом (grid-template-columns:1fr 1fr), а не мелкие карточки.
- Если на референсе просто текст рядом с текстом (без фона/рамки) — не добавляй фон/рамку от себя.
- Если на референсе есть вкладки (табы) — сделай реальные визуальные табы (ряд кнопок, одна активная с явным выделением var(--acc) или явным фоном) над контентным блоком.
- Числа/цифры-статистику показывай крупным жирным шрифтом БЕЗ рамки, если на референсе они просто на фоне секции, а не в отдельных карточках.

ТЕХНИЧЕСКИЕ ПРАВИЛА:
- Кнопки/CTA — background:var(--acc), color:var(--acc-ink) (уже даёт правильный контраст).
- Каждой секции задавай явный background-color (hex, который видишь на референсе) и явный color текста, обеспечивающий контраст именно на этом фоне.
- Если делаешь карточки людей/экспертов — фото https://i.pravatar.cc/300?img=N (N от 1 до 70, разное на каждой).
- Если карточки функций без фото — emoji как иконка (font-size:32px).
- Заголовки секций — <h2 class="h2"> с явным color под фон секции. Не используй <h1> в середине.
- Используй РЕАЛЬНЫЙ текст бренда из JSON ниже — не выдумывай другой оффер, только повторяй структуру/стиль референса.
- Включи хотя бы один блок с явным CTA (кнопка со ссылкой ${content.ref}).
- Каждая секция — <section style="padding:64px 0;background:...(явный hex этой секции)..."><div style="max-width:1100px;margin:0 auto;padding:0 22px">...</div></section>.
- Верни ТОЛЬКО HTML-фрагмент. Без markdown, без \`\`\`, без <html>/<head>/<body>/<script>, без пояснений.

JSON контента:
${JSON.stringify(content)}`;
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      }],
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
      try { return await analyzeSiteCss(url); } catch (_) { return { error: e.message }; }
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
