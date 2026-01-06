import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashCard from "../../components/DashCard";
import DoctorAppointmentTable from "../../components/DoctorAppointmentTable";
import {
  fetchDoctorSummary,
  fetchDoctorAppointments,
} from "../../services/dashboard";
import { listDoctorPatients } from "../../services/chat";
import "../../assets/styles/doctorDashboard.css";

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
    <div className="dd-shell">
      {/* ===== LEFT SIDEBAR (UI only) ===== */}
      <aside className="dd-sidebar">
        <div className="dd-doc">
          <div className="dd-docAvatar" aria-hidden="true">
            <div className="dd-docAvatarInner">👨‍⚕️</div>
          </div>
          <div className="dd-docInfo">
            <div className="dd-docName">{user?.username || "Dr. Nguyen"}</div>
            <div className="dd-docDept">Khoa Tim Mạch</div>
          </div>
        </div>

        <nav className="dd-nav">
          <a className="dd-navItem active" href="#dashboard">
            <span className="dd-navIcon" aria-hidden="true">
              ⬛
            </span>
            Dashboard
          </a>

          <Link to="/doctor/lab-notify" className="dd-navItem">
            <span className="dd-navIcon" aria-hidden="true">📁</span>
            Thông báo kết quả
            {sum.labToNotify > 0 && (
              <span className="dd-badge">{sum.labToNotify}</span>
            )}
          </Link>

          <Link to="/doctor-chat" className="dd-navItem">
            <span className="dd-navIcon" aria-hidden="true">💬</span>
            Tin nhắn
            {!loadingChats && chatCount > 0 && (
              <span className="dd-badge">{chatCount}</span>
            )}
          </Link>
          <Link to="/doctor/examination-progress" className="dd-navItem">
            <span className="dd-navIcon" aria-hidden="true">
              ↔
            </span>
            Cập nhật trạng thái
          </Link>


          <div className="dd-navDivider" />

          <a className="dd-navItem" href="#settings">
            <span className="dd-navIcon" aria-hidden="true">
              ⚙️
            </span>
            Cài đặt
          </a>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dd-main">
        <div className="dd-container">
          <div className="dd-header">
            <h2 className="dd-title">Doctor Dashboard</h2>
            <p className="dd-sub muted">
              Xin chào, {user?.username}. Tổng quan {sum.today || "Hôm nay"} — quản
              lý hàng đợi & trao đổi bệnh nhân.
            </p>
          </div>


          {/* ===== CONTENT GRID: table + right panels ===== */}
          <div className="dd-contentGrid">
            {/* LEFT: US9 table */}
            <section className="dd-card dd-tableCard">
              <div className="dd-sectionHead">
                <div className="dd-sectionTitle">
                  Danh sách bệnh nhân hôm nay (US9)
                </div>
                <a className="dd-sectionLink" href="#all">
                  Xem tất cả
                </a>
              </div>

              <div className="dd-tableBody">
                {loadingAppt ? (
                  <p className="muted">Đang tải...</p>
                ) : appointments.length === 0 ? (
                  <p className="muted">Không có lịch khám hôm nay</p>
                ) : (
                  <DoctorAppointmentTable appointments={appointments} />
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
