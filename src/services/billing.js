const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res) {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || data || "Request failed");
    err.status = res.status; throw err;
  }
  return data;
}

export const listInvoices = async () => {
  const r = await fetch(`${BASE}/api/billing/invoices`, { headers: authHeaders() });
  return handle(r);
};

export const getInvoiceDetail = async (id) => {
  const r = await fetch(`${BASE}/api/billing/invoices/${id}`, { headers: authHeaders() });
  return handle(r);
};

export const payInvoiceMock = async (id) => {
  const r = await fetch(`${BASE}/api/billing/invoices/${id}/pay`, { method: 'POST', headers: authHeaders() });
  return handle(r);
};

// Stripe (tuỳ chọn)
export const createStripeIntent = async (id) => {
  const r = await fetch(`${BASE}/api/billing/invoices/${id}/create-intent`, { method: 'POST', headers: authHeaders() });
  return handle(r);
};