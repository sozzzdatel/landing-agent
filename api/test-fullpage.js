module.exports = async (req, res) => {
  const target = "https://vercel.com";
  const variants = {
    dot_fullpage: "https://api.microlink.io/?url=" + encodeURIComponent(target) + "&screenshot=true&meta=false&screenshot.fullPage=true",
    top_fullpage: "https://api.microlink.io/?url=" + encodeURIComponent(target) + "&screenshot=true&meta=false&fullPage=true",
    element_body: "https://api.microlink.io/?url=" + encodeURIComponent(target) + "&screenshot=true&meta=false&screenshot.element=body",
  };
  const out = {};
  for (const [name, api] of Object.entries(variants)) {
    try {
      const r = await fetch(api, { signal: AbortSignal.timeout(15000) });
      const d = await r.json();
      out[name] = { status: d.status, screenshotUrl: d.data?.screenshot?.url || null };
    } catch (e) {
      out[name] = { error: e.message };
    }
  }
  return res.status(200).json(out);
};
