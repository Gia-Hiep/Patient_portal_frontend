import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import { fetchAdminSummary } from "../../services/dashboard";
import { getAdminDoctors } from "../../services/adminDoctors"; // ✅ thêm dòng này

export default function AdminDashboard() {
  const user = useSelector((s) => s.auth.user);

  const [sum, setSum] = useState({
    users: 0,
    doctors: 0,
    services: 0,
    news: 0,
    backups: 0,
    lastBackup: null,
  });

  useEffect(() => {
    (async () => {
     
      let next = {
        users: 0,
        doctors: 0,
        services: 0,
        news: 0,
        backups: 0,
        lastBackup: null,
      };

      // 1) Try lấy summary từ API cũ
      try {
        const res = await fetchAdminSummary();
        if (res && typeof res === "object") {
          next = {
            users: Number(res.users ?? next.users),
            doctors: Number(res.doctors ?? next.doctors),
            services: Number(res.services ?? next.services),
            news: Number(res.news ?? next.news),
            backups: Number(res.backups ?? next.backups),
            lastBackup: res.lastBackup ?? next.lastBackup,
          };
        }
      } catch {
        // bỏ trống: để fallback 0, không set hard-code
      }

      // 2) ✅ Luôn sync lại số bác sĩ theo danh sách thật
      // (để Dashboard chắc chắn KHỚP trang /admin/doctors)
      try {
        const list = await getAdminDoctors({ includeDisabled: true });
        next.doctors = Array.isArray(list) ? list.length : 0;
      } catch {
        // nếu lỗi thì giữ value hiện có (thường là 0 hoặc từ summary)
      }

      setSum(next);
    })();
  }, []);

  return (
    <div className="auth-card" style={{ maxWidth: 1120 }}>
      <h2>Admin Dashboard</h2>
      <p className="muted">
        Xin chào, {user?.username}. Quản trị người dùng, dịch vụ & hệ thống.
      </p>

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
          sub="Tài khoản & phân quyền (US13)"
          to="/admin/users"
        />
        <DashCard
          title="Bác sĩ"
          value={sum.doctors}
          sub="Danh sách bác sĩ (US14)"
          to="/admin/doctors"
        />
        <DashCard
          title="Dịch vụ"
          value={sum.services}
          sub="Danh mục dịch vụ (US14)"
          to="/admin/services"
        />
        <DashCard
          title="Thông báo / Tin tức"
          value={sum.news}
          sub="CRUD thông báo (US15)"
          to="/admin/news"
        />
        <DashCard
          title="Số bản backup"
          value={sum.backups}
          sub={`Gần nhất: ${sum.lastBackup || "-"}`}
          to="/admin/backups"
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
          <a href="/admin/backups" className="btn">
            Backup dữ liệu ngay
          </a>
        </div>
      </div>
    </div>
  );
}
