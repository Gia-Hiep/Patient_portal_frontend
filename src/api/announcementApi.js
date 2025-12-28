// src/pages/admin/AdminAnnouncementsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export default function AdminAnnouncementsPage() {
  const token = useSelector((s) => s.auth.token);

  const axiosAuth = useMemo(() => {
    const instance = axios.create({ baseURL: API_BASE });
    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [token]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [form, setForm] = useState({
    id: null,
    title: "",
    message: "",
    type: "NEWS",
  });

  const fetchList = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await axiosAuth.get("/api/announcements");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách thông báo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setMode("create");
    setForm({ id: null, title: "", message: "", type: "NEWS" });
    setOpen(true);
  };

  const openEdit = (it) => {
    setMode("edit");
    setForm({
      id: it.id,
      title: it.title || "",
      message: it.message || it.content || it.description || "",
      type: it.type || "NEWS",
    });
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setErr("Vui lòng nhập đủ tiêu đề và nội dung.");
      return;
    }

    try {
      setErr("");
      if (mode === "create") {
        await axiosAuth.post("/api/announcements", {
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
        });
      } else {
        await axiosAuth.put(`/api/announcements/${form.id}`, {
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
        });
      }
      closeModal();
      fetchList();
    } catch (e2) {
      setErr(
        e2?.response?.data?.message || e2?.message || "Lưu thông báo thất bại."
      );
    }
  };

  const remove = async (id) => {
    const ok = window.confirm("Xóa thông báo này?");
    if (!ok) return;

    try {
      setErr("");
      await axiosAuth.delete(`/api/announcements/${id}`);
      fetchList();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>📣 Quản lý thông báo (Admin)</h2>

        <Link to="/dashboard" className="chip-btn">
          ← Về Dashboard
        </Link>

        <button className="chip-btn" onClick={openCreate}>
          + Tạo thông báo
        </button>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>
        Tạo/Sửa/Xóa thông báo bệnh viện (US15).
      </p>

      {err && (
        <div className="alert error" style={{ marginTop: 10 }}>
          {err}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="muted">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="muted">Chưa có thông báo.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  background: "#0f1422",
                  border: "1px solid #223",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 700, flex: 1 }}>
                    {it.type === "EMERGENCY" ? "🚨" : "📰"} {it.title}
                  </div>

                  <button className="chip-btn" onClick={() => openEdit(it)}>
                    Sửa
                  </button>
                  <button className="chip-btn" onClick={() => remove(it.id)}>
                    Xóa
                  </button>
                </div>

                <div style={{ marginTop: 10, lineHeight: 1.5 }}>
                  {it.message || it.content || it.description}
                </div>

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  ID: {it.id} • Type: {it.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal đơn giản */}
      {open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{
              width: "min(720px, 100%)",
              background: "#0b1020",
              border: "1px solid #223",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, flex: 1 }}>
                {mode === "create" ? "Tạo thông báo" : "Sửa thông báo"}
              </div>
              <button className="chip-btn" onClick={closeModal}>
                Đóng
              </button>
            </div>

            <form
              onSubmit={submit}
              style={{ marginTop: 12, display: "grid", gap: 12 }}
            >
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  Tiêu đề
                </div>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  className="input"
                  placeholder="VD: Lịch nghỉ Tết Nguyên Đán 2026"
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  Loại
                </div>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="input"
                >
                  <option value="NEWS">NEWS</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  Nội dung
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  className="input"
                  rows={6}
                  placeholder="Nhập nội dung thông báo…"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                <button type="button" className="chip-btn" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="chip-btn">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
