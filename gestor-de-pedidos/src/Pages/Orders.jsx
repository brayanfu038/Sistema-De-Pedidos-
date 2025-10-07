// src/Pages/Orders.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "../lib/api";

export default function OrdersPage({ onBack, onLogout }) {
  const navigate = useNavigate();

  // Handlers de navegación: usan props si vienen; si no, hacen la navegación local
  const handleBack = () => {
    if (typeof onBack === "function") return onBack();
    // vuelve al dashboard
    navigate("/app");
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") return onLogout();
    // limpia sesión y manda al login
    try { localStorage.removeItem("gd_session"); } catch {}
    navigate("/login", { replace: true });
  };

  const [searchId, setSearchId] = useState("");
  const [items, setItems] = useState([]); // [{customerid, orderID, status}]
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // modal crear
  const [createOpen, setCreateOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerid: "", orderID: "", status: "Received" });

  // modal actualizar
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ orderID: "", status: "In progress" });

  const filtered = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) =>
      [o.customerid, o.orderID, o.status].some((f) => String(f).toLowerCase().includes(q))
    );
  }, [items, searchId]);

  async function doSearch() {
    const id = searchId.trim();
    if (!id) {
      setErrMsg("Ingresa el customerid (document) a buscar");
      return;
    }
    try {
      setErrMsg("");
      setLoading(true);
      const list = await ordersApi.listByCustomerId(id);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setItems([]);
      setErrMsg(e.message || "Error buscando órdenes");
    } finally {
      setLoading(false);
    }
  }

  async function submitCreate(e) {
    e.preventDefault();
    const payload = {
      customerid: (newOrder.customerid || "").trim(),
      orderID: (newOrder.orderID || "").trim(),
      status: newOrder.status || "Received",
    };
    if (!payload.customerid || !payload.orderID) {
      alert("customerid y orderID son obligatorios");
      return;
    }
    try {
      setLoading(true);
      const r = await ordersApi.create(payload);
      if (r?.orderCreated) {
        alert("Orden creada");
        setCreateOpen(false);
        if (searchId.trim() && searchId.trim() === payload.customerid) {
          await doSearch();
        }
      } else {
        alert("No se pudo crear la orden");
      }
    } catch (e) {
      alert(e.message || "Error creando orden");
    } finally {
      setLoading(false);
    }
  }

  async function submitUpdate(e) {
    e.preventDefault();
    const payload = {
      orderID: (updateData.orderID || "").trim(),
      status: updateData.status,
    };
    if (!payload.orderID || !payload.status) {
      alert("orderID y status son obligatorios");
      return;
    }
    try {
      setLoading(true);
      const r = await ordersApi.updateStatus(payload);
      if (r?.orderStatusUpdated) {
        alert("Estado actualizado");
        setUpdateOpen(false);
        if (searchId.trim()) await doSearch();
      } else {
        alert("No se pudo actualizar el estado");
      }
    } catch (e) {
      alert(e.message || "Error actualizando estado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="rounded-xl px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700">
            Volver
          </button>
          <h1 className="text-lg font-semibold">Órdenes</h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="p-4 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Buscar por customerid (document)"
                className="w-full h-11 rounded-xl border border-slate-800 bg-slate-900 px-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              {!!searchId && (
                <button
                  onClick={() => setSearchId("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <button
            onClick={doSearch}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 h-11 text-sm"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            onClick={() => {
              setNewOrder({ customerid: searchId || "", orderID: "", status: "Received" });
              setCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 h-11 text-sm font-semibold"
          >
            + Nueva orden
          </button>

          <button
            onClick={() => {
              setUpdateData({ orderID: "", status: "In progress" });
              setUpdateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 h-11 text-sm"
          >
            Cambiar estado
          </button>
        </div>

        {errMsg && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
            {errMsg}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-300">
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4">customerid</th>
                <th className="py-3 px-4">orderID</th>
                <th className="py-3 px-4">status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={`${it.orderID}-${idx}`} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-mono text-slate-200">{it.customerid}</td>
                  <td className="py-3 px-4">{it.orderID}</td>
                  <td className="py-3 px-4">{it.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Crear */}
      {createOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCreateOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Nueva orden</h2>
            <form onSubmit={submitCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">customerid (document)</label>
                <input
                  value={newOrder.customerid}
                  onChange={(e) => setNewOrder((s) => ({ ...s, customerid: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">orderID</label>
                <input
                  value={newOrder.orderID}
                  onChange={(e) => setNewOrder((s) => ({ ...s, orderID: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">status</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder((s) => ({ ...s, status: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
                >
                  <option>Received</option>
                  <option>In progress</option>
                  <option>Sended</option>
                </select>
              </div>
              <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl px-4 h-11 bg-slate-800 hover:bg-slate-700">Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-xl px-4 h-11 bg-indigo-600 hover:bg-indigo-500">
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update status */}
      {updateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setUpdateOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Cambiar estado</h2>
            <form onSubmit={submitUpdate} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm mb-1">orderID</label>
                <input
                  value={updateData.orderID}
                  onChange={(e) => setUpdateData((s) => ({ ...s, orderID: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData((s) => ({ ...s, status: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
                >
                  <option>Received</option>
                  <option>In progress</option>
                  <option>Sended</option>
                </select>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setUpdateOpen(false)} className="rounded-xl px-4 h-11 bg-slate-800 hover:bg-slate-700">Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-xl px-4 h-11 bg-indigo-600 hover:bg-indigo-500">
                  {loading ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
