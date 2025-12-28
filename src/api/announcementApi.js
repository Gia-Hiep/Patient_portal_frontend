import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// lấy token từ localStorage (đa số dự án lưu token ở đây)
function authHeaders() {
  const token = localStorage.getItem("token"); // kiểm tra đúng key bạn đang lưu
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ====== PUBLIC / PATIENT ======
export const getAnnouncements = () =>
  API.get("/announcements", { headers: authHeaders() });

export const markAsRead = (id) =>
  API.put(`/announcements/${id}/read`, {}, { headers: authHeaders() });

// ====== ADMIN CRUD ======
// ⚠️ sửa đúng endpoint admin theo backend bạn đang có
export const createAnnouncement = (payload) =>
  API.post("/admin/announcements", payload, { headers: authHeaders() });

export const updateAnnouncement = (id, payload) =>
  API.put(`/admin/announcements/${id}`, payload, { headers: authHeaders() });

export const deleteAnnouncement = (id) =>
  API.delete(`/admin/announcements/${id}`, { headers: authHeaders() });
