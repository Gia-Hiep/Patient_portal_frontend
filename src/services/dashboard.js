import { getJson } from "./api";


export const fetchPatientSummary = () => getJson("/api/patient/summary");
export const fetchDoctorSummary  = () => getJson("/api/doctor/summary?date=today");
export const fetchAdminSummary   = () => getJson("/api/admin/summary");
