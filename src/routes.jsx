import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import VisitHistory from "./pages/VisitHistory";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";

// ⭐ THÊM IMPORT
import ProcessStatus from "./pages/ProcessStatus";

function Protected({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
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
      <Route path="/register" element={<Register />} />
      <Route
        path="/visits"
        element={
          <Protected>
            <VisitHistory />
          </Protected>
        }
      ></Route>
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
    </Routes>
  );
}
