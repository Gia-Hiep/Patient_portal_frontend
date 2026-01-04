import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashCard from "../../components/DashCard";
import { fetchAdminSummary } from "../../services/dashboard";
import { getAdminDoctors } from "../../services/adminDoctors"; // ✅ thêm dòng này
import { getJson } from "../../services/api";
import "../../assets/styles/adminDashboard.css";

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
      if (!mounted) return;

      setLoading(true);
      setErr("");

      let next = {
        users: 0,
        doctors: 0,
        services: 0,
        news: 0,
        backups: 0,
        lastBackup: null,
        announcements: 0,
      };

      let needFallback = false;

      // 1) Try lấy summary từ API cũ
      try {
        const res = await fetchAdminSummary();
        if (res && typeof res === "object") {
          next = {
            ...next,
            users: Number(res.users ?? next.users),
            doctors: Number(res.doctors ?? next.doctors),
            services: Number(res.services ?? next.services),
            news: Number(res.news ?? next.news),
            backups: Number(res.backups ?? next.backups),
            lastBackup: res.lastBackup ?? next.lastBackup,
          };
        }
      } catch {
        needFallback = true;
      }

      // 2) ✅ Luôn sync lại số bác sĩ theo danh sách thật
      try {
        const list = await getAdminDoctors({ includeDisabled: true });
        next.doctors = Array.isArray(list) ? list.length : 0;
      } catch {
        needFallback = true;
      }

      // 3) Fallback: users/backups/announcements từ các API thật
      if (needFallback) {
        const [usersRes, historyRes, annRes] = await Promise.allSettled([
          getJson("/api/admin/users"),
          getJson("/api/admin/backups/history"),
          getJson("/api/public/announcements"),
        ]);

        const users =
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
            ? usersRes.value
            : [];
        next.users = users.length;

        const history =
          historyRes.status === "fulfilled" && Array.isArray(historyRes.value)
            ? historyRes.value
            : [];
        next.backups = history.length;

        const first = history[0] || null;
        next.lastBackup =
          first?.backupTime || first?.backup_time || first?.time || null;

        const anns =
          annRes.status === "fulfilled" && Array.isArray(annRes.value)
            ? annRes.value
            : [];
        next.announcements = anns.length;

        const errs = [];
        if (usersRes.status === "rejected") errs.push("users");
        if (historyRes.status === "rejected") errs.push("backup history");
        if (annRes.status === "rejected") errs.push("announcements");
        if (errs.length) setErr(`Không tải được: ${errs.join(", ")}.`);
      }

      if (!mounted) return;
      setSum(next);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="ad-shell">
      <div className="ad-wrap">
        <div className="ad-headRow">
          <div>
            <h2 className="ad-title">Admin Dashboard</h2>
            <p className="ad-sub muted">
              Xin chào, {user?.username}. Quản trị người dùng & hệ thống.
            </p>
          </div>

          {/* icon user tròn góc phải như ảnh */}
          <div className="ad-headAvatar" aria-hidden="true">
            👤
          </div>
        </div>

        {err && <div className="ad-alertError">{err}</div>}

        {loading && (
          <div className="ad-loading muted" style={{ marginTop: 6 }}>
            Đang tải…
          </div>
        )}

        {/* GRID cards: desktop 5 cột */}
        <div className="ad-grid">
          {loading ? (
            <>
              <div className="ad-skel" />
              <div className="ad-skel" />
              <div className="ad-skel" />
              <div className="ad-skel" />
              <div className="ad-skel" />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Backup CTA row như ảnh reference */}
        <div className="ad-backupPanel">
          <div className="ad-backupLeft">
            <div className="ad-backupTitle">
              <span className="ad-backupIcon" aria-hidden="true">
                ☁
              </span>
              Backup dữ liệu (US16)
            </div>
            <div className="ad-backupDesc muted">
              Tạo file backup <i>file_backup_dd_mm_yyyy</i>, lưu lịch sử backup.
            </div>
          </div>

          <a href="/admin/backup" className="ad-backupBtn">
            Backup dữ liệu ngay
          </a>
        </div>
      </div>
    </div>
  );
}
