// AdminAnnouncementsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    adminListAnnouncements,
    adminCreateAnnouncement,
    adminUpdateAnnouncement,
    adminDeleteAnnouncement,
} from "../../services/adminAnnouncements";
import "../../assets/styles/adminAnnouncements.css";
import { useNavigate } from "react-router-dom";

const TYPE_LABEL = {
    NEWS: "Tin tức",
    EMERGENCY: "Khẩn cấp",
};

const emptyForm = { title: "", content: "", type: "NEWS" };

export default function AdminAnnouncementsPage() {
    const [type, setType] = useState(""); // filter
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("create"); // create|edit
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const nav = useNavigate();
    const load = async () => {
        try {
            setErr("");
            setMsg("");
            setLoading(true);
            const data = await adminListAnnouncements(type || null);
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || "Không tải được danh sách thông báo.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, [type]);

    const openCreate = () => {
        setMode("create");
        setEditingId(null);
        setForm(emptyForm);
        setMsg("");
        setErr("");
        setOpen(true);
    };

    const openEdit = (a) => {
        setMode("edit");
        setEditingId(a.id);
        setForm({
            title: a.title || "",
            content: a.content || "",
            type: String(a.type || "NEWS").toUpperCase(),
        });
        setMsg("");
        setErr("");
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const validate = () => {
        const title = (form.title || "").trim();
        const content = (form.content || "").trim();
        const typeV = (form.type || "").trim();
        if (!title || !content || !typeV) return "Vui lòng nhập đầy đủ thông tin.";
        return "";
    };

    const save = async () => {
        const v = validate();
        if (v) {
            setErr(v);
            return;
        }

        try {
            setSaving(true);
            setErr("");
            setMsg("");

            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
                type: form.type,
            };

            if (mode === "create") {
                await adminCreateAnnouncement(payload);
                setMsg("Tạo mới thành công.");
            } else {
                await adminUpdateAnnouncement(editingId, payload);
                setMsg("Cập nhật thành công.");
            }

            closeModal();
            await load();
        } catch (e) {
            setErr(e?.message || "Lưu thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const del = async (id) => {
        const ok = window.confirm("Bạn có chắc muốn xóa?");
        if (!ok) return;

        try {
            setErr("");
            setMsg("");
            await adminDeleteAnnouncement(id);
            setMsg("Xóa thành công.");
            await load();
        } catch (e) {
            setErr(e?.message || "Xóa thất bại.");
        }
    };

    const displayRows = useMemo(() => rows || [], [rows]);

    return (
        <div className="aa-page">
            {(msg || err) && (
                <div className={`aa-topbar ${msg ? "is-success" : "is-error"}`}>
                    <div className="aa-topbar__icon" aria-hidden="true">
                        {msg ? (
                            <span className="aa-dot aa-dot--success">✓</span>
                        ) : (
                            <span className="aa-dot aa-dot--error">!</span>
                        )}
                    </div>

                    <div className="aa-topbar__content">
                        {msg ? (
                            <>
                                <div className="aa-topbar__title">Thành công</div>
                                <div className="aa-topbar__text">{msg}</div>
                            </>
                        ) : (
                            <>
                                <div className="aa-topbar__title">Lỗi</div>
                                <div className="aa-topbar__text">{err}</div>
                            </>
                        )}
                    </div>

                    <button
                        className="aa-topbar__close"
                        onClick={() => {
                            setMsg("");
                            setErr("");
                        }}
                        aria-label="Đóng"
                        title="Đóng"
                        type="button"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="auth-card aa-card" style={{ maxWidth: 1100 }}>
                <div className="aa-head">
                    <div className="aa-head__left">
                        <h2 className="aa-title" style={{ margin: 0 }}>
                            Quản lý thông báo
                        </h2>
                        <div className="aa-subtitle">Xem và quản lý tin tức hiển thị trên ứng dụng bệnh nhân.</div>
                    </div>

                    <div className="aa-head__right">
                        <div className="aa-filterWrap">
                            <select
                                className="aa-select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                aria-label="Lọc loại thông báo"
                            >
                                <option value="">Tất cả</option>
                                <option value="NEWS">Tin tức</option>
                                <option value="EMERGENCY">Khẩn cấp</option>
                            </select>
                        </div>

                        <button className="aa-btn aa-btn--secondary" onClick={load} type="button">
                            <span className="aa-btn__icon" aria-hidden="true">↻</span>
                            Tải lại
                        </button>

                        <button
                            className="aa-btn aa-btn--ghost aa-backBtn"
                            onClick={() => nav("/dashboard")}
                            type="button"
                        >
                            ← Quay lại
                        </button>

                        <button className="aa-btn aa-btn--primary" onClick={openCreate} type="button">
                            <span className="aa-btn__icon" aria-hidden="true">+</span>
                            Thêm thông báo
                        </button>
                    </div>

                </div>

                {/* giữ y nguyên các state text */}
                {loading ? (
                    <div className="muted aa-state">Đang tải…</div>
                ) : displayRows.length === 0 ? (
                    <div className="muted aa-state">Chưa có thông báo.</div>
                ) : (
                    <div className="aa-tableWrap table-wrap">
                        <table className="aa-table visit-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Loại</th>
                                    <th>Tiêu đề</th>
                                    <th style={{ width: 120 }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayRows.map((a) => {
                                    const t = String(a.type).toUpperCase();
                                    const badgeCls = `badge-status ${t === "EMERGENCY" ? "cancelled" : "completed"}`;
                                    const timeText = a.createdAt
                                        ? new Date(a.createdAt).toLocaleString("vi-VN")
                                        : "";

                                    return (
                                        <tr key={a.id}>
                                            <td className="aa-timeCell">{timeText}</td>

                                            <td>
                                                <span className={badgeCls}>
                                                    {TYPE_LABEL[t] || a.type}
                                                </span>
                                            </td>

                                            <td className="aa-titleCell">
                                                <div className="aa-rowTitle">{a.title}</div>
                                                <div className="muted aa-rowDesc">
                                                    {(a.content || "").slice(0, 120)}
                                                    {(a.content || "").length > 120 ? "…" : ""}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="aa-actions">
                                                    <button
                                                        className="aa-iconBtn aa-iconBtn--edit"
                                                        onClick={() => openEdit(a)}
                                                        type="button"
                                                        title="Sửa"
                                                        aria-label="Sửa"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path
                                                                d="M4 20h4l10.5-10.5a1.4 1.4 0 0 0 0-2L16.5 5.5a1.4 1.4 0 0 0-2 0L4 16v4z"
                                                                fill="currentColor"
                                                            />
                                                            <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" fill="none" />
                                                        </svg>
                                                        <span className="sr-only">Sửa</span>
                                                    </button>

                                                    <button
                                                        className="aa-iconBtn aa-iconBtn--delete"
                                                        onClick={() => del(a.id)}
                                                        type="button"
                                                        title="Xóa"
                                                        aria-label="Xóa"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path
                                                                d="M6 7h12l-1 14H7L6 7z"
                                                                fill="currentColor"
                                                                opacity="0.95"
                                                            />
                                                            <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" fill="none" />
                                                        </svg>
                                                        <span className="sr-only">Xóa</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal Create/Edit */}
                {open && (
                    <div className="modal-backdrop aa-modalBackdrop" onClick={closeModal}>
                        <div className="modal aa-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header aa-modalHeader">
                                <h3 className="aa-modalTitle" style={{ margin: 0 }}>
                                    {mode === "create" ? "Thêm thông báo" : "Sửa thông báo"}
                                </h3>
                                <button className="close-btn aa-close" onClick={closeModal} type="button">
                                    ×
                                </button>
                            </div>

                            <div className="modal-body aa-modalBody">
                                {err && <div className="alert error aa-inModalAlert">{err}</div>}

                                <div className="aa-field">
                                    <div className="aa-label">
                                        Loại thông báo <span className="aa-req">*</span>
                                    </div>
                                    <select
                                        className="aa-input"
                                        value={form.type}
                                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                    >
                                        <option value="NEWS">Tin tức</option>
                                        <option value="EMERGENCY">Khẩn cấp</option>
                                    </select>
                                </div>

                                <div className="aa-field">
                                    <div className="aa-label">
                                        Tiêu đề <span className="aa-req">*</span>
                                    </div>
                                    <input
                                        className="aa-input"
                                        value={form.title}
                                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                        placeholder="Nhập tiêu đề…"
                                    />
                                </div>

                                <div className="aa-field">
                                    <div className="aa-label">
                                        Nội dung <span className="aa-req">*</span>
                                    </div>
                                    <textarea
                                        className="aa-input aa-textarea"
                                        value={form.content}
                                        onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                                        placeholder="Nhập nội dung…"
                                        rows={7}
                                    />
                                </div>

                                <div className="aa-modalFooter">
                                    <div className="muted aa-note">
                                        * Thông báo lưu xong sẽ hiển thị ngay ở trang bệnh nhân.
                                    </div>

                                    <div className="aa-footerActions">
                                        <button className="aa-btn aa-btn--secondary" onClick={closeModal} type="button">
                                            Hủy
                                        </button>
                                        <button
                                            className="aa-btn aa-btn--primary"
                                            disabled={saving}
                                            onClick={save}
                                            type="button"
                                        >
                                            {saving ? "Đang lưu…" : "Lưu"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
