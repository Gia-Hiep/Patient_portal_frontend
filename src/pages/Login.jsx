import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, forgotPasswordThunk } from '../store/authThunks';
import { getLockState, registerFailure, resetFailures } from '../utils/lockout';
import '../assets/styles/auth.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector(s => s.auth.status);
  const token = useSelector(s => s.auth.token);

  const [id, setId] = useState(''); 
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(null);
  const [, setTick] = useState(0);

  // re-render mỗi giây cho countdown
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 1000); return ()=>clearInterval(t); }, []);
  // đã đăng nhập -> về dashboard
  useEffect(() => { if (token) nav('/dashboard', { replace: true }); }, [token, nav]);

  const lock = getLockState(id || 'anonymous');
  const loading = authStatus === 'loading';

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (lock.locked) return;
    if (!id || !pw) { setErr('Vui lòng nhập đầy đủ thông tin'); return; }

    try {
      await dispatch(loginThunk(id, pw)).unwrap();
      resetFailures(id || 'anonymous');
      nav('/dashboard', { replace: true });
    } catch (error) {
      if (error?.status === 401) registerFailure(id || 'anonymous');
      setErr(error?.message || 'Đăng nhập thất bại');
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
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Đăng nhập</h2>
        <p className="muted">Nhập email / số điện thoại hoặc tên đăng nhập, và mật khẩu.</p>

        {err && <div className="alert">{err}</div>}

        <label>Email / Số điện thoại / Username</label>
        <input className="input" value={id} onChange={e=>setId(e.target.value)} placeholder="vd: patient01@hospital.local" autoComplete="username" />

        <label>Mật khẩu</label>
        <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password" />

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
