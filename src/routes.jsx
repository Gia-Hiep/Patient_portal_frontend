import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import VisitHistory from "./pages/VisitHistory";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import Billing from "./pages/Billing";
import ChatPatient from "./pages/ChatPatient";
import ChatDoctor from "./pages/ChatDoctor";

import AnnouncementsPage from "./pages/AnnouncementsPage";
import ProcessStatus from "./pages/ProcessStatus";

import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminBackups from "./pages/admin/AdminBackups";

// ---- guards ----
function Protected({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { token, role } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
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

      {/* US7 - bệnh nhân xem thông báo */}
      <Route
        path="/announcements"
        element={
          <Protected>
            <AnnouncementsPage />
          </Protected>
        }
      />

      <Route
        path="/process-tracking"
        element={
          <Protected>
            <ProcessStatus />
          </Protected>
        }
      />

      {/* Admin CRUD thông báo */}
      <Route
        path="/admin/announcements"
        element={
          <AdminOnly>
            <AdminAnnouncements />
          </AdminOnly>
        }
      />
      {/* Admin Backup dữ liệu (US16) */}
      <Route
        path="/admin/backups"
        element={
          <AdminOnly>
            <AdminBackups />
          </AdminOnly>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
