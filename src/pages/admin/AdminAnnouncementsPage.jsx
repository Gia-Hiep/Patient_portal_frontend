import React, { useEffect, useMemo, useState } from "react";
import {
    adminListAnnouncements,
    adminCreateAnnouncement,
    adminUpdateAnnouncement,
    adminDeleteAnnouncement,
} from "../../services/adminAnnouncements";

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

    return (
        <div className="auth-card" style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, flex: 1 }}>Quản lý thông báo</h2>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ padding: 8, borderRadius: 10 }}
                >
                    <option value="">Tất cả</option>
                    <option value="NEWS">Tin tức</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                </select>

                <button className="chip-btn" onClick={load}>
                    Tải lại
                </button>

                <button className="chip-btn" onClick={openCreate}>
                    Thêm thông báo
                </button>
            </div>

            {err && <div className="alert error" style={{ marginTop: 10 }}>{err}</div>}
            {msg && <div className="alert success" style={{ marginTop: 10 }}>{msg}</div>}

            {loading ? (
                <div className="muted" style={{ marginTop: 12 }}>Đang tải…</div>
            ) : rows.length === 0 ? (
                <div className="muted" style={{ marginTop: 12 }}>Chưa có thông báo.</div>
            ) : (
                <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table className="visit-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Loại</th>
                                <th>Tiêu đề</th>
                                <th style={{ width: 200 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((a) => (
                                <tr key={a.id}>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {a.createdAt ? new Date(a.createdAt).toLocaleString("vi-VN") : ""}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge-status ${String(a.type).toUpperCase() === "EMERGENCY"
                                                    ? "cancelled"
                                                    : "completed"
                                                }`}
                                        >
                                            {TYPE_LABEL[String(a.type).toUpperCase()] || a.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 650 }}>{a.title}</div>
                                        <div className="muted" style={{ marginTop: 4 }}>
                                            {(a.content || "").slice(0, 120)}
                                            {(a.content || "").length > 120 ? "…" : ""}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <button className="chip-btn" onClick={() => openEdit(a)}>
                                                Sửa
                                            </button>
                                            <button className="chip-btn" onClick={() => del(a.id)}>
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Create/Edit */}
            {open && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>
                                {mode === "create" ? "Thêm thông báo" : "Sửa thông báo"}
                            </h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            {err && <div className="alert error">{err}</div>}

                            <div className="detail-block">
                                <div className="label">Loại thông báo</div>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                    style={{ width: "100%", padding: 8, borderRadius: 10, marginTop: 6 }}
                                >
                                    <option value="NEWS">Tin tức</option>
                                    <option value="EMERGENCY">Khẩn cấp</option>
                                </select>
                            </div>

                            <div className="detail-block" style={{ marginTop: 10 }}>
                                <div className="label">Tiêu đề</div>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="Nhập tiêu đề…"
                                    style={{ width: "100%", padding: 10, borderRadius: 10, marginTop: 6 }}
                                />
                            </div>

                            <div className="detail-block" style={{ marginTop: 10 }}>
                                <div className="label">Nội dung</div>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                                    placeholder="Nhập nội dung…"
                                    rows={7}
                                    style={{ width: "100%", padding: 10, borderRadius: 10, marginTop: 6, resize: "vertical" }}
                                />
                            </div>

                            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="chip-btn" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button className="chip-btn" disabled={saving} onClick={save}>
                                    {saving ? "Đang lưu…" : "Lưu"}
                                </button>
                            </div>

                            <div className="muted" style={{ marginTop: 10 }}>
                                * Thông báo lưu xong sẽ hiển thị ngay ở trang bệnh nhân.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
