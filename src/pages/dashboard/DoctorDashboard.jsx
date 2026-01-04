import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashCard from "../../components/DashCard";
import DoctorAppointmentTable from "../../components/DoctorAppointmentTable";
import { fetchDoctorSummary, fetchDoctorAppointments } from "../../services/dashboard";
import { listDoctorPatients } from "../../services/chat"; 

export default function DoctorDashboard() {
  const user = useSelector((s) => s.auth.user);

  // ===== Summary (lab/today) =====
  const [sum, setSum] = useState({
    labToNotify: 0,
    today: "Hôm nay",
  });

  // ===== Chat peers count (REAL) =====
  const [chatCount, setChatCount] = useState(0);
  const [loadingChats, setLoadingChats] = useState(false);

  // ===== Appointments for CARDS (ALL) =====
  const [allAppointments, setAllAppointments] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // ===== Appointments for TABLE (filtered) =====
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(""); // "" | WAITING | DONE | CANCELLED
  const [loadingAppt, setLoadingAppt] = useState(false);

  // ===== Load summary (real) =====
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDoctorSummary();
        setSum({
          labToNotify: res?.labToNotify ?? 0,
          today: res?.today ?? "Hôm nay",
        });
      } catch (e) {
        console.error("fetchDoctorSummary failed:", e);
        setSum({ labToNotify: 0, today: "Hôm nay" });
      }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      setLoadingChats(true);
      try {
        const res = await listDoctorPatients(""); // q="" => lấy full list
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setChatCount(Array.isArray(list) ? list.length : 0);
      } catch (e) {
        console.error("listDoctorPatients failed:", e);
        setChatCount(0);
      } finally {
        setLoadingChats(false);
      }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      setLoadingAll(true);
      try {
        const res = await fetchDoctorAppointments("");
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setAllAppointments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("fetchDoctorAppointments (all) failed:", e);
        setAllAppointments([]);
      } finally {
        setLoadingAll(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingAppt(true);
      setAppointments([]);
      try {
        const res = await fetchDoctorAppointments(status);
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setAppointments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("fetchDoctorAppointments (filtered) failed:", e);
        setAppointments([]);
      } finally {
        setLoadingAppt(false);
      }
    })();
  }, [status]);

  const cardCounts = useMemo(() => {
    const waiting = allAppointments.filter(
      (a) => a.status === "REQUESTED" || a.status === "CONFIRMED"
    ).length;

    const inProgress = allAppointments.filter(
      (a) =>
        a.status === "IN_PROGRESS" ||
        a.status === "IN_EXAMINATION" ||
        a.status === "EXAMINING"
    ).length;

    const done = allAppointments.filter((a) => a.status === "COMPLETED").length;

    const cancelled = allAppointments.filter(
      (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
    ).length;

    return { waiting, inProgress, done, cancelled };
  }, [allAppointments]);

  return (
    <div className="auth-card" style={{ maxWidth: 1080 }}>
      <h2>Doctor Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Tổng quan {sum.today || "Hôm nay"} — quản lý hàng đợi & trao đổi bệnh nhân.
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
        <DashCard
          title="Đang chờ"
          value={loadingAll ? "…" : cardCounts.waiting}
          sub="Danh sách chờ (US9)"
          to="/doctor/queue?status=waiting"
        />
        <DashCard
          title="Đang khám"
          value={loadingAll ? "…" : cardCounts.inProgress}
          sub="Tiếp tục khám"
          to="/doctor/queue?status=in_progress"
        />
        <DashCard
          title="Đã khám"
          value={loadingAll ? "…" : cardCounts.done}
          sub="Lịch sử trong ngày"
          to="/doctor/queue?status=done"
        />

        <DashCard
          title="Tin nhắn"
          value={loadingChats ? "…" : chatCount}
          sub="Bệnh nhân đang trò chuyện (US11)"
          to="/doctor-chat"
        />

        <DashCard
          title="KQ cần thông báo"
          value={sum.labToNotify}
          sub="Đẩy thông báo (US12)"
          to="/doctor/lab-notify"
        />
      </div>

      {/* ===== US9: APPOINTMENT TABLE ===== */}
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

      {/* ===== US12: QUICK SECTION ===== */}
      <div
        style={{
          marginTop: 24,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Kết quả cần thông báo (US12)</div>
        <div className="muted">
          Xem danh sách bệnh nhân có kết quả xét nghiệm và gửi thông báo: “Kết quả xét nghiệm của bạn đã sẵn sàng.”
        </div>
        <div style={{ marginTop: 10 }}>
          <Link to="/doctor/lab-notify" className="link">
            Đi đến trang thông báo kết quả
          </Link>
        </div>
      </div>

      {/* ===== US10: EXAMINATION PROGRESS ===== */}
      <div
        style={{
          marginTop: 16,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Cập nhật trạng thái quy trình (US10)</div>
        <div className="muted">
          Chọn bệnh nhân và cập nhật 🟢/🟡/🔵. Thay đổi hiển thị tức thì cho bệnh nhân.
        </div>
        <div style={{ marginTop: 10 }}>
          <Link to="/doctor/examination-progress" className="link">
            Đi đến trang cập nhật
          </Link>
        </div>
      </div>
    </div>
  );
}
