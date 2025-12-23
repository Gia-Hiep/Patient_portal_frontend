import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

export default function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const go = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <header
      style={{
        width: "100%",
        padding: "12px 24px",
        background: "#0f1422",
        borderBottom: "1px solid #222",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 99,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>

        {/* MENU RIÊNG CHO BÁC SĨ */}
        {role === "DOCTOR" && (
          <button
            onClick={() => go("/doctor/examination-progress")}
            style={{
              background: "transparent",
              border: "1px solid #2d3a57",
              color: "#9bb0d0",
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Tiến trình khám
          </button>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#bbb" }}>{user?.username}</span>
        <button className="btn small" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
