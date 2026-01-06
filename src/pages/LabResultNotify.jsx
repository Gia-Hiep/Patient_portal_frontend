import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  fetchLabResultPatients,
  fetchLabResultDetail,
  sendLabResultNotification,
} from "../services/labresult";
import "../assets/styles/LabResultNotify.css";

export default function LabResultNotify() {
  const user = useSelector((s) => s.auth.user);
  const hasPermission = ["DOCTOR", "LAB_STAFF"].includes(user?.role);

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState(
    "Kết quả xét nghiệm của bạn đã sẵn sàng."
  );

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  // ===== LOAD PATIENTS =====
  useEffect(() => {
    if (!hasPermission) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchLabResultPatients();
        setPatients(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [hasPermission]);

  // ===== SELECT PATIENT =====
  const selectPatient = async (p) => {
    setSelected(p);
    setDetail(null);
    setSuccess("");
    setLoadingDetail(true);

    try {
      const d = await fetchLabResultDetail(p.patientId);
      setDetail(d);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ===== SEND NOTIFICATION =====
  const send = async () => {
    if (!selected || !detail || sending) return;

    try {
      setSending(true);
      await sendLabResultNotification({
        patientId: selected.patientId,
        body: message,
      });
      setSuccess("✅ Gửi thông báo thành công");
    } catch (e) {
      alert("❌ Không thể gửi thông báo");
    } finally {
      setSending(false);
    }
  };

  // ✅ required unauthorized text
  if (!hasPermission) {
    return (
      <div className="lrn-page">
        <div className="lrn-unauth">Bạn không có quyền gửi thông báo.</div>
      </div>
    );
  }

  const filtered = search.trim()
    ? patients.filter(
        (p) =>
          p.fullName?.toLowerCase().trim() === search.toLowerCase().trim()
      )
    : patients;

  return (
    <div className="lrn-page">
      <div className="lrn-shell">
        <header className="lrn-header">
          <h2 className="lrn-title">Đẩy thông báo kết quả xét nghiệm (US12)</h2>
          <p className="lrn-subtitle">
            Gửi kết quả và thông báo cho bệnh nhân qua ứng dụng.
          </p>
        </header>

        <div className="lrn-card">
          <div className="lrn-layout">
            {/* LEFT */}
            <aside className="lrn-left">
              <div className="lrn-search">
                <span className="lrn-searchIcon" aria-hidden="true">
                  🔎
                </span>
                <input
                  className="lrn-searchInput"
                  placeholder="Tìm kiếm bệnh nhân"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="lrn-list">
                {loading ? (
                  <p className="lrn-muted">Đang tải…</p>
                ) : filtered.length === 0 ? (
                  <p className="lrn-muted">Không có dữ liệu.</p>
                ) : (
                  <ul className="lrn-ul">
                    {filtered.map((p) => (
                      <li
                        key={p.patientId}
                        onClick={() => selectPatient(p)}
                        className={`lrn-item ${
                          selected?.patientId === p.patientId ? "active" : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            selectPatient(p);
                        }}
                      >
                        <div className="lrn-itemMain">
                          <div className="lrn-itemTop">
                            <div className="lrn-itemName">{p.fullName}</div>
                            {/* giữ nguyên text hiện có (không đổi logic trạng thái) */}
                            <span className="lrn-badge lrn-badgeDone">
                              Hoàn tất
                            </span>
                          </div>

                          <div className="lrn-itemMeta">
                            <span className="lrn-metaLabel">ID:</span>{" "}
                            <span className="lrn-metaValue">
                              {p.patientId}
                            </span>
                          </div>
                        </div>

                        <span className="lrn-chevron" aria-hidden="true">
                          ›
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>

            {/* RIGHT */}
            <main className="lrn-right">
              {loadingDetail && <p className="lrn-muted">Đang tải kết quả…</p>}

              {!loadingDetail && !detail && (
                <div className="lrn-placeholder">
                  <p className="lrn-muted">Chọn bệnh nhân để xem chi tiết</p>
                </div>
              )}

              {!loadingDetail && detail && (
                <div className="lrn-detail">
                  <div className="lrn-detailHeader">
                    <div className="lrn-avatar" aria-hidden="true">
                      <span>👤</span>
                    </div>
                    <div className="lrn-detailInfo">
                      <h3 className="lrn-detailName">{detail.fullName}</h3>
                      <div className="lrn-detailSub">
                        <span className="lrn-metaLabel">Mã bệnh nhân:</span>{" "}
                        <span className="lrn-metaValue">
                          {selected?.patientId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lrn-panel">
                    <div className="lrn-row2">
                      <div className="lrn-field">
                        <div className="lrn-fieldLabel">Kết quả:</div>
                        <div className="lrn-fieldValue">{detail.summary}</div>
                      </div>

                      <div className="lrn-field">
                        <div className="lrn-fieldLabel">Ngày hoàn tất:</div>
                        <div className="lrn-fieldValue">
                          {new Date(detail.completedDate).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lrn-compose">
                    <div className="lrn-composeLabel">Nội dung tin nhắn</div>

                    <textarea
                      className="lrn-textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="lrn-actions">
                      <div className="lrn-successWrap">
                        {success && <div className="lrn-success">{success}</div>}
                      </div>

                      <button
                        className="lrn-sendBtn"
                        onClick={send}
                        disabled={sending}
                      >
                        {sending ? "Đang gửi…" : "Gửi thông báo"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
