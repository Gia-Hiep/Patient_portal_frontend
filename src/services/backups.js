import { getJson, postJson } from "./api";

export const backupNow = () => postJson("/api/admin/backups", {});


export const listBackupFiles = () => getJson("/api/admin/backups/files");


export const getBackupHistory = () => getJson("/api/admin/backups/history");
