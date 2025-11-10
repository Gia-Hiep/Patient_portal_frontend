import React, { useEffect, useState } from 'react';
import { loginApi, forgotPasswordApi } from '../services/auth';
import { getLockState, registerFailure, resetFailures } from '../utils/lockout';
import '../assets/styles/auth.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [id, setId] = useState('');          // email / số ĐT / username
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);       // trigger re-render mỗi giây để cập nhật countdown

  // Đếm ngược khoá
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Nếu đã có token -> sang dashboard
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) nav('/dashboard', { replace: true });
  }, [nav]);

  const lock = getLockState(id || 'anonymous'); // tick làm component re-render mỗi giây

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (lock.locked) return;

    if (!id || !pw) {
      setErr('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(id, pw);
      resetFailures(id || 'anonymous');

      // Lưu token + user
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      nav('/dashboard', { replace: true });
    } catch (error) {
      if (error?.status === 401) registerFailure(id || 'anonymous');
      setErr(error?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    const identifier = prompt('Nhập email (hoặc username) để nhận liên kết khôi phục:');
    if (!identifier) return;
    try {
      await forgotPasswordApi(identifier); // Gửi { identifier }
      alert('Nếu tài khoản tồn tại, liên kết khôi phục đã được gửi.');
    } catch (e) {
      alert(e?.message || 'Không thể gửi email khôi phục');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Đăng nhập</h2>
        <p className="muted">Nhập email / số điện thoại hoặc tên đăng nhập, và mật khẩu.</p>

        {err && <div className="alert">{err}</div>}

        <label> Email / Số điện thoại / Username </label>
        <input
          className="input"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="vd: patient01@hospital.local"
          autoComplete="username"
        />

        <label> Mật khẩu </label>
        <input
          className="input"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button className="btn" type="submit" disabled={loading || lock.locked}>
          {lock.locked ? `Bị khóa ${lock.remaining}s` : (loading ? 'Đang đăng nhập...' : 'Đăng nhập')}
        </button>

        <div className="row">
          <span className="muted">Sai 3 lần sẽ khóa 1 phút</span>
          <button type="button" className="link" onClick={onForgot}>Quên mật khẩu?</button>
        </div>
      </form>
    </div>
  );
}
