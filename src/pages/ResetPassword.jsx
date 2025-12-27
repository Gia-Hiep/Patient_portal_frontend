import React, { useMemo, useState } from "react";
import { resetPasswordApi } from "../services/auth";
import "../assets/styles/auth.css";

export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy token từ query ?token=...
  const token = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("token") || "";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token) {
      setErr("Thiếu token khôi phục. Hãy mở link từ email.");
      return;
    }
    if (!pw || !cpw) {
      setErr("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (pw.length < 8) {
      setErr("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    if (pw !== cpw) {
      setErr("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(token, pw);
      setMsg(
        "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới."
      );
      // Tự động về trang đăng nhập sau 2 giây
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (e2) {
      setErr(
        e2?.message ||
          "Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc đã dùng."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Đặt lại mật khẩu</h2>
        <p className="muted">Nhập mật khẩu mới cho tài khoản của bạn.</p>

        {err && <div className="alert">{err}</div>}
        {msg && (
          <div
            className="alert"
            style={{
              color: "#b7ffc3",
              borderColor: "#3a6a4b",
              background: "#1c2a23",
            }}
          >
            {msg}
          </div>
        )}

        <label>Mật khẩu mới</label>
        <input
          className="input"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <label>Nhập lại mật khẩu</label>
        <input
          className="input"
          type="password"
          value={cpw}
          onChange={(e) => setCpw(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
}
