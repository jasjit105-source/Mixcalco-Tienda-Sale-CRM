// Config comes from Netlify environment variables (Site settings > Environment variables).
// SAHIBA_API_BASE   - the SQL API base URL (ngrok/hosted).
// SAHIBA_API_TOKEN  - the bearer token for the SQL API.
// ALLOWED_ORIGIN    - the site origin allowed to call this proxy.
// The fallbacks below keep the site working until the env vars are set. The token is
// already public in git history, so rotate it, set SAHIBA_API_TOKEN in Netlify, then delete the fallback.
const API_BASE = process.env.SAHIBA_API_BASE || "https://aggrievedly-spryest-hattie.ngrok-free.dev";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://mixcalco-tienda-sale-crm.netlify.app";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Vary": "Origin"
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ status: "error", message: "Method not allowed" }) };
  }
  try {
    const token = process.env.SAHIBA_API_TOKEN || "Sahiba_CZSfEghwaD4s";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let res;
    try {
      res = await fetch(API_BASE + "/V1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "ngrok-skip-browser-warning": "true" },
        body: event.body,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }
    const data = await res.text();
    // When the ngrok tunnel is down, ngrok answers with its own HTML 404 page.
    // Translate that into a clear message instead of passing raw HTML to the app.
    if (!res.ok && /<html/i.test(data) && /ngrok/i.test(data)) {
      return { statusCode: 503, headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders()), body: JSON.stringify({ status: "error", message: "The store data server is OFFLINE — the ngrok tunnel is not running. Start the tunnel program on the store computer (and check its internet), then refresh this page." }) };
    }
    return { statusCode: res.status, headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders()), body: data };
  } catch (e) {
    const msg = e.name === "AbortError" ? "The data server did not respond (timeout). Please try again." : e.message;
    return { statusCode: 502, headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders()), body: JSON.stringify({ status: "error", message: msg }) };
  }
};
