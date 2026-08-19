import { useState } from "react"
import {
  EstadoEjecucionPill,
  IconoPaso,
  colorSla,
  desvioMeta,
  estadoEjecucionMeta,
  formatoSla,
  prioridadMeta,
  tipoPasoMeta,
  type Desvio,
  type Ejecucion,
  type EstadoEjecucion,
} from "./FlujosData"

interface Props {
  ejecuciones: Ejecucion[]
  desvios: Desvio[]
  onResolverDesvio: (id: string, accion: string) => void
  /** Cuando llegas desde una tarjeta de la pestaña Flujos, la vista abre filtrada por ese flujo. */
  filtroFlujo?: string | null
  nombreFlujo?: string
  onLimpiarFiltro?: () => void
}

const estadoEvento: Record<string, { bg: string; color: string; borde: string }> = {
  Completado: { bg: "#d1fae5", color: "#059669", borde: "#1E3A8A" },
  "En curso": { bg: "#e0f2fe", color: "#0EA5E9", borde: "#0EA5E9" },
  Pendiente: { bg: "#f1f5f9", color: "#94a3b8", borde: "#cbd5e1" },
  Vencido: { bg: "#fee2e2", color: "#dc2626", borde: "#ef4444" },
  Devuelto: { bg: "#ede9fe", color: "#6d28d9", borde: "#7c3aed" },
}

