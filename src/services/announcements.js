import { getJson } from "./api";

export const listAnnouncements = (type) =>
  getJson("/api/announcements", { params: type ? { type } : {} });

export const listPublicAnnouncements = (type) =>
  getJson("/api/public/announcements", { params: type ? { type } : {} });
