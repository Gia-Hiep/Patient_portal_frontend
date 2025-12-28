const BASE = "http://localhost:8080";

function getToken() {
  // tuỳ bạn đang lưu token ở đâu, thường là localStorage
  return localStorage.getItem("token");
}

function buildHeaders(extra = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handle(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "") ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function getJson(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(),
  });
  return handle(res);
}

export async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function putJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function delJson(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return handle(res);
}

export const getMyProfile = () => getJson("/api/profile/me");
export const updateMyProfile = (payload) => putJson("/api/profile/me", payload);
export const getMyVisits = () => getJson("/api/visits"); // list
export const getVisitDetail = (id) => getJson(`/api/visits/${id}`); // detail
