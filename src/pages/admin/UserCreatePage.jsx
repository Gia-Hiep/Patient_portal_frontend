import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCreateUser } from "../../services/adminUsers";
import "../../assets/styles/auth.css";
import "../../assets/styles/adminCreateUser.css";

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
    <div className="adminCreatePage">
      <div className="adminCreateCard">
        {/* Header */}
        <div className="adminCreateHeader">
          <h2 className="adminCreateTitle">Tạo tài khoản mới</h2>

          <button
            type="button"
            className="adminCreateBackBtn"
            onClick={() => nav("/admin/users")}
          >
            Quay lại
          </button>
        </div>

        {/* Alerts (keep texts exactly as before) */}
        {err && <div className="adminCreateAlert adminCreateAlertError">{err}</div>}
        {msg && <div className="adminCreateAlert adminCreateAlertSuccess">{msg}</div>}

        {/* Form */}
        <form onSubmit={submit} className="adminCreateForm">
          <div className="adminCreateGrid">
            <div className="adminCreateField">
              <label className="muted">Username*</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="vd: hiepcc22"
              />
            </div>

            <div className="adminCreateField">
              <label className="muted">Email*</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vd: hiep@gmail.com"
              />
            </div>

            <div className="adminCreateField">
              <label className="muted">Số điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="vd: 09xxxxxxxx"
              />
            </div>

            <div className="adminCreateField">
              <label className="muted">Vai trò*</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="PATIENT">Bệnh nhân</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            <div className="adminCreateField adminCreateFieldFull">
              <label className="muted">Mật khẩu*</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="adminCreateFooter">
            <button
              type="button"
              className="adminCreateResetBtn"
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

            <button type="submit" className="adminCreateSubmitBtn" disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
