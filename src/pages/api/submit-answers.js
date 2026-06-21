import { saveAnswerEntries } from "../../services/answerService";

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const applicationId = String(body.application_id || "").trim();
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!applicationId) {
      return new Response(
        JSON.stringify({ ok: false, error: "application_id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (answers.length === 0) {
      return new Response(JSON.stringify({ ok: true, results: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Normalize entries to Cockpit format expected by application_answer collection
    const entriesToSave = answers.map((a) => {
      const qid = String(a.question_id || "").trim();
      const qname = String(a.question_name || "").trim();
      const aval = a.answer_value == null ? "" : String(a.answer_value);

      return {
        apllication_id: { _id: applicationId, link: "t_application" },
        question_id: { _id: qid, link: "job_question" },
        question_name: qname,
        answer_value: aval,
      };
    });

    console.log(
      "[submit-answers] entriesToSave:",
      JSON.stringify(entriesToSave, null, 2),
    );
    const results = await saveAnswerEntries(entriesToSave);
    console.log(
      "[submit-answers] save results:",
      JSON.stringify(results, null, 2),
    );

    // determine overall success if at least one saved ok
    const allOk = results.every((r) => r.ok === true);

    return new Response(JSON.stringify({ ok: allOk, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[submit-answers] Error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
