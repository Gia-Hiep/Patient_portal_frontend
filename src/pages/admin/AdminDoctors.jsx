import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AppHeader from "../../components/Header";
import {
  deleteAdminDoctor,
  getAdminDoctors,
  updateAdminDoctor,
  createAdminDoctor,
} from "../../services/adminDoctors";
import "../../assets/styles/adminDoctors.css";

/* ================= UI COMPONENTS ================= */

function Badge({ children }) {
  const v = String(children || "").toUpperCase();
  const cls =
    v === "ACTIVE"
      ? "adoc-badge adoc-badge--active"
      : v === "DISABLED"
      ? "adoc-badge adoc-badge--disabled"
      : "adoc-badge";
  return <span className={cls}>{children}</span>;
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08ZM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83Z"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm3-4h6l1 1h4v2H4V4h4l1-1Zm1 6h2v10h-2V9Zm4 0h2v10h-2V9Z"
      />
    </svg>
  );
}

function Modal({ title, onClose, children, width = 720 }) {
  return (
    <div
      className="adoc-modal-backdrop"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="adoc-modal"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="adoc-modal__head">
          <div className="adoc-modal__title">{title}</div>
          <button
            className="adoc-icon-btn adoc-icon-btn--ghost"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="adoc-modal__body">{children}</div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div className="adoc-field">
      <div className="adoc-field__label">{label}</div>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="adoc-input adoc-textarea"
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="adoc-input"
        />
      )}
    </div>
  );
}

function DoctorAvatar({ name }) {
  const s = String(name || "").trim();
  const parts = s.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || "BS").toUpperCase();

  return <div className="adoc-avatar">{initials}</div>;
}

/* ================= MAIN PAGE ================= */

