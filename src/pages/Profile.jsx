import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/api";
import "../assets/styles/auth.css";
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
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // 1. Lấy hồ sơ cá nhân
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

        // 2. Lấy cài đặt thông báo
        try {
          const settings = await getNotificationSettings();
          if (settings && typeof settings.autoNotifyEnabled === "boolean") {
            setAutoNotifyEnabled(settings.autoNotifyEnabled);
          }
        } catch (e) {
          // Nếu lỗi phần cài đặt thông báo thì bỏ qua, không chặn màn hình hồ sơ
          console.warn("Không tải được cài đặt thông báo:", e);
        }
      } catch (e) {
        setErr(e.message || "Không tải được hồ sơ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setErr(null);
    setMsg(null);
    if (!form.fullName) {
      setErr("Vui lòng nhập Họ tên");
      return;
    }
    try {
      // 1. Cập nhật thông tin hồ sơ
      const res = await updateMyProfile(form);
      setViewName(res.fullName || res.email || "");
      // 2. Cập nhật cài đặt thông báo tự động
      try {
        await updateNotificationSettings({ autoNotifyEnabled });
      } catch (e) {
        console.warn("Không cập nhật được cài đặt thông báo:", e);
      }

      setMsg("Cập nhật thành công");
      setEditing(false);
    } catch (e) {
      setErr(e.message || "Cập nhật thất bại");
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
    <div className="profile-wrap">
      <div className="profile-topbar">
        <button
          className="icon-btn"
          onClick={() => window.history.back()}
          title="Quay lại"
        >
          ←
        </button>

        <div className="title">HỒ SƠ CÁ NHÂN</div>

        {/* Nút trở về trang chủ */}
        <button
          className="chip-btn"
          onClick={() => navigate("/")}
          style={{ marginRight: "10px" }}
        >
          Trang chủ
        </button>

        {!editing ? (
          <button
            className="chip-btn"
            onClick={() => {
              setEditing(true);
              setMsg(null);
              setErr(null);
            }}
          >
            Chỉnh sửa
          </button>
        ) : (
          <button className="chip-btn" onClick={save}>
            Lưu
          </button>
        )}
      </div>

      <div className="profile-body">
        <div className="avatar"></div>
        <div className="name-line">{viewName}</div>

        {err && <div className="alert">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}

        <ProfileField
          label="Họ Tên"
          value={form.fullName}
          onChange={(v) => setForm({ ...form, fullName: v })}
          disabled={!editing}
        />

        <ProfileField
          label="Ngày sinh"
          type="date"
          value={form.dateOfBirth || ""}
          onChange={(v) => setForm({ ...form, dateOfBirth: v })}
          disabled={!editing}
        />

        <ProfileField
          label="Địa chỉ"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
          disabled={!editing}
        />

        <ProfileField
          label="Số điện thoại"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          disabled={!editing}
        />

        <ProfileField
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          disabled={!editing}
        />

        <div className="section-title">Người liên hệ khẩn cấp</div>

        <div className="row-2">
          <ProfileField
            label="Họ tên"
            value={form.emergencyContactName}
            onChange={(v) => setForm({ ...form, emergencyContactName: v })}
            disabled={!editing}
          />
          <ProfileField
            label="SĐT"
            value={form.emergencyContactPhone}
            onChange={(v) => setForm({ ...form, emergencyContactPhone: v })}
            disabled={!editing}
          />
        </div>

        <ProfileField
          label="Mã BHYT"
          value={form.insuranceNumber}
          onChange={(v) => setForm({ ...form, insuranceNumber: v })}
          disabled={!editing}
        />

        {/* ===== CÀI ĐẶT THÔNG BÁO TỰ ĐỘNG ===== */}
        <div className="section-title">Cài đặt thông báo</div>

        <div className="pf-field">
          <label>Nhận thông báo tự động</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="checkbox"
              checked={autoNotifyEnabled}
              onChange={(e) => setAutoNotifyEnabled(e.target.checked)}
              disabled={!editing}
            />
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              Khi bật, hệ thống sẽ gửi thông báo về kết quả xét nghiệm, lịch
              khám và nhắc tái khám.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div className="pf-field">
      <label>{label}</label>
      <input
        type={type}
        className="input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
