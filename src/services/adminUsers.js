import { getJson, postJson, putJson } from "./api";

export const adminListUsers = () => getJson("/api/admin/users");

export const adminCreateUser = (payload) =>
    postJson("/api/admin/users", payload);

export const adminChangeRole = (id, role) =>
    putJson(`/api/admin/users/${id}/role`, { role });

export const adminLockUser = (id) =>
    putJson(`/api/admin/users/${id}/lock`, {});

export const adminUnlockUser = (id) =>
    putJson(`/api/admin/users/${id}/unlock`, {});
