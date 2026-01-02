import { getJson, postJson } from "./api";

export const fetchUserNotifications = () => getJson("/api/notifications");

export const markNotificationRead = (id) =>
  postJson(`/api/notifications/${id}/read`, {});

export const fetchUnreadCount = () =>
  getJson("/api/notifications/unread-count");

export const getNotificationSettings = () =>
  getJson("/api/me/settings/notifications");

export const updateNotificationSettings = (payload) =>
  postJson("/api/me/settings/notifications", payload);
