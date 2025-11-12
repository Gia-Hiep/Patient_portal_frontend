// src/services/api.js
// Ưu tiên lấy từ env; hỗ trợ CRA & Vite
const BASE =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : null) ||
  "http://localhost:8080";

/** Lấy header Authorization từ localStorage (nếu đã đăng nhập) */
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Xử lý response JSON/Text chung (hỗ trợ Spring ProblemDetail: {title, detail, ...}) */
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
  } catch (_) {
    // body rỗng/không đọc được -> bỏ qua
  }

  if (!res.ok) {
    const message =
      // Spring Boot 3 ProblemDetail
      data?.detail ||
      // Thông điệp tuỳ backend
      data?.message ||
      data?.error ||
      // Fallback text/plain
      text ||
      // Cuối cùng: ghép status line
      `${res.status} ${res.statusText || "Request failed"}`;

    const err = new Error(message);
    err.status = res.status;
    err.code = data?.code || null; // nếu backend trả mã lỗi (vd: EMAIL_EXISTS)
    err.data = data;               // đính kèm payload để debug nếu cần
    throw err;
  }

  // Luôn trả về object (tránh undefined)
  return data ?? {};
}

/** POST JSON */
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

/** GET JSON (hỗ trợ params đơn giản qua options.params) */
export async function getJson(path, options = {}) {
  let url = `${BASE}${path}`;
  if (options.params && typeof options.params === "object") {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  return handleJsonResponse(res);
}

/** (tuỳ chọn) PUT/DELETE nếu cần dùng sau này */
//

/** Ví dụ API cụ thể: đăng ký bệnh nhân */
export function registerPatient(payload) {
  return postJson("/api/auth/register", payload);
}
