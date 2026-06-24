import { submitApplication } from "../../services/applicationService";

export const prerender = false;

function capitalizeFirst(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function POST({ request }) {
  try {
    const formData = await request.formData();

    const formatDateOnly = (date = new Date()) =>
      date.toISOString().slice(0, 10);

    // Add required fields if not already present
    if (!formData.get("date")) {
      formData.set("date", formatDateOnly());
    }
    if (!formData.get("stage_notes")) {
      formData.set("stage_notes", "");
    }

    const candidateName = formData.get("candidate_name");
    if (typeof candidateName === "string" && candidateName.trim()) {
      formData.set("candidate_name", capitalizeFirst(candidateName));
    }

    const result = await submitApplication(formData);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[submit-application] Error:", err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
