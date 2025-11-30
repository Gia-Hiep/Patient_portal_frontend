import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import PatientDashboard from "./dashboard/PatientDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";
import AppHeader from "../components/Header"; // ✅ thêm dòng này

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  let dashboardComponent = null;
  if (role === "ADMIN") {
    dashboardComponent = <AdminDashboard />;
  } else if (role === "DOCTOR") {
    dashboardComponent = <DoctorDashboard />;
  } else {
    dashboardComponent = <PatientDashboard />;
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
