import React, { useEffect, useState } from "react";
import { listInvoices, getInvoiceDetail } from "../services/billing";
import { createPaymentIntent, confirmPayment } from "../services/payment";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../assets/styles/billing.css";

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
    <div className="bill-checkout">
      <div className="bill-payCard">
        <div className="bill-payHead">Thanh toán</div>
        <div className="payment-container bill-paymentElement">
          <PaymentElement />
        </div>
      </div>

      <button
        className="bill-btn bill-btn-primary"
        style={{ marginTop: 12 }}
        onClick={handleConfirm}
        disabled={submitting}
        type="button"
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
  const navigate = useNavigate();
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

  /* ---------- Xem/Tải PDF ---------- */
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

  const renderStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    const cls =
      s === "PAID"
        ? "bill-badge bill-badge-paid"
        : s === "UNPAID"
          ? "bill-badge bill-badge-unpaid"
          : "bill-badge bill-badge-other";
    return <span className={cls}>{status}</span>;
  };

  return (
    <div className="bill-page">
      <div className="bill-shell">
        {/* Breadcrumb (UI only) */}
        <div className="bill-breadcrumb">
          <span className="bill-crumbHome" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M10 21v-7h4v7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Trang chủ</span>
          <span className="bill-crumbSep">/</span>
          <span>Hóa đơn viện phí</span>
        </div>

        {/* Title row */}
        <div className="bill-titleRow">
          <div>
            <h2 className="bill-title">Hóa đơn viện phí</h2>
            <div className="bill-subtitle">
              Xem lịch sử thanh toán và chi tiết các khoản viện phí của bạn.
            </div>
          </div>

          <button
            className="bill-btn bill-btn-ghost"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            ← Quay lại Dashboard
          </button>
        </div>


        {error && <div className="bill-alert bill-alert-error">{error}</div>}

        {/* Table card */}
        <div className="bill-card">
          {loading ? (
            <div className="bill-state">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="bill-state">Hiện tại bạn chưa phát sinh viện phí.</div>
          ) : (
            <div className="bill-tableWrap">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th className="bill-th-icon" />
                    <th>Mã hóa đơn</th>
                    <th>Ngày lập</th>
                    <th className="bill-th-right">Tổng cộng</th>
                    <th>Trạng thái</th>
                    <th className="bill-th-actions">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="bill-td-icon">
                        <span className="bill-docIco" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                            <path
                              d="M7 3.5h7l3 3V20A1.5 1.5 0 0 1 15.5 21.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 3.5V7h3"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.5 10.5h7M8.5 13.5h7M8.5 16.5h5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </td>

                      <td className="bill-mono bill-invNo">{r.invoiceNo}</td>
                      <td>{r.issueDate}</td>

                      <td className="bill-th-right bill-amount">
                        {Number(r.totalAmount).toLocaleString("vi-VN")} ₫
                      </td>

                      <td>{renderStatusBadge(r.status)}</td>

                      <td className="bill-td-actions">
                        <button
                          className="bill-linkBtn"
                          onClick={() => openDetail(r.id)}
                          type="button"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination (UI only) */}
              <div className="bill-tableFooter">
                <div className="bill-footerText">
                  Hiển thị <b>1</b> đến <b>{Math.min(5, rows.length)}</b> trong tổng số{" "}
                  <b>{rows.length}</b> hóa đơn
                </div>

                <div className="bill-pager">
                  <button className="bill-pagerBtn" disabled type="button" aria-label="prev">
                    ‹
                  </button>
                  <button className="bill-pagerNum bill-pagerNum--active" disabled type="button">
                    1
                  </button>
                  <button className="bill-pagerNum" disabled type="button">
                    2
                  </button>
                  <button className="bill-pagerNum" disabled type="button">
                    3
                  </button>
                  <span className="bill-pagerDots">…</span>
                  <button className="bill-pagerNum" disabled type="button">
                    5
                  </button>
                  <button className="bill-pagerBtn" disabled type="button" aria-label="next">
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết hóa đơn */}
      {detail && (
        <div
          className="bill-modalBackdrop"
          onClick={() => {
            setDetail(null);
            setClientSecret("");
          }}
        >
          <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bill-modalHeader">
              <div className="bill-modalTitle">
                <h3 className="bill-modalH3">Hóa đơn {detail.invoiceNo}</h3>
                <div className="bill-modalMeta">
                  <span className="bill-metaItem">
                    <span className="bill-metaLabel">Ngày lập:</span> {detail.issueDate}
                  </span>
                  <span className="bill-metaSep" aria-hidden="true">
                    •
                  </span>
                  <span className="bill-metaItem">{renderStatusBadge(detail.status)}</span>
                </div>
              </div>

              <button
                className="bill-closeBtn"
                onClick={() => {
                  setDetail(null);
                  setClientSecret("");
                }}
                type="button"
                aria-label="close"
              >
                ×
              </button>
            </div>

            <div className="bill-modalBody">
              <div className="bill-itemsCard">
                <div className="bill-itemsHead">Danh sách dịch vụ</div>

                <div className="bill-tableWrap bill-tableWrap--inner">
                  <table className="bill-table bill-table--inner">
                    <thead>
                      <tr>
                        <th>Mã DV</th>
                        <th>Dịch vụ</th>
                        <th className="bill-th-right">SL</th>
                        <th className="bill-th-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="bill-mono">{it.code}</td>
                          <td>{it.name}</td>
                          <td className="bill-th-right">{it.qty}</td>
                          <td className="bill-th-right">
                            {Number(it.price).toLocaleString("vi-VN")} ₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bill-totalRow">
                  <span className="bill-totalLabel">Tổng cộng:&nbsp;</span>
                  <span className="bill-totalValue">
                    {Number(detail.totalAmount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <div className="bill-actions">
                {detail.status === "PAID" ? (
                  detail.documentId ? (
                    <>
                      <button
                        className="bill-btn bill-btn-ghost"
                        onClick={() => viewPdf(detail.documentId)}
                        type="button"
                      >
                        Xem hóa đơn PDF
                      </button>
                      <button
                        className="bill-btn bill-btn-ghost"
                        onClick={() =>
                          downloadPdf(
                            detail.documentId,
                            `${detail.invoiceNo || "invoice"}.pdf`
                          )
                        }
                        type="button"
                      >
                        Tải hóa đơn
                      </button>
                    </>
                  ) : (
                    <span className="bill-muted">Chưa có file PDF cho hóa đơn này.</span>
                  )
                ) : null}

                {detail.status !== "PAID" && !clientSecret && (
                  <button
                    className="bill-btn bill-btn-primary"
                    disabled={startingPay}
                    onClick={() => startPay(detail.id)}
                    type="button"
                  >
                    {startingPay ? "Đang khởi tạo…" : "Thanh toán viện phí"}
                  </button>
                )}
              </div>

              {clientSecret && stripePromise && (
                <div className="bill-paySection">
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
                <div className="bill-alert bill-alert-error" style={{ marginTop: 12 }}>
                  Thiếu REACT_APP_STRIPE_PUBLISHABLE_KEY – không thể hiển thị form thanh toán.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem PDF*/}
      {showPdf && (
        <div className="bill-modalBackdrop" onClick={() => setShowPdf(false)}>
          <div className="bill-modal bill-modal--pdf" onClick={(e) => e.stopPropagation()}>
            <div className="bill-modalHeader">
              <h3 className="bill-modalH3">Xem hóa đơn PDF</h3>
              <button
                className="bill-closeBtn"
                onClick={() => setShowPdf(false)}
                type="button"
                aria-label="close"
              >
                ×
              </button>
            </div>
            <div className="bill-modalBody bill-modalBody--pdf">
              <iframe src={pdfSrc} title="PDF" className="bill-pdfFrame" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
