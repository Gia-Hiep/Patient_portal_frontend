import { getJson, putJson } from "./api";

export const getPatientsForDoctor = () =>
  getJson("/api/examination-progress");

export const updateStageByPatient = (patientId, stageId) =>
  putJson(`/api/examination-progress/patient/${patientId}`, {
    stageId,
  });
