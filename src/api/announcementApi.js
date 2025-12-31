import { getJson, postJson, putJson, delJson } from "../services/api";

// ==== USER (xem danh sách) ====
// nếu backend của bạn là GET /api/announcements
export const getAnnouncements = () => getJson("/api/announcements");

// Nếu backend KHÔNG có markAsRead thì bạn xoá hẳn chức năng này ở UI.
// Còn nếu có endpoint, bạn giữ lại như dưới (đổi path theo backend của bạn).
export const markAsRead = (id) => postJson(`/api/announcements/${id}/read`, {});

// ==== ADMIN CRUD ====
// IMPORTANT: path admin tùy backend bạn đang làm.
// Nếu backend bạn dùng /api/admin/announcements thì để vậy.
// Nếu bạn đang dùng /api/announcements luôn thì đổi lại tương ứng.

const ADMIN_BASE = "/api/admin/announcements";

export const createAnnouncement = (payload) => postJson(ADMIN_BASE, payload);

export const updateAnnouncement = (id, payload) =>
  putJson(`${ADMIN_BASE}/${id}`, payload);

export const deleteAnnouncement = (id) => delJson(`${ADMIN_BASE}/${id}`);
