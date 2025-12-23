import { getJson, putJson } from "./api";

export const getAutoNotificationSetting = async () => {
  try {
    return await getJson("/api/settings/auto-notifications");
  } catch {
    return { enabled: true };
  }
};

export const updateAutoNotificationSetting = async (enabled) => {
  return putJson("/api/settings/auto-notifications", { enabled });
};
