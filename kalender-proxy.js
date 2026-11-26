// Cloudflare Worker: holt deinen Kalender (.ics) und gibt ihn an das JARVIS-Dashboard weiter.
// Nötig, weil iCloud und Google den direkten Abruf aus dem Browser blockieren (CORS).
// Einrichtung: dash.cloudflare.com › Workers & Pages › Create › "Hello World" Worker › Code ersetzen › Deploy.
// Danach in JARVIS › ⚙ SETUP › Kalender-Proxy eintragen:  https://<dein-worker>.workers.dev/?url=

const ERLAUBTE_HOSTS = [/\.icloud\.com$/, /^calendar\.google\.com$/, /^outlook\.(live|office365)\.com$/];
const ERLAUBTE_SEITE = "https://davelli23.github.io";

export default {
  async fetch(req) {
    const cors = { "Access-Control-Allow-Origin": ERLAUBTE_SEITE, "Cache-Control": "no-store" };
    const ziel = new URL(req.url).searchParams.get("url");
    if (!ziel) return new Response("url fehlt", { status: 400, headers: cors });
    let u;
    try { u = new URL(ziel.replace(/^webcals?:\/\//i, "https://")); } catch { return new Response("ungültige url", { status: 400, headers: cors }); }
    if (u.protocol !== "https:" || !ERLAUBTE_HOSTS.some(h => h.test(u.hostname)))
      return new Response("Host nicht erlaubt", { status: 403, headers: cors });
    const r = await fetch(u.toString(), { headers: { "User-Agent": "Mozilla/5.0 JARVIS-Kalender" } });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, "Content-Type": "text/calendar; charset=utf-8" } });
  },
};
