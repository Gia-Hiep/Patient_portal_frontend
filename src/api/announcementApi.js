import axios from "axios";

const API_URL = "http://localhost:8080/api/announcements";

const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});

export const getAnnouncements = () =>
  axios.get(API_URL, { headers: authHeader() });

export const markAsRead = (id) =>
  axios.post(`${API_URL}/${id}/read`, {}, { headers: authHeader() });

export const getUnreadCount = () =>
  axios.get(`${API_URL}/unread-count`, { headers: authHeader() });
