// api/test-gateway.js — разовая проверка: достижим ли внутренний шлюз с серверов Vercel.
module.exports = async (req, res) => {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch("https://llm-gateway.a24.biz/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: "Bearer " + (process.env.GATEWAY_KEY || ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/aion-labs/aion-3.0-mini",
        messages: [{ role: "user", content: "привет" }],
        max_tokens: 50,
      }),
    });
    clearTimeout(timer);
    const text = await r.text();
    return res.status(200).json({ reached: true, status: r.status, body: text.slice(0, 500) });
  } catch (e) {
    return res.status(200).json({ reached: false, error: e.message, cause: e.cause ? String(e.cause) : null });
  }
};
