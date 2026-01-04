import { getJson, postJson, putJson } from "./api";

const BASE = "/api/admin/announcements";

export const adminListAnnouncements = (type) =>
    getJson("/api/announcements", { params: type ? { type } : {} });

export const adminCreateAnnouncement = (payload) =>
    postJson(BASE, payload);

export const adminUpdateAnnouncement = (id, payload) =>
    putJson(`${BASE}/${id}`, payload);

export const adminDeleteAnnouncement = async (id) => {
    const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}${BASE}/${id}`,
        {
            method: "DELETE",
            headers: {
                ...(localStorage.getItem("token")
                    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    : {}),
            },
        }
    );


    let data = null;
    try {
        data = await res.json();
    } catch { }

    if (!res.ok) {
        const err = new Error(data?.message || "Xóa thất bại");
        err.status = res.status;
        throw err;
    }
    return data || { message: "Xóa thành công." };
};
