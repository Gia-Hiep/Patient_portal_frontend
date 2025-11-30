import React, { useEffect, useState } from "react";
import { getMyVisits, getVisitDetail } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../assets/styles/auth.css";

export default function VisitHistory() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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
      const data = await getVisitDetail(visitId); // VisitDetailDTO
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
    let cls = "badge-status";
    if (s === "COMPLETED") cls += " completed";
    else if (s === "IN_PROGRESS") cls += " inprogress";
    else if (s === "CANCELLED") cls += " cancelled";
    return <span className={cls}>{s || "N/A"}</span>;
  };

  return (
    <div className="visit-history">
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>Lịch sử khám chữa bệnh</h2>

        <button
          className="chip-btn"
          onClick={() => navigate("/")}
          style={{ padding: "6px 14px", fontSize: "14px" }}
        >
          Trang chủ
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : visits.length === 0 ? (
        <p>Bạn chưa có lịch sử khám bệnh nào.</p>
      ) : (
        <table className="visit-table">
          <thead>
            <tr>
              <th>Ngày khám</th>
              <th>Khoa khám</th>
              <th>Bác sĩ phụ trách</th>
              <th>Chẩn đoán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <td>{v.visitDate}</td>
                <td>{v.department}</td>
                <td>{v.doctorName}</td>
                <td>{v.diagnosisShort}</td>
                <td>{renderStatus(v.status)}</td>
                <td>
                  <button onClick={() => openDetail(v.id)}>Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal chi tiết */}
      {showDetail && (
        <div className="modal-backdrop" onClick={closeDetail}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết hồ sơ khám</h3>
              <button className="close-btn" onClick={closeDetail}>
                ×
              </button>
            </div>

            {detailLoading ? (
              <p>Đang tải chi tiết...</p>
            ) : !detail ? (
              <p>Không có dữ liệu.</p>
            ) : (
              <div className="modal-body">
                <div className="detail-row">
                  <span className="label">Ngày khám:</span>
                  <span>{detail.visitDate}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khoa khám:</span>
                  <span>{detail.department}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Bác sĩ:</span>
                  <span>{detail.doctorName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Dịch vụ:</span>
                  <span>{detail.serviceName}</span>
                </div>

                <hr />

                <div className="detail-block">
                  <div className="label">
                    Chẩn đoán chi tiết / Lịch sử điều trị:
                  </div>
                  <p>{detail.diagnosisDetail || "—"}</p>
                </div>

                <hr />

                <div className="detail-block">
                  <div className="label">Kết quả PDF:</div>
                  {!detail.documents || detail.documents.length === 0 ? (
                    <p>Chưa có tài liệu PDF cho lần khám này.</p>
                  ) : (
                    <ul>
                      {detail.documents.map((doc) => (
                        <li key={doc.id}>
                          {doc.title} ({doc.docType}){" "}
                          <a
                            href={`${
                              process.env.REACT_APP_API_BASE_URL ||
                              "http://localhost:8080"
                            }/api/documents/${doc.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Xem PDF
                          </a>
                          {" | "}
                          <a
                            href={`${
                              process.env.REACT_APP_API_BASE_URL ||
                              "http://localhost:8080"
                            }/api/documents/${doc.id}/download`}
                          >
                            Tải PDF
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
