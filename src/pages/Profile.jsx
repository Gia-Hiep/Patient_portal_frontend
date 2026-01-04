import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/api";
import "../assets/styles/profile.css";
import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../services/userNotifications";

export default function Profile() {
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    insuranceNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Cài đặt: nhận thông báo tự động
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(true);

  const [viewName, setViewName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [savingNotify, setSavingNotify] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // 1) Lấy hồ sơ cá nhân
        const data = await getMyProfile();
        setForm({
          fullName: data.fullName || "",
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          insuranceNumber: data.insuranceNumber || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
        });
        setViewName(data.fullName || data.email || "");

        // 2) Lấy cài đặt thông báo
        try {
          const settings = await getNotificationSettings();
          if (settings && typeof settings.autoNotifyEnabled === "boolean") {
            setAutoNotifyEnabled(settings.autoNotifyEnabled);
          }
        } catch (e) {
          console.warn("Không tải được cài đặt thông báo:", e);
        }
      } catch (e) {
        setErr(e?.message || "Không tải được hồ sơ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =========================
  // SAVE PROFILE
  // =========================
  const save = async () => {
    setErr(null);
    setMsg(null);

    if (!form.fullName) {
      setErr("Vui lòng nhập Họ tên");
      return;
    }

    try {
      // Cập nhật thông tin hồ sơ
      const res = await updateMyProfile(form);
      setViewName(res.fullName || res.email || "");

      setMsg("Cập nhật thành công");
      setEditing(false);
    } catch (e) {
      setErr(e?.message || "Cập nhật thất bại");
    }
  };

  // =========================
  // TOGGLE AUTO NOTIFICATION
  // =========================
  const toggleAutoNotify = async (checked) => {
    // optimistic update
    setAutoNotifyEnabled(checked);

    try {
      setSavingNotify(true);
      await updateNotificationSettings({ autoNotifyEnabled: checked });
    } catch (e) {
      // revert nếu lỗi
      setAutoNotifyEnabled(!checked);
      alert("Lưu cài đặt thông báo thất bại");
    } finally {
      setSavingNotify(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">Đang tải hồ sơ...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* TOP BAR */}
      <div className="profile-topbar">
        <div className="profile-topbar-left">
          <button
            className="icon-btn"
            onClick={() => window.history.back()}
            title="Quay lại"
            aria-label="Quay lại"
            type="button"
          >
            <span aria-hidden="true" className="icon">
              ←
            </span>
          </button>

          <div className="title">HỒ SƠ CÁ NHÂN</div>
        </div>

        <div className="profile-topbar-right">
          <button
            className="chip-btn chip-btn--ghost"
            onClick={() => navigate("/")}
            type="button"
            title="Trang chủ"
          >
            <span className="chip-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 21v-6a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Trang chủ
          </button>

          {!editing ? (
            <button
              className="chip-btn chip-btn--primary"
              onClick={() => {
                setEditing(true);
                setMsg(null);
                setErr(null);
              }}
              type="button"
            >
              <span className="chip-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path
                    d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5 6.5 17.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Chỉnh sửa
            </button>
          ) : (
            <button className="chip-btn chip-btn--primary" onClick={save} type="button">
              Lưu
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="profile-body">
        {/* HERO CARD */}
        <div className="pf-card pf-hero">
          <div className="pf-hero-inner">
            <div className="pf-avatar">
              <div className="avatar" />
              <button className="pf-avatar-badge" type="button" aria-label="avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path
                    d="M4 7.5A2.5 2.5 0 0 1 6.5 5H9l1-1h4l1 1h2.5A2.5 2.5 0 0 1 21 7.5v10A2.5 2.5 0 0 1 18.5 20h-12A2.5 2.5 0 0 1 4 17.5v-10Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>
            </div>

            <div className="name-line">{viewName}</div>
          </div>
        </div>

        {/* Alerts (keep same behavior; only styled) */}
        {err && <div className="alert pf-alert-error">{err}</div>}
        {msg && <div className="alert success pf-toast-success">{msg}</div>}

        {/* CÀI ĐẶT THÔNG BÁO */}
        <div className="pf-card">
          <div className="pf-card-head">
            <span className="pf-card-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 22a2.3 2.3 0 0 0 2.2-2H9.8A2.3 2.3 0 0 0 12 22Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M18 16H6l1.2-1.5V10a4.8 4.8 0 0 1 9.6 0v4.5L18 16Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="section-title section-title--inCard">Cài đặt thông báo</div>
          </div>

          <div className="pf-notify-row">
            <div className="pf-notify-text">
              <div className="pf-notify-label">Thông báo tự động</div>
              <div className="pf-notify-desc">
                Khi bật, hệ thống sẽ hiển thị popup khi có thông báo mới.
              </div>
            </div>

            <label className={`pf-switch ${savingNotify ? "is-disabled" : ""}`}>
              <input
                type="checkbox"
                checked={autoNotifyEnabled}
                disabled={savingNotify}
                onChange={(e) => toggleAutoNotify(e.target.checked)}
              />
              <span className="pf-switch-ui" aria-hidden="true" />
            </label>
          </div>
        </div>

        {/* THÔNG TIN (card layout only; text remains from fields) */}
        <div className="pf-card">
          <div className="pf-grid-2">
            <ProfileField
              label="Họ Tên"
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
              disabled={!editing}
              icon="user"
            />

            <ProfileField
              label="Ngày sinh"
              type="date"
              value={form.dateOfBirth || ""}
              onChange={(v) => setForm({ ...form, dateOfBirth: v })}
              disabled={!editing}
              icon="calendar"
            />

            <ProfileField
              label="Số điện thoại"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              disabled={!editing}
              icon="phone"
            />

            <ProfileField
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              disabled={!editing}
              icon="mail"
            />
          </div>

          <div className="pf-grid-1">
            <ProfileField
              label="Địa chỉ"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              disabled={!editing}
              icon="pin"
            />
          </div>

          <div className="pf-grid-1">
            <ProfileField
              label="Mã BHYT"
              value={form.insuranceNumber}
              onChange={(v) => setForm({ ...form, insuranceNumber: v })}
              disabled={!editing}
              icon="card"
            />
          </div>
        </div>

        {/* NGƯỜI LIÊN HỆ KHẨN CẤP */}
        <div className="pf-card">
          <div className="pf-card-head">
            <span className="pf-card-ico pf-card-ico--danger" aria-hidden="true">
              *
            </span>
            <div className="section-title section-title--inCard">Người liên hệ khẩn cấp</div>
          </div>

          <div className="pf-grid-2">
            <ProfileField
              label="Họ tên"
              value={form.emergencyContactName}
              onChange={(v) => setForm({ ...form, emergencyContactName: v })}
              disabled={!editing}
              icon="user"
            />
            <ProfileField
              label="SĐT"
              value={form.emergencyContactPhone}
              onChange={(v) => setForm({ ...form, emergencyContactPhone: v })}
              disabled={!editing}
              icon="phone"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, disabled, type = "text", icon }) {
  return (
    <div className="pf-field">
      <label>{label}</label>

      <div className={`pf-input ${disabled ? "is-readonly" : ""}`}>
        {icon ? (
          <span className="pf-input-ico" aria-hidden="true">
            {icon === "user" ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M4.5 20a7.5 7.5 0 0 1 15 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ) : icon === "calendar" ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M7 3v3M17 3v3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 7.5h15V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            ) : icon === "phone" ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M7 3h3l1.2 5-2 1.2a13 13 0 0 0 5.6 5.6l1.2-2 5 1.2v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            ) : icon === "mail" ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M4.5 6.5h15V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 7l7 6 7-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            ) : icon === "pin" ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M6 7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5v9A2.5 2.5 0 0 1 15.5 19h-7A2.5 2.5 0 0 1 6 16.5v-9Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M8 9h8M8 12h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        ) : null}

        <input
          type={type}
          className="input pf-input-el"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
