import { useState } from "react"

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Provider = "microsoft" | "google"

interface CuentaConectada {
  id: string
  provider: Provider
  email: string
  nombre: string
  conectadoEn: string
  activa: boolean
  mensajesHoy: number
  pqrsGeneradas: number
  ultimaSync: string
}

interface EmailPreview {
  id: string
  cuentaId: string
  de: string
  asunto: string
  extracto: string
  fecha: string
  leido: boolean
  convertido: boolean
  radicadoId?: string
  tipo?: "Petición" | "Queja" | "Reclamo" | "Sugerencia"
}

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const mockCuentas: CuentaConectada[] = [
  {
    id: "c1",
    provider: "microsoft",
    email: "pqrs@pqrslab.com",
    nombre: "Buzón PQRS Principal",
    conectadoEn: "2026-07-01",
    activa: true,
    mensajesHoy: 4,
    pqrsGeneradas: 38,
    ultimaSync: "Hace 3 min",
  },
  {
    id: "c2",
    provider: "google",
    email: "atencion@pqrslab.co",
    nombre: "Atención Ciudadana",
    conectadoEn: "2026-07-15",
    activa: true,
    mensajesHoy: 2,
    pqrsGeneradas: 19,
    ultimaSync: "Hace 11 min",
  },
]

const mockEmails: EmailPreview[] = [
  { id: "e1", cuentaId: "c1", de: "juan.garcia@gmail.com",        asunto: "Problema con mi factura de agosto",                 extracto: "Buenos días, me comunico para informar que mi factura del mes de agosto presenta un cobro que no reconozco...", fecha: "2026-08-03 09:14", leido: false, convertido: true,  radicadoId: "PQR-2026-000012", tipo: "Reclamo" },
  { id: "e2", cuentaId: "c1", de: "maria.lopez@hotmail.com",      asunto: "Solicitud de certificado de residencia",            extracto: "Por medio del presente correo solicito muy comedidamente me sea expedido el certificado de residencia...",       fecha: "2026-08-03 08:47", leido: false, convertido: true,  radicadoId: "PQR-2026-000011", tipo: "Petición" },
  { id: "e3", cuentaId: "c2", de: "pedro.ramirez@yahoo.com",      asunto: "Queja por mala atención en sucursal norte",         extracto: "El pasado martes 29 de julio visité la sucursal norte y fui atendido de manera descortés por el funcionario...", fecha: "2026-08-03 08:22", leido: true,  convertido: false },
  { id: "e4", cuentaId: "c1", de: "ana.sofia@empresa.com",        asunto: "Sugerencia mejora plataforma digital",              extracto: "Estimados, quisiera proponer la implementación de un módulo de seguimiento en tiempo real para las PQRS...",    fecha: "2026-08-02 17:55", leido: true,  convertido: true,  radicadoId: "PQR-2026-000010", tipo: "Sugerencia" },
  { id: "e5", cuentaId: "c2", de: "carlos.morales@gmail.com",     asunto: "RE: Respuesta radicado PQR-2026-000005",            extracto: "Gracias por la respuesta. Sin embargo considero que el tiempo de atención no fue el adecuado y quisiera...",    fecha: "2026-08-02 16:30", leido: true,  convertido: false },
  { id: "e6", cuentaId: "c1", de: "lucia.fernandez@outlook.com",  asunto: "Cobro no reconocido tarjeta débito",               extracto: "Me aparece un descuento en mi extracto bancario que no reconozco y al llamar a la línea de atención...",        fecha: "2026-08-02 14:10", leido: true,  convertido: true,  radicadoId: "PQR-2026-000009", tipo: "Queja" },
  { id: "e7", cuentaId: "c2", de: "roberto.silva@gmail.com",      asunto: "Solicitud información licencia construcción",       extracto: "Necesito conocer los requisitos y el proceso para tramitar una licencia de construcción en el municipio...",     fecha: "2026-08-02 11:05", leido: true,  convertido: false },
]

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" className="w-5 h-5" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function ProviderBadge({ provider }: { provider: Provider }) {
  return provider === "microsoft"
    ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5"><MicrosoftLogo />Microsoft 365</span>
    : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5"><GoogleLogo />Google Workspace</span>
}

const tipoBadge: Record<string, { bg: string; text: string }> = {
  Petición:   { bg: "#dbeafe", text: "#1d4ed8" },
  Queja:      { bg: "#fee2e2", text: "#dc2626" },
  Reclamo:    { bg: "#ffedd5", text: "#ea580c" },
  Sugerencia: { bg: "#d1fae5", text: "#059669" },
}

