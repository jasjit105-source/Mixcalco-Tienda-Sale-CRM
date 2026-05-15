const API_BASE = "https://aggrievedly-spryest-hattie.ngrok-free.dev";
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "POST,OPTIONS" }, body: "" };
  }
  try {
    const token = process.env.SAHIBA_API_TOKEN || "Sahiba_CZSfEghwaD4s";
    const res = await fetch(API_BASE + "/V1/query", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "ngrok-skip-browser-warning": "true" }, body: event.body });
    const data = await res.text();
    return { statusCode: res.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: data };
  } catch (e) { return { statusCode: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ status: "error", message: e.message }) }; }
};
