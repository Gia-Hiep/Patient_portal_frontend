import { getJson, postJson } from "./api";

/**
 * =================================================
 * US12 – DANH SÁCH BỆNH NHÂN CÓ KẾT QUẢ XÉT NGHIỆM
 * Backend: GET /api/lab-results/patients
 * =================================================
 *
 * Response:
 * [
 *   {
 *     patientId: number,
 *     fullName: string,
 *     status: "DONE" | "WAITING"
 *   }
 * ]
 */
export const fetchLabResultPatients = async () => {
  return getJson("/api/lab-results/patients");
};

/**
 * =================================================
 * US12 – CHI TIẾT KẾT QUẢ XÉT NGHIỆM CỦA 1 BỆNH NHÂN
 * Backend: GET /api/lab-results/{patientId}
 * =================================================
 *
 * Response:
 * {
 *   patientId: number,
 *   fullName: string,
 *   summary: string,
 *   completedDate: string (ISO)
 * }
 */
export const fetchLabResultDetail = async (patientId) => {
  if (!patientId) {
    throw new Error("patientId is required");
  }

  return getJson(`/api/lab-results/${patientId}`);
};

/**
 * =================================================
 * US12 – GỬI THÔNG BÁO KẾT QUẢ XÉT NGHIỆM
 * Backend: POST /api/autonotification/send
 * =================================================
 *
 * Payload:
 * {
 *   patientId: number,
 *   body: string
 * }
 */
export const sendLabResultNotification = async ({
  patientId,
  body,
}) => {
  if (!patientId) {
    throw new Error("patientId is required");
  }

  return postJson("/api/autonotification/send", {
    patientId,
    body,
  });
};
