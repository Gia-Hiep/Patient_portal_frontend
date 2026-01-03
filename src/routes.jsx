import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ExaminationProgress from "./pages/ExaminationProgress";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VisitHistory from "./pages/VisitHistory";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import Billing from "./pages/Billing";
import ChatPatient from "./pages/ChatPatient";
import ChatDoctor from "./pages/ChatDoctor";
import Profile from "./pages/Profile";

import ProcessStatus from "./pages/ProcessStatus";
import AutoNotifications from "./pages/AutoNotifications";

import { getNotifications } from "./services/notification";
import { getAutoNotificationSetting } from "./services/notificationSetting";
import NotificationBell from "./components/NotificationBell";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LabResultNotify from "./pages/LabResultNotify";
// ===============================
// PROTECTED ROUTE
// ===============================
function Protected({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ===============================
// APP ROUTES
// ===============================
export default function AppRoutes() {
  const token = useSelector((s) => s.auth.token);

  // 🔔 Số thông báo chưa đọc (chỉ AutoNotifications được update)
  const [unread, setUnread] = useState(0);

  // 🔕 Setting bật / tắt auto notification
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(true);

  // Lưu ID để phát hiện thông báo mới
  const lastIdsRef = useRef([]);

  // ===============================
  // LOAD SETTING KHI CÓ TOKEN
  // ===============================
  useEffect(() => {
    if (!token) return;

    let mounted = true;

    (async () => {
      try {
        const setting = await getAutoNotificationSetting();
        if (!mounted) return;

        const enabled = !!setting?.enabled;
        setAutoNotifyEnabled(enabled);

        // Prime ID để tránh toast dồn khi bật
        const list = await getNotifications();
        if (Array.isArray(list)) {
          lastIdsRef.current = list.map((n) => n.id);
        }
      } catch (err) {
        console.error("Load notification setting failed:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  // ===============================
  // POLLING NHẬN THÔNG BÁO MỚI
  // (CHỈ KHI BẬT)
  // ===============================
  useEffect(() => {
    if (!token) return;
    if (!autoNotifyEnabled) return;

    const poll = async () => {
      try {
        const list = await getNotifications();
        if (!Array.isArray(list)) return;

        const currentIds = list.map((n) => n.id);
        const lastIds = lastIdsRef.current;

        const newIds = currentIds.filter(
          (id) => !lastIds.includes(id)
        );

        newIds.forEach((id) => {
          const ntf = list.find((n) => n.id === id);
          if (ntf && ntf.status === "UNREAD") {
            toast.info(`🔔 ${ntf.title}`);
          }
        });

        lastIdsRef.current = currentIds;
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    const timer = setInterval(poll, 5000);

    return () => clearInterval(timer);
  }, [token, autoNotifyEnabled]);

  // ===============================
  // RETURN ROUTES
  // ===============================
  return (
    <>
      <ToastContainer position="top-right" />

      {/* ICON CHUÔNG CHUNG */}
      <NotificationBell count={unread} />

      <Routes>
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
        <Route path="/register" element={<Register />} />
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
          path="/lab-result-notifications"
          element={
            <Protected>
              <LabResultNotify />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}