const BASE_URL = process.env.API_BASE_URL || import.meta.env.API_BASE_URL;
const TOKEN = process.env.API_TOKEN || import.meta.env.API_TOKEN;

function collectionGetUrl(collection) {
  return `${BASE_URL}collections/get/${collection}?token=${TOKEN}`;
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const https = require("node:https");
    https
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

export const prerender = false;

export async function GET({ url }) {
  try {
    const applicationId = String(
      url.searchParams.get("application_id") || "",
    ).trim();
    const apiUrl = collectionGetUrl("application_answer");
    const data = await fetchJson(apiUrl);
    const entries = Array.isArray(data.entries) ? data.entries : [];

    const filtered = applicationId
      ? entries.filter(
          (e) => String(e?.apllication_id?._id || "") === String(applicationId),
        )
      : entries.slice(0, 50);

    return new Response(
      JSON.stringify({ ok: true, count: filtered.length, entries: filtered }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[get-answers] Error:", err.message || err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
