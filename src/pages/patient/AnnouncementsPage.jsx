import React, { useEffect, useMemo, useState } from "react";
import { listAnnouncements } from "../../services/announcements";

const TYPE_LABEL = {
    NEWS: "Tin tức",
    EMERGENCY: "Khẩn cấp",
};

export default function AnnouncementsPage() {
    const [type, setType] = useState(""); // "" | NEWS | EMERGENCY
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        try {
            setErr("");
            setLoading(true);
            const data = await listAnnouncements(type || null);
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || "Không tải được thông báo.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, [type]);

    const hasData = rows && rows.length > 0;

    return (
        <div className="auth-card" style={{ maxWidth: 1000 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, flex: 1 }}>Thông báo bệnh viện</h2>

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
            </div>

            <p className="muted" style={{ marginTop: 8 }}>
                Danh sách hiển thị theo thời gian mới nhất lên đầu.
            </p>

            {err && <div className="alert error">{err}</div>}

            {loading ? (
                <div className="muted">Đang tải…</div>
            ) : !hasData ? (
                <div className="muted">Chưa có thông báo.</div>
            ) : (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {rows.map((a) => (
                        <div
                            key={a.id}
                            style={{
                                border: "1px solid #223",
                                background: "#0f1422",
                                borderRadius: 14,
                                padding: 12,
                            }}
                        >
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <span
                                    className={`badge-status ${String(a.type).toUpperCase() === "EMERGENCY"
                                            ? "cancelled"
                                            : "completed"
                                        }`}
                                >
                                    {TYPE_LABEL[String(a.type).toUpperCase()] ||
                                        String(a.type || "N/A")}
                                </span>

                                <div style={{ fontWeight: 700, flex: 1 }}>{a.title}</div>

                                <div className="muted" style={{ fontSize: 13 }}>
                                    {a.createdAt ? new Date(a.createdAt).toLocaleString("vi-VN") : ""}
                                </div>
                            </div>

                            <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                                {a.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
