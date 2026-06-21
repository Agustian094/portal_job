import https from "node:https";

const BASE_URL = import.meta.env.API_BASE_URL;
const TOKEN = import.meta.env.API_TOKEN;

function collectionGetUrl(collection, query = "") {
  return `${BASE_URL}collections/get/${collection}?token=${TOKEN}${query}`;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Cockpit responded ${res.statusCode}: ${body}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error(`Invalid JSON from Cockpit: ${err.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function fetchCitiesFromCockpit() {
  const url = collectionGetUrl("m_city");
  return fetchJson(url);
}

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const provId = url.searchParams.get("prov_id");
    const returnAll = url.searchParams.get("all") === "1";

    console.log(
      "api/cities GET -> url:",
      request.url,
      "prov_id:",
      provId,
      "returnAll:",
      returnAll,
    );

    const data = await fetchCitiesFromCockpit();
    const allEntries = data.entries || [];

    if (returnAll) {
      console.log(
        "api/cities -> returnAll fetched:",
        allEntries.length,
        "sample prov_ids:",
        allEntries.slice(0, 20).map((e) => e.prov_id),
      );
      return new Response(
        JSON.stringify({ ok: true, entries: data.entries || [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!provId) {
      console.log("api/cities -> no prov_id provided, returning empty entries");
      return new Response(JSON.stringify({ ok: true, entries: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provIdNum = Number(provId);
    const entries = allEntries.filter((e) => Number(e.prov_id) === provIdNum);

    console.log(
      "api/cities -> fetched allEntries:",
      allEntries.length,
      "filtered (prov_id=",
      provId,
      ") ->",
      entries.length,
    );
    try {
      const sampleProvIds = Array.from(
        new Set(allEntries.slice(0, 50).map((e) => String(e.prov_id))),
      );
      console.log(
        "api/cities -> sample prov_id values in allEntries:",
        sampleProvIds.slice(0, 20),
      );
    } catch (e) {
      /* ignore */
    }

    return new Response(JSON.stringify({ ok: true, entries }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
