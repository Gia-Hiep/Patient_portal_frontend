// API cho US15/US7 (Thông báo bệnh viện)
// Dùng chung cho:
// - Patient/Doctor xem danh sách thông báo
// - Mark as read
// - Admin CRUD (tạo/sửa/xóa)

import { getJson, postJson, putJson, delJson } from "../services/api";

// ===== List =====
export function getAnnouncements() {
  return getJson("/api/announcements");
}

// Nếu backend của bạn chưa có endpoint read riêng, bạn sẽ đổi path ở đây
export function markAsRead(id) {
  return postJson(`/api/announcements/${id}/read`, {});
}

// ===== Admin CRUD =====
export function fetchAnnouncements() {
  return getAnnouncements();
}

export function createAnnouncement(payload) {
  return postJson("/api/announcements", payload);
}

export function updateAnnouncement(id, payload) {
  return putJson(`/api/announcements/${id}`, payload);
}

export function deleteAnnouncement(id) {
  return delJson(`/api/announcements/${id}`);
}
