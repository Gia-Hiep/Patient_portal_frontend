import React, { useEffect, useState } from "react";
import { getMyVisits, getVisitDetail } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../assets/styles/visitHistory.css";

export default function VisitHistory() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfSrc, setPdfSrc] = useState("");
  const [showPdf, setShowPdf] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyVisits();
        setVisits(data || []);
      } catch (err) {
        console.error(err);
        if (err.status === 403) {
          setError(
            "Truy cập bị từ chối. Chỉ bệnh nhân đã đăng nhập mới xem được lịch sử khám."
          );
        } else {
          setError(err.message || "Không tải được lịch sử khám bệnh.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, []);

  const openDetail = async (visitId) => {
    try {
      setDetailLoading(true);
      setShowDetail(true);
      const data = await getVisitDetail(visitId);
      setDetail(data);
    } catch (err) {
      console.error(err);
      setDetail(null);
      alert(err.message || "Không tải được chi tiết hồ sơ khám.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetail(null);
  };

  const renderStatus = (status) => {
    const s = (status || "").toUpperCase();
    let cls = "vh-status";
    if (s === "COMPLETED") cls += " completed";
    else if (s === "IN_PROGRESS") cls += " inprogress";
    else if (s === "CANCELLED") cls += " cancelled";
    return <span className={cls}>{s || "N/A"}</span>;
  };

  // 🔹 xem PDF (gửi Authorization header)
  const viewPdf = async (url) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Không xem được PDF");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfSrc(objectUrl);
      setShowPdf(true);
    } catch (e) {
      alert(e.message);
    }
  };

  // 🔹 tải PDF (gửi Authorization header)
  const downloadPdf = async (url, filename = "document.pdf") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Không tải được PDF");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="vh-page">
      <div className="vh-shell">
        {/* Header */}
        <div className="vh-header">
          <div className="vh-titleWrap">
            <h2 className="vh-title">Lịch sử khám chữa bệnh</h2>
            <div className="vh-subtitle">
              Xem lại toàn bộ hồ sơ khám và điều trị của bạn tại bệnh viện.
            </div>
          </div>

          <button className="vh-homeBtn" onClick={() => navigate("/")}>
            Trang chủ
          </button>
        </div>

        {error && <div className="vh-alert">{error}</div>}

        {/* Toolbar */}
        <div className="vh-toolbar">
          <div className="vh-search">
            <span className="vh-searchIco" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M16.5 16.5 21 21"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="vh-card">
          {loading ? (
            <div className="vh-state">Đang tải dữ liệu...</div>
          ) : visits.length === 0 ? (
            <div className="vh-state">Bạn chưa có lịch sử khám bệnh nào.</div>
          ) : (
            <div className="vh-tableWrap">
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>Ngày khám</th>
                    <th>Khoa khám</th>
                    <th>Bác sĩ phụ trách</th>
                    <th>Chẩn đoán</th>
                    <th>Trạng thái</th>
                    <th className="vh-th-actions">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id}>
                      <td className="vh-td-date">
                        <span className="vh-dateIco" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                            <path
                              d="M7 3v3M17 3v3"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M4.5 7.5h15V20A1.5 1.5 0 0 1 18 21.5H6A1.5 1.5 0 0 1 4.5 20V7.5Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span>{v.visitDate}</span>
                      </td>

                      <td>{v.department}</td>

                      <td className="vh-td-doctor">
                        <span className="vh-avatarDot" aria-hidden="true">
                          {String(v.doctorName || "A").trim().charAt(0).toUpperCase()}
                        </span>
                        <span>{v.doctorName}</span>
                      </td>

                      <td className="vh-td-dx">{v.diagnosisShort}</td>

                      <td>{renderStatus(v.status)}</td>

                      <td className="vh-td-actions">
                        <button className="vh-detailBtn" onClick={() => openDetail(v.id)}>
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="vh-footerRow">
                <div className="vh-footerText">
                  Hiển thị <b>1</b> đến <b>{Math.min(4, visits.length)}</b> trong số{" "}
                  <b>{visits.length}</b> kết quả
                </div>

                <div className="vh-pager">
                  <button className="vh-pagerBtn" type="button" disabled aria-label="prev">
                    ‹
                  </button>
                  <button className="vh-pagerBtn" type="button" disabled aria-label="next">
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showDetail && (
        <div className="vh-modalBackdrop" onClick={closeDetail}>
          <div className="vh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vh-modalHeader">
              <h3>Chi tiết hồ sơ khám</h3>
              <button className="vh-closeBtn" onClick={closeDetail} type="button" aria-label="close">
                ×
              </button>
            </div>

            <div className="vh-modalBody">
              {detailLoading ? (
                <div className="vh-state">Đang tải chi tiết...</div>
              ) : !detail ? (
                <div className="vh-state">Không có dữ liệu.</div>
              ) : (
                <div className="vh-detail">
                  <div className="vh-kvGrid">
                    <div className="vh-kv">
                      <div className="vh-k">Ngày khám</div>
                      <div className="vh-v">{detail.visitDate}</div>
                    </div>
                    <div className="vh-kv">
                      <div className="vh-k">Khoa khám</div>
                      <div className="vh-v">{detail.department}</div>
                    </div>
                    <div className="vh-kv">
                      <div className="vh-k">Bác sĩ</div>
                      <div className="vh-v">{detail.doctorName}</div>
                    </div>
                    <div className="vh-kv">
                      <div className="vh-k">Dịch vụ</div>
                      <div className="vh-v">{detail.serviceName}</div>
                    </div>
                  </div>

                  <div className="vh-divider" />

                  <div className="vh-block">
                    <div className="vh-blockLabel">Chẩn đoán chi tiết / Lịch sử điều trị:</div>
                    <p className="vh-blockText">{detail.diagnosisDetail || "—"}</p>
                  </div>

                  <div className="vh-divider" />

                  <div className="vh-block">
                    <div className="vh-blockLabel">Kết quả PDF:</div>

                    {!detail.documents || detail.documents.length === 0 ? (
                      <p className="vh-blockText">Chưa có tài liệu PDF cho lần khám này.</p>
                    ) : (
                      <ul className="vh-docList">
                        {detail.documents.map((doc) => (
                          <li key={doc.id} className="vh-docItem">
                            <div className="vh-docMeta">
                              <div className="vh-docTitle">
                                {doc.title} ({doc.type})
                              </div>
                            </div>

                            <div className="vh-docActions">
                              <button
                                className="vh-docBtn"
                                onClick={() =>
                                  viewPdf(
                                    `${
                                      process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"
                                    }/api/documents/${doc.id}/view`
                                  )
                                }
                                type="button"
                              >
                                Xem PDF
                              </button>

                              <button
                                className="vh-docBtn"
                                onClick={() =>
                                  downloadPdf(
                                    `${
                                      process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"
                                    }/api/documents/${doc.id}/download`,
                                    `${doc.title || "document"}.pdf`
                                  )
                                }
                                type="button"
                              >
                                Tải PDF
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem PDF */}
      {showPdf && (
        <div className="vh-modalBackdrop" onClick={() => setShowPdf(false)}>
          <div className="vh-modal vh-modal--pdf" onClick={(e) => e.stopPropagation()}>
            <div className="vh-modalHeader">
              <h3>Xem tài liệu PDF</h3>
              <button
                className="vh-closeBtn"
                onClick={() => setShowPdf(false)}
                type="button"
                aria-label="close"
              >
                ×
              </button>
            </div>
            <div className="vh-modalBody vh-modalBody--pdf">
              <iframe src={pdfSrc} title="PDF" className="vh-pdfFrame" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
