import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCreateUser } from "../../services/adminUsers";
import "../../assets/styles/auth.css";

export default function UserCreatePage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "PATIENT",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      setSaving(true);
      await adminCreateUser(form);
      setMsg("Tạo tài khoản thành công");

      // chuyển về list sau 700ms cho “đã mắt”
      setTimeout(() => nav("/admin/users"), 700);
    } catch (e) {
      // backend nên trả message: “Tài khoản đã tồn tại trong hệ thống.”
      setErr(e.message || "Tạo tài khoản thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Tạo tài khoản mới</h2>
        <button className="chip-btn" onClick={() => nav("/admin/users")}>
          Quay lại
        </button>
      </div>

      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert success">{msg}</div>}

      <form onSubmit={submit} style={{ marginTop: 12 }}>
        <label className="muted">Username*</label>
        <input
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="vd: hiepcc22"
        />

        <label className="muted">Email*</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="vd: hiep@gmail.com"
        />

        <label className="muted">Số điện thoại</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="vd: 09xxxxxxxx"
        />

        <label className="muted">Mật khẩu*</label>
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />

        <label className="muted">Vai trò*</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="PATIENT">Bệnh nhân</option>
          <option value="DOCTOR">Bác sĩ</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() =>
              setForm({
                username: "",
                email: "",
                phone: "",
                password: "",
                role: "PATIENT",
              })
            }
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
