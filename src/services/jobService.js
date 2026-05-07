const BASE_URL = import.meta.env.API_BASE_URL;
const TOKEN = import.meta.env.API_TOKEN;

async function requestJobs(query = "") {
  const url = `${BASE_URL}collections/get/t_job_posting?token=${TOKEN}${query}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Gagal mengambil data job");
  }

  return res.json();
}

// Ambil data job posting
export async function getJobs() {
  try {
    return await requestJobs();
  } catch (err) {
    console.error(err);
    return { entries: [] };
  }
}

// Ambil detail job berdasarkan ID
export async function getJobById(id) {
  try {
    const data = await requestJobs(`&filter[_id]=${id}`);

    return data.entries?.[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
