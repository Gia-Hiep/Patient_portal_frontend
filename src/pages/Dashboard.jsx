import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import PatientDashboard from "./dashboard/PatientDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

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

  let dashboardComponent;
  switch (role) {
    case "ADMIN":
      dashboardComponent = <AdminDashboard />;
      break;
    case "DOCTOR":
      dashboardComponent = <DoctorDashboard />;
      break;
    default:
      dashboardComponent = <PatientDashboard />;
  }

  return (
    <div className="auth-container">
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <button className="btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>

      {dashboardComponent}
    </div>
  );
}
