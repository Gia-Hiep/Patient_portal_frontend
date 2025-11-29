import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../services/notifications";

/**
 * US7 – Nhận thông báo chung từ bệnh viện
 *
 * Layout:
 * - Cột trái: danh sách thông báo (title + time), mới nhất lên trên.
 * - Cột phải: chi tiết thông báo đang chọn.
 */
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
        console.error(err);
        setError(err.message || "Không tải được thông báo.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const formatDateTime = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleString("vi-VN");
  };

  if (loading) {
    return <div className="page">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="page error">Lỗi: {error}</div>;
  }

  // Acceptance: nếu chưa có thông báo → hiển thị text
  if (!items.length) {
    return (
      <div className="page">
        <h1>Thông báo</h1>
        <p>Hiện chưa có thông báo mới.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: "flex", gap: 16 }}>
      {/* Cột trái: danh sách */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ddd",
          paddingRight: 12,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Thông báo</h2>
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
            }}
          >
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {formatDateTime(n.postedAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Cột phải: chi tiết */}
      <div style={{ flex: 1, paddingLeft: 12 }}>
        {selected ? (
          <>
            <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              <span>{formatDateTime(selected.postedAt)}</span>
              {selected.postedBy && (
                <span style={{ marginLeft: 12 }}>
                  • Người đăng: {selected.postedBy}
                </span>
              )}
            </div>
            <div
              style={{
                padding: 10,
                borderRadius: 4,
                backgroundColor: "#fafafa",
                border: "1px solid #eee",
                whiteSpace: "pre-line",
              }}
            >
              {selected.content}
            </div>
          </>
        ) : (
          <div>Chọn một thông báo ở cột bên trái để xem chi tiết.</div>
        )}
      </div>
    </div>
  );
}
