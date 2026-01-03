import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/* ================== PAGES ================== */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import VisitHistory from "./pages/VisitHistory";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import Billing from "./pages/Billing";
import ChatPatient from "./pages/ChatPatient";
import ChatDoctor from "./pages/ChatDoctor";
import Profile from "./pages/Profile";
import ProcessStatus from "./pages/ProcessStatus";
import AutoNotifications from "./pages/AutoNotifications";
import ExaminationProgress from "./pages/ExaminationProgress";
import LabResultNotify from "./pages/LabResultNotify";

/* ===== US14.2 - ADMIN DOCTORS ===== */
import AdminDoctors from "./pages/admin/AdminDoctors";

/* ================== SERVICES ================== */
import { getNotifications } from "./services/notification";
import { getAutoNotificationSetting } from "./services/notificationSetting";

/* ================== COMPONENTS ================== */
import NotificationBell from "./components/NotificationBell";

/* ================== TOAST ================== */
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================== GUARDS ================== */
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

  /* ===== POLLING NOTIFICATIONS ===== */
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

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
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
          path="/examination-progress"
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
          path="/lab-result-notify"
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
