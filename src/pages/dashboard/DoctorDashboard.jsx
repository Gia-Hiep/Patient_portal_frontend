import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import DoctorAppointmentTable from "../../components/DoctorAppointmentTable";
import {
  fetchDoctorSummary,
  fetchDoctorAppointments,
} from "../../services/dashboard";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const user = useSelector((s) => s.auth.user);

  // ===== Summary (US khác) =====
  const [sum, setSum] = useState({
    chats: 0,
    labToNotify: 0,
    today: "hôm nay",
  });

  // ===== Appointments =====
  const [allAppointments, setAllAppointments] = useState([]); // FULL LIST (for cards)
  const [appointments, setAppointments] = useState([]);       // FILTERED (for table)
  const [status, setStatus] = useState(""); // "" | WAITING | DONE | CANCELLED
  const [loadingAppt, setLoadingAppt] = useState(false);

  // ===== Load summary =====
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDoctorSummary();
        setSum({
          chats: res?.chats ?? 0,
          labToNotify: res?.labToNotify ?? 0,
          today: res?.today ?? "hôm nay",
        });
      } catch (e) {
        console.error("fetchDoctorSummary failed:", e);
      }
    })();
  }, []);

  // ===== Load ALL appointments once (for cards) =====
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDoctorAppointments("");
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setAllAppointments(list);
      } catch (e) {
        console.error("fetchDoctorAppointments (all) failed:", e);
        setAllAppointments([]);
      }
    })();
  }, []);

  // ===== Load appointments for TABLE (depends on filter) =====
  useEffect(() => {
    (async () => {
      setLoadingAppt(true);
      setAppointments([]);
      try {
        const res = await fetchDoctorAppointments(status);
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setAppointments(list);
      } catch (e) {
        console.error("fetchDoctorAppointments failed:", e);
        setAppointments([]);
      } finally {
        setLoadingAppt(false);
      }
    })();
  }, [status]);

  // ===== CARD COUNTS (LUÔN TÍNH TỪ ALL) =====
  const waitingCount = allAppointments.filter(
    (a) => a.status === "REQUESTED" || a.status === "CONFIRMED"
  ).length;

  const doneCount = allAppointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const cancelledCount = allAppointments.filter(
    (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
  ).length;

  return (
    <div className="auth-card" style={{ maxWidth: 1080 }}>
      <h2>Doctor Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Tổng quan {sum.today} — quản lý và xem danh sách bệnh nhân.
      </p>

      {/* ===== DASH CARDS ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <DashCard title="Đang chờ" value={waitingCount} sub="Danh sách chờ (US9)" />
        <DashCard title="Đã khám" value={doneCount} sub="Lịch sử trong ngày" />
        <DashCard title="Đã huỷ" value={cancelledCount} sub="Lịch huỷ / không đến" />
        <DashCard title="Tin nhắn" value={sum.chats} sub="Trả lời bệnh nhân (US11)" />
        <DashCard title="KQ cần thông báo" value={sum.labToNotify} sub="Đẩy thông báo (US12)" />
      </div>

      {/* ===== APPOINTMENT TABLE ===== */}
      <div
        style={{
          marginTop: 24,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>Danh sách bệnh nhân hôm nay (US9)</div>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="WAITING">Đang chờ</option>
            <option value="DONE">Đã khám</option>
            <option value="CANCELLED">Đã huỷ</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          {loadingAppt ? (
            <p className="muted">Đang tải...</p>
          ) : appointments.length === 0 ? (
            <p className="muted">Không có lịch khám hôm nay</p>
          ) : (
            <DoctorAppointmentTable appointments={appointments} />
          )}
        </div>
      </div>

      {/* ===== US10 ===== */}
      <div
        style={{
          marginTop: 24,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Cập nhật trạng thái quy trình (US10)
        </div>
        <div className="muted">
          Chọn bệnh nhân và cập nhật 🟢/🟡/🔵. Thay đổi hiển thị tức thì cho bệnh nhân.
        </div>
        <div style={{ marginTop: 10 }}>
          <a href="/doctor/update-status" className="link">
            Đi đến trang cập nhật
          </a>
        </div>
      </div>
    </div>
  );
}
