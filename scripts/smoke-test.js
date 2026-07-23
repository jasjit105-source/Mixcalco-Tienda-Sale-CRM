// Smoke test: runs every SQL query in public/index.html against the live API and
// asserts a success response. Usage: node scripts/smoke-test.js [api-url]
// Extracts the SQL object from index.html (between /*SQL-START*/ and /*SQL-END*/)
// so the tested SQL is exactly what the app ships.
const fs = require("fs");
const path = require("path");

const API = process.argv[2] || "https://mixcalco-tienda-sale-crm.netlify.app/api/query";
const html = fs.readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf8");
const m = html.match(/\/\*SQL-START\*\/([\s\S]*?)\/\*SQL-END\*\//);
if (!m) { console.error("SQL-START/SQL-END markers not found"); process.exit(1); }
const SQL = new Function(m[1] + "; return SQL;")();

const D1 = "20260714", D2 = "20260721", D = "20260721";
const CASES = [
  ["storeSummary", SQL.storeSummary(), { fecha: D }],
  ["tickets", SQL.tickets(null, "Leona Vicario"), { fecha: D }],
  ["ticketDetail", SQL.ticketDetail(null, "121234", "Leona Vicario"), { fecha: D }],
  ["topItems", SQL.topItems(), { fecha: D }],
  ["deposits", SQL.deposits(), { fecha: D }],
  ["inventory", SQL.inventory(), {}],
  ["yazminTickets", SQL.yazminTickets(), { fecha_inicio: D1, fecha_fin: D2 }],
  ["yazminDaily", SQL.yazminDaily(), { fecha_inicio: D1, fecha_fin: D2 }],
  ["yazminTopCustomers", SQL.yazminTopCustomers(), { fecha_inicio: D1, fecha_fin: D2 }],
  ["yazminBigTickets", SQL.yazminBigTickets(), { fecha_inicio: D1, fecha_fin: D2 }],
  ["regularSales", SQL.regularSales(), { fecha1: D1, fecha2: D2 }],
  ["kardex", SQL.kardex("006KA"), { fecha1: D1, fecha2: D2 }],
  ["corteCercu", SQL.corteCercu(), { fecha: D }],
  ["corteLeona", SQL.corteLeona(), { fecha: D }],
  ["styleAnalysis", SQL.styleAnalysis("'006KA'"), { fecha1: D1, fecha2: D2 }],
  ["styleInventory", SQL.styleInventory("'006KA'"), {}],
  ["onlineSales", SQL.onlineSales(), { fecha1: D1, fecha2: D2 }],
  ["onlineDaily", SQL.onlineDaily(), { fecha1: D1, fecha2: D2 }],
  ["stockAlerts", SQL.stockAlerts(), { fecha1: "20260601", fecha2: D2 }],
  ["predictionData", SQL.predictionData(), { fecha1: "20260101", fecha2: D2 }],
  ["fbAds", SQL.fbAds("126OB"), { fecha1: D1, fecha2: D2 }],
];

(async () => {
  let failed = 0;
  for (const [name, query, parameters] of CASES) {
    const t0 = Date.now();
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, parameters }),
      });
      const j = await res.json().catch(() => ({}));
      const ok = res.ok && j.status === "success";
      console.log((ok ? "PASS" : "FAIL") + "  " + name.padEnd(20) + (Date.now() - t0) + "ms  " + (ok ? (j.total_records + " rows") : (res.status + " " + (j.message || j.detail || "").slice(0, 160))));
      if (!ok) failed++;
    } catch (e) {
      console.log("FAIL  " + name.padEnd(20) + e.message); failed++;
    }
  }
  console.log(failed ? "\n" + failed + " QUERIES FAILED" : "\nALL QUERIES PASSED");
  process.exit(failed ? 1 : 0);
})();
