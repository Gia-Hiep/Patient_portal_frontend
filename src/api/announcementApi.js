// src/api/announcementApi.js
import { getJson, postJson, putJson, delJson } from "../services/api";

// ======================
// PATIENT: xem thông báo
// ======================
export const getAnnouncements = () => getJson("/api/announcements");

// đánh dấu đã đọc (nếu backend bạn có endpoint này)
export const markAsRead = (id) => postJson(`/api/announcements/${id}/read`, {});

// ======================
// ADMIN: CRUD thông báo
// ======================
export const fetchAnnouncements = () => getJson("/api/admin/announcements");

export const createAnnouncement = (payload) =>
  postJson("/api/admin/announcements", payload);

export const updateAnnouncement = (id, payload) =>
  putJson(`/api/admin/announcements/${id}`, payload);

export const deleteAnnouncement = (id) =>
  delJson(`/api/admin/announcements/${id}`);
