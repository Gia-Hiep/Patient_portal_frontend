import React from 'react';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 720 }}>
        <h2>Dashboard cá nhân</h2>
        <p className="muted">Xin chào, <b>{user?.username}</b> ({user?.role})</p>
        <button className="btn" onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
}
