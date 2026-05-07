import { submitApplication } from "../../services/applicationService";

export async function POST({ request }) {
  try {
    const formData = await request.formData();

    // Map job_id -> job_posting expected by Cockpit
    const jobId = formData.get("job_id");
    if (jobId) {
      formData.set("job_posting", jobId);
      formData.delete("job_id");
    }

    // Add required fields
    if (!formData.get("date")) {
      formData.set("date", new Date().toISOString());
    }
    formData.set("current_stage", "applied");
    formData.set("stage_notes", "");

    const result = await submitApplication(formData);

    return new Response(JSON.stringify({ ok: true, result }), {
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
