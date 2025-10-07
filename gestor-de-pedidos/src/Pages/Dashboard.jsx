import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const go = (where) => {
    if (where === "clients") return navigate("/clients");
    if (where === "orders") return navigate("/orders"); // crea la ruta cuando la tengas
    return navigate("/app");
  };

  const onLogout = () => {
    localStorage.removeItem("gd_session");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <h1 className="text-lg font-semibold">Gestor de Pedidos</h1>
        <button
          onClick={onLogout}
          className="rounded-xl px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block border-r border-slate-800 min-h-[calc(100dvh-4rem)] p-4">
          <nav className="space-y-2 text-sm">
            <button
              onClick={() => go("home")}
              className="block w-full text-left rounded-lg px-3 py-2 bg-slate-800/60"
            >
              Resumen
            </button>
            <button
              onClick={() => go("clients")}
              className="block w-full text-left rounded-lg px-3 py-2 hover:bg-slate-800/60"
            >
              Clientes
            </button>
            <button
              onClick={() => go("orders")}
              className="block w-full text-left rounded-lg px-3 py-2 hover:bg-slate-800/60"
            >
              Pedidos
            </button>
          </nav>
        </aside>

        <main className="p-4 sm:p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Resumen</h2>
            <p className="text-slate-400 text-sm">
              Maqueta UI-only. Aquí irán métricas, tablas, etc.
            </p>
          </section>

          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {["Pedidos hoy", "Clientes activos", "Ingresos", "Pendientes", "Entregas", "Productos"].map((t) => (
              <div key={t} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs text-slate-400">{t}</div>
                <div className="mt-2 text-2xl font-bold">—</div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-sm font-semibold mb-2">Últimos pedidos</div>
            <div className="text-slate-400 text-sm">Tabla mock aquí (UI-only)</div>
          </section>
        </main>
      </div>
    </div>
  );
}