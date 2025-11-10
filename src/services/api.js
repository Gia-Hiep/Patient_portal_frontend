// src/services/api.js

// Ưu tiên lấy từ env, fallback về localhost
const BASE =
  process.env.REACT_APP_API_BASE_URL ||      // CRA
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_API_BASE_URL
    : null) ||                               // Vite (nếu có)
  "http://localhost:8080";

/**
 * Xử lý response JSON chung
 */
async function handleJsonResponse(res) {
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // Nếu không parse được JSON (204 / empty) thì để data = {}
  }

  if (!res.ok) {
    const message = data.error || data.message || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Hàm POST JSON dùng chung
 * @param {string} path - ví dụ "/api/auth/register"
 * @param {object} body - dữ liệu gửi lên
 * @param {object} options - headers / config thêm
 */
export async function postJson(path, body, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });

  return handleJsonResponse(res);
}

/**
 * API: Đăng ký bệnh nhân
 * Gọi đúng endpoint backend: POST /api/auth/register
 */
export function registerPatient(payload) {
  // payload: { fullName, emailOrPhone, password, confirmPassword, agreeTerms }
  return postJson("/api/auth/register", payload);
}
