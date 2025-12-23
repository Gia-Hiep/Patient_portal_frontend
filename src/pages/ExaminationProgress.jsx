import React, { useEffect, useState } from "react";
import {
  getPatientsForDoctor,
  updateStageByPatient,
} from "../services/examinationProgress";
import "../assets/styles/ExaminationProgress.css";

export default function ExaminationProgress() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stageId, setStageId] = useState("");

  useEffect(() => {
    getPatientsForDoctor().then(setPatients);
  }, []);

  const submit = async () => {
    if (!selectedPatient || !stageId) {
      alert("Vui lòng chọn bệnh nhân và trạng thái");
      return;
    }

    await updateStageByPatient(selectedPatient.patientId, stageId);
    alert("Cập nhật trạng thái thành công");
  };

 return (
  <div className="exam-page">
    <div className="exam-card auth-card">

      <h2 className="exam-title">Cập nhật trạng thái khám</h2>

      {/* =====================
          DANH SÁCH BỆNH NHÂN
      ===================== */}
      <div className="patient-list">
        <h4 className="section-title">Danh sách bệnh nhân</h4>

        {patients.length === 0 && (
          <p className="empty-text">Chưa có bệnh nhân</p>
        )}

        {patients.map((p) => (
          <div
            key={p.patientId}
            className={`patient-card ${
              selectedPatient?.patientId === p.patientId ? "active" : ""
            }`}
            onClick={() => setSelectedPatient(p)}
          >
            <div className="patient-avatar">
              {p.avatar ? <img src={p.avatar} alt="avatar" /> : "👤"}
            </div>

            <div className="patient-info">
              <div className="patient-name">
                {p.fullName || `Bệnh nhân #${p.patientId}`}
              </div>
              <div className="patient-code">Mã hồ sơ: {p.patientId}</div>
              <div className="patient-note">
                Đang khám: {p.notes || "Chưa cập nhật"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================
          FORM CẬP NHẬT
      ===================== */}
      {selectedPatient && (
        <div className="update-box">
          <h4 className="section-title">
            Cập nhật cho bệnh nhân #{selectedPatient.patientId}
          </h4>

          <select
            className="stage-select"
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="1">🟢 Đang khám</option>
            <option value="2">🟡 Chờ xét nghiệm</option>
            <option value="3">🔵 Hoàn tất</option>
          </select>

          <div className="btn-group">
            <button className="update-btn" onClick={submit}>
              ✔ Cập nhật trạng thái
            </button>

            <a href="/dashboard" className="back-btn">
              ⬅ Quay về trang chủ
            </a>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
