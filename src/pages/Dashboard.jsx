import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

import PatientDashboard from "./dashboard/PatientDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";
import AppHeader from "../components/Header"; // ✅ thêm dòng này

export default function Dashboard({ unread }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // Truyền unread xuống từng loại Dashboard
  let dashboardComponent;
  switch (role) {
    case "ADMIN":
      dashboardComponent = <AdminDashboard unread={unread} />;
      break;
    case "DOCTOR":
      dashboardComponent = <DoctorDashboard unread={unread} />;
      break;
    default:
      dashboardComponent = <PatientDashboard unread={unread} />;
  }

  return (
    <div className="auth-container">
      {/* ✅ dùng header chung (có chuông, user, nút đăng xuất) */}
      <AppHeader />

      {/* phần nội dung dashboard */}
      {dashboardComponent}
    </div>
  );
}
