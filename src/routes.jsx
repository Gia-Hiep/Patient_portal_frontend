import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/* ================== PAGES ================== */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import VisitHistory from "./pages/VisitHistory";
import Profile from "./pages/Profile";

import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import Billing from "./pages/Billing";

import ChatPatient from "./pages/ChatPatient";
import ChatDoctor from "./pages/ChatDoctor";
import ProcessStatus from "./pages/ProcessStatus";
import ExaminationProgress from "./pages/ExaminationProgress";
import AutoNotifications from "./pages/AutoNotifications";
import LabResultNotify from "./pages/LabResultNotify";

// ✅ US14.2 (đang có)
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import UserCreatePage from "./pages/admin/UserCreatePage";

import AdminBackupsPage from "./pages/admin/AdminBackupsPage";
import AnnouncementsPage from "./pages/patient/AnnouncementsPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
// ✅ US14.1 (bạn tạo file theo mình gửi)
import Services from "./pages/Services";
import AdminServicesPage from "./pages/admin/AdminServicesPage";

/* ===== US14.2 - ADMIN DOCTORS ===== */
import AdminDoctors from "./pages/admin/AdminDoctors";

/* ================== SERVICES ================== */
import { getNotifications } from "./services/notification";
import { getAutoNotificationSetting } from "./services/notificationSetting";

/* ================== COMPONENTS ================== */
import NotificationBell from "./components/NotificationBell";

/* ================== GUARDS ================== */

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===============================
// PROTECTED ROUTE
// ===============================

function Protected({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const role = useSelector((s) => s.auth.role);
  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

/* ================== ROUTES ================== */
export default function AppRoutes() {
  const token = useSelector((s) => s.auth.token);


  const [unread, setUnread] = useState(0);
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(true);

  const lastIdsRef = useRef([]);

  /* ===== LOAD SETTING ===== */
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    (async () => {
      try {
        const setting = await getAutoNotificationSetting();
        if (!mounted) return;

        const enabled = !!setting?.enabled;
        setAutoNotifyEnabled(enabled);

        const list = await getNotifications();
        if (Array.isArray(list)) {
          lastIdsRef.current = list.map((n) => n.id);
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);


  useEffect(() => {
    if (!token || !autoNotifyEnabled) return;

    const poll = async () => {
      try {
        const list = await getNotifications();
        if (!Array.isArray(list)) return;

        const currentIds = list.map((n) => n.id);
        const lastIds = lastIdsRef.current;

        const newIds = currentIds.filter((id) => !lastIds.includes(id));

        newIds.forEach((id) => {
          const ntf = list.find((n) => n.id === id);
          if (ntf?.status === "UNREAD") {
            toast.info(`🔔 ${ntf.title}`);
            setUnread((u) => u + 1);
          }
        });

        lastIdsRef.current = currentIds;
      } catch (err) {
        console.error(err);
      }
    };

    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [token, autoNotifyEnabled]);

  /* ================== RETURN ================== */
  return (
    <>
      <ToastContainer position="top-right" />
      <NotificationBell count={unread} />

      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />


        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/visits"
          element={
            <Protected>
              <VisitHistory />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <Notifications />
            </Protected>
          }
        />
        <Route
          path="/user-notifications"
          element={
            <Protected>
              <UserNotifications />
            </Protected>
          }
        />

        <Route
          path="/billing"
          element={
            <Protected>
              <Billing />
            </Protected>
          }
        />

        <Route
          path="/chat"
          element={
            <Protected>
              <ChatPatient />
            </Protected>
          }
        />

        <Route
          path="/doctor-chat"
          element={
            <Protected>
              <ChatDoctor />
            </Protected>
          }
        />

        <Route
          path="/process-status"
          element={
            <Protected>
              <ProcessStatus />
            </Protected>
          }
        />

        <Route
          path="doctor/examination-progress"
          element={
            <Protected>
              <ExaminationProgress />
            </Protected>
          }
        />

        <Route
          path="/autonotifications"
          element={
            <Protected>
              <AutoNotifications
                autoNotifyEnabled={autoNotifyEnabled}
                setAutoNotifyEnabled={setAutoNotifyEnabled}
                setUnread={setUnread}
              />
            </Protected>
          }
        />

        <Route
          path="/doctor/lab-notify"
          element={
            <Protected>
              <LabResultNotify />
            </Protected>
          }
        />

        {/* ===== US14.2 ===== */}
        <Route
          path="/admin/doctors"
          element={
            <Protected>
              <AdminOnly>
                <AdminDoctors />
              </AdminOnly>
            </Protected>
          }
        />
        {/* ✅ US14.1: Patient tra cứu dịch vụ */}
        <Route
          path="/services"
          element={
            <Protected>
              <Services />
            </Protected>
          }
        />

        {/* ✅ US14.1: Admin quản lý dịch vụ */}
        <Route
          path="/admin/services"
          element={
            <Protected>
              <AdminServicesPage />``
            </Protected>
          }
        />

        {/* ✅ US14.2: Admin quản lý user */}
        <Route
          path="/admin/users"
          element={
            <Protected>
              <AdminUsersPage />
            </Protected>
          }
        />

        <Route
          path="/admin/users/create"
          element={
            <Protected>
              <UserCreatePage />
            </Protected>
          }
        />

        {/* NOT FOUND */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/admin/users"
          element={
            <Protected>
              <AdminUsersPage />
            </Protected>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <Protected>
              <UserCreatePage />
            </Protected>
          }
        />
      
      <Route
        path="/admin/backup"
        element={
          <Protected>
            <AdminBackupsPage />
          </Protected>
        }
      />
      <Route
        path="/announcements"
        element={
          <Protected>
            <AnnouncementsPage />
          </Protected>}
      />

      <Route
        path="/admin/announcements"
        element={
          <Protected>
            <AdminAnnouncementsPage />
          </Protected>}
      />
      </Routes>
    </>
  );
}
