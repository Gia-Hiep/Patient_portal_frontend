const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

/** Lấy header Authorization từ localStorage (nếu đã đăng nhập) */
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Xử lý response JSON chung */
async function handleJsonResponse(res) {
  let data = {};
  try { data = await res.json(); } catch (e) { /* 204/no body -> data = {} */ }

  if (!res.ok) {
    const message = data.error || data.message || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** POST JSON */
export async function postJson(path, body, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleJsonResponse(res);
}

/** GET JSON */
export async function getJson(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  return handleJsonResponse(res);
}

