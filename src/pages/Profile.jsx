import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/api";
import {
  getAutoNotificationSetting,
  updateAutoNotificationSetting,
} from "../services/notificationSetting";
import "../assets/styles/auth.css";
import { useNavigate } from "react-router-dom";

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

  const [viewName, setViewName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

  // 🔔 AUTO NOTIFICATION SETTING
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(true);
  const [savingNotify, setSavingNotify] = useState(false);

  const navigate = useNavigate();

  // =========================
  // LOAD PROFILE + SETTING
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const [profile, notifySetting] = await Promise.all([
          getMyProfile(),
          getAutoNotificationSetting(),
        ]);

        setForm({
          fullName: profile.fullName || "",
          dateOfBirth: profile.dateOfBirth || "",
          address: profile.address || "",
          phone: profile.phone || "",
          email: profile.email || "",
          insuranceNumber: profile.insuranceNumber || "",
          emergencyContactName: profile.emergencyContactName || "",
          emergencyContactPhone: profile.emergencyContactPhone || "",
        });

        setViewName(profile.fullName || profile.email || "");
        setAutoNotifyEnabled(!!notifySetting?.enabled);
      } catch (e) {
        setErr(e.message || "Không tải được hồ sơ");
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
      const res = await updateMyProfile(form);
      setMsg("Cập nhật thành công");
      setViewName(res.fullName || res.email || "");
      setEditing(false);
    } catch (e) {
      setErr(e.message || "Cập nhật thất bại");
    }
  };

  // =========================
  // TOGGLE AUTO NOTIFICATION
  // =========================
  const toggleAutoNotify = async (checked) => {
    setAutoNotifyEnabled(checked);

    try {
      setSavingNotify(true);
      await updateAutoNotificationSetting(checked);
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
    <div className="profile-wrap">
      {/* TOP BAR */}
      <div className="profile-topbar">
        <button
          className="icon-btn"
          onClick={() => window.history.back()}
          title="Quay lại"
        >
          ←
        </button>

        <div className="title">HỒ SƠ CÁ NHÂN</div>

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

      {/* BODY */}
      <div className="profile-body">
        <div className="avatar"></div>
        <div className="name-line">{viewName}</div>

        {err && <div className="alert">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}

        {/* ===================== */}
        {/* CÀI ĐẶT THÔNG BÁO */}
        {/* ===================== */}
        <div className="section-title">Cài đặt thông báo</div>

        <div
          className="pf-field"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>Thông báo tự động</label>
          <input
            type="checkbox"
            checked={autoNotifyEnabled}
            disabled={savingNotify}
            onChange={(e) => toggleAutoNotify(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
        </div>

        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 16 }}>
          Khi bật, hệ thống sẽ hiển thị popup khi có thông báo mới.
        </div>

        {/* ===================== */}
        {/* THÔNG TIN CÁ NHÂN */}
        {/* ===================== */}
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
            onChange={(v) =>
              setForm({ ...form, emergencyContactName: v })
            }
            disabled={!editing}
          />
          <ProfileField
            label="SĐT"
            value={form.emergencyContactPhone}
            onChange={(v) =>
              setForm({ ...form, emergencyContactPhone: v })
            }
            disabled={!editing}
          />
        </div>

        <ProfileField
          label="Mã BHYT"
          value={form.insuranceNumber}
          onChange={(v) =>
            setForm({ ...form, insuranceNumber: v })
          }
          disabled={!editing}
        />
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
