// src/Pages/Clients.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customersApi } from "../lib/api";

const LS_KEY = "gd_clients_last_results";

export default function ClientsPage({ onBack, onLogout }) {
  const navigate = useNavigate();

  // Callbacks de respaldo si no vienen por props
  const goBack =
    onBack ??
    (() => {
      navigate(-1);
    });

  const doLogout =
    onLogout ??
    (() => {
      localStorage.removeItem("gd_session");
      navigate("/login", { replace: true });
    });

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.customerId, it.firstName, it.lastName, it.email, it.phone, it.address]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [items, searchId]);

  function openNew() {
    setEditing({
      id: null,
      customerId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    });
    setModalOpen(true);
  }

  async function onSearch() {
    const doc = searchId.trim();
    if (!doc) {
      setErrMsg("Ingresa un ID (document) para buscar");
      return;
    }
    try {
      setErrMsg("");
      setLoading(true);
      const data = await customersApi.findById(doc);
      const uiItem = {
        id: crypto.randomUUID(),
        customerId: data.document,
        firstName: data.firstname,
        lastName: data.lastname,
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
      };
      setItems([uiItem]);
      localStorage.setItem(LS_KEY, JSON.stringify([uiItem]));
    } catch (e) {
      setItems([]);
      localStorage.setItem(LS_KEY, JSON.stringify([]));
      setErrMsg(e.message || "No se encontró el cliente");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!editing) return;

    const payload = {
      document: (editing.customerId || "").trim(),
      firstname: (editing.firstName || "").trim(),
      lastname: (editing.lastName || "").trim(),
      address: (editing.address || "").trim(),
      phone: (editing.phone || "").trim(),
      email: (editing.email || "").trim(),
    };

    if (!payload.document) return alert("ID de cliente (document) es obligatorio");
    if (!payload.firstname || !payload.lastname)
      return alert("Nombre y apellido son obligatorios");
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      return alert("Correo no válido");

    try {
      setLoading(true);
      const res = await customersApi.create(payload);
      if (res?.createCustomerValid) {
        alert("Cliente creado correctamente");
        const uiItem = {
          id: crypto.randomUUID(),
          customerId: payload.document,
          firstName: payload.firstname,
          lastName: payload.lastname,
          address: payload.address,
          phone: payload.phone,
          email: payload.email,
        };
        setItems([uiItem]);
        localStorage.setItem(LS_KEY, JSON.stringify([uiItem]));
        setModalOpen(false);
        setEditing(null);
      } else {
        alert("No se pudo crear el cliente (posible duplicado).");
      }
    } catch (e) {
      alert(e.message || "Error creando cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="rounded-xl px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700"
          >
            Volver
          </button>
          <h1 className="text-lg font-semibold">Clientes</h1>
        </div>
        <button
          onClick={doLogout}
          className="rounded-xl px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Contenido */}
      <main className="p-4 sm:p-8 space-y-4">
        {/* Acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Buscar por ID (document) o texto"
                className="w-full h-11 rounded-xl border border-slate-800 bg-slate-900 px-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              {searchId && (
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
            onClick={onSearch}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 h-11 text-sm"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 h-11 text-sm font-semibold"
          >
            + Nuevo cliente
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
                <th className="py-3 px-4">ID Cliente</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-mono text-slate-200">{it.customerId}</td>
                  <td className="py-3 px-4">
                    {it.firstName} {it.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{it.email || "—"}</td>
                  <td className="py-3 px-4 text-slate-300">{it.phone || "—"}</td>
                  <td className="py-3 px-4 text-slate-300">{it.address || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal creación */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editing?.id ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  value={editing?.firstName || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, firstName: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  value={editing?.lastName || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, lastName: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Correo</label>
                <input
                  type="email"
                  value={editing?.email || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, email: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">ID Cliente (document)</label>
                <input
                  value={editing?.customerId || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, customerId: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Teléfono</label>
                <input
                  value={editing?.phone || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Dirección</label>
                <input
                  value={editing?.address || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, address: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 h-11 bg-slate-800 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl px-4 h-11 bg-indigo-600 hover:bg-indigo-500"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
