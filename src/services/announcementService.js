const API_BASE = "http://localhost:8080";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("auth"))?.token || "";
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // nếu backend trả json error
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
      (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }

  return data;
}

/** Patient + Admin: list */
export function listAnnouncements() {
  return request("/api/announcements");
}

/** Patient: mark read (tuỳ backend bạn đang map endpoint nào)
 *  Nếu backend bạn dùng PUT /api/announcements/{id}/read thì giữ như dưới.
 *  Nếu khác, nói mình endpoint đúng để mình chỉnh 1 dòng là xong.
 */
export function markAnnouncementRead(id) {
  return request(`/api/announcements/${id}/read`, { method: "PUT" });
}

/** Admin: create */
export function createAnnouncement(payload) {
  return request("/api/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Admin: update */
export function updateAnnouncement(id, payload) {
  return request(`/api/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Admin: delete */
export function deleteAnnouncement(id) {
  return request(`/api/announcements/${id}`, { method: "DELETE" });
}
