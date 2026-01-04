import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashCard from "../../components/DashCard";
import { getMyVisits, getVisitDetail } from "../../services/api";
import { listInvoices } from "../../services/billing";
import "../../assets/styles/patientDashboard.css";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

export default function PatientDashboard({ unread = 0 }) {
  const user = useSelector((s) => s.auth.user);

  const [sum, setSum] = useState({
    visits: 0,
    labResultsReady: 0,
    imagingCount: 0,
    unreadNoti: 0,

    // billing (mới)

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
    let mounted = true;
    setSum((prev) => ({ ...prev, unreadNoti: unread || 0 }));
  }, [unread]);

  // ===== Load dashboard data (real) =====
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        setLoading(true);

        // chạy song song 2 API lớn
        const [visitsRes, invoicesRes] = await Promise.allSettled([
          getMyVisits(),
          listInvoices(),
        ]);

        // ===== Visits (cũ) =====
        const visits =
          visitsRes.status === "fulfilled" && Array.isArray(visitsRes.value)
            ? visitsRes.value
            : [];

        const visitCount = visits.length;

        const details = await Promise.all(
          visits.map((v) => getVisitDetail(v.id).catch(() => null))
        );

        let lab = 0,
          imaging = 0;
        details.forEach((d) => {
          (d?.documents || []).forEach((doc) => {
            const t = String(doc?.type || doc?.docType || "").toUpperCase();
            if (t === "LAB") lab += 1;
            if (t === "IMAGING") imaging += 1;
          });
        });

        // next appointment
        const now = new Date();
        const futureVisits = visits
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

        // ===== Billing (mới) =====
        const invoices =
          invoicesRes.status === "fulfilled" && Array.isArray(invoicesRes.value)
            ? invoicesRes.value
            : [];

        const invoicesTotal = invoices.length;

        let invoicesUnpaid = 0;
        let unpaidAmount = 0;
        invoices.forEach((iv) => {
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

        // nếu 1 trong 2 API fail thì báo nhẹ
        const errs = [];
        if (visitsRes.status === "rejected") errs.push("lịch sử khám");
        if (invoicesRes.status === "rejected") errs.push("hóa đơn");
        if (errs.length) {
          setError(`Không tải được: ${errs.join(", ")}.`);
        }
      } catch (e) {
        setError(e?.message || "Không tải được tổng quan bệnh nhân.");
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pd-shell">
      <div className="pd-wrap">
        {/* 1) Header row */}
        <div className="pd-head">
          <div>
            <h2 className="pd-title">Patient Dashboard</h2>
            <p className="pd-sub muted">
              Xin chào, {user?.username}. Đây là tổng quan sức khỏe của bạn.
            </p>
          </div>

          <Link to="/profile" className="pd-profileBtn">
            Hồ sơ cá nhân
          </Link>
        </div>

        {/* 3) Error / Loading */}
        {error && <div className="pd-alertError">{error}</div>}
        {loading && <div className="pd-loading muted">Đang tải…</div>}

        {/* 4) KPI cards grid */}
        <div className="pd-kpis">
          <DashCard
            title="Lịch sử khám bệnh"
            value={sum.visits}
            sub="Xem lịch sử khám & chi tiết"
            to="/visits"
          />

          <DashCard
            title="Hóa đơn viện phí"
            value={sum.invoicesTotal}
            sub={`${sum.invoicesUnpaid} chưa thanh toán • ${vnd(sum.unpaidAmount)}`}
            to="/billing"
          />

          <DashCard
            title="Thông báo chưa đọc"
            value={sum.unreadNoti}
            sub="Thông báo tự động (US5)"
            to="/user-notifications"
          />
        </div>

        {/* 5) Next appointment panel */}
        <div className="pd-nextPanel">
          <div className="pd-nextLabel">
            <span className="pd-dot" aria-hidden="true" />
            LỊCH KHÁM SẮP TỚI
          </div>

          {loading ? (
            <div className="muted">Đang tải…</div>
          ) : sum.nextAppointment ? (
            <div className="pd-nextBody">
              <div className="pd-nextTitle">Tái khám Nội Tổng Quát</div>

              <div className="pd-nextInfo">
                <div className="pd-infoRow">
                  <span className="pd-infoIcon" aria-hidden="true">
                    🕒
                  </span>
                  <div>
                    <b>Thời gian:</b> {sum.nextAppointment.time}
                  </div>
                </div>

                <div className="pd-infoRow">
                  <span className="pd-infoIcon" aria-hidden="true">
                    📍
                  </span>
                  <div>
                    <b>Phòng:</b> {sum.nextAppointment.clinic}
                  </div>
                </div>

                <div className="pd-infoRow">
                  <span className="pd-infoIcon" aria-hidden="true">
                    👤
                  </span>
                  <div>
                    <b>Trạng thái:</b> {sum.nextAppointment.status}
                  </div>
                </div>
              </div>

              <div className="pd-nextActions">
                <Link to="/process-tracking" className="pd-primaryBtn">
                  Xem trạng thái quy trình khám
                  <span className="pd-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>

                {/* chip nhỏ góc phải như reference (chỉ UI) */}
                <div className="pd-statusChip">
                  <div className="pd-chipTop">Đang chờ</div>
                  <div className="pd-chipMain">Bạn chưa check-in</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="muted">Chưa có lịch khám.</div>
          )}
        </div>

        {/* 6) Quick actions panel */}
        <div className="pd-quick">
          <div className="pd-quickTitle">Truy cập nhanh</div>

          <div className="pd-quickGrid">
            <Link to="/chat" className="pd-quickItem">
              <div className="pd-quickIcon" aria-hidden="true">
                💬
              </div>
              <div className="pd-quickText">
                <div className="pd-quickMain">Nhắn tin với bác sĩ</div>
                <div className="pd-quickSub muted">Tư vấn trực tuyến (US8)</div>
              </div>
            </Link>

            <Link to="/process-status" className="pd-quickItem">
              <div className="pd-quickIcon" aria-hidden="true">
                🔄
              </div>
              <div className="pd-quickText">
                <div className="pd-quickMain">Quy trình khám</div>
                <div className="pd-quickSub muted">Xem trạng thái quy trình khám</div>
              </div>
            </Link>

            <Link to="/notifications" className="pd-quickItem">
              <div className="pd-quickIcon" aria-hidden="true">
                📣
              </div>
              <div className="pd-quickText">
                <div className="pd-quickMain">Tin tức bệnh viện</div>
                <div className="pd-quickSub muted">
                  Thông báo chung từ bệnh viện (US7)
                </div>
              </div>
            </Link>

            <Link to="/user-notifications" className="pd-quickItem">
              <div className="pd-quickIcon" aria-hidden="true">
                🤖
              </div>
              <div className="pd-quickText">
                <div className="pd-quickMain">Thông báo tự động</div>
                <div className="pd-quickSub muted">Thông báo tự động (US5)</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
