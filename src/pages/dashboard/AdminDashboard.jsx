import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import { getJson } from "../../services/api";

function fmtTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d.toLocaleString("vi-VN");
  return String(v);
}

export default function AdminDashboard() {
  const user = useSelector((s) => s.auth.user);

  const [sum, setSum] = useState({
    users: 0,
    backups: 0,
    lastBackup: null,
    announcements: 0, // ✅ thêm
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const [usersRes, historyRes, annRes] = await Promise.allSettled([
          getJson("/api/admin/users"),
          getJson("/api/admin/backups/history"),
          // dùng public list để đếm (không cần role)
          getJson("/api/public/announcements"),
        ]);

        // users
        const users =
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
            ? usersRes.value
            : [];
        const usersCount = users.length;

        // backups history
        const history =
          historyRes.status === "fulfilled" && Array.isArray(historyRes.value)
            ? historyRes.value
            : [];
        const backups = history.length;

        const first = history[0] || null;
        const lastBackup =
          first?.backupTime || first?.backup_time || first?.time || null;

        // announcements
        const anns =
          annRes.status === "fulfilled" && Array.isArray(annRes.value)
            ? annRes.value
            : [];
        const announcements = anns.length;

        if (!mounted) return;

        setSum({
          users: usersCount,
          backups,
          lastBackup,
          announcements,
        });

        const errs = [];
        if (usersRes.status === "rejected") errs.push("users");
        if (historyRes.status === "rejected") errs.push("backup history");
        if (annRes.status === "rejected") errs.push("announcements");
        if (errs.length) setErr(`Không tải được: ${errs.join(", ")}.`);
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.message || "Không tải được dashboard admin.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1120 }}>
      <h2>Admin Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Quản trị người dùng & hệ thống.
      </p>

      {err && (
        <div className="alert error" style={{ marginTop: 8 }}>
          {err}
        </div>
      )}
      {loading && (
        <div className="muted" style={{ marginTop: 6 }}>
          Đang tải…
        </div>
      )}

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

        <DashCard
          title="Thông báo / Tin tức"
          value={sum.announcements}
          sub="Tạo/Sửa/Xóa thông báo"
          to="/admin/announcements"
        />
        
        <DashCard
          title="Dịch vụ"
          value={sum.services}
          sub="Danh mục dịch vụ (US14)"
          to="/admin/services"
        />

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
