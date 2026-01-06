import React from "react";
import { useSelector } from "react-redux";
import "../assets/styles/base.css";

export default function AppFooter() {
  const role = useSelector((s) => s.auth.role);

  const roleLabel =
    role === "ADMIN"
      ? "Admin"
      : role === "DOCTOR"
      ? "Doctor"
      : role === "PATIENT"
      ? "Patient"
      : "Guest";

  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__left">
          <span className="app-footer__brand">Patient Portal</span>
          <span className="app-footer__sep">•</span>
          <span className="app-footer__muted">Vai trò: {roleLabel}</span>
        </div>

        <div className="app-footer__right">
          <span className="app-footer__muted">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
