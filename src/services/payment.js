const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const authHeaders = () => {
  const t = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};
const handle = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.message || data || "Request failed");
  return data;
};

export async function createPaymentIntent(invoiceId) {
  const r = await fetch(`${BASE}/api/payment/pay`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ invoiceId })
  });
  return handle(r); // { outcome:'REQUIRES_CONFIRMATION', message:<clientSecret> }
}
export async function confirmPayment(invoiceId, paymentIntentId) {
  const r = await fetch(`${BASE}/api/payment/confirm`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ invoiceId, paymentIntentId })
  });
  return handle(r); // { outcome:'SUCCESS'|'FAIL', newStatus:'PAID'|... }
}
