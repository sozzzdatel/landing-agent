// api/edit.js — правки готового лендинга по текстовой команде.
// Принимает текущий HTML целиком + инструкцию, возвращает обновлённый HTML целиком.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const EDIT_MODEL = "anthropic/claude-sonnet-5";

async function safeJson(r, label = "API") {
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch (_) { throw new Error(`${label} вернул не JSON: ${raw.slice(0, 300)}`); }
  if (!r.ok) throw new Error(data?.error?.message || data?.error || `${label} HTTP ${r.status}`);
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { html, instruction } = req.body || {};
    if (!html || !instruction) return res.status(400).json({ error: "html и instruction обязательны" });
    if (!process.env.OPENROUTER_KEY) return res.status(400).json({ error: "OPENROUTER_KEY не задан — правки недоступны" });

    const prompt = `Вот HTML-документ готового лендинга целиком. Пользователь просит внести правку:

"${instruction}"

ПРАВИЛА:
- Внеси ТОЛЬКО то, что просит правка. Всё остальное оставь как есть, не переписывай заново то, что не просили менять.
- Сохрани структуру документа (<!DOCTYPE>, <head>, <style>, скрипты в конце body) без изменений, если правка не касается их напрямую.
- Если просят поменять цвет — правь конкретные hex/CSS-переменные, не трогай текст.
- Если просят подвинуть/убрать/добавить блок — работай с HTML-разметкой, сохраняя остальные секции нетронутыми.
- Верни ПОЛНЫЙ обновлённый HTML-документ целиком (с <!DOCTYPE html> и до </html>), без markdown, без \`\`\`, без пояснений до/после.

ИСХОДНЫЙ HTML:
${html}`;

    const r = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENROUTER_KEY, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(55000),
      body: JSON.stringify({
        model: EDIT_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8000,
      }),
    });
    const d = await safeJson(r, "OpenRouter");
    let out = d.choices?.[0]?.message?.content || "";
    out = out.replace(/```html/gi, "").replace(/```/g, "").trim();
    if (!out || out.length < 200 || !/<html/i.test(out)) throw new Error("Модель вернула пустой или некорректный HTML");

    return res.status(200).json({ html: out });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
