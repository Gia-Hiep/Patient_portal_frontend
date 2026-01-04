import { getJson, putJson, delJson, postJson } from "./api";

/**
 * US14.2 - Admin quản lý bác sĩ
 */

// Lấy danh sách bác sĩ
export const getAdminDoctors = (opts = {}) =>
  getJson("/api/admin/doctors", {
    params: { includeDisabled: !!opts.includeDisabled },
  });

// Cập nhật thông tin bác sĩ
export const updateAdminDoctor = (id, payload) =>
  putJson(`/api/admin/doctors/${id}`, payload);

// Vô hiệu hóa (soft delete) bác sĩ
export const deleteAdminDoctor = (id) =>
  delJson(`/api/admin/doctors/${id}`);

// 🔥 THÊM MỚI: Tạo bác sĩ
export const createAdminDoctor = (payload) =>
  postJson("/api/admin/doctors", payload);
