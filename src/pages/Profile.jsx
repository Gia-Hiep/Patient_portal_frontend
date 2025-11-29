import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/api";
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
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try {
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
      const res = await updateMyProfile(form);
      setMsg("Cập nhật thành công");
      setViewName(res.fullName || res.email || "");
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
  <button className="icon-btn" onClick={() => window.history.back()} title="Quay lại">
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
