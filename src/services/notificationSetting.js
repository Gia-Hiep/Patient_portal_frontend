import { getJson, putJson } from "./api";

// 🔔 GET setting từ backend thật
export const getAutoNotificationSetting = async () => {
  return getJson("/api/autonotification/setting");
};

// 🔔 UPDATE setting → ghi DB
export const updateAutoNotificationSetting = async (enabled) => {
  return putJson("/api/autonotification/setting", { enabled });
};
