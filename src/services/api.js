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
      data?.detail || data?.message || data?.error || text ||
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

<<<<<<< HEAD
/** GET JSON (hỗ trợ params đơn giản qua options.params) */
=======
>>>>>>> 089516a (Update them quan ly profile)
export async function getJson(path, options = {}) {
  let url = `${BASE}${path}`;
  if (options.params && typeof options.params === "object") {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  const res = await fetch(url, {
    method: "GET",
<<<<<<< HEAD
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
=======
    headers: { ...authHeaders(), ...(options.headers || {}) },
>>>>>>> 089516a (Update them quan ly profile)
    ...options,
  });
  return handleJsonResponse(res);
}

<<<<<<< HEAD
/** (tuỳ chọn) PUT/DELETE nếu cần dùng sau này */
//

/** Ví dụ API cụ thể: đăng ký bệnh nhân */
export function registerPatient(payload) {
  return postJson("/api/auth/register", payload);
}
=======
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
>>>>>>> 089516a (Update them quan ly profile)
