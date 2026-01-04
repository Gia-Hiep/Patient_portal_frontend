import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, forgotPasswordThunk } from "../store/authThunks";
import { getLockState, registerFailure, resetFailures } from "../utils/lockout";
import "../assets/styles/auth.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const token = useSelector((s) => s.auth.token);

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(null);
  const [, setTick] = useState(0);

  // re-render mỗi giây cho countdown
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  // đã đăng nhập -> về dashboard
  useEffect(() => {
    if (token) nav("/dashboard", { replace: true });
  }, [token, nav]);

  const lock = getLockState(id || "anonymous");
  const loading = authStatus === "loading";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (lock.locked) return;
    if (!id || !pw) {
      setErr("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await dispatch(loginThunk(id, pw)).unwrap();
      resetFailures(id || "anonymous");
      nav("/dashboard", { replace: true });
    } catch (error) {
      if (error?.status === 401) registerFailure(id || "anonymous");
      setErr(error?.message || "Đăng nhập thất bại");
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
    <div className="auth-page auth-page--compact">
      <main className="auth-container" role="main">
        <form className="auth-card auth-card--compact" onSubmit={onSubmit}>
          <div className="auth-head">
            <div className="auth-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M6.5 5.5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M12 8v10M7 13h10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 className="auth-title auth-title--compact">Đăng nhập</h2>
            <p className="muted auth-muted">
              Nhập email / số điện thoại hoặc tên đăng nhập, và mật khẩu.
            </p>
          </div>

          {err && (
            <div className="alert alert--error" role="alert">
              {err}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email / Số điện thoại / Username</label>
            <input
              className="input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="vd: patient01@hospital.local"
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Mật khẩu</label>
            <div className="auth-input-wrap">
              <input
                className="input auth-input-hasIcon"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <span className="auth-input-icon" aria-hidden="true" title="">
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

          <div className="auth-info">
            <span className="muted">Sai 3 lần sẽ khóa 1 phút</span>
          </div>

          <button className="btn" type="submit" disabled={loading || lock.locked}>
            {lock.locked
              ? `Bị khóa ${lock.remaining}s`
              : loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>

          <div className="auth-footer auth-footer--split">
            <a href="/register" className="auth-footer-link">
              Đăng Ký
            </a>
            <button type="button" className="link" onClick={onForgot}>
              Quên mật khẩu?
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
