import { submitApplication } from "../../services/applicationService";

export const prerender = false;

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    console.log("[submit-application] Received formData keys:", Array.from(formData.keys()));

    const formatDateOnly = (date = new Date()) => date.toISOString().slice(0, 10);

    // Add required fields if not already present
    if (!formData.get("date")) {
      formData.set("date", formatDateOnly());
    }
    if (!formData.get("stage_notes")) {
      formData.set("stage_notes", "");
    }

    console.log("[submit-application] Sending to Cockpit with keys:", Array.from(formData.keys()));
    const result = await submitApplication(formData);
    console.log("[submit-application] Success:", result);

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