/* ─────────────────────────────────────────────
   Línea de tiempo de una ejecución
───────────────────────────────────────────── */
function LineaTiempo({ e, onClose }: { e: Ejecucion; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{e.caso}</h3>
              <EstadoEjecucionPill estado={e.estado} />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {e.asunto} · <span className="font-mono">{e.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-6 flex-wrap shrink-0" style={{ background: "#f8fafc" }}>
          {[
            { l: "Flujo", v: e.flujo },
            { l: "Inicio", v: e.inicio },
            { l: "Vence", v: e.vence },
            { l: "Responsable actual", v: e.responsable },
          ].map(x => (
            <div key={x.l}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{x.l}</p>
              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{x.v}</p>
            </div>
          ))}
          <div className="ml-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">SLA</p>
            <p className="text-[13px] font-mono font-bold mt-0.5" style={{ color: colorSla(e.restanteHoras) }}>
              {e.estado === "Completada" ? "Cumplido" : formatoSla(e.restanteHoras)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ background: "#F8FAFC" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Recorrido paso a paso
          </p>

          {e.linea.map((ev, i) => {
            const tm = tipoPasoMeta[ev.tipo]
            const em = estadoEvento[ev.estado]
            const ultimo = i === e.linea.length - 1
            return (
              <div key={i} className="flex gap-3">
                {/* Riel */}
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2"
                    style={{
                      background: ev.estado === "Completado" ? "#1E3A8A" : em.bg,
                      color: ev.estado === "Completado" ? "#fff" : em.color,
                      borderColor: ev.estado === "En curso" ? "#0EA5E9" : "transparent",
                    }}
                  >
                    {ev.estado === "Completado" ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <IconoPaso tipo={ev.tipo} className="w-4 h-4" />
                    )}
                  </span>
                  {!ultimo && (
                    <div
                      className="w-0.5 flex-1 min-h-[24px] my-1 rounded-full"
                      style={{ background: ev.estado === "Completado" ? "#c7d7fe" : "#e2e8f0" }}
                    />
                  )}
                </div>

                {/* Tarjeta */}
                <div className="flex-1 min-w-0 pb-4">
                  <div
                    className="rounded-xl border bg-white p-3.5"
                    style={{ borderColor: ev.estado === "En curso" || ev.estado === "Vencido" ? em.borde : "#e2e8f0" }}
                  >
                    <div className="flex items-start gap-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">{ev.paso}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {ev.responsable} · {tm.label}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                        style={{ background: em.bg, color: em.color }}
                      >
                        {ev.estado}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                      {[
                        { l: "Inicio", v: ev.inicio },
                        { l: "Fin", v: ev.fin ?? "—" },
                        { l: "Duración", v: ev.duracion ?? "—" },
                        { l: "SLA", v: `${ev.slaHoras} h` },
                      ].map(x => (
                        <span key={x.l} className="text-[10px] text-slate-400">
                          {x.l} <span className="font-mono font-semibold text-slate-600">{x.v}</span>
                        </span>
                      ))}
                    </div>

                    {ev.nota && (
                      <p className="text-[11px] leading-relaxed text-slate-500 rounded-lg px-3 py-2 mt-2.5" style={{ background: "#f8fafc" }}>
                        {ev.nota}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
          <button className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            Reasignar paso actual
          </button>
          <button className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            Ampliar SLA
          </button>
          <button className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer">
            Escalar al líder
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Subvista Ejecuciones
───────────────────────────────────────────── */
export default function Ejecuciones({
  ejecuciones,
  desvios,
  onResolverDesvio,
  filtroFlujo = null,
  nombreFlujo,
  onLimpiarFiltro,
}: Props) {
  const [filtro, setFiltro] = useState<"Todas" | EstadoEjecucion>("Todas")
  const [buscar, setBuscar] = useState("")
  const [abierta, setAbierta] = useState<Ejecucion | null>(null)

  const delFlujo = filtroFlujo ? ejecuciones.filter(e => e.flujoId === filtroFlujo) : ejecuciones

  const filtradas = delFlujo.filter(e => {
    if (filtro !== "Todas" && e.estado !== filtro) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      return (
        e.caso.toLowerCase().includes(q) ||
        e.asunto.toLowerCase().includes(q) ||
        e.flujo.toLowerCase().includes(q) ||
        e.responsable.toLowerCase().includes(q)
      )
    }
    return true
  })

  const conteos: Record<string, number> = {
    Todas: delFlujo.length,
    "En curso": delFlujo.filter(e => e.estado === "En curso").length,
    "En riesgo": delFlujo.filter(e => e.estado === "En riesgo").length,
    Vencida: delFlujo.filter(e => e.estado === "Vencida").length,
    Bloqueada: delFlujo.filter(e => e.estado === "Bloqueada").length,
    Completada: delFlujo.filter(e => e.estado === "Completada").length,
  }

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: "#F8FAFC" }}>
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">

        {/* Monitor */}
        <div className="space-y-5 min-w-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Seguimiento de casos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Un flujo es la ruta definida; aquí ves los casos reales recorriéndola, con el paso donde van y el
              tiempo que les queda.
            </p>
          </div>

          {filtroFlujo && (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
              style={{ background: "#eff3ff", borderColor: "#c7d7fe" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-[#1E3A8A]">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <p className="text-[11px] text-slate-600 flex-1 min-w-0">
                Mostrando solo los casos del flujo{" "}
                <span className="font-bold text-[#1E3A8A]">{nombreFlujo ?? filtroFlujo}</span>
              </p>
              <button
                onClick={onLimpiarFiltro}
                className="text-[11px] font-bold text-[#1E3A8A] hover:underline cursor-pointer shrink-0"
              >
                Ver todos los flujos
              </button>
            </div>
          )}

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {(["Todas", "En curso", "En riesgo", "Vencida", "Bloqueada", "Completada"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    filtro === f
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                  }`}
                >
                  {f !== "Todas" && (
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: filtro === f ? "#fff" : estadoEjecucionMeta[f].dot }}
                    />
                  )}
                  {f}
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                      filtro === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {conteos[f]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                placeholder="Buscar caso o responsable…"
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-56 transition-all"
              />
            </div>
          </div>

          {/* Listado */}
          <div className="space-y-3">
            {filtradas.map(e => {
              const pm = prioridadMeta[e.prioridad]
              const avance = Math.round((e.pasoIdx / e.totalPasos) * 100)
              const cSla = colorSla(e.restanteHoras)
              return (
                <button
                  key={e.id}
                  onClick={() => setAbierta(e)}
                  className="w-full text-left bg-white rounded-2xl border p-4 hover:border-[#c7d7fe] hover:shadow-sm transition-all cursor-pointer group"
                  style={{
                    borderColor: e.estado === "Vencida" ? "#fecaca" : e.estado === "En riesgo" ? "#fde68a" : "#e2e8f0",
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{e.caso}</span>
                        <EstadoEjecucionPill estado={e.estado} />
                        <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: pm.color }}>
                          <span className="text-[9px]">{pm.icon}</span>
                          {e.prioridad}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-1">{e.asunto}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {e.flujo} · <span className="font-mono">{e.id}</span>
                      </p>

                      {/* Avance */}
                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${avance}%`,
                              background: e.estado === "Vencida" ? "#ef4444" : "linear-gradient(90deg,#1E3A8A,#0EA5E9)",
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          Paso <span className="font-bold text-slate-600">{e.pasoIdx + 1}</span> / {e.totalPasos}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-slate-400">En:</span>
                        <span className="text-[10px] font-semibold text-slate-600">{e.pasoActual}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[10px] text-slate-400">{e.responsable}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">SLA</span>
                      <span className="text-sm font-mono font-bold" style={{ color: e.estado === "Completada" ? "#059669" : cSla }}>
                        {e.estado === "Completada" ? "Cumplido" : formatoSla(e.restanteHoras)}
                      </span>
                      <span className="text-[10px] text-slate-300">{e.vence}</span>
                      <span className="text-[10px] font-semibold text-slate-300 group-hover:text-[#1E3A8A] transition-colors mt-1">
                        Ver recorrido →
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            {filtradas.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-2">
                <p className="text-sm text-slate-400 font-medium">Sin ejecuciones</p>
                <p className="text-xs text-slate-300">Ajusta los filtros o la búsqueda</p>
              </div>
            )}
          </div>
        </div>

        {/* Desvíos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">Desvíos y alertas</h3>
            {desvios.length > 0 && (
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#fee2e2", color: "#991b1b" }}>
                {desvios.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 -mt-1">
            Lo que se salió de lo previsto, con las acciones que puedes autorizar.
          </p>

          {desvios.map(d => {
            const m = desvioMeta[d.tipo]
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: m.bg, color: m.color }}>
                    {m.label}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-300">{d.hora}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{d.titulo}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5">{d.detalle}</p>
                {d.caso && <p className="text-[10px] font-mono text-slate-300 mt-1.5">{d.caso}</p>}
                <div className="flex flex-col gap-1.5 mt-3">
                  {d.acciones.map((a, i) => (
                    <button
                      key={a}
                      onClick={() => onResolverDesvio(d.id, a)}
                      className="w-full px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                      style={
                        i === 0
                          ? { background: "#1E3A8A", color: "#fff" }
                          : { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }
                      }
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {desvios.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 py-10 flex flex-col items-center gap-2">
              <svg viewBox="0 0 20 20" fill="#10b981" className="w-8 h-8">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-slate-500">Todo en orden</p>
              <p className="text-xs text-slate-300 text-center px-4">Ningún flujo se ha salido de lo previsto</p>
            </div>
          )}

          <div className="rounded-2xl p-4" style={{ background: "#eff3ff" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1E3A8A" }}>
              Fase 2
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Hoy las acciones las propone una regla fija. Cuando haya suficiente histórico, la IA aprenderá cuál
              funcionó en cada situación y priorizará la mejor.
            </p>
          </div>
        </div>
      </div>

      {abierta && <LineaTiempo e={abierta} onClose={() => setAbierta(null)} />}
    </div>
  )
}
