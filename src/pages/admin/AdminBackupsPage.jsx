import React, { useEffect, useMemo, useState } from "react";
import { backupNow, getBackupHistory, listBackupFiles } from "../../services/backups";
import "../../assets/styles/auth.css";

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

    const failedCount = useMemo(
        () => (history || []).filter((h) => String(h.status).toUpperCase() === "FAILED").length,
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

    return (
        <div className="auth-card" style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0, flex: 1 }}>Dữ liệu hệ thống • Backup</h2>

                <button className="chip-btn" onClick={doBackup} disabled={creating}>
                    {creating ? "Đang backup..." : "Backup dữ liệu ngay"}
                </button>

                <button className="chip-btn" onClick={loadAll} disabled={loading || creating}>
                    Làm mới
                </button>
            </div>

            <p className="muted" style={{ marginTop: 6 }}>
                Tạo file backup giả lập theo định dạng <b>file_backup_dd_MM_yyyy.txt</b> và lưu lịch sử.
            </p>

            {msg && <div className="alert success" style={{ marginTop: 10 }}>{msg}</div>}
            {err && <div className="alert error" style={{ marginTop: 10 }}>{err}</div>}

            {loading ? (
                <div style={{ marginTop: 16 }}>Đang tải…</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 16, marginTop: 16 }}>
                    <div style={{ background: "#0f1422", border: "1px solid #223", borderRadius: 16, padding: 14 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Danh sách file backup</div>

                        {files.length === 0 ? (
                            <div className="muted">Chưa có file backup nào.</div>
                        ) : (
                            <div className="table-wrap">
                                <table className="visit-table">
                                    <thead>
                                        <tr>
                                            <th>Tên file</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((f) => (
                                            <tr key={f}>
                                                <td style={{ wordBreak: "break-word" }}>{f}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div style={{ background: "#0f1422", border: "1px solid #223", borderRadius: 16, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontWeight: 700, flex: 1 }}>Lịch sử backup</div>
                            <span className="muted">FAILED: {failedCount}</span>
                        </div>

                        {history.length === 0 ? (
                            <div className="muted" style={{ marginTop: 8 }}>Chưa có lịch sử.</div>
                        ) : (
                            <div className="table-wrap" style={{ marginTop: 10 }}>
                                <table className="visit-table">
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
                                                st === "SUCCESS" ? "badge-status completed" :
                                                    st === "FAILED" ? "badge-status cancelled" :
                                                        "badge-status";
                                            return (
                                                <tr key={h.id || `${h.backupTime}-${h.note}-${st}`}>
                                                    <td>{fmtTime(h.backupTime || h.time || h.createdAt)}</td>
                                                    <td>
                                                        <span className={badgeCls}>{st || "N/A"}</span>
                                                    </td>
                                                    <td style={{ wordBreak: "break-word" }}>
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
                </div>
            )}

            <div className="muted" style={{ marginTop: 14 }}>
                * Chỉ tài khoản <b>ADMIN</b> mới thực hiện backup. Nếu PATIENT/DOCTOR truy cập sẽ báo “Bạn không có quyền truy cập chức năng này.”
            </div>
        </div>
    );
}
