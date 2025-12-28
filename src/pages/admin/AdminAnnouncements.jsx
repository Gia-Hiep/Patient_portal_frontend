import React, { useEffect, useMemo, useState } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../api/announcementApi";

const emptyForm = {
  title: "",
  message: "",
  type: "NEWS",
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const isEditing = useMemo(() => editingId != null, [editingId]);

  async function load() {
    try {
      setErr("");
      setLoading(true);

      const res = await getAnnouncements();
      const data = res?.data || [];

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách thông báo."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(a) {
    // ✅ lấy nội dung theo mọi field có thể có
    const msg = a?.message ?? a?.content ?? a?.description ?? "";
    setEditingId(a.id);
    setForm({
      title: a?.title || "",
      message: msg,
      type: a?.type || "NEWS",
    });
  }

  function buildPayload() {
    // ✅ chuẩn hoá payload: gửi cả 3 key để backend nhận cái nó cần
    const title = (form.title || "").trim();
    const message = (form.message || "").trim();
    const type = form.type || "NEWS";

    return {
      title,
      type,

      // backend có thể nhận 1 trong các field dưới
      message,
      content: message,
      description: message,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();

    const title = (form.title || "").trim();
    const message = (form.message || "").trim();
    if (!title || !message) {
      setErr("Vui lòng nhập đầy đủ Title và Nội dung.");
      return;
    }

    try {
      setErr("");

      const payload = buildPayload();

      if (isEditing) {
        await updateAnnouncement(editingId, payload);
      } else {
        await createAnnouncement(payload);
      }

      startCreate();
      await load();
    } catch (e2) {
      console.error(e2);
      setErr(
        e2?.response?.data?.message ||
          e2?.message ||
          "Lưu thất bại (có thể thiếu token/không đủ quyền)."
      );
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Bạn chắc chắn muốn xoá thông báo này?");
    if (!ok) return;

    try {
      setErr("");
      await deleteAnnouncement(id);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Xoá thất bại.");
    }
  }

  return (
    <div className="auth-card admin-full">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Quản lý thông báo (Admin)</h2>

        <button className="chip-btn" type="button" onClick={startCreate}>
          + Tạo mới
        </button>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>
        Tạo / sửa / xoá thông báo bệnh viện (US15).
      </p>

      {err && (
        <div className="alert error" style={{ marginTop: 8 }}>
          {err}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10 }}>
          {isEditing ? `Sửa thông báo #${editingId}` : "Tạo thông báo mới"}
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label className="muted">Tiêu đề</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Ví dụ: Lịch nghỉ Tết Nguyên Đán 2026"
              className="input"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label className="muted">Loại</label>
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

          <div style={{ display: "grid", gap: 6 }}>
            <label className="muted">Nội dung</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={4}
              placeholder="Nhập nội dung thông báo..."
              className="input"
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {isEditing && (
              <button type="button" className="chip-btn" onClick={startCreate}>
                Huỷ sửa
              </button>
            )}

            <button type="submit" className="chip-btn">
              {isEditing ? "Lưu thay đổi" : "Tạo thông báo"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>
          Danh sách thông báo
        </div>

        {loading ? (
          <div className="muted">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="muted">Chưa có thông báo.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "#0f1422",
                  border: "1px solid #223",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 700, flex: 1 }}>
                    {a.title}{" "}
                    <span className="muted" style={{ fontWeight: 500 }}>
                      • {a.type}
                    </span>
                  </div>

                  <button
                    className="chip-btn"
                    type="button"
                    onClick={() => startEdit(a)}
                  >
                    Sửa
                  </button>
                  <button
                    className="chip-btn"
                    type="button"
                    onClick={() => onDelete(a.id)}
                  >
                    Xoá
                  </button>
                </div>

                <div
                  className="muted"
                  style={{ marginTop: 8, lineHeight: 1.6 }}
                >
                  {a.message || a.content || a.description}
                </div>

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  {a.createdAt || a.created_at || ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
