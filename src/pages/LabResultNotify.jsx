import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  fetchLabResultPatients,
  fetchLabResultDetail,
  sendLabResultNotification,
} from "../services/labresult";
import "../assets/styles/LabResultNotify.css";

export default function LabResultNotify() {
  const user = useSelector((s) => s.auth.user);
  const hasPermission = ["DOCTOR", "LAB_STAFF"].includes(user?.role);

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState(
    "Kết quả xét nghiệm của bạn đã sẵn sàng."
  );

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  // ===== LOAD PATIENTS =====
  useEffect(() => {
    if (!hasPermission) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchLabResultPatients();
        setPatients(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [hasPermission]);

  // ===== SELECT PATIENT =====
  const selectPatient = async (p) => {
    setSelected(p);
    setDetail(null);
    setSuccess("");
    setLoadingDetail(true);

    try {
      const d = await fetchLabResultDetail(p.patientId);
      setDetail(d);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ===== SEND NOTIFICATION =====
  const send = async () => {
    if (!selected || !detail || sending) return;

    try {
      setSending(true);
      await sendLabResultNotification({
        patientId: selected.patientId,
        body: message,
      });
      setSuccess("✅ Gửi thông báo thành công");
    } catch (e) {
      alert("❌ Không thể gửi thông báo");
    } finally {
      setSending(false);
    }
  };

  if (!hasPermission) {
    return <p>⛔ Bạn không có quyền truy cập</p>;
  }

  const filtered = search.trim()
    ? patients.filter(
        (p) =>
          p.fullName?.toLowerCase().trim() ===
          search.toLowerCase().trim()
      )
    : patients;

  return (
    <div className="auth-card" style={{ maxWidth: 1100 }}>
      <h2>Đẩy thông báo kết quả xét nghiệm (US12)</h2>

      <div className="lab-notify-container">
        {/* LEFT */}
        <div className="patient-list">
          <input
            placeholder="Tìm kiếm bệnh nhân"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p>Đang tải…</p>
          ) : (
            <ul>
              {filtered.map((p) => (
                <li
                  key={p.patientId}
                  onClick={() => selectPatient(p)}
                  className={
                    selected?.patientId === p.patientId ? "active" : ""
                  }
                >
                  <b>{p.fullName}</b>
                  <span className="done">Hoàn tất</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT */}
        <div className="patient-detail">
          {loadingDetail && <p>Đang tải kết quả…</p>}

          {!loadingDetail && detail && (
            <>
              <h3>{detail.fullName}</h3>

              <p>
                <b>Kết quả:</b> {detail.summary}
              </p>

              <p>
                <b>Ngày hoàn tất:</b>{" "}
                {new Date(detail.completedDate).toLocaleString("vi-VN")}
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button onClick={send} disabled={sending}>
                {sending ? "Đang gửi…" : "Gửi thông báo"}
              </button>

              {success && <p className="success">{success}</p>}
            </>
          )}

          {!loadingDetail && !detail && (
            <p>Chọn bệnh nhân để xem chi tiết</p>
          )}
        </div>
      </div>
    </div>
  );
}
