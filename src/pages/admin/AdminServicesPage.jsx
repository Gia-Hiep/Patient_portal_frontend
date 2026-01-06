import React, { useEffect, useMemo, useState } from "react";
import "../../assets/styles/adminServices.css";
import {
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
} from "../../services/medicalServices";
import { useNavigate } from "react-router-dom";



const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div
      className="as-modalOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="as-modal">
        <div className="as-modalHeader">
          <div className="as-modalTitle">{title}</div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="as-modalClose"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="as-modalBody">{children}</div>

        {footer && <div className="as-modalFooter">{footer}</div>}
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
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
    <div className="as-page">
      <div className="as-card">
        {/* Header */}
        <div className="as-header">
          <div className="as-headerLeft">
            <h2 className="as-title">Quản lý dịch vụ (US14.1)</h2>
            <div className="as-subtitle">
              Quản lý danh mục, giá cả và trạng thái dịch vụ.
            </div>
          </div>

          <div className="as-headerActions">
            <button
              className="as-btn as-btnGhost as-backBtn"
              onClick={() => nav("/dashboard")}
              type="button"
            >
              ← Quay lại
            </button>

            <button className="as-btn as-btnPrimary" onClick={openCreate}>
              + Thêm dịch vụ
            </button>
          </div>
        </div>


        <p className="muted as-help">
          Bảng hiển thị: Tên dịch vụ, Mô tả, Giá, Chức năng (Edit/Delete).
        </p>

        {/* Filters */}
        <div className="as-filters">
          <div className="as-searchWrap">
            <span className="as-searchIcon" aria-hidden="true">
              🔍
            </span>
            <input
              className="as-input as-searchInput"
              placeholder="Tìm theo tên / mô tả / code / id..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="as-input as-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Lọc theo trạng thái"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ALL">Tất cả</option>
          </select>

          <button className="as-btn as-btnSecondary" onClick={load} disabled={loading}>
            Tải lại
          </button>
        </div>

        {/* States */}
        {error && <div className="as-errorText">{error}</div>}
        {loading && <div className="muted as-loadingText">Đang tải...</div>}

        {/* Table */}
        {!loading && (
          <div className="as-tableWrap">
            <table className="as-table">
              <thead>
                <tr>
                  <th className="as-th">Tên dịch vụ</th>
                  <th className="as-th">Mô tả</th>
                  <th className="as-th as-thRight">Giá</th>
                  <th className="as-th as-thCenter as-thActions">Chức năng</th>
                </tr>
              </thead>

              <tbody>
                {(filtered || []).map((s) => (
                  <tr
                    key={s.id}
                    className={`as-tr ${s.active ? "" : "as-trInactive"}`}
                  >
                    <td className="as-td">
                      <div className="as-nameRow">
                        <div className="as-name">{s.name}</div>
                        {!s.active && <span className="as-pillInactive">Inactive</span>}
                      </div>

                      <div className="as-meta muted">
                        Code: {s.code} {!s.active ? "• (Inactive)" : ""}
                      </div>
                    </td>

                    <td className="as-td as-desc muted">{s.description || "—"}</td>

                    <td className="as-td as-price">{vnd(s.price)}</td>

                    <td className="as-td as-actionsCell">
                      <div className="as-rowActions">
                        <button className="as-btn as-btnGhost" onClick={() => openEdit(s)}>
                          Sửa
                        </button>
                        <button className="as-btn as-btnDangerGhost" onClick={() => askDelete(s)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={4} className="as-empty muted">
                      Không có dịch vụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Form modal */}
        <Modal
          open={openForm}
          title={editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
          onClose={() => setOpenForm(false)}
          footer={
            <>
              <button className="as-btn as-btnSecondary" onClick={() => setOpenForm(false)}>
                Hủy
              </button>
              <button className="as-btn as-btnPrimary" onClick={submit}>
                {editing ? "Lưu" : "Tạo mới"}
              </button>
            </>
          }
        >
          <div className="as-formGrid">
            <div className="as-field as-fieldFull">
              <label className="as-label">Tên dịch vụ</label>
              <input
                className={`as-input ${formErr === "Tên dịch vụ là bắt buộc." ? "as-inputError" : ""}`}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Khám tư vấn"
              />
              {formErr === "Tên dịch vụ là bắt buộc." && (
                <div className="as-fieldError">Tên dịch vụ là bắt buộc.</div>
              )}
            </div>

            <div className="as-field as-fieldFull">
              <label className="as-label">Mô tả</label>
              <textarea
                className="as-input as-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả ngắn..."
              />
            </div>

            <div className="as-field">
              <label className="as-label">Giá (VNĐ)</label>

              <div className="as-money">
                <input
                  className={`as-input as-moneyInput ${formErr === "Giá không hợp lệ." ? "as-inputError" : ""
                    }`}
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="VD: 150000"
                  inputMode="numeric"
                />
                <div className="as-moneySuffix">VND</div>
              </div>

              <div className="as-hint muted">Giá phải là số dương.</div>

              {formErr === "Giá không hợp lệ." && (
                <div className="as-fieldError">Giá không hợp lệ.</div>
              )}
            </div>

            {/* giữ formErr tổng quát (nếu có) như cũ */}
            {formErr &&
              formErr !== "Tên dịch vụ là bắt buộc." &&
              formErr !== "Giá không hợp lệ." && (
                <div className="as-formErrGlobal">{formErr}</div>
              )}
          </div>
        </Modal>

        {/* Delete modal */}
        <Modal
          open={openDel}
          title="Xác nhận xóa dịch vụ"
          onClose={() => setOpenDel(false)}
          footer={
            <>
              <button className="as-btn as-btnSecondary" onClick={() => setOpenDel(false)}>
                Hủy
              </button>
              <button className="as-btn as-btnPrimary" onClick={doDelete}>
                Xóa
              </button>
            </>
          }
        >
          <div className="as-delBody">
            <div className="muted">
              Bạn có chắc muốn xóa dịch vụ <b>{delItem?.name}</b> không?
            </div>
            <div className="muted as-delNote">
              (Lưu ý: “Xóa” sẽ chuyển dịch vụ sang trạng thái Inactive.)
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
