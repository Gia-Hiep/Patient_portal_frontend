import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashCard from "../../components/DashCard";
import { getMyVisits, getVisitDetail } from "../../services/api";
import { listInvoices } from "../../services/billing";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

export default function PatientDashboard({ unread = 0 }) {
  const user = useSelector((s) => s.auth.user);

  const [sum, setSum] = useState({
    visits: 0,
    labResultsReady: 0,
    imagingCount: 0,

    unreadNoti: unread, // lấy từ props

    // billing
    invoicesTotal: 0,
    invoicesUnpaid: 0,
    unpaidAmount: 0,

    nextAppointment: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== Update unread từ props =====
  useEffect(() => {
    setSum((prev) => ({ ...prev, unreadNoti: unread || 0 }));
  }, [unread]);

  // ===== Load dashboard data (real) =====
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        setLoading(true);

        // ===== Visits & documents =====
        const visits = await getMyVisits(); // [{ id, visitDate, department, status, ... }]
        const visitList = Array.isArray(visits) ? visits : [];
        const visitCount = visitList.length;

        const details = await Promise.all(
          visitList.map((v) => getVisitDetail(v.id).catch(() => null))
        );

        let lab = 0;
        let imaging = 0;

        (details || []).forEach((d) => {
          (d?.documents || []).forEach((doc) => {
            const t = String(doc?.type || doc?.docType || "").toUpperCase();
            if (t === "LAB") lab += 1;
            if (t === "IMAGING") imaging += 1;
          });
        });

        // ===== Next appointment =====
        const now = new Date();
        const futureVisits = visitList
          .map((v) => ({ ...v, _dt: new Date(v.visitDate) }))
          .filter((v) => !isNaN(v._dt) && v._dt > now)
          .sort((a, b) => a._dt - b._dt);

        let nextAppointment = null;
        if (futureVisits.length > 0) {
          const nxt = futureVisits[0];
          nextAppointment = {
            time: nxt.visitDate,
            clinic: nxt.department || "Chưa cập nhật",
            status: nxt.status || "Sắp diễn ra",
          };
        }

        // ===== Billing =====
        const invoices = await listInvoices(); // [{ id, invoiceNo, totalAmount, status }, ...]
        const invoiceList = Array.isArray(invoices) ? invoices : [];
        const invoicesTotal = invoiceList.length;

        let invoicesUnpaid = 0;
        let unpaidAmount = 0;
        invoiceList.forEach((iv) => {
          if (String(iv?.status || "").toUpperCase() === "UNPAID") {
            invoicesUnpaid += 1;
            unpaidAmount += Number(iv?.totalAmount || 0);
          }
        });

        if (cancelled) return;

        setSum((prev) => ({
          ...prev,
          visits: visitCount,
          labResultsReady: lab,
          imagingCount: imaging,
          nextAppointment,
          invoicesTotal,
          invoicesUnpaid,
          unpaidAmount,
        }));
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Không tải được tổng quan bệnh nhân.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1024 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Patient Dashboard</h2>

        <Link to="/profile" className="chip-btn">
          Hồ sơ cá nhân
        </Link>
      </div>

      <p className="muted">Xin chào, {user?.username}. Đây là tổng quan sức khỏe của bạn.</p>

      {error && (
        <div className="alert error" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}

      {/* ===== Cards ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <DashCard
          title="Lịch sử khám bệnh"
          value={sum.visits}
          sub="Xem lịch sử khám & chi tiết"
          to="/visits"
        />

        <DashCard
          title="Thông báo chưa đọc"
          value={sum.unreadNoti}
          sub="Thông báo tự động (US5)"
          to="/user-notifications"
        />

        <DashCard
          title="Hóa đơn viện phí"
          value={sum.invoicesTotal}
          sub={`${sum.invoicesUnpaid} chưa thanh toán • ${vnd(sum.unpaidAmount)}`}
          to="/billing"
        />
      </div>

      {/* ===== Next appointment ===== */}
      <div
        style={{
          marginTop: 24,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        {/* ===== Quick links ===== */}
        <div style={{ marginTop: 18 }}>
          <Link to="/chat" className="link">
            Nhắn tin với bác sĩ (US8)
          </Link>
        </div>
        <div style={{ marginTop: 10 }}>
          <Link to="/process-status" className="link">
            Xem trạng thái quy trình khám
          </Link>
        </div>
        <div style={{ marginTop: 18 }}>
          <Link to="/user-notifications" className="link">
            Thông báo tự động (US5)
          </Link>
        </div>

        <div style={{ marginTop: 18 }}>
          <Link to="/notifications" className="link">
            Thông báo chung từ bệnh viện (US7)
          </Link>
        </div>
      </div>
    </div>
  );
}
