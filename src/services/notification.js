import { getJson, putJson } from "./api";

/**
 * Lấy danh sách thông báo của user hiện tại
 * - Backend sẽ tự trả [] nếu user tắt auto notification
 * - Luôn đảm bảo frontend nhận được Array
 */
export const getNotifications = async () => {
  try {
    const res = await getJson("/api/autonotification");
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error("getNotifications error:", err);
    return [];
  }
};

/**
 * Đánh dấu 1 thông báo là đã đọc
 * @param {number} id - notification id
 */
export const markNotificationRead = async (id) => {
  if (!id) {
    return Promise.resolve(); // đảm bảo luôn trả Promise
  }

  try {
    return await putJson(`/api/autonotification/${id}/read`, {});
  } catch (err) {
    console.error("markNotificationRead error:", err);
    throw err;
  }
};
