// Minimal local dev server: serves public/ and proxies /api/query to the live
// Netlify function so the app runs locally against real data.
// Usage: node scripts/dev-server.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.argv[2]) || 8787;
const PUB = path.join(__dirname, "..", "public");
const UPSTREAM = "https://mixcalco-tienda-sale-crm.netlify.app/api/query";

http.createServer(async (req, res) => {
  if (req.url === "/api/query" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const up = await fetch(UPSTREAM, { method: "POST", headers: { "Content-Type": "application/json" }, body });
        const data = await up.text();
        res.writeHead(up.status, { "Content-Type": "application/json" });
        res.end(data);
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: e.message }));
      }
    });
    return;
  }
  if (req.url.startsWith("/api/img")) {
    const id = new URL(req.url, "http://x").searchParams.get("id") || "";
    if (!/^[\w-]{10,80}$/.test(id)) { res.writeHead(400); res.end("bad id"); return; }
    try {
      const up = await fetch("https://lh3.googleusercontent.com/d/" + id + "=w400", { redirect: "follow" });
      const buf = Buffer.from(await up.arrayBuffer());
      res.writeHead(up.status, { "Content-Type": up.headers.get("content-type") || "image/jpeg" });
      res.end(buf);
    } catch (e) { res.writeHead(502); res.end(e.message); }
    return;
  }
  const file = req.url === "/" || req.url.startsWith("/?") ? "/index.html" : req.url.split("?")[0];
  const fp = path.join(PUB, file);
  if (!fp.startsWith(PUB) || !fs.existsSync(fp)) { res.writeHead(404); res.end("not found"); return; }
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  res.writeHead(200, { "Content-Type": types[path.extname(fp)] || "application/octet-stream" });
  res.end(fs.readFileSync(fp));
}).listen(PORT, () => console.log("dev server on http://localhost:" + PORT));
