import https from "node:https";

const BASE_URL = import.meta.env.API_BASE_URL;
const TOKEN = import.meta.env.API_TOKEN;

function collectionSaveUrl(collection) {
  return `${BASE_URL}collections/save/${collection}?token=${TOKEN}`;
}

async function postJson(url, payload) {
  console.log(
    "[answerService] POST application_answer payload:",
    JSON.stringify(payload),
  );
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    console.warn("[answerService] response not JSON:", text);
  }

  if (!res.ok) {
    throw new Error(`Cockpit save failed ${res.status}: ${text}`);
  }

  console.log("[answerService] Cockpit response:", json ?? text);
  return json;
}

/**
 * Save a single application_answer entry to Cockpit
 * @param {object} entry - object with fields matching collection (apllication_id, question_id, question_name, answer_value)
 */
export async function saveAnswerEntry(entry) {
  const url = collectionSaveUrl("application_answer");
  const payload = { data: entry };
  return postJson(url, payload);
}

/**
 * Save multiple answer entries. Returns array of results.
 */
export async function saveAnswerEntries(entries = []) {
  const results = [];
  for (const e of entries) {
    try {
      const r = await saveAnswerEntry(e);
      results.push({ ok: true, response: r });
    } catch (err) {
      console.error("[answerService] save entry failed:", err.message, e);
      results.push({ ok: false, error: err.message, entry: e });
    }
  }
  return results;
}

export default { saveAnswerEntry, saveAnswerEntries };
