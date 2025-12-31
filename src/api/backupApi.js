import { getJson, postJson } from "../services/api";

const ADMIN_BASE = "/api/admin/backups";

export const runBackupNow = () => postJson(ADMIN_BASE, {});
export const getBackupFiles = () => getJson(`${ADMIN_BASE}/files`);
export const getBackupHistory = () => getJson(`${ADMIN_BASE}/history`);
