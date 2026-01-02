import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson } from "../services/api";
import "../assets/styles/auth.css";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await getJson("/api/announcements");
        setItems(data || []);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Không tải được thông báo");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="auth-container notifications-page">
      {/* LAYOUT CHÍNH: trái = menu (1/3), phải = thông báo (2/3) */}
      <div className="notif-layout">
        {/* SIDEBAR MENU BÊN TRÁI */}
        <aside className="notif-side-nav">
          <div className="notif-side-title">Menu</div>

          <button
            className="notif-side-btn"
            onClick={() => navigate("/dashboard")}
          >
            Lịch khám
          </button>

          <button
            className="notif-side-btn"
            onClick={() => navigate("/dashboard")}
          >
            Kết quả
          </button>

          <button
            className="notif-side-btn notif-side-btn-active"
            onClick={() => navigate("/notifications")}
          >
            Thông báo
          </button>

          <button className="notif-side-btn" disabled>
            Tin nhắn
          </button>

          <button className="notif-side-btn" disabled>
            Viện phí
          </button>
        </aside>

        {/* CỘT PHẢI: Nút + tiêu đề + danh sách thông báo */}
        <main className="notif-main">
          {/* 🔹 Nút Trang chủ / Hồ sơ nằm trên phần thông báo */}
          <div className="notif-top-nav">
            <button
              className="notif-top-btn"
              onClick={() => navigate("/dashboard")}
            >
              Trang chủ
            </button>
            <button
              className="notif-top-btn"
              onClick={() => navigate("/profile")}
            >
              Hồ sơ
            </button>
          </div>

          <h1 className="notif-title">Thông báo</h1>

          {loading && <div>Đang tải thông báo...</div>}
          {err && <div className="alert">{err}</div>}

          {!loading && !err && items.length === 0 && (
            <div style={{ marginTop: 16 }}>Hiện chưa có thông báo mới.</div>
          )}

          {!loading && !err && items.length > 0 && (
            <div className="notif-card-list">
              {items.map((n) => (
                <div key={n.id} className="notif-card">
                  <div className="notif-card-title">{n.title}</div>
                  <div className="notif-card-sub">
                    {n.content || n.level || "Thông báo từ bệnh viện"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
