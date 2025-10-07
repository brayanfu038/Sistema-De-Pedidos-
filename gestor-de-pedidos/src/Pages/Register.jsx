import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api"; // usa el cliente que creamos (VITE_API_URL)

export default function RegisterPage() {
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [email, setEmail]               = useState("");
  const [customerId, setCustomerId]     = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd]           = useState(false);
  const [showPwd2, setShowPwd2]         = useState(false);
  const [accept, setAccept]             = useState(false);

  const [errors, setErrors]   = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pwdStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
  }, [password]);

  function validate() {
    const e = {};
    if (!firstName.trim()) e.firstName = "Ingresa tu nombre.";
    if (!lastName.trim()) e.lastName = "Ingresa tu apellido.";
    if (!email.trim()) e.email = "Ingresa tu correo.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Correo no válido.";
    if (!customerId.trim()) e.customerId = "Ingresa tu ID de cliente."; // ← texto (string)

    if (!password) e.password = "Ingresa una contraseña.";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres.";

    if (!confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
    else if (password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden.";

    if (!accept) e.accept = "Debes aceptar los términos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMessage("");
    if (!validate()) return;

    try {
      setLoading(true);
      // BACKEND: solo necesita customerid y password
      await api.register(customerId, password); // POST /createuser → 204
      setMessage("🎉 Cuenta creada. Ahora inicia sesión.");
      // Pequeño delay visual y redirigimos a Login
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      if (err.status === 409) setMessage(""); // quitamos success
      setErrors((prev) => ({
        ...prev,
        api: err.status === 409 ? "El usuario ya existe." : (err.message || "Error al registrar."),
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Crear cuenta</h1>
        <p className="text-sm text-slate-400 mb-6">Completa los datos para registrarte</p>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-200">Nombre</label>
              <input id="firstName" value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              {errors.firstName && <p className="mt-1 text-xs text-red-300">{errors.firstName}</p>}
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-200">Apellido</label>
              <input id="lastName" value={lastName} onChange={(e)=>setLastName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              {errors.lastName && <p className="mt-1 text-xs text-red-300">{errors.lastName}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">Correo</label>
              <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customerId" className="block text-sm font-medium text-slate-200">ID de cliente</label>
              <input id="customerId" type="text" value={customerId} onChange={(e)=>setCustomerId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              {errors.customerId && <p className="mt-1 text-xs text-red-300">{errors.customerId}</p>}
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">Contraseña</label>
              <div className="mt-1 relative">
                <input id="password" type={showPwd?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.5"/></svg>
                </button>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className={"h-full transition-all " + (pwdStrength<=1?"w-1/4 bg-red-500":pwdStrength===2?"w-2/4 bg-amber-500":pwdStrength===3?"w-3/4 bg-emerald-500":"w-full bg-emerald-600")} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Usa 8+ chars, mayúscula, número y símbolo.</p>
              {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">Confirmar</label>
              <div className="mt-1 relative">
                <input id="confirmPassword" type={showPwd2?"text":"password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                <button type="button" onClick={()=>setShowPwd2(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.5"/></svg>
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-300">{errors.confirmPassword}</p>}
            </div>

            <div className="sm:col-span-2 flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={accept} onChange={(e)=>setAccept(e.target.checked)} className="rounded border-slate-600 bg-slate-900" />
                Acepto los términos y condiciones
              </label>
              <a href="#" className="font-medium text-slate-300 hover:text-white">Política de privacidad</a>
            </div>

            {(Object.keys(errors).length>0 && !message) && (
              <div className="sm:col-span-2 rounded-xl border border-red-900/40 bg-red-900/20 text-red-200 text-sm p-3">
                {errors.api ? errors.api : "Revisa los campos en rojo."}
              </div>
            )}
            {message && (
              <div className="sm:col-span-2 rounded-xl border border-emerald-900/40 bg-emerald-900/20 text-emerald-200 text-sm p-3">
                {message}
              </div>
            )}

            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white py-3 text-sm font-semibold shadow-sm hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Creando cuenta…" : "Crear cuenta"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-300">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold hover:underline text-white">
              Iniciar sesión
            </Link>
          </div>
        </form>

        <p className="mt-4 text-[11px] text-slate-400">Los campos extra (nombre, apellido, correo) son locales; el backend solo recibe ID de cliente y contraseña.</p>
      </div>
    </div>
  );
}
