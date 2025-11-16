import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient } from "../services/auth";  // giữ như bạn đang dùng
import "../assets/styles/auth.css";
import { loginThunk, forgotPasswordThunk } from '../store/authThunks';
import { useDispatch, useSelector } from 'react-redux';
import { getLockState, registerFailure, resetFailures } from '../utils/lockout';
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
      const identifier = prompt('Nhập email (hoặc username) để nhận liên kết khôi phục:');
      if (!identifier) return;
      try {
        await dispatch(forgotPasswordThunk(identifier));
        alert('Nếu tài khoản tồn tại, liên kết đã được gửi.');
      } catch (e) {
        alert(e?.message || 'Không thể gửi email khôi phục');
      }
    };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">ĐĂNG KÝ TÀI KHOẢN</h2>
        <p className="auth-muted">Tạo tài khoản để sử dụng cổng thông tin bệnh nhân</p>

        <form onSubmit={onSubmit} noValidate>
          <label>Họ Tên</label>
          <input
            className="input"
            name="fullName"
            value={f.fullName}
            onChange={onChange}
          />

          <label>Email / Số điện thoại</label>
          <input
            className={`input ${fieldErr.emailOrPhone ? "input-error" : ""}`}
            name="emailOrPhone"
            value={f.emailOrPhone}
            onChange={onChange}
          />
          {fieldErr.emailOrPhone && (
            <div className="field-error">{fieldErr.emailOrPhone}</div>
          )}

          <label>Mật khẩu</label>
          <input
            className="input"
            type="password"
            name="password"
            value={f.password}
            onChange={onChange}
          />

          <label>Nhập lại mật khẩu</label>
          <input
            className="input"
            type="password"
            name="confirmPassword"
            value={f.confirmPassword}
            onChange={onChange}
          />

          <div className="row">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={f.agreeTerms}
              onChange={onChange}
            />
            <span>Tôi đồng ý với điều khoản &amp; chính sách</span>
          </div>

          {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>

          <div className="auth-footer">
            Bạn đã có tài khoản? <a href="/login">Đăng Nhập</a> ·{" "}
         <button type="button" className="link" onClick={onForgot}>Quên mật khẩu?</button>
          </div>
        </form>
      </div>
    </div>
  );
}
