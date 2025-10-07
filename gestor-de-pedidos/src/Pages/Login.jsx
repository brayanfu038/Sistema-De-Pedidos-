import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api"; // client con VITE_API_URL

export default function LoginPage() {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [message, setMessage]       = useState("");
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!customerId.trim()) return setError("Ingresa tu ID de cliente.");
    if (!password || password.length < 4) return setError("La contraseña debe tener al menos 4 caracteres.");

    try {
      setLoading(true);
      const res = await api.login(customerId, password); // { userCreated: boolean }
      if (res.userCreated) {
        localStorage.setItem("gd_session", JSON.stringify({ customerId, at: Date.now() }));
        navigate("/app");
      } else {
        setError("Credenciales inválidas.");
      }
    } catch (err) {
      setError(err.message || "Error de autenticación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
          Gestor de Pedidos
        </h1>
        <p className="text-sm text-slate-400 mb-6">Inicia sesión para continuar</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 shadow-md"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-slate-200">
                ID de cliente
              </label>
              <input
                id="customerId"
                type="text"                            // ← string explícito
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="p. ej. 1088001122"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm pr-12 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm pr-12 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {/* Botón ojo – mismo estilo */}
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    // ojo cerrado
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 0 0 1.06-1.06l-2.33-2.33A11.78 11.78 0 0 0 21.75 12S18 4.5 12 4.5a9.9 9.9 0 0 0-4.79 1.23L3.53 2.47ZM12 6c4.47 0 7.64 3.23 9.03 6-.62 1.28-1.58 2.66-2.88 3.76l-2.04-2.04c.12-.43.19-.88.19-1.35A4.5 4.5 0 0 0 9.3 8.07l-1.7-1.7A8.35 8.35 0 0 1 12 6Zm0 12c-4.47 0-7.64-3.23-9.03-6a13.3 13.3 0 0 1 2.7-3.82l2.09 2.09A4.5 4.5 0 0 0 15 12c0 .55-.1 1.07-.28 1.56l2.39 2.39A8.37 8.37 0 0 1 12 18Z" />
                    </svg>
                  ) : (
                    // ojo abierto
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 4.5C6 4.5 2.25 12 2.25 12S6 19.5 12 19.5 21.75 12 21.75 12 18 4.5 12 4.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Acciones secundarias */}
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-300">
                <input type="checkbox" className="rounded border-slate-600 bg-slate-900" />
                Recordarme
              </label>
              <a href="#" className="font-medium text-slate-300 hover:text-white">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="rounded-xl border border-red-900/40 bg-red-900/20 text-red-200 text-sm p-3">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-900/20 text-emerald-200 text-sm p-3">
                {message}
              </div>
            )}

            {/* Botón primario (mismo estilo) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-2.5 text-sm font-semibold shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : ("Ingresar")}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-300">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold hover:underline text-white">
              Crear cuenta
            </Link>
          </div>
        </form>

        <p className="mt-4 text-[11px] text-slate-400">Este formulario ya llama al servidor.</p>
      </div>
    </div>
  );
}
