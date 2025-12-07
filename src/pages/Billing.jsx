import React, { useEffect, useState } from "react";
import { listInvoices, getInvoiceDetail } from "../services/billing";
import { createPaymentIntent, confirmPayment } from "../services/payment";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../assets/styles/auth.css";

const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

/* ---------- Stripe checkout ---------- */
function Checkout({ clientSecret, invoiceId, onCompleted }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    try {
      setSubmitting(true);
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        alert(error.message || "Thanh toán thất bại.");
        return;
      }
      const pi =
        paymentIntent ??
        (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;
      const res = await confirmPayment(invoiceId, pi.id);
      alert(
        res.message ||
          (res.outcome === "SUCCESS"
            ? "Thanh toán thành công"
            : "Thanh toán thất bại")
      );
      onCompleted?.();
    } catch (e) {
      alert(e.message || "Thanh toán thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div className="payment-container">
        <PaymentElement />
      </div>
      <button
        className="chip-btn"
        style={{ marginTop: 12 }}
        onClick={handleConfirm}
        disabled={submitting}
      >
        {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
}

/* ========== Billing page ========== */
export default function Billing() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [startingPay, setStartingPay] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const [pdfSrc, setPdfSrc] = useState("");
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setRows(await listInvoices());
      } catch (e) {
        setError(e.message || "Không tải được hóa đơn");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = async (id) => {
    try {
      setDetail(await getInvoiceDetail(id));
      setClientSecret("");
    } catch (e) {
      alert(e.message);
    }
  };

  const startPay = async (id) => {
    try {
      setStartingPay(true);
      const res = await createPaymentIntent(id);
      if (res.outcome === "ALREADY_PAID") {
        alert("Hóa đơn đã thanh toán");
        setDetail(await getInvoiceDetail(id));
        setRows(await listInvoices());
        return;
      }
      if (res.outcome !== "REQUIRES_CONFIRMATION" || !res.message) {
        alert(res.message || "Không khởi tạo được thanh toán");
        return;
      }
      setClientSecret(res.message);
    } catch (e) {
      alert(e.message || "Không khởi tạo được thanh toán.");
    } finally {
      setStartingPay(false);
    }
  };

  const refreshAfterPaid = async () => {
    if (detail) {
      const id = detail.id;
      setClientSecret("");
      setDetail(await getInvoiceDetail(id));
    }
    setRows(await listInvoices());
  };

  /* ---------- Xem/Tải PDF giống VisitHistory ---------- */
  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const viewPdf = async (docId) => {
    try {
      const res = await fetch(`${BASE}/api/documents/${docId}/view`, {
        headers: authHeader(),
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

  const downloadPdf = async (docId, filename = "invoice.pdf") => {
    try {
      const res = await fetch(`${BASE}/api/documents/${docId}/download`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Không tải được PDF");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      // cố gắng lấy tên file từ header nếu đã expose
      const cd = res.headers.get("content-disposition") || "";
      const m = cd.match(/filename\*?=(?:UTF-8''|")(.*?)(?:\"|$)/i);
      a.download = m && m[1] ? decodeURIComponent(m[1]) : filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 1000 }}>
      <h2 style={{ marginTop: 0 }}>Hóa đơn viện phí</h2>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div>Đang tải…</div>
      ) : rows.length === 0 ? (
        <div>Hiện tại bạn chưa phát sinh viện phí.</div>
      ) : (
        <div className="table-wrap">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Ngày lập</th>
                <th style={{ textAlign: "right" }}>Tổng cộng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.invoiceNo}</td>
                  <td>{r.issueDate}</td>
                  <td style={{ textAlign: "right" }}>
                    {Number(r.totalAmount).toLocaleString("vi-VN")} ₫
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        r.status === "PAID"
                          ? "completed"
                          : r.status === "UNPAID"
                          ? "inprogress"
                          : "cancelled"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="chip-btn"
                      onClick={() => openDetail(r.id)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết hóa đơn */}
      {detail && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setDetail(null);
            setClientSecret("");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hóa đơn {detail.invoiceNo}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setDetail(null);
                  setClientSecret("");
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Ngày lập:</span>
                <span>{detail.issueDate}</span>
              </div>

              <div className="table-wrap" style={{ marginTop: 10 }}>
                <table className="visit-table">
                  <thead>
                    <tr>
                      <th>Mã DV</th>
                      <th>Dịch vụ</th>
                      <th style={{ textAlign: "right" }}>SL</th>
                      <th style={{ textAlign: "right" }}>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.code}</td>
                        <td>{it.name}</td>
                        <td style={{ textAlign: "right" }}>{it.qty}</td>
                        <td style={{ textAlign: "right" }}>
                          {Number(it.price).toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="detail-row"
                style={{ justifyContent: "flex-end", fontWeight: 600 }}
              >
                <span className="label">Tổng cộng:&nbsp;</span>
                <span>
                  {Number(detail.totalAmount).toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {detail.documentId ? (
                  <>
                    <button
                      className="chip-btn"
                      onClick={() => viewPdf(detail.documentId)}
                    >
                      Xem hóa đơn PDF
                    </button>
                    <button
                      className="chip-btn"
                      onClick={() =>
                        downloadPdf(
                          detail.documentId,
                          `${detail.invoiceNo || "invoice"}.pdf`
                        )
                      }
                    >
                      Tải hóa đơn
                    </button>
                  </>
                ) : (
                  <span className="muted">
                    Chưa có file PDF cho hóa đơn này.
                  </span>
                )}

                {detail.status !== "PAID" && !clientSecret && (
                  <button
                    className="chip-btn"
                    disabled={startingPay}
                    onClick={() => startPay(detail.id)}
                  >
                    {startingPay ? "Đang khởi tạo…" : "Thanh toán viện phí"}
                  </button>
                )}
              </div>

              {clientSecret && stripePromise && (
                <div style={{ marginTop: 16 }}>
                  <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <Checkout
                      clientSecret={clientSecret}
                      invoiceId={detail.id}
                      onCompleted={refreshAfterPaid}
                    />
                  </Elements>
                </div>
              )}
              {clientSecret && !stripePromise && (
                <div className="alert error" style={{ marginTop: 12 }}>
                  Thiếu REACT_APP_STRIPE_PUBLISHABLE_KEY – không thể hiển thị
                  form thanh toán.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem PDF*/}
      {showPdf && (
        <div className="modal-backdrop" onClick={() => setShowPdf(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem hóa đơn PDF</h3>
              <button className="close-btn" onClick={() => setShowPdf(false)}>
                ×
              </button>
            </div>
            <iframe src={pdfSrc} title="PDF" className="pdf-frame" />
          </div>
        </div>
      )}
    </div>
  );
}
