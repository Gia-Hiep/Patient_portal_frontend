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

/** ✅ THÊM: DELETE JSON (dùng cho Admin xóa dịch vụ) */
export async function delJson(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders(), ...(options.headers || {}) },
    ...options,
  });
  return handleJsonResponse(res);
}

// ============================
// Existing exports (giữ nguyên)
// ============================
export const getMyProfile = () => getJson("/api/profile/me");
export const updateMyProfile = (payload) => putJson("/api/profile/me", payload);

export const getMyVisits = () => getJson("/api/visits"); // list
export const getVisitDetail = (id) => getJson(`/api/visits/${id}`); // detail

// ============================
// ✅ US14.1: Medical Services API
// ============================

/** Patient/Doctor: xem danh sách dịch vụ active */
export const getServices = () => getJson("/api/services");

/** Admin: list tất cả dịch vụ */
export const adminGetServices = () => getJson("/api/admin/services");

/** Admin: thêm dịch vụ */
export const adminCreateService = (payload) =>
  postJson("/api/admin/services", payload);

/** Admin: sửa dịch vụ */
export const adminUpdateService = (id, payload) =>
  putJson(`/api/admin/services/${id}`, payload);

/** Admin: xóa dịch vụ (soft delete) */
export const adminDeleteService = (id) =>
  delJson(`/api/admin/services/${id}`);
