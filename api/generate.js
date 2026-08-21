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
  const prompt = `Ты верстальщик. Вот скриншот лендинга-референса и текстовый контент бренда (JSON ниже).
Напиши HTML для СЕРЕДИНЫ страницы (между hero и футером), максимально повторяя типы блоков, композицию и стиль референса.

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА (не пожелания, а требования):
- ЛЮБОЙ список из нескольких похожих пунктов (фичи, шаги, преимущества, тарифы, отзывы) ОБЯЗАН быть оформлен как визуальные карточки, никогда не голым текстом/списком. Каждая карточка ОБЯЗАНА иметь строку стилей ровно такую:
  style="background:var(--soft);border:1px solid var(--line);border-radius:var(--radius);padding:28px"
  и располагаться в контейнере с style="display:grid;grid-template-columns:repeat(N,1fr);gap:18px" (N — как на референсе, обычно 2-4).
- Если на референсе карточки людей/экспертов с фото — используй фото https://i.pravatar.cc/300?img=N (N от 1 до 70, разное число на каждой карточке), фото оборачивай в div со style="border-radius:var(--radius);overflow:hidden".
- Если карточки функций/фич без фото — используй emoji как иконку (font-size:32px) над заголовком карточки.
- Если есть таблетки-фильтры/теги — сделай их: <span style="background:var(--soft);border:1px solid var(--line);border-radius:20px;padding:8px 16px;display:inline-block">.
- Для заголовков блоков используй class="h2" на <h2> (даёт правильный адаптивный размер, не задавай свой font-size на h2/h3 вручную). Для вводного текста под заголовком — class="desc". Не используй <h1> нигде в середине страницы (h1 только один раз в hero).
- Никогда не задавай color вручную на тексте — оставляй унаследованным (он уже правильный из-за var(--ink)/var(--bg) на body). Если очень нужно — используй ТОЛЬКО var(--ink) или var(--mut), никогда свой hex и никогда var(--acc)/var(--acc2) на обычном тексте (только на кнопках/акцентах).
- Используй ТОЛЬКО эти цвета через CSS-переменные, не выдумывай новых hex: var(--acc), var(--acc2), var(--bg), var(--soft), var(--line), var(--ink), var(--mut). Радиус скруглений: var(--radius).
- Используй РЕАЛЬНЫЙ текст бренда из JSON ниже (заголовки, буллеты, вопросы) — не выдумывай другой оффер, только оформляй его в стиле референса.
- Всегда включи блок с призывом к действию (кнопка: <a href="${content.ref}" style="background:var(--acc);color:#fff;padding:14px 24px;border-radius:calc(var(--radius) - 4px);display:inline-block;font-weight:600">) хотя бы один раз.
- Каждый крупный блок — <section style="padding:72px 0"><div style="max-width:1100px;margin:0 auto;padding:0 22px">...</div></section>.
- Верни ТОЛЬКО HTML-фрагмент. Без markdown, без \`\`\`, без <html>/<head>/<body>/<script>, без пояснений.

JSON контента:
${JSON.stringify(content)}`;
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      }],
      max_tokens: 3000,
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