export default function AdminDoctors() {
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [includeDisabled, setIncludeDisabled] = useState(false);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ===== CREATE DOCTOR ===== */
  const [createOpen, setCreateOpen] = useState(false);
  const [createModel, setCreateModel] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    specialty: "",
    department: "",
    licenseNo: "",
    workingSchedule: "",
  });

  useEffect(() => {
    if (role !== "ADMIN") navigate("/dashboard", { replace: true });
  }, [role, navigate]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await getAdminDoctors({ includeDisabled });
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.message || "Không tải được danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeDisabled]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return rows;
    return rows.filter((d) => {
      const s = `${d.fullName || ""} ${d.username || ""} ${d.email || ""} ${
        d.specialty || ""
      } ${d.department || ""}`.toLowerCase();
      return s.includes(key);
    });
  }, [q, rows]);

  /* ================= EDIT ================= */

  const onOpenEdit = (d) => {
    setEditModel({ ...d });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editModel?.id) return;
    setLoading(true);
    setErr(null);
    try {
      await updateAdminDoctor(editModel.id, {
        fullName: editModel.fullName,
        specialty: editModel.specialty,
        department: editModel.department,
        licenseNo: editModel.licenseNo,
        bio: editModel.bio,
        workingSchedule: editModel.workingSchedule,
      });
      setEditOpen(false);
      setEditModel(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const onAskDelete = (d) => {
    setDeleteTarget(d);
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setLoading(true);
    setErr(null);
    try {
      await deleteAdminDoctor(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setErr(e?.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */

  const onCreateDoctor = async () => {
    setLoading(true);
    setErr(null);
    try {
      await createAdminDoctor(createModel);
      setCreateOpen(false);
      setCreateModel({
        username: "",
        email: "",
        password: "",
        fullName: "",
        specialty: "",
        department: "",
        licenseNo: "",
        workingSchedule: "",
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Tạo bác sĩ thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="adoc">
      <AppHeader />

      <div className="adoc-shell">
        <div className="adoc-card">
          <div className="adoc-head">
            <div className="adoc-head__left">
              <h2 className="adoc-title">Quản lý danh sách bác sĩ</h2>
              <div className="adoc-subtitle">
                US14.2: Xem danh sách, cập nhật, thêm bác sĩ
              </div>
            </div>

            <div className="adoc-head__right">
              <button
                className="adoc-btn adoc-btn--ghost"
                onClick={() => navigate("/dashboard")}
              >
                ← Về Dashboard
              </button>
            </div>
          </div>

          <div className="adoc-toolbar">
            <div className="adoc-search">
              <span className="adoc-search__icon" aria-hidden="true">
                🔍
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên/email/chuyên khoa..."
                className="adoc-search__input"
              />
            </div>

            <label className="adoc-check">
              <input
                type="checkbox"
                checked={includeDisabled}
                onChange={(e) => setIncludeDisabled(e.target.checked)}
              />
              <span>Hiển thị cả DISABLED</span>
            </label>

            <div className="adoc-actions">
              <button
                className="adoc-btn adoc-btn--ghost"
                onClick={load}
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Tải lại"}
              </button>

              <button
                className="adoc-btn adoc-btn--primary"
                onClick={() => setCreateOpen(true)}
              >
                + Thêm bác sĩ
              </button>
            </div>
          </div>

          {err && <div className="adoc-alert">{err}</div>}

          <div className="adoc-table-wrap">
            <table className="adoc-table">
              <thead>
                <tr>
                  <th>Bác sĩ</th>
                  <th>Email</th>
                  <th>Chuyên khoa</th>
                  <th>Khoa</th>
                  <th>Trạng thái</th>
                  <th className="adoc-th-actions">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="adoc-row">
                    <td>
                      <div className="adoc-doctor">
                        <DoctorAvatar name={d.fullName || d.username} />
                        <div className="adoc-doctor__meta">
                          <div className="adoc-doctor__name">
                            {d.fullName || "(Chưa có tên)"}
                          </div>
                          <div className="adoc-doctor__sub">
                            @{d.username} • ID {d.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="adoc-td-muted">{d.email}</td>
                    <td>{d.specialty || "-"}</td>
                    <td>{d.department || "-"}</td>
                    <td>
                      <Badge>{d.status || "-"}</Badge>
                    </td>

                    <td className="adoc-td-actions">
                      <div className="adoc-row-actions">
                        <button
                          className="adoc-icon-btn adoc-icon-btn--edit"
                          onClick={() => onOpenEdit(d)}
                          disabled={loading}
                          title="Sửa"
                          aria-label="Sửa"
                          type="button"
                        >
                          <IconPencil />
                        </button>

                        <button
                          className="adoc-icon-btn adoc-icon-btn--danger"
                          onClick={() => onAskDelete(d)}
                          disabled={loading || d.status === "DISABLED"}
                          title="Xóa"
                          aria-label="Xóa"
                          type="button"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="adoc-empty">
                      Không có bác sĩ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {editOpen && editModel && (
        <Modal
          title={`Chỉnh sửa bác sĩ (ID ${editModel.id})`}
          onClose={() => setEditOpen(false)}
        >
          <div className="adoc-modal-grid">
            <TextField
              label="Họ tên"
              value={editModel.fullName}
              onChange={(v) => setEditModel((s) => ({ ...s, fullName: v }))}
              placeholder="VD: BS. Nguyễn Văn A"
            />

            <TextField
              label="Số chứng chỉ (license)"
              value={editModel.licenseNo}
              onChange={(v) => setEditModel((s) => ({ ...s, licenseNo: v }))}
              placeholder="VD: 12345"
            />

            <TextField
              label="Chuyên khoa"
              value={editModel.specialty}
              onChange={(v) => setEditModel((s) => ({ ...s, specialty: v }))}
              placeholder="VD: Nội tổng quát"
            />

            <TextField
              label="Khoa / Phòng"
              value={editModel.department}
              onChange={(v) => setEditModel((s) => ({ ...s, department: v }))}
              placeholder="VD: Khám tổng quát"
            />

            <div className="adoc-col-span">
              <TextField
                label="Lịch làm việc"
                value={editModel.workingSchedule}
                onChange={(v) =>
                  setEditModel((s) => ({ ...s, workingSchedule: v }))
                }
                placeholder='VD: "T2-T6 08:00-17:00; T7 08:00-11:00"'
              />
            </div>

            <div className="adoc-col-span">
              <TextField
                label="Giới thiệu"
                multiline
                value={editModel.bio}
                onChange={(v) => setEditModel((s) => ({ ...s, bio: v }))}
                placeholder="Mô tả ngắn về bác sĩ..."
              />
            </div>
          </div>

          <div className="adoc-modal-footer">
            <button
              className="adoc-btn adoc-btn--ghost"
              onClick={() => setEditOpen(false)}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="adoc-btn adoc-btn--primary"
              onClick={onSaveEdit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </Modal>
      )}

      {deleteOpen && deleteTarget && (
        <Modal title="Xác nhận xóa" onClose={() => setDeleteOpen(false)} width={520}>
          <div className="adoc-del">
            <div className="adoc-del__text" style={{ lineHeight: 1.6 }}>
              Bạn chắc chắn muốn xóa bác sĩ:
              <div style={{ marginTop: 8 }}>
                <b>{deleteTarget.fullName || deleteTarget.username}</b> (
                {deleteTarget.email})
              </div>
              <div className="adoc-del__note" style={{ marginTop: 8 }}>
                Hành động này sẽ đặt tài khoản về trạng thái <b>DISABLED</b> (soft
                delete) để tránh ảnh hưởng dữ liệu lịch sử.
              </div>
            </div>
          </div>

          <div className="adoc-modal-footer">
            <button
              className="adoc-btn adoc-btn--ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="adoc-btn adoc-btn--danger"
              onClick={onConfirmDelete}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận xóa"}
            </button>
          </div>
        </Modal>
      )}

      {createOpen && (
        <Modal title="Thêm bác sĩ mới" onClose={() => setCreateOpen(false)}>
          <div className="adoc-modal-grid">
            <TextField
              label="Username"
              value={createModel.username}
              onChange={(v) => setCreateModel((s) => ({ ...s, username: v }))}
            />
            <TextField
              label="Email"
              value={createModel.email}
              onChange={(v) => setCreateModel((s) => ({ ...s, email: v }))}
            />
            <TextField
              label="Mật khẩu (mặc định: 123456)"
              value={createModel.password}
              onChange={(v) => setCreateModel((s) => ({ ...s, password: v }))}
            />
            <TextField
              label="Họ tên"
              value={createModel.fullName}
              onChange={(v) => setCreateModel((s) => ({ ...s, fullName: v }))}
            />
            <TextField
              label="Chuyên khoa"
              value={createModel.specialty}
              onChange={(v) => setCreateModel((s) => ({ ...s, specialty: v }))}
            />
            <TextField
              label="Khoa"
              value={createModel.department}
              onChange={(v) => setCreateModel((s) => ({ ...s, department: v }))}
            />
            <TextField
              label="Số chứng chỉ"
              value={createModel.licenseNo}
              onChange={(v) => setCreateModel((s) => ({ ...s, licenseNo: v }))}
            />
            <div className="adoc-col-span">
              <TextField
                label="Lịch làm việc"
                value={createModel.workingSchedule}
                onChange={(v) =>
                  setCreateModel((s) => ({ ...s, workingSchedule: v }))
                }
              />
            </div>
          </div>

          <div className="adoc-modal-footer">
            <button
              className="adoc-btn adoc-btn--ghost"
              onClick={() => setCreateOpen(false)}
            >
              Hủy
            </button>
            <button className="adoc-btn adoc-btn--primary" onClick={onCreateDoctor}>
              Lưu
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
