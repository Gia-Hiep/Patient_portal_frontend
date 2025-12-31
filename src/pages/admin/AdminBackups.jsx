import React, { useEffect, useState } from "react";
import {
  runBackupNow,
  getBackupFiles,
  getBackupHistory,
} from "../../api/backupApi";

export default function AdminBackups() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);

  async function loadAll() {
    const [f, h] = await Promise.all([getBackupFiles(), getBackupHistory()]);
    setFiles(Array.isArray(f) ? f : []);
    setHistory(Array.isArray(h) ? h : []);
  }

  useEffect(() => {
    loadAll().catch((e) => setErr(e.message || "Load failed"));
  }, []);

  async function onBackup() {
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      const res = await runBackupNow();
      setMsg(res?.message || "Backup thành công!");
      await loadAll();
    } catch (e) {
      setErr(e.message || "Không thể tạo file backup, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>Dữ liệu hệ thống</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Backup dữ liệu (US16)
        </div>
        <button onClick={onBackup} disabled={loading}>
          {loading ? "Đang backup..." : "Backup dữ liệu ngay"}
        </button>

        {msg && (
          <div style={{ marginTop: 10, color: "green", fontWeight: 600 }}>
            {msg}
          </div>
        )}
        {err && (
          <div style={{ marginTop: 10, color: "red", fontWeight: 600 }}>
            {err}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Danh sách file backup
          </div>
          {files.length === 0 ? (
            <div>Chưa có file backup nào.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {files.map((name) => (
                <li key={name} style={{ marginBottom: 6 }}>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Lịch sử backup
          </div>
          {history.length === 0 ? (
            <div>Chưa có lịch sử backup.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Thời gian
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Trạng thái
                    </th>
                    <th
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td
                        style={{
                          padding: "8px 6px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {row.backupTime || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {row.status}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {row.fileName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
