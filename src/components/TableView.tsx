import { useState } from "react"
import type { Radicado, View } from "../App"
import FormNew from "./FormNew"
import GestionFormularios from "./GestionFormularios"
import Configuracion from "./Configuracion"
import BuzonCorreos from "./BuzonCorreos"

interface Props {
  radicados: Radicado[]
  openDetail: (id: string) => void
  showForm: boolean
  setView: (v: View) => void
  onSubmit: (r: Radicado) => void
}

const estadoStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Recibido:     { bg: "#e0f2fe", text: "#0369a1", dot: "#0EA5E9" },
  "En gestión": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Resuelto:     { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Cerrado:      { bg: "#f1f5f9", text: "#475569", dot: "#64748B" },
  Rechazado:    { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

const tipoStyle: Record<string, { bg: string; text: string }> = {
  Petición:   { bg: "#dbeafe", text: "#1d4ed8" },
  Queja:      { bg: "#fee2e2", text: "#dc2626" },
  Reclamo:    { bg: "#ffedd5", text: "#ea580c" },
  Sugerencia: { bg: "#d1fae5", text: "#059669" },
}

const prioridadConfig: Record<string, { icon: string; color: string }> = {
  Alta:  { icon: "▲", color: "#dc2626" },
  Media: { icon: "●", color: "#d97706" },
  Baja:  { icon: "▼", color: "#059669" },
}

type EstadoFilter = "Todos" | "Recibido" | "En gestión" | "Resuelto" | "Cerrado"
type TabView = "solicitudes" | "formularios" | "configuracion" | "buzon"

function getDiasRestantes(fechaStr: string): number {
  const vencimiento = new Date(fechaStr)
  vencimiento.setDate(vencimiento.getDate() + 21)
  const hoy = new Date("2026-08-03")
  return Math.ceil((vencimiento.getTime() - hoy.getTime()) / 86400000)
}

function getVenc(r: Radicado) {
  if (r.estado === "Resuelto" || r.estado === "Cerrado" || r.estado === "Rechazado") return null
  const d = getDiasRestantes(r.fecha)
  if (d < 0)  return { nivel: "vencido",   dias: d }
  if (d <= 3) return { nivel: "critical",  dias: d }
  if (d <= 7) return { nivel: "warn",      dias: d }
  return null
}

function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

const avatarColors = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#0891b2", "#059669", "#d97706"]
function avatarColor(nombre: string) {
  let h = 0
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) % avatarColors.length
  return avatarColors[h]
}

export default function TableView({ radicados, openDetail, showForm, setView, onSubmit }: Props) {
  const [tab, setTab] = useState<TabView>("solicitudes")
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("Todos")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const perPage = 8

  const filtered = radicados.filter(r => {
    if (estadoFilter !== "Todos" && r.estado !== estadoFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.asunto.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q) && !r.peticionario.nombre.toLowerCase().includes(q)) return false
    }
    return true
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const counts: Record<EstadoFilter, number> = {
    Todos:        radicados.length,
    Recibido:     radicados.filter(r => r.estado === "Recibido").length,
    "En gestión": radicados.filter(r => r.estado === "En gestión").length,
    Resuelto:     radicados.filter(r => r.estado === "Resuelto").length,
    Cerrado:      radicados.filter(r => r.estado === "Cerrado").length,
  }

  const pillDot: Partial<Record<EstadoFilter, string>> = {
    Recibido: "#0EA5E9", "En gestión": "#f59e0b", Resuelto: "#10b981", Cerrado: "#64748B",
  }

  if (showForm) {
    return <div className="p-6"><FormNew onSubmit={onSubmit} onCancel={() => setView("table")} /></div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center">
        {([["solicitudes","Solicitudes"],["formularios","Gestión de Formularios"],["configuracion","Configuración"],["buzon","Buzón de Correos"]] as [TabView,string][]).map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === key ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >{label}</button>
        ))}
      </div>

      {/* ── SOLICITUDES ── */}
      {tab === "solicitudes" && (
        <div className="flex-1 overflow-auto p-6 space-y-5">

          {/* Top action row */}
          <div className="flex items-center gap-3 justify-between">
            <p className="text-sm text-slate-500 hidden sm:block">
              Gestión de <span className="font-medium text-[#1E3A8A]">Peticiones</span>, <span className="font-medium text-[#0EA5E9]">Quejas</span>, <span className="font-medium text-slate-600">Reclamos</span> y <span className="font-medium text-slate-600">Sugerencias</span>.
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Buscar..." className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-48 transition-all" />
              </div>
              <button onClick={() => setView("new")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Radicar PQRS
              </button>
            </div>
          </div>

          {/* Filter pills with counts */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["Todos","Recibido","En gestión","Resuelto","Cerrado"] as EstadoFilter[]).map(f => (
              <button key={f} onClick={() => { setEstadoFilter(f); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  estadoFilter === f
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                }`}
              >
                {pillDot[f] && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: estadoFilter === f ? "#fff" : pillDot[f] }} />}
                {f}
                <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${estadoFilter === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      { label: "Radicado",     w: "w-44" },
                      { label: "Peticionario", w: "w-48" },
                      { label: "Tipo",         w: "w-28" },
                      { label: "Asunto",       w: "" },
                      { label: "Prioridad",    w: "w-24" },
                      { label: "Estado",       w: "w-28" },
                      { label: "Fecha",        w: "w-28" },
                      { label: "Acciones",     w: "w-20" },
                    ].map(col => (
                      <th key={col.label} className={`text-left px-4 py-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 select-none ${col.w}`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr><td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-slate-200">
                          <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2.5"/>
                          <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                        <p className="text-sm text-slate-400 font-medium">Sin radicados</p>
                        <p className="text-xs text-slate-300">Ajusta los filtros o crea un nuevo radicado</p>
                      </div>
                    </td></tr>
                  )}
                  {paginated.map(r => {
                    const venc = getVenc(r)
                    const isHov = hoveredRow === r.id
                    const rowBg =
                      venc?.nivel === "vencido"  ? (isHov ? "#fef2f2" : "#fff5f5") :
                      venc?.nivel === "critical" ? (isHov ? "#fff7ed" : "#fffbf5") :
                      venc?.nivel === "warn"     ? (isHov ? "#fefce8" : "#fffef5") :
                      isHov ? "#f8fafc" : "#fff"

                    const leftBorder =
                      venc?.nivel === "vencido"  ? "#ef4444" :
                      venc?.nivel === "critical" ? "#f97316" :
                      venc?.nivel === "warn"     ? "#eab308" : "transparent"

                    return (
                      <tr key={r.id}
                        onMouseEnter={() => setHoveredRow(r.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => openDetail(r.id)}
                        className="border-b border-slate-50 cursor-pointer transition-colors duration-100"
                        style={{ background: rowBg, boxShadow: `inset 3px 0 0 ${leftBorder}` }}
                      >
                        {/* Radicado + alerta */}
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-xs font-bold text-slate-700">{r.id}</p>
                          {venc && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold rounded px-1.5 py-0.5"
                              style={{
                                background: venc.nivel === "vencido" ? "#fee2e2" : venc.nivel === "critical" ? "#ffedd5" : "#fefce8",
                                color:      venc.nivel === "vencido" ? "#dc2626" : venc.nivel === "critical" ? "#ea580c" : "#ca8a04",
                              }}
                            >
                              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                                <path fillRule="evenodd" d="M5.133 1.6c.385-.667 1.349-.667 1.734 0l3.9 6.75A1 1 0 019.9 9.75H2.1a1 1 0 01-.867-1.4l3.9-6.75zM6 4.5a.5.5 0 01.5.5v1.5a.5.5 0 01-1 0V5A.5.5 0 016 4.5zM6 9a.75.75 0 100-1.5A.75.75 0 006 9z" clipRule="evenodd" />
                              </svg>
                              {venc.nivel === "vencido" ? `Vencido ${Math.abs(venc.dias)}d` : `${venc.dias}d restantes`}
                            </span>
                          )}
                        </td>

                        {/* Peticionario con avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ background: avatarColor(r.peticionario.nombre) }}>
                              {initials(r.peticionario.nombre)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{r.peticionario.nombre}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{r.peticionario.cedula}</p>
                            </div>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-bold rounded-md px-2 py-0.5"
                            style={{ background: tipoStyle[r.tipo].bg, color: tipoStyle[r.tipo].text }}>
                            {r.tipo}
                          </span>
                        </td>

                        {/* Asunto */}
                        <td className="px-4 py-3.5 max-w-0">
                          <p className="text-xs text-slate-600 truncate pr-4">{r.asunto}</p>
                        </td>

                        {/* Prioridad */}
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: prioridadConfig[r.prioridad].color }}>
                            <span className="text-[10px]">{prioridadConfig[r.prioridad].icon}</span>
                            {r.prioridad}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
                            style={{ background: estadoStyle[r.estado].bg, color: estadoStyle[r.estado].text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: estadoStyle[r.estado].dot }} />
                            {r.estado}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-mono text-slate-400">{r.fecha}</span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-0.5">
                            <button onClick={e => { e.stopPropagation(); openDetail(r.id) }} title="Ver detalle"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-[#e0f2fe] hover:text-[#0EA5E9] transition-all cursor-pointer">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                            </button>
                            <button onClick={e => e.stopPropagation()} title="Eliminar"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">{filtered.length}</span> radicados
                  {estadoFilter !== "Todos" && <span className="text-slate-400"> · filtrado por <span className="font-medium text-slate-600">{estadoFilter}</span></span>}
                </p>
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
                  {[
                    { color: "#ef4444", label: "Vencido" },
                    { color: "#f97316", label: "≤ 3 días" },
                    { color: "#eab308", label: "≤ 7 días" },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span className="w-2 h-px inline-block border-l-4" style={{ borderColor: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-30 text-xs transition-all cursor-pointer">
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => setPage(i + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer border"
                      style={i + 1 === page
                        ? { background: "#1E3A8A", color: "#fff", borderColor: "#1E3A8A" }
                        : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}
                    >{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-30 text-xs transition-all cursor-pointer">
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "formularios" && <GestionFormularios />}
      {tab === "configuracion" && <Configuracion />}
      {tab === "buzon" && <BuzonCorreos />}

      {/* Global footer */}
      <div className="bg-white border-t border-slate-100 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span>© 2026 Concept BPO. Meta Business Partner.</span>
        <div className="flex gap-4">
          {["Política de privacidad","Términos del servicio","Seguridad"].map(l => (
            <button key={l} className="hover:text-slate-600 transition-colors cursor-pointer">{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
