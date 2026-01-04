import React, { useEffect, useMemo, useState } from "react";
import {
    backupNow,
    getBackupHistory,
    listBackupFiles,
} from "../../services/backups";
import "../../assets/styles/auth.css";
import "../../assets/styles/adminBackups.css";
import { useNavigate } from "react-router-dom";

function fmtTime(v) {
    if (!v) return "-";
    try {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toLocaleString("vi-VN");
    } catch { }
    return String(v);
}

export default function AdminBackupsPage() {
    const [files, setFiles] = useState([]);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const nav = useNavigate();
    const failedCount = useMemo(
        () =>
            (history || []).filter(
                (h) => String(h.status).toUpperCase() === "FAILED"
            ).length,
        [history]
    );

    const loadAll = async () => {
        setErr("");
        setMsg("");
        setLoading(true);
        try {
            const [f, h] = await Promise.all([listBackupFiles(), getBackupHistory()]);
            setFiles(Array.isArray(f) ? f : []);
            setHistory(Array.isArray(h) ? h : []);
        } catch (e) {
            if (e.status === 403) {
                setErr("Bạn không có quyền truy cập chức năng này.");
            } else {
                setErr(e.message || "Không tải được dữ liệu backup.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doBackup = async () => {
        setErr("");
        setMsg("");
        setCreating(true);
        try {
            const res = await backupNow(); // {message, fileName}
            setMsg(res?.message || "Backup thành công!");
            // reload list + history
            await loadAll();
        } catch (e) {
            if (e.status === 403) {
                setErr("Bạn không có quyền truy cập chức năng này.");
            } else {
                setErr(e.message || "Không thể tạo file backup, vui lòng thử lại.");
            }
        } finally {
            setCreating(false);
        }
    };

    const successCount = (history || []).filter(
        (h) => String(h.status || "").toUpperCase() === "SUCCESS"
    ).length;

    return (
        <div className="ab-page">
            <div className="ab-card auth-card" style={{ maxWidth: 1100 }}>
                {/* Header row */}
                <div className="ab-header">
                    <div className="ab-headerLeft">
                        <h2 className="ab-breadcrumb">Dữ liệu hệ thống • Backup</h2>
                        <p className="ab-subtitle muted">
                            Tạo file backup giả lập theo định dạng{" "}
                            <b>file_backup_dd_MM_yyyy.txt</b> và lưu lịch sử.
                        </p>
                    </div>

                    <div className="ab-actions">
                        <button
                            className="ab-btn ab-btn-ghost chip-btn"
                            onClick={loadAll}
                            disabled={loading || creating}
                        >
                            Làm mới
                        </button>

                        <button
                            className="ab-btn ab-btn-ghost chip-btn ab-backBtn"
                            onClick={() => nav("/dashboard")}
                            type="button"
                        >
                            ← Quay lại
                        </button>

                        <button
                            className="ab-btn ab-btn-primary chip-btn"
                            onClick={doBackup}
                            disabled={creating}
                        >
                            {creating ? "Đang backup..." : "Backup dữ liệu ngay"}
                        </button>
                    </div>

                </div>

                {/* Alerts */}
                {msg && (
                    <div className="ab-alertWrap">
                        <div className="ab-alert success alert" style={{ marginTop: 10 }}>
                            {msg}
                        </div>
                    </div>
                )}
                {err && (
                    <div className="ab-alertWrap">
                        <div className="ab-alert error alert" style={{ marginTop: 10 }}>
                            {err}
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="ab-loading">Đang tải…</div>
                ) : (
                    <div className="ab-grid">
                        {/* Left panel */}
                        <section className="ab-panel">
                            <div className="ab-panelHead">
                                <div className="ab-panelTitle">
                                    <span className="ab-ico" aria-hidden="true">
                                        📁
                                    </span>
                                    <span>Danh sách file backup</span>
                                    <span className="ab-pill">Total: {files.length}</span>
                                </div>
                            </div>

                            <div className="ab-panelBody">
                                {files.length === 0 ? (
                                    <div className="muted">Chưa có file backup nào.</div>
                                ) : (
                                    <div className="table-wrap ab-tableWrap">
                                        <table className="visit-table ab-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên file</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {files.map((f) => (
                                                    <tr key={f}>
                                                        <td className="ab-fileCell">
                                                            <span className="ab-fileIcon" aria-hidden="true">
                                                                📄
                                                            </span>
                                                            <span className="ab-fileName">{f}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Right panel */}
                        <section className="ab-panel">
                            <div className="ab-panelHead">
                                <div className="ab-panelTitle">
                                    <span className="ab-ico" aria-hidden="true">
                                        🕘
                                    </span>
                                    <span>Lịch sử backup</span>
                                </div>

                                <div className="ab-panelBadges">
                                    <span className="ab-badge ab-badge-failed">
                                        FAILED: {failedCount}
                                    </span>
                                    <span className="ab-badge ab-badge-success">
                                        SUCCESS: {successCount}
                                    </span>
                                </div>
                            </div>

                            <div className="ab-panelBody">
                                {history.length === 0 ? (
                                    <div className="muted">Chưa có lịch sử.</div>
                                ) : (
                                    <div className="table-wrap ab-tableWrap">
                                        <table className="visit-table ab-table">
                                            <thead>
                                                <tr>
                                                    <th>Thời gian</th>
                                                    <th>Trạng thái</th>
                                                    <th>Ghi chú (tên file)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((h) => {
                                                    const st = String(h.status || "").toUpperCase();
                                                    const badgeCls =
                                                        st === "SUCCESS"
                                                            ? "badge-status completed"
                                                            : st === "FAILED"
                                                                ? "badge-status cancelled"
                                                                : "badge-status";
                                                    return (
                                                        <tr key={h.id || `${h.backupTime}-${h.note}-${st}`}>
                                                            <td>
                                                                {fmtTime(h.backupTime || h.time || h.createdAt)}
                                                            </td>
                                                            <td>
                                                                <span className={badgeCls}>{st || "N/A"}</span>
                                                            </td>
                                                            <td className="ab-noteCell">
                                                                {h.note || h.fileName || "-"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {/* Footer note */}
                <div className="ab-footer muted">
                    * Chỉ tài khoản <b>ADMIN</b> mới thực hiện backup. Nếu PATIENT/DOCTOR
                    truy cập sẽ báo “Bạn không có quyền truy cập chức năng này.”
                </div>
            </div>
        </div>
    );
}
