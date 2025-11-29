import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashCard from "../../components/DashCard";
import { fetchPatientSummary } from "../../services/dashboard";

export default function PatientDashboard() {
  const user = useSelector((s) => s.auth.user);
  const [sum, setSum] = useState({
    visits: 0,
    labResultsReady: 0,
    unreadNoti: 0,
    unpaidInvoices: 0,
    nextAppointment: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchPatientSummary();
        setSum((prev) => ({ ...prev, ...res }));
      } catch {
        setSum({
          visits: 12,
          labResultsReady: 1,
          unreadNoti: 2,
          unpaidInvoices: 0,
          nextAppointment: {
            time: "10:30 - 21/11",
            clinic: "Tai–Mũi–Họng",
            status: "Đang chờ",
          },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1024 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Patient Dashboard</h2>
        <Link to="/profile" className="chip-btn">
          Hồ sơ cá nhân
        </Link>{" "}
        {}
      </div>

      <p className="muted">
        Xin chào, {user?.username}. Đây là tổng quan các chức năng của bạn.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <DashCard
          title="Lần khám đã lưu"
          value={sum.visits}
          sub="Tra cứu lịch sử khám (US2)"
          to="/records"
        />
        <DashCard
          title="KQ xét nghiệm mới"
          value={sum.labResultsReady}
          sub="Xem / tải PDF (US3)"
          to="/lab-results"
        />
        <DashCard
          title="Thông báo chưa đọc"
          value={sum.unreadNoti}
          sub="Thông báo tự động (US5/7)"
          to="/notifications"
        />
        <DashCard
          title="Hóa đơn chưa thanh toán"
          value={sum.unpaidInvoices}
          sub="Thanh toán online (US6)"
          to="/billing"
        />
      </div>

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
          Lịch khám sắp tới (US1/US4)
        </div>
        {loading ? (
          <div className="muted">Đang tải…</div>
        ) : sum.nextAppointment ? (
          <div>
            <div>
              <b>Thời gian:</b> {sum.nextAppointment.time}
            </div>
            <div>
              <b>Phòng:</b> {sum.nextAppointment.clinic}
            </div>
            <div>
              <b>Trạng thái:</b> {sum.nextAppointment.status}
            </div>
            <div style={{ marginTop: 10 }}>
              <Link to="/process-tracking" className="link">
                Xem trạng thái quy trình khám
              </Link>
            </div>
          </div>
        ) : (
          <div className="muted">Chưa có lịch khám.</div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <Link to="/chat" className="link">
          Nhắn tin với bác sĩ (US8)
        </Link>
      </div>
    </div>
  );
}
