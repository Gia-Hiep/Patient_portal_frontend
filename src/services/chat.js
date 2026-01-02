const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const authHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

async function handle(res) {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.message || data?.error || data || "Request failed");
  return data;
}

/* PATIENT */
export const listMyDoctors = async () => {
  const r = await fetch(`${BASE}/api/chat/doctors`, { headers: authHeaders() });
  return handle(r);
};

export const getPatientThread = async (doctorId) => {
  const r = await fetch(`${BASE}/api/chat/threads/${doctorId}`, { headers: authHeaders() });
  return handle(r);
};

export const sendPatientMessage = async (doctorId, content) => {
  const r = await fetch(`${BASE}/api/chat/threads/${doctorId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  return handle(r);
};

/* DOCTOR */
export const listDoctorPatients = async (q = "") => {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const r = await fetch(`${BASE}/api/doctor-chat/patients${qs}`, { headers: authHeaders() });
  return handle(r);
};

export const getDoctorThread = async (patientId) => {
  const r = await fetch(`${BASE}/api/doctor-chat/threads/${patientId}`, { headers: authHeaders() });
  return handle(r);
};

export const sendDoctorMessage = async (patientId, content) => {
  const r = await fetch(`${BASE}/api/doctor-chat/threads/${patientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  return handle(r);
};
