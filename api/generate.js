// api/generate.js — бриф → конфиг лендинга.
// Если задан ANTHROPIC_API_KEY: агент ресёрчит партнёра и пишет копирайт.
// Если ключа нет: работает на пресетах (тоже полностью автономно).

const { BRANDS, NICHES, renderLanding, configFromPreset } = require("../lib/engine");

async function claudeConfig(brief) {
  const niches = Object.entries(NICHES).map(([k, n]) => `${k} (${n.label})`).join(", ");
  const b = BRANDS[brief.product] || BRANDS.studyai;
  const prompt = `Ты — маркетолог партнёрской программы. Продукт: ${b.name}. Партнёр/канал: ${brief.partner || "—"}. Ссылка партнёра: ${brief.url || "—"}.
Выбери одну нишу из: ${niches}. Напиши живой продающий копирайт на русском под эту аудиторию.
Верни СТРОГО JSON без markdown:
{"niche":"ключ","eyebrow":"≤7 слов","h1":"≤8 слов","sub":"1 предложение","cta":"2-3 слова","discount":"−15%","toolsTitle":"заголовок","toolsDesc":"1 предложение","tools":[{"t":"","d":""},{"t":"","d":""},{"t":"","d":""},{"t":"","d":""}],"stats":[{"v":"","l":""},{"v":"","l":""},{"v":"","l":""},{"v":"","l":""}],"steps":[{"t":"","d":""},{"t":"","d":""},{"t":"","d":""}],"faq":[{"q":"","a":""},{"q":"","a":""},{"q":"","a":""}],"finalTitle":"≤7 слов"}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
      tools: brief.url ? [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }] : undefined,
    }),
  });
  const data = await r.json();
  const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n");
  const clean = text.replace(/```json/gi, "").replace(/```/g, "");
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  const gen = JSON.parse(clean.slice(s, e + 1));
  if (!NICHES[gen.niche]) gen.niche = "general";
  return Object.assign({ brand: brief.product, ref: brief.ref, promo: brief.promo }, gen);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const brief = req.body || {};
    let config;
    if (process.env.ANTHROPIC_API_KEY) {
      try { config = await claudeConfig(brief); }
      catch (e) { config = configFromPreset(brief); config._fallback = "ai_error:" + e.message; }
    } else {
      config = configFromPreset(brief);
    }
    const html = renderLanding(config, true);
    return res.status(200).json({ config, html, ai: !!process.env.ANTHROPIC_API_KEY });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
