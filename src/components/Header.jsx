import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.auth.role);

  const title =
    role === "ADMIN"
      ? "Quản trị hệ thống"
      : role === "DOCTOR"
      ? "Bác sĩ"
      : "Bệnh nhân";

  const onLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(15, 20, 34, 0.95)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
        zIndex: 100,
      }}
    >
      <span style={{ fontWeight: 600, color: "#fff" }}>{title}</span>

      {/* Chuông thông báo + badge */}
      <NotificationBell />

      <span style={{ color: "#bbb" }}>{user?.username}</span>

      <button className="btn small" onClick={onLogout}>
        Đăng xuất
      </button>
    </header>
  );
}