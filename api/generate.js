// api/generate.js — бриф → конфиг лендинга.
// Если задан ANTHROPIC_API_KEY: агент дополнительно пишет копирайт через ИИ.
// Всегда (бесплатно, без ключа): если указан URL сайта-референса — агент реально
// скачивает его CSS и вытаскивает оттуда доминирующие цвета и шрифт, накладывая
// их на лендинг вместо стандартной палитры бренда. Это не подделка — цвета настоящие.

const { BRANDS, renderLanding, configFromPreset } = require("../lib/engine");

// Бесплатный визуальный анализ сайта-референса: реальный fetch CSS, без ИИ.
async function analyzeSiteStyle(url) {
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LandingAgent/1.0; +https://vercel.com)" },
    });
    clearTimeout(timer);
    const html = await r.text();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().slice(0, 80) : "";

    // Инлайновые <style> блоки — сразу в html.
    let cssText = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join("\n");

    // Первые 2 подключённых стиля — реально скачиваем.
    const linkHrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
    for (const href of linkHrefs.slice(0, 2)) {
      try {
        const abs = new URL(href, url).href;
        const cr = await fetch(abs, { signal: AbortSignal.timeout(4000) });
        cssText += "\n" + (await cr.text());
      } catch (_) { /* пропускаем недоступный файл стилей */ }
    }

    // Частотный анализ hex-цветов (без чёрного/белого — это не бренд-цвет).
    const hexes = cssText.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const freq = {};
    for (const h of hexes) {
      const c = h.toLowerCase();
      if (["#ffffff", "#000000", "#fefefe", "#010101"].includes(c)) continue;
      freq[c] = (freq[c] || 0) + 1;
    }
    const topColors = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);

    // Частотный анализ шрифта.
    const fontDecls = cssText.match(/font-family\s*:\s*([^;}"']+)/gi) || [];
    const fontFreq = {};
    for (const f of fontDecls) {
      const name = f.replace(/font-family\s*:\s*/i, "").split(",")[0].replace(/['"]/g, "").trim();
      if (!name || /^(inherit|initial|unset|serif|sans-serif)$/i.test(name)) continue;
      if (name.startsWith("var(")) continue; // это ссылка на CSS-переменную, а не реальный шрифт
      fontFreq[name] = (fontFreq[name] || 0) + 1;
    }
    const topFont = Object.entries(fontFreq).sort((a, b) => b[1] - a[1])[0];

    if (!topColors.length && !topFont) return { title, found: false };
    return { title, found: true, colors: topColors, font: topFont ? topFont[0] : null };
  } catch (e) {
    return { found: false, error: e.message };
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const brief = req.body || {};
    const config = configFromPreset(brief);

    const siteStyle = await analyzeSiteStyle(brief.url);
    if (siteStyle && siteStyle.found) {
      config.styleOverride = {};
      if (siteStyle.colors[0]) config.styleOverride.acc = siteStyle.colors[0];
      if (siteStyle.colors[1]) config.styleOverride.acc2 = siteStyle.colors[1];
      if (siteStyle.font) config.styleOverride.bodyFont = `'${siteStyle.font}', sans-serif`;
    }

    const html = renderLanding(config, true);
    return res.status(200).json({ config, html, siteStyle });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
