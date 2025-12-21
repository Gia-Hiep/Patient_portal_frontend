import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import { fetchDoctorSummary } from "../../services/dashboard";

export default function DoctorDashboard() {
  const user = useSelector((s) => s.auth.user);
  const [sum, setSum] = useState({
    waiting: 0,
    inProgress: 0,
    done: 0,
    chats: 0,
    labToNotify: 0,
    today: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDoctorSummary();
        setSum(res);
      } catch {
        setSum({ waiting: 4, inProgress: 1, done: 7, chats: 3, labToNotify: 2, today: "Hôm nay" });
      }
    })();
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1080 }}>
      <h2>Doctor Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Tổng quan {sum.today} — quản lý hàng đợi & trao đổi bệnh nhân.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <DashCard title="Đang chờ" value={sum.waiting} sub="Danh sách chờ (US9)" to="/doctor/queue?status=waiting" />
        <DashCard title="Đang khám" value={sum.inProgress} sub="Tiếp tục khám" to="/doctor/queue?status=in_progress" />
        <DashCard title="Đã khám" value={sum.done} sub="Lịch sử trong ngày" to="/doctor/queue?status=done" />
        <DashCard title="Tin nhắn" value={sum.chats} sub="Trả lời bệnh nhân (US11)" to="/doctor-chat" />
        <DashCard title="KQ cần thông báo" value={sum.labToNotify} sub="Đẩy thông báo (US12)" to="/doctor/lab-notify" />
      </div>

      <div style={{ marginTop: 24, background: "#0f1422", border: "1px solid #223", borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Cập nhật trạng thái quy trình (US10)</div>
        <div className="muted">
          Chọn bệnh nhân và cập nhật 🟢/🟡/🔵. Thay đổi hiển thị tức thì cho bệnh nhân.
        </div>
        <div style={{ marginTop: 10 }}>
          <a href="/doctor/update-status" className="link">Đi đến trang cập nhật</a>
        </div>
      </div>
    </div>
  );
}
