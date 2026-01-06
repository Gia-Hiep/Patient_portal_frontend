import { getJson } from "./api";

// ===== SUMMARY =====
export const fetchPatientSummary = () =>
  getJson("/api/patient/summary");

export const fetchDoctorSummary = () =>
  getJson("/api/doctor/summary?date=today");

export const fetchAdminSummary = () =>
  getJson("/api/admin/summary");

// ===== US9: DANH SÁCH BỆNH NHÂN BÁC SĨ =====
export const fetchDoctorAppointments = (status, date) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (date) params.append("date", date);

  const qs = params.toString();
  return getJson(`/api/doctor/appointments${qs ? `?${qs}` : ""}`);
};
