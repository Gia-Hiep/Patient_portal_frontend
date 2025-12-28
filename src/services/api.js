const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/** Lấy header Authorization từ localStorage  */
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Xử lý response JSON/Text chung **/
async function handleJsonResponse(res) {
  let data = null;
  let text = "";

  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      text = await res.text();
    }
  } catch (_) {}

  if (!res.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      text ||
      `${res.status} ${res.statusText || "Request failed"}`;
    const err = new Error(message);
    err.status = res.status;
    err.code = data?.code || null;
    err.data = data;
    throw err;
  }
  return data ?? {};
}

export async function postJson(path, body, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleJsonResponse(res);
}

export async function getJson(path, options = {}) {
  let url = `${BASE}${path}`;
  if (options.params && typeof options.params === "object") {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeaders(), ...(options.headers || {}) },
    ...options,
  });
  return handleJsonResponse(res);
}
export async function delJson(url) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Delete failed");
  }

  // DELETE thường không trả body
  return res.text();
}

export async function putJson(path, body, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleJsonResponse(res);
}

export const getMyProfile = () => getJson("/api/profile/me");
export const updateMyProfile = (payload) => putJson("/api/profile/me", payload);
export const getMyVisits = () => getJson("/api/visits"); // list
export const getVisitDetail = (id) => getJson(`/api/visits/${id}`); // detail
