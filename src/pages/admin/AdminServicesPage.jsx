import React, { useEffect, useMemo, useState } from "react";
import "../../assets/styles/auth.css";
import {
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
} from "../../services/medicalServices";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          width: "min(720px, 100%)",
          background: "#0f1422",
          border: "1px solid #223",
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* ✅ Header kiểu WinForm */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderBottom: "1px solid #223",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              lineHeight: 1.25,
              flex: 1,
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>

          {/* Nút đóng nhỏ góc phải */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid #2a3550",
              background: "rgba(255,255,255,0.04)",
              color: "#eaf0ff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              lineHeight: 1,
              flex: "0 0 auto",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>{children}</div>

        {/* ✅ Footer giữ như cũ (Hủy/Lưu ngang) */}
        {footer && (
          <div
            style={{
              padding: 16,
              paddingTop: 0,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  // ✅ Filter trạng thái: ACTIVE | INACTIVE | ALL
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [formErr, setFormErr] = useState("");

  const [openDel, setOpenDel] = useState(false);
  const [delItem, setDelItem] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminListServices();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ lọc theo Active/Inactive + tìm kiếm
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();

    return (items || [])
      .filter((s) => {
        if (statusFilter === "ACTIVE") return s.active === true;
        if (statusFilter === "INACTIVE") return s.active === false;
        return true; // ALL
      })
      .filter((s) => {
        if (!key) return true;
        return (
          String(s.id || "").includes(key) ||
          (s.name || "").toLowerCase().includes(key) ||
          (s.code || "").toLowerCase().includes(key) ||
          (s.description || "").toLowerCase().includes(key)
        );
      });
  }, [items, q, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "" });
    setFormErr("");
    setOpenForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s?.name || "",
      description: s?.description || "",
      price: s?.price ?? "",
    });
    setFormErr("");
    setOpenForm(true);
  };

  const validate = () => {
    const name = String(form.name || "").trim();
    const priceNum = Number(form.price);
    if (!name) return "Tên dịch vụ là bắt buộc.";
    if (!Number.isFinite(priceNum) || priceNum <= 0) return "Giá không hợp lệ.";
    return "";
  };

  const submit = async () => {
    const v = validate();
    if (v) return setFormErr(v);
    setFormErr("");

    const payload = {
      name: String(form.name || "").trim(),
      description: String(form.description || "").trim(),
      price: Number(form.price),
    };

    try {
      if (!editing) {
        const created = await adminCreateService(payload);
        setItems((prev) => [created, ...(prev || [])]); // ✅ update tức thì
      } else {
        const updated = await adminUpdateService(editing.id, payload);
        setItems((prev) =>
          (prev || []).map((x) => (x.id === updated.id ? updated : x))
        ); // ✅ update tức thì
      }
      setOpenForm(false);
    } catch (e) {
      alert(e?.message || "Thao tác thất bại");
    }
  };

  const askDelete = (s) => {
    setDelItem(s);
    setOpenDel(true);
  };

  const doDelete = async () => {
    if (!delItem) return;
    try {
      // ✅ Soft delete: backend set active=false
      const updated = await adminDeleteService(delItem.id);

      // ✅ Update tức thì theo đúng soft delete
      if (updated && updated.id) {
        setItems((prev) =>
          (prev || []).map((x) => (x.id === updated.id ? updated : x))
        );
      } else {
        // fallback nếu API delete không trả object
        setItems((prev) =>
          (prev || []).map((x) =>
            x.id === delItem.id ? { ...x, active: false } : x
          )
        );
      }

      setOpenDel(false);
      setDelItem(null);
    } catch (e) {
      alert(e?.message || "Xóa thất bại");
    }
  };

  return (
    // ✅ WRAPPER căn giữa trang
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 16px",
      }}
    >
      {/* ✅ CARD nằm giữa */}
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Quản lý dịch vụ (US14.1)</h2>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
            <button className="btn" onClick={openCreate} style={{ minWidth: 220 }}>
              + Thêm dịch vụ
            </button>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 6 }}>
          Bảng hiển thị: Tên dịch vụ, Mô tả, Giá, Chức năng (Edit/Delete).
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Tìm theo tên / mô tả / code / id..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />

          {/* ✅ Filter Active/Inactive/All */}
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 220, minWidth: 180, cursor: "pointer" }}
            title="Lọc theo trạng thái"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ALL">Tất cả</option>
          </select>

          <button className="btn" onClick={load} disabled={loading}>
            Tải lại
          </button>
        </div>

        {error && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
        {loading && (
          <p className="muted" style={{ marginTop: 12 }}>
            Đang tải...
          </p>
        )}

        {!loading && (
          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10 }}>Tên dịch vụ</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Mô tả</th>
                  <th style={{ textAlign: "right", padding: 10 }}>Giá</th>
                  <th style={{ textAlign: "center", padding: 10, width: 180 }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {(filtered || []).map((s) => (
                  <tr
                    key={s.id}
                    style={{ borderTop: "1px solid #223", opacity: s.active ? 1 : 0.55 }}
                  >
                    <td style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Code: {s.code} {s.active ? "" : "• (Inactive)"}
                      </div>
                    </td>
                    <td style={{ padding: 10 }} className="muted">
                      {s.description || "—"}
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>{vnd(s.price)}</td>
                    <td style={{ padding: 10, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button className="btn" onClick={() => openEdit(s)}>
                          Sửa
                        </button>
                        <button className="btn" onClick={() => askDelete(s)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ padding: 12 }} className="muted">
                      Không có dịch vụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          open={openForm}
          title={editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
          onClose={() => setOpenForm(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpenForm(false)}>
                Hủy
              </button>
              <button className="btn" onClick={submit}>
                {editing ? "Lưu" : "Tạo mới"}
              </button>
            </>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="muted" style={{ display: "block", marginBottom: 6 }}>
                Tên dịch vụ
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Khám tư vấn"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="muted" style={{ display: "block", marginBottom: 6 }}>
                Mô tả
              </label>
              <textarea
                className="input"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả ngắn..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label className="muted" style={{ display: "block", marginBottom: 6 }}>
                Giá (VNĐ)
              </label>
              <input
                className="input"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="VD: 150000"
                inputMode="numeric"
              />
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <div className="muted" style={{ fontSize: 12 }}>
                Giá phải là số dương.
              </div>
            </div>
          </div>

          {formErr && <div style={{ marginTop: 10, color: "#ff6b6b" }}>{formErr}</div>}
        </Modal>

        <Modal
          open={openDel}
          title="Xác nhận xóa dịch vụ"
          onClose={() => setOpenDel(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpenDel(false)}>
                Hủy
              </button>
              <button className="btn" onClick={doDelete}>
                Xóa
              </button>
            </>
          }
        >
          <div className="muted">
            Bạn có chắc muốn xóa dịch vụ <b>{delItem?.name}</b> không?
          </div>
          <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
            (Lưu ý: “Xóa” sẽ chuyển dịch vụ sang trạng thái Inactive.)
          </div>
        </Modal>
      </div>
    </div>
  );
}
