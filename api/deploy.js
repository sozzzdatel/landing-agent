// api/deploy.js — html → живой лендинг на поддомене (Vercel REST API, без git).
// ENV: VERCEL_TOKEN (обяз.), VERCEL_TEAM_ID (если команда), BASE_DOMAIN (напр. study24.ai)
// Разово: добавь wildcard-домен *.BASE_DOMAIN к проекту lp-partners в дашборде Vercel.

const API = "https://api.vercel.com";

async function vfetch(path, opts = {}) {
  const team = process.env.VERCEL_TEAM_ID ? (path.includes("?") ? "&" : "?") + "teamId=" + process.env.VERCEL_TEAM_ID : "";
  const r = await fetch(API + path + team, {
    ...opts,
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.VERCEL_TOKEN) return res.status(500).json({ error: "VERCEL_TOKEN не задан в env" });
  try {
    const { subdomain, html, partner = "", niche = "" } = req.body || {};
    if (!subdomain || !html) return res.status(400).json({ error: "subdomain и html обязательны" });
    const base = process.env.BASE_DOMAIN || "study24.ai";
    const project = "lp-partners";
    const alias = `${subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "")}.${base}`;

    const dep = await vfetch("/v13/deployments?forceNew=1", {
      method: "POST",
      body: JSON.stringify({
        name: project, project, target: "production",
        files: [{ file: "index.html", data: html, encoding: "utf-8" }],
        projectSettings: { framework: null },
        meta: { partner, niche },
      }),
    });

    await vfetch(`/v2/deployments/${dep.id}/aliases`, { method: "POST", body: JSON.stringify({ alias }) });

    return res.status(200).json({ url: alias, vercelUrl: dep.url, deploymentId: dep.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
