import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import { getJson } from "../../services/api";

function fmtTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("vi-VN");
  }
  return String(v);
}

export default function AdminDashboard() {
  const user = useSelector((s) => s.auth.user);

  const [sum, setSum] = useState({
    users: 0,
    backups: 0,
    lastBackup: null,
    doctors: 0,
    services: 0,
    news: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // ====== Users count ======
        let usersCount = 0;
        try {
          const users = await getJson("/api/admin/users");
          usersCount = Array.isArray(users) ? users.length : 0;
        } catch (e) {
          console.error("Load users failed", e);
        }

        // ====== Backup history ======
        let backups = 0;
        let lastBackup = null;
        try {
          const history = await getJson("/api/admin/backups/history");
          const rows = Array.isArray(history) ? history : [];
          backups = rows.length;

          // tùy entity: backupTime / backup_time / createdAt...
          const first = rows[0];
          lastBackup = first?.backupTime || first?.backup_time || first?.time || null;
        } catch (e) {
          console.error("Load backup history failed", e);
        }

        setSum((prev) => ({
          ...prev,
          users: usersCount,
          backups,
          lastBackup,
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1120 }}>
      <h2>Admin Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Quản trị người dùng & hệ thống.
      </p>

      {loading && <div className="muted" style={{ marginTop: 6 }}>Đang tải…</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <DashCard
          title="Người dùng"
          value={sum.users}
          sub="Tài khoản & phân quyền"
          to="/admin/users"
        />

        {/* Nếu chưa có API doctors/services/news thì cứ để 0 hoặc bỏ card */}
        <DashCard
          title="Số bản backup"
          value={sum.backups}
          sub={`Gần nhất: ${fmtTime(sum.lastBackup)}`}
          to="/admin/backup"
        />
      </div>

      <div
        style={{
          marginTop: 24,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Backup dữ liệu (US16)
        </div>
        <div className="muted">
          Tạo file backup <i>file_backup_dd_mm_yyyy</i>, lưu lịch sử backup.
        </div>

        <div style={{ marginTop: 10 }}>
          <a href="/admin/backup" className="btn">
            Backup dữ liệu ngay
          </a>
        </div>
      </div>
    </div>
  );
}
