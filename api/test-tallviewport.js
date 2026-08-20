module.exports = async (req, res) => {
  const target = "https://vercel.com";
  const api = "https://api.microlink.io/?url=" + encodeURIComponent(target) + "&screenshot=true&meta=false&viewport.width=1280&viewport.height=4000&waitForTimeout=1000";
  try {
    const r = await fetch(api, { signal: AbortSignal.timeout(20000) });
    const d = await r.json();
    return res.status(200).json({ status: d.status, screenshotUrl: d.data?.screenshot?.url || null, raw: d.data?.screenshot || null });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};
