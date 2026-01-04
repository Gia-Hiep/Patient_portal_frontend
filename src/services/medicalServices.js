import { getJson, postJson, putJson, delJson } from "./api";

export const listServices = () => getJson("/api/services");

// Admin
export const adminListServices = () => getJson("/api/admin/services");
export const adminCreateService = (payload) => postJson("/api/admin/services", payload);
export const adminUpdateService = (id, payload) => putJson(`/api/admin/services/${id}`, payload);
export const adminDeleteService = (id) => delJson(`/api/admin/services/${id}`);