function initials(email: string) {
  const [local] = email.split("@")
  return local.split(".").slice(0, 2).map(p => p[0]?.toUpperCase()).join("")
}

const avatarPalette = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2"]
function avatarColor(s: string) {
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % avatarPalette.length
  return avatarPalette[h]
}

/* ─────────────────────────────────────────────
   Modal — connect account
───────────────────────────────────────────── */
function ConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: (p: Provider, email: string, name: string) => void }) {
  const [step, setStep] = useState<"pick" | "form">("pick")
  const [provider, setProvider] = useState<Provider>("microsoft")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const handleConnect = () => {
    if (!email.trim() || !name.trim()) return
    onConnect(provider, email, name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Conectar buzón de correo</h3>
              <p className="text-xs text-slate-400">Las PQRS recibidas por email se radican automáticamente</p>
            </div>
            <button onClick={onClose} className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {step === "pick" && (
            <>
              <p className="text-xs text-slate-500">Selecciona el proveedor de correo que deseas integrar:</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { p: "microsoft" as Provider, label: "Microsoft 365", sub: "Outlook / Exchange", logo: <MicrosoftLogo /> },
                  { p: "google"    as Provider, label: "Google Workspace", sub: "Gmail / G Suite",  logo: <GoogleLogo /> },
                ]).map(opt => (
                  <button key={opt.p} onClick={() => setProvider(opt.p)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: provider === opt.p ? "#1E3A8A" : "#e2e8f0",
                      background:  provider === opt.p ? "#eff3ff" : "#f8fafc",
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      {opt.logo}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                    </div>
                    {provider === opt.p && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#1E3A8A" }}>
                        <svg viewBox="0 0 12 12" fill="white" className="w-2.5 h-2.5"><path fillRule="evenodd" d="M10.04 3.47a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L5 7.44l3.97-3.97a.75.75 0 011.07 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* OAuth hint */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex gap-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs text-slate-500 leading-relaxed">
                  La conexión usa <strong>OAuth 2.0</strong>. No almacenamos tu contraseña. Podrás revocar el acceso en cualquier momento desde tu cuenta {provider === "microsoft" ? "Microsoft" : "Google"}.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">Cancelar</button>
                <button onClick={() => setStep("form")}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer active:scale-95"
                  style={{ background: "#1E3A8A" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
                >Continuar →</button>
              </div>
            </>
          )}

          {step === "form" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setStep("pick")} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">← Atrás</button>
                <ProviderBadge provider={provider} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Dirección de correo <span className="text-red-400">*</span></label>
                  <input autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={provider === "microsoft" ? "buzón@empresa.com" : "buzón@gmail.com"}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre del buzón <span className="text-red-400">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Ej: Buzón PQRS Principal"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">Cancelar</button>
                <button onClick={handleConnect} disabled={!email.trim() || !name.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-40 flex items-center gap-2"
                  style={{ background: provider === "google" ? "#EA4335" : "#1E3A8A" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <span>{provider === "microsoft" ? <MicrosoftLogo /> : <GoogleLogo />}</span>
                  Autorizar con {provider === "microsoft" ? "Microsoft" : "Google"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function BuzonCorreos() {
  const [cuentas, setCuentas] = useState<CuentaConectada[]>(mockCuentas)
  const [emails, setEmails] = useState<EmailPreview[]>(mockEmails)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [filterCuenta, setFilterCuenta] = useState<string>("todas")
  const [filterLeido, setFilterLeido] = useState<"todos" | "nuevos" | "convertidos">("todos")
  const [hovEmail, setHovEmail] = useState<string | null>(null)
  const [hovCuenta, setHovCuenta] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleConnect = (provider: Provider, email: string, name: string) => {
    const nueva: CuentaConectada = {
      id: String(Date.now()), provider, email, nombre: name,
      conectadoEn: "2026-08-03", activa: true,
      mensajesHoy: 0, pqrsGeneradas: 0, ultimaSync: "Justo ahora",
    }
    setCuentas(prev => [...prev, nueva])
    setShowConnectModal(false)
  }

  const handleSync = (id: string) => {
    setSyncing(id)
    setTimeout(() => setSyncing(null), 1800)
  }

  const handleConvertir = (emailId: string) => {
    const e = emails.find(x => x.id === emailId)
    if (!e) return
    const num = String(Math.floor(Math.random() * 900) + 100).padStart(6, "0")
    const radicadoId = `PQR-2026-${num}`
    const tipos: EmailPreview["tipo"][] = ["Petición", "Queja", "Reclamo", "Sugerencia"]
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]
    setEmails(prev => prev.map(x => x.id === emailId ? { ...x, convertido: true, leido: true, radicadoId, tipo } : x))
  }

  const filteredEmails = emails.filter(e => {
    if (filterCuenta !== "todas" && e.cuentaId !== filterCuenta) return false
    if (filterLeido === "nuevos" && e.leido) return false
    if (filterLeido === "convertidos" && !e.convertido) return false
    return true
  })

  const totalNuevos = emails.filter(e => !e.leido).length
  const totalConvertidos = emails.filter(e => e.convertido).length

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
            Buzón de Correos
            {totalNuevos > 0 && (
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white" style={{ background: "#0EA5E9" }}>
                {totalNuevos} nuevos
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Conecta bandejas de Microsoft o Google para radicar PQRS automáticamente desde el correo.
          </p>
        </div>
        <button onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          Conectar buzón
        </button>
      </div>

      {/* ── Cuentas conectadas ── */}
      {cuentas.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">Sin buzones conectados</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Conecta una cuenta de Microsoft 365 o Google Workspace para recibir PQRS por correo electrónico.</p>
          </div>
          <button onClick={() => setShowConnectModal(true)}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer transition-all active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >Conectar primer buzón</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuentas.map(cuenta => {
            const isHov = hovCuenta === cuenta.id
            const isSyncing = syncing === cuenta.id
            return (
              <div key={cuenta.id}
                onMouseEnter={() => setHovCuenta(cuenta.id)}
                onMouseLeave={() => setHovCuenta(null)}
                className="bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-150"
                style={{ boxShadow: isHov ? "0 4px 20px rgba(30,58,138,0.08)" : "0 1px 4px rgba(0,0,0,0.03)" }}
              >
                {/* Card header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                    {cuenta.provider === "microsoft" ? <MicrosoftLogo /> : <GoogleLogo />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{cuenta.nombre}</p>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Activa
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{cuenta.email}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button title="Sincronizar ahora" onClick={() => handleSync(cuenta.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-[#e0f2fe] hover:text-[#0EA5E9] transition-all cursor-pointer">
                      <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}>
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                    </button>
                    <button title="Desconectar" onClick={() => setCuentas(prev => prev.filter(c => c.id !== cuenta.id))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Hoy",      value: cuenta.mensajesHoy,   color: "#0EA5E9" },
                    { label: "PQRS gen.", value: cuenta.pqrsGeneradas, color: "#1E3A8A" },
                    { label: "Sync",     value: cuenta.ultimaSync,    color: "#059669", isText: true },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-sm font-bold" style={{ color: s.color }}>
                        {s.isText ? <span className="text-[10px]">{s.value}</span> : s.value}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Provider + date */}
                <div className="flex items-center justify-between">
                  <ProviderBadge provider={cuenta.provider} />
                  <span className="text-[10px] text-slate-400 font-mono">Desde {cuenta.conectadoEn}</span>
                </div>
              </div>
            )
          })}

          {/* Add card */}
          <button onClick={() => setShowConnectModal(true)}
            className="rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-[#1E3A8A]/30 hover:text-[#1E3A8A] hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[160px]">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 group-hover:border-[#1E3A8A]/40 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Agregar buzón</p>
              <p className="text-xs text-slate-300 mt-0.5">Microsoft o Google</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Bandeja de entrada ── */}
      {cuentas.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Bandeja de entrada</h3>
            <div className="flex items-center gap-2">
              {/* Cuenta filter */}
              <select value={filterCuenta} onChange={e => setFilterCuenta(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] cursor-pointer transition-all">
                <option value="todas">Todos los buzones</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              {/* Estado filter */}
              {([["todos","Todos"],["nuevos","Nuevos"],["convertidos","Convertidos"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFilterLeido(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    filterLeido === val
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-3">
            {[
              { label: `${emails.length} mensajes`, color: "#64748B", bg: "#f1f5f9" },
              { label: `${totalNuevos} sin leer`,   color: "#0EA5E9", bg: "#e0f2fe" },
              { label: `${totalConvertidos} radicados`, color: "#059669", bg: "#d1fae5" },
            ].map(s => (
              <span key={s.label} className="text-[11px] font-semibold rounded-lg px-2.5 py-1" style={{ color: s.color, background: s.bg }}>
                {s.label}
              </span>
            ))}
          </div>

          {/* Email list */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-50">
            {filteredEmails.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">No hay mensajes con este filtro</p>
              </div>
            )}
            {filteredEmails.map(email => {
              const isHov = hovEmail === email.id
              const cuenta = cuentas.find(c => c.id === email.cuentaId)
              return (
                <div key={email.id}
                  onMouseEnter={() => setHovEmail(email.id)}
                  onMouseLeave={() => setHovEmail(null)}
                  className="flex items-start gap-4 px-5 py-4 transition-colors duration-100 cursor-default"
                  style={{ background: isHov ? "#f8fafc" : !email.leido ? "#fafcff" : "#fff" }}
                >
                  {/* Unread indicator */}
                  <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${!email.leido ? "bg-[#0EA5E9]" : "bg-transparent"}`} />
                    {cuenta && (
                      <div className="w-5 h-5 rounded flex items-center justify-center">
                        {cuenta.provider === "microsoft" ? <MicrosoftLogo /> : <GoogleLogo />}
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: avatarColor(email.de) }}>
                    {initials(email.de)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className={`text-xs ${!email.leido ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                        {email.de}
                      </p>
                      {email.convertido && email.tipo && (
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: tipoBadge[email.tipo].bg, color: tipoBadge[email.tipo].text }}>
                          {email.tipo}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mb-1 ${!email.leido ? "font-semibold text-slate-700" : "text-slate-600"}`}>
                      {email.asunto}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{email.extracto}</p>

                    {/* Radicado link */}
                    {email.convertido && email.radicadoId && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                        <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                          <path fillRule="evenodd" d="M10.04 3.47a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L5 7.44l3.97-3.97a.75.75 0 011.07 0z" clipRule="evenodd"/>
                        </svg>
                        Radicado {email.radicadoId}
                      </div>
                    )}
                  </div>

                  {/* Right: date + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">{email.fecha.split(" ")[1]}</span>
                    <span className="text-[10px] text-slate-300">{email.fecha.split(" ")[0]}</span>
                    {!email.convertido && isHov && (
                      <button onClick={() => handleConvertir(email.id)}
                        className="flex items-center gap-1 text-[10px] font-bold rounded-lg px-2.5 py-1 text-white transition-all cursor-pointer active:scale-95"
                        style={{ background: "#1E3A8A" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/></svg>
                        Radicar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Reglas de clasificación ── */}
      {cuentas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Reglas de clasificación</h3>
              <p className="text-xs text-slate-400 mt-0.5">Define cómo se detecta y clasifica automáticamente cada tipo de PQRS.</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50 transition-all cursor-pointer">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" clipRule="evenodd"/></svg>
              Nueva regla
            </button>
          </div>
          <div className="space-y-2">
            {[
              { tipo: "Petición",   color: "#1d4ed8", bg: "#dbeafe", keywords: ["solicito", "petición", "información", "certificado"], asunto: "contiene cualquier keyword", activa: true },
              { tipo: "Queja",      color: "#dc2626", bg: "#fee2e2", keywords: ["queja", "inconformidad", "mala atención", "deficiente"], asunto: "contiene cualquier keyword", activa: true },
              { tipo: "Reclamo",    color: "#ea580c", bg: "#ffedd5", keywords: ["cobro", "factura", "reclamo", "no reconozco"], asunto: "contiene cualquier keyword", activa: true },
              { tipo: "Sugerencia", color: "#059669", bg: "#d1fae5", keywords: ["sugerencia", "propuesta", "mejora", "implementar"], asunto: "contiene cualquier keyword", activa: false },
            ].map(regla => (
              <div key={regla.tipo} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-4 hover:shadow-sm transition-all">
                <span className="text-[11px] font-bold rounded-md px-2.5 py-1 shrink-0" style={{ background: regla.bg, color: regla.color }}>
                  {regla.tipo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1.5">Asunto o cuerpo <span className="italic">{regla.asunto}:</span></p>
                  <div className="flex flex-wrap gap-1">
                    {regla.keywords.map(k => (
                      <span key={k} className="text-[10px] font-mono font-medium rounded px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-500">{k}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors`} style={{ background: regla.activa ? "#10b981" : "#cbd5e1" }}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${regla.activa ? "left-4" : "left-0.5"}`} />
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-blue-50 hover:text-[#1E3A8A] transition-all cursor-pointer">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showConnectModal && <ConnectModal onClose={() => setShowConnectModal(false)} onConnect={handleConnect} />}
    </div>
  )
}
