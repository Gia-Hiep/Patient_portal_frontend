<<<<<<< HEAD
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

export default function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.auth.role);

  const title =
    role === "ADMIN" ? "Quản trị hệ thống" :
    role === "DOCTOR" ? "Bác sĩ" :
    "Bệnh nhân";

  const onLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header style={{
      width: "100%",
      padding: "12px 24px",
      background: "#0f1422",
      borderBottom: "1px solid #222",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 99
    }}>
      <h2 style={{ margin: 0 }}>{title}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#bbb" }}>{user?.username}</span>
        <button className="btn small" onClick={onLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}
=======
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

export default function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.auth.role);

  const title =
    role === "ADMIN" ? "Quản trị hệ thống" :
    role === "DOCTOR" ? "Bác sĩ" :
    "Bệnh nhân";

  const onLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header style={{
      width: "100%",
      padding: "12px 24px",
      background: "#0f1422",
      borderBottom: "1px solid #222",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 99
    }}>
      <h2 style={{ margin: 0 }}>{title}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#bbb" }}>{user?.username}</span>
        <button className="btn small" onClick={onLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}
>>>>>>> 19f36464b14b0f999ad2f6f209e29ad287387a59
