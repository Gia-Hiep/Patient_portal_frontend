import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient } from "../services/auth"; // giữ như bạn đang dùng
import "../assets/styles/auth.css";
import { loginThunk, forgotPasswordThunk } from "../store/authThunks";
import { useDispatch, useSelector } from "react-redux";
import { getLockState, registerFailure, resetFailures } from "../utils/lockout";

const initial = {
  fullName: "",
  emailOrPhone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
};

export default function Register() {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState(null); // {type: 'success'|'error', text: string}
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({ emailOrPhone: "" }); // lỗi theo field
  const nav = useNavigate();
  const dispatch = useDispatch();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    if (fieldErr[name]) setFieldErr((s) => ({ ...s, [name]: "" })); // clear lỗi khi sửa
  };

  const validate = () => {
    if (!f.fullName.trim()) return "Vui lòng nhập Họ tên.";
    if (!f.emailOrPhone.trim()) return "Vui lòng nhập Email hoặc SĐT.";
    if (f.password.length < 8) return "Mật khẩu tối thiểu 8 ký tự.";
    if (f.password !== f.confirmPassword) return "Xác nhận mật khẩu không khớp.";
    if (!f.agreeTerms) return "Bạn phải đồng ý với điều khoản.";
    return null;
  };

  // Nhận biết lỗi trùng email từ backend
  const isEmailExistsError = (err) => {
    const m = (err?.message || "").toLowerCase();
    return err?.status === 409 || m.includes("đã tồn tại") || m.includes("exists");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setMsg({ type: "error", text: err });

    setLoading(true);
    setMsg(null);
    setFieldErr({ emailOrPhone: "" });

    try {
      const data = await registerPatient(f);
      setMsg({ type: "success", text: data?.message || "Đăng ký thành công!" });
      setTimeout(() => nav("/login"), 900);
    } catch (err2) {
      if (isEmailExistsError(err2)) {
        setFieldErr({ emailOrPhone: "Email đã tồn tại trong hệ thống." });
      } else {
        setMsg({ type: "error", text: err2?.message || "Đăng ký thất bại" });
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    const identifier = prompt("Nhập email (hoặc username) để nhận liên kết khôi phục:");
    if (!identifier) return;
    try {
      await dispatch(forgotPasswordThunk(identifier));
      alert("Nếu tài khoản tồn tại, liên kết đã được gửi.");
    } catch (e) {
      alert(e?.message || "Không thể gửi email khôi phục");
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="auth-topbar-inner">
          <div className="auth-brand" aria-label="Patient Portal">
            <span className="auth-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M5 12a7 7 0 1 1 14 0v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M12 7v10M7 12h10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="auth-brand-text">Patient Portal</span>
          </div>

          <nav className="auth-topbar-actions" aria-label="Header actions">
            <a className="auth-topbar-link" href="/login">
              Đăng Nhập
            </a>
          </nav>
        </div>
      </header>

      <main className="auth-container" role="main">
        <section className="auth-card" aria-label="Register form">
          <div className="auth-head">
            <h2 className="auth-title">ĐĂNG KÝ TÀI KHOẢN</h2>
            <p className="auth-muted">Tạo tài khoản để sử dụng cổng thông tin bệnh nhân</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                Họ Tên <span className="auth-required">*</span>
              </label>
              <input
                className="input"
                name="fullName"
                value={f.fullName}
                onChange={onChange}
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Email / Số điện thoại <span className="auth-required">*</span>
              </label>
              <input
                className={`input ${fieldErr.emailOrPhone ? "input-error" : ""}`}
                name="emailOrPhone"
                value={f.emailOrPhone}
                onChange={onChange}
                autoComplete="username"
              />
              {fieldErr.emailOrPhone && (
                <div className="field-error" role="alert">
                  {fieldErr.emailOrPhone}
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Mật khẩu <span className="auth-required">*</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  className="input auth-input-hasIcon"
                  type="password"
                  name="password"
                  value={f.password}
                  onChange={onChange}
                  autoComplete="new-password"
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Nhập lại mật khẩu <span className="auth-required">*</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  className="input auth-input-hasIcon"
                  type="password"
                  name="confirmPassword"
                  value={f.confirmPassword}
                  onChange={onChange}
                  autoComplete="new-password"
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={f.agreeTerms}
                  onChange={onChange}
                />
                <span>Tôi đồng ý với điều khoản &amp; chính sách</span>
              </label>
            </div>

            {msg && (
              <div className={`alert ${msg.type}`} role="alert">
                {msg.text}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </button>

            <div className="auth-footer">
              <div className="auth-footer-line">
                Bạn đã có tài khoản? <a href="/login">Đăng Nhập</a>
              </div>
              <button type="button" className="link auth-forgot" onClick={onForgot}>
                Quên mật khẩu?
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
