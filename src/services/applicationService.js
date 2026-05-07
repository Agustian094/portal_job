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

export async function submitApplication(formData) {
  const url = `${BASE_URL}collections/save/t_application?token=${TOKEN}`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gagal submit aplikasi: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getProvinces() {
  const url = collectionGetUrl("m_province");
  console.log("service.getProvinces -> URL:", url);
  const data = await fetchJson(url);
  console.log("service.getProvinces -> entries:", (data.entries || []).length);
  return data;
}

export async function getCities(provId = "") {
  // Fetch all cities from Cockpit and filter locally by prov_id.
  // This avoids depending on Cockpit's filter query format which may differ.
  const url = collectionGetUrl("m_city");
  console.log("service.getCities -> URL:", url, "provId:", provId || "(none)");
  const data = await fetchJson(url);
  const entries = data.entries || [];
  console.log("service.getCities -> fetched entries:", entries.length);

  if (provId) {
    const provIdNum = Number(provId);
    const filtered = entries.filter((e) => Number(e.prov_id) === provIdNum);
    console.log("service.getCities -> after filter provId:", provId, "filtered:", filtered.length);
    return { entries: filtered };
  }

  return { entries };
}
