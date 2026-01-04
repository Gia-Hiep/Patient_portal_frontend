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
        {/* Header */}
        <div className="exam-header">
          <div className="exam-header-left">
            <a href="/dashboard" className="exam-back">
              ⬅ Quay về trang chủ
            </a>
            <h2 className="exam-title">Cập nhật trạng thái khám</h2>
          </div>
        </div>

        <div className="exam-layout">
          {/* LEFT: patient list */}
          <aside className="exam-left">
            <div className="exam-left-head">
              <h4 className="section-title">Danh sách bệnh nhân</h4>
            </div>

            {patients.length === 0 && (
              <p className="empty-text">Chưa có bệnh nhân</p>
            )}

            <div className="exam-list">
              {patients.map((p) => (
                <button
                  type="button"
                  key={p.patientId}
                  className={`patient-card ${
                    selectedPatient?.patientId === p.patientId ? "active" : ""
                  }`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <div className="patient-avatar" aria-hidden="true">
                    {p.avatar ? (
                      <img src={p.avatar} alt="avatar" />
                    ) : (
                      <span className="patient-avatar-fallback">👤</span>
                    )}
                  </div>

                  <div className="patient-info">
                    <div className="patient-name">
                      {p.fullName || `Bệnh nhân #${p.patientId}`}
                    </div>
                    <div className="patient-meta">
                      <span className="patient-code">
                        Mã hồ sơ: {p.patientId}
                      </span>
                    </div>
                    <div className="patient-note">
                      Đang khám: {p.notes || "Chưa cập nhật"}
                    </div>
                  </div>

                  <div className="patient-chevron" aria-hidden="true">
                    ›
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: update panel */}
          <main className="exam-right">
            {!selectedPatient ? (
              <div className="exam-placeholder" />
            ) : (
              <div className="update-box">
                <div className="update-head">
                  <h4 className="section-title">
                    Cập nhật cho bệnh nhân #{selectedPatient.patientId}
                  </h4>
                </div>

                <div className="update-form">
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
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
