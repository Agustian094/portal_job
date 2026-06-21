const BASE_URL = import.meta.env.API_BASE_URL;
const TOKEN = import.meta.env.API_TOKEN;

async function requestQuestions() {
  const url = `${BASE_URL}collections/get/job_question?token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal mengambil job_question: ${res.status}`);
  return res.json();
}

export async function getQuestionsByJob(jobPostingId) {
  try {
    const data = await requestQuestions();
    const entries = data.entries || [];
    const filtered = entries
      .filter(
        (e) => String(e?.header?._id || "") === String(jobPostingId || ""),
      )
      .sort(
        (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
      );

    return { entries: filtered };
  } catch (err) {
    console.error("questionService.getQuestionsByJob ->", err.message);
    return { entries: [] };
  }
}

export async function getAllQuestions() {
  try {
    const data = await requestQuestions();
    return { entries: data.entries || [] };
  } catch (err) {
    console.error("questionService.getAllQuestions ->", err.message);
    return { entries: [] };
  }
}

export default { getQuestionsByJob, getAllQuestions };
