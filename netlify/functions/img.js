// Image proxy for the Excel Photos tab: serves a Google Drive image by file id
// same-origin, so the browser can read its bytes even if lh3 CORS is blocked.
exports.handler = async (event) => {
  const id = (event.queryStringParameters || {}).id || "";
  if (!/^[\w-]{10,80}$/.test(id)) {
    return { statusCode: 400, body: JSON.stringify({ error: "bad id" }) };
  }
  try {
    const res = await fetch("https://lh3.googleusercontent.com/d/" + id + "=w400", { redirect: "follow" });
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: "upstream " + res.status }) };
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": res.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=86400" },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: e.message }) };
  }
};
