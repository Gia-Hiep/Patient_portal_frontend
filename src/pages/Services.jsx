import React, { useEffect, useState } from "react";
import { listServices } from "../services/medicalServices";
import "../assets/styles/auth.css";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

export default function Services() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await listServices();
        if (!cancelled) setItems(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Không tải được danh sách dịch vụ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Danh sách dịch vụ</h2>
        <span className="muted">Luôn hiển thị dữ liệu mới nhất từ hệ thống</span>
      </div>

      {loading && <p className="muted" style={{ marginTop: 12 }}>Đang tải...</p>}
      {err && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{err}</p>}

      {!loading && !err && (
        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10 }}>Tên dịch vụ</th>
                <th style={{ textAlign: "left", padding: 10 }}>Mô tả</th>
                <th style={{ textAlign: "right", padding: 10 }}>Giá</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #223" }}>
                  <td style={{ padding: 10, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: 10 }} className="muted">{s.description || "—"}</td>
                  <td style={{ padding: 10, textAlign: "right" }}>{vnd(s.price)}</td>
                </tr>
              ))}
              {(!items || items.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ padding: 12 }} className="muted">
                    Chưa có dịch vụ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
