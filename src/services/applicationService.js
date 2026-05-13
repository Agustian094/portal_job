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

async function fetchCollectionEntries(collection) {
  const url = collectionGetUrl(collection);
  const data = await fetchJson(url);
  return Array.isArray(data.entries) ? data.entries : [];
}

export async function getJobStagesByJobPosting(jobPostingId) {
  const entries = await fetchCollectionEntries("job_stages");
  const filtered = entries.filter(
    (entry) => String(entry?.header?._id || "") === String(jobPostingId || ""),
  );

  filtered.sort((left, right) => {
    const leftOrder = Number(left?.stage_order || 0);
    const rightOrder = Number(right?.stage_order || 0);
    return leftOrder - rightOrder;
  });

  return filtered;
}

export async function getInitialJobStage(jobPostingId) {
  const stages = await getJobStagesByJobPosting(jobPostingId);
  return stages[0] || null;
}

export async function submitApplication(formData) {
  const url = `${BASE_URL}collections/save/t_application?token=${TOKEN}`;
  // Convert FormData -> plain object for JSON payload
  const obj = {};
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }

  const jobPostingId = String(obj.job_posting || "").trim();

  if (!obj.current_stage || String(obj.current_stage).trim() === "applied") {
    const initialStage = jobPostingId ? await getInitialJobStage(jobPostingId) : null;

    if (initialStage) {
      obj.current_stage = initialStage;
    } else {
      delete obj.current_stage;
    }
  } else if (typeof obj.current_stage === "string") {
    try {
      const parsedStage = JSON.parse(obj.current_stage);
      if (parsedStage && typeof parsedStage === "object") {
        obj.current_stage = parsedStage;
      }
    } catch {
      // keep as-is when current_stage is a plain string
    }
  }

  // Transform collectionlink fields to proper format: { _id: "...", link: "collectionName" }
  const collectionLinkMap = {
    job_posting: "t_job_posting",
    provinsi: "m_province",
    kota: "m_city",
  };

  for (const [fieldName, collectionName] of Object.entries(collectionLinkMap)) {
    if (obj[fieldName] && String(obj[fieldName]).trim()) {
      obj[fieldName] = {
        _id: String(obj[fieldName]).trim(),
        link: collectionName,
      };
    } else {
      // Remove empty collectionlink fields
      delete obj[fieldName];
    }
  }

  const payload = { data: obj };

  // Try JSON first (many Cockpit-like APIs accept JSON bodies)
  let res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  // If the JSON approach returns 404, try a multipart/form-data fallback
  if (res.status === 404) {
    res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    // Fallback fallback response status is logged
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gagal submit aplikasi: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getProvinces() {
  const url = collectionGetUrl("m_province");
  const data = await fetchJson(url);
  return data;
}

export async function getCities(provId = "") {
  // Fetch all cities from Cockpit and filter locally by prov_id.
  // This avoids depending on Cockpit's filter query format which may differ.
  const url = collectionGetUrl("m_city");
  console.log("service.getCities -> fetching cities, provId:", provId || "(none)");
  const data = await fetchJson(url);
  const entries = data.entries || [];
  console.log("service.getCities -> fetched entries:", entries.length);

  if (provId) {
    const provIdNum = Number(provId);
    const filtered = entries.filter((e) => Number(e.prov_id) === provIdNum);
    return { entries: filtered };
  }

  return { entries };
}
