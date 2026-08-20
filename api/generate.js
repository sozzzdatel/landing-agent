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
  "radius":"sharp или rounded — острые или скруглённые углы",
  "heroAlign":"center или left — как выровнен текст в первом экране",
  "featureColumns": 2 или 3 или 4 — сколько колонок в сетке карточек преимуществ (если есть),
  "density":"compact или spacious — насколько плотно расположены блоки",
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
      if (site.radius === "sharp") config.styleOverride.radius = "6px";
      if (site.radius === "rounded") config.styleOverride.radius = "22px";
      if (site.heroAlign === "center") config.styleOverride.heroAlign = "center";
      if ([2, 3, 4].includes(site.featureColumns)) config.styleOverride.featureColumns = site.featureColumns;
      if (site.density === "spacious") config.styleOverride.spacious = true;
      if (Array.isArray(site.blocksOrder) && site.blocksOrder.length) config.styleOverride.blocksOrder = site.blocksOrder;
    }

    const html = renderLanding(config, true);
    return res.status(200).json({ config, html, siteAnalysis: site });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
