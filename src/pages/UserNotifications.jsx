import React, { useEffect, useState } from "react";
import {
  fetchUserNotifications,
  markNotificationRead,
} from "../services/userNotifications";
import { Link } from "react-router-dom";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const now = new Date();
  const t = new Date(isoStr);
  const diffMs = now - t;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}

export default function UserNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchUserNotifications();
      setItems(data || []);
      setError(null);
    } catch (e) {
      setError(e.message || "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClick = async (n) => {
    if (n.status === "UNREAD") {
      try {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, status: "READ" } : x))
        );
      } catch (e) {
        console.error(e);
        // có thể hiện toast lỗi nhẹ
      }
    }
  };

  if (loading) return <div className="page">Đang tải thông báo...</div>;
  if (error) return <div className="page">Lỗi: {error}</div>;

  return (
    <div className="page" style={{ padding: 20 }}>
      {/* Nút quay lại dashboard */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/dashboard"
          style={{
            padding: "8px 14px",
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Trở về trang chủ
        </Link>
      </div>

      <h1>Thông báo tự động</h1>

      {items.length === 0 ? (
        <p>Bạn chưa có thông báo nào.</p>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                padding: "10px 12px",
                borderRadius: 6,
                cursor: "pointer",
                backgroundColor: n.status === "UNREAD" ? "#263238" : "#111827",
                border:
                  n.status === "UNREAD"
                    ? "1px solid #4caf50"
                    : "1px solid #374151",
                color: "#e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {/* Tiêu đề: Kết quả xét nghiệm, Đến lượt khám... */}
                  {n.title}
                  {n.status === "UNREAD" && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: "#22c55e",
                      }}
                    >
                      • Mới
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{n.body}</div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginLeft: 12 }}>
                {timeAgo(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
