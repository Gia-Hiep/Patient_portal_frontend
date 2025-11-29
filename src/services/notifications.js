import { getJson } from "./api";

export const fetchNotifications = () => getJson("/api/announcements");
