import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import VisitHistory from "./pages/VisitHistory";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import Billing from "./pages/Billing";
import ChatPatient from "./pages/ChatPatient";
import ChatDoctor from "./pages/ChatDoctor";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ProcessStatus from "./pages/ProcessStatus";

/** Route bảo vệ bằng JWT */
function Protected({ children }) {
  const token = useSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
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
        path="/visits"
        element={
          <Protected>
            <VisitHistory />
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

      {/* ✅ US15 – Thông báo bệnh viện */}
      <Route
        path="/announcements"
        element={
          <Protected>
            <AnnouncementsPage />
          </Protected>
        }
      />

      {/* Optional */}
      <Route
        path="/process-status"
        element={
          <Protected>
            <ProcessStatus />
          </Protected>
        }
      />
    </Routes>
  );
}
