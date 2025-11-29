import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../services/notifications";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await fetchNotifications();
        if (ignore) return;

        setItems(data || []);
        setSelected((data && data[0]) || null);
      } catch (err) {
        setError(err.message || "Không tải được thông báo.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => (ignore = true);
  }, []);

  const formatDateTime = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleString("vi-VN");
  };

  if (loading) return <div className="page">Đang tải thông báo...</div>;
  if (error) return <div className="page">Lỗi: {error}</div>;

  return (
    <div className="page" style={{ padding: "20px" }}>
      {/* Nút trở về */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/dashboard"
          style={{
            padding: "8px 14px",
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Trở về trang chủ
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          height: "75vh",
        }}
      >
        {/* Cột trái */}
        <div
          style={{
            width: "30%",
            borderRight: "1px solid #555",
            paddingRight: 10,
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Thông báo</h2>

          {items.length === 0 && <p>Hiện chưa có thông báo mới.</p>}

          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelected(n)}
              style={{
                padding: "8px 10px",
                marginBottom: 6,
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor:
                  selected && selected.id === n.id ? "#e3f2fd" : "transparent",
                color: "white",
              }}
            >
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {formatDateTime(n.publishedAt)}
              </div>
            </div>
          ))}
        </div>

        {/* Cột phải */}
        <div style={{ flex: 1, paddingLeft: 20, color: "white" }}>
          {selected ? (
            <>
              <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
              <div style={{ marginBottom: 10, opacity: 0.8 }}>
                {formatDateTime(selected.publishedAt)}
              </div>

              <div
                style={{
                  background: "white",
                  padding: 12,
                  color: "#000",
                  borderRadius: "6px",
                  whiteSpace: "pre-line",
                }}
              >
                {selected.content}
              </div>
            </>
          ) : (
            <p>Chọn một thông báo để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
}
