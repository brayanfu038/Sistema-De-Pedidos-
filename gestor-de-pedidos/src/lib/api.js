// src/lib/api.js
const AUTH_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_URL ?? "http://localhost:8080";

// función genérica
async function request(base, path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return { ok: true, status: 204 };

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = data?.detail || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  login: (customerid, password) =>
    request(AUTH_BASE, "/authuser", { method: "POST", body: { customerid, password } }),

  register: (customerid, password) =>
    request(AUTH_BASE, "/createuser", { method: "POST", body: { customerid, password } }),
};

export const customersApi = {
  create: (payload) =>
    request(GATEWAY_BASE, "/customer/createcustomer", { method: "POST", body: payload }),

  findById: (document) =>
    request(GATEWAY_BASE, `/customer/findcustomerbyid/${encodeURIComponent(document)}`),
};

export const ordersApi = {
  // ✅ Rutas del gateway (no tocamos StripPrefix del YML)
  create: (payload) =>
    request(GATEWAY_BASE, "/order/createorder", { method: "POST", body: payload }),

  updateStatus: (payload) =>
    request(GATEWAY_BASE, "/order/updateorderstatus", { method: "PUT", body: payload }),

  // nombre “findByCustomer”…
  findByCustomer: (customerid) =>
    request(GATEWAY_BASE, `/order/findorderbycustomerid/${encodeURIComponent(customerid)}`),

  // …y alias “listByCustomerId” para que tu página no cambie si ya lo usaste así
  listByCustomerId: (customerid) =>
    request(GATEWAY_BASE, `/order/findorderbycustomerid/${encodeURIComponent(customerid)}`),
};
