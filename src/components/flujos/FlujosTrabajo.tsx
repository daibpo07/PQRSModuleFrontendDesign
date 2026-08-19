import { useState } from "react"
import Ejecuciones from "./Ejecuciones"
import EquipoCargas from "./EquipoCargas"
import FlujoBuilder from "./FlujoBuilder"
import MiTrabajo from "./MiTrabajo"
import OrquestacionIA from "./OrquestacionIA"
import {
  CadenaPasos,
  EstadoFlujoPill,
  IconoPaso,
  estadoFlujoMeta,
  mockAgentes,
  mockDesvios,
  mockEjecuciones,
  mockFlujos,
  mockTareas,
  nf,
  slaTotal,
  tipoPasoMeta,
  type Agente,
  type Desvio,
  type EstadoFlujo,
  type Flujo,
  type Tarea,
} from "./FlujosData"

type Subvista = "flujos" | "ejecuciones" | "trabajo" | "equipo" | "ia"

/* ─────────────────────────────────────────────
   Tarjeta de flujo
───────────────────────────────────────────── */
function TarjetaFlujo({
  f,
  abierta,
  vivo,
  onToggle,
  onEditar,
  onEstado,
  onSeguimiento,
}: {
  f: Flujo
  abierta: boolean
  /** Casos que ahora mismo recorren este flujo, y en qué paso está cada uno. */
  vivo: { enCurso: number; enRiesgo: number; vencidas: number; porPaso: number[] }
  onToggle: () => void
  onEditar: () => void
  onEstado: (e: EstadoFlujo) => void
  onSeguimiento: () => void
}) {
  const horas = slaTotal(f.pasos)
  const humanos = f.pasos.filter(p => p.tipo === "humana" || p.tipo === "aprobacion").length

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all"
      style={{
        borderColor: abierta ? "#c7d7fe" : "#e2e8f0",
        boxShadow: abierta ? "0 4px 20px rgba(30,58,138,0.07)" : undefined,
      }}
    >
      <button onClick={onToggle} className="w-full text-left px-5 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{f.nombre}</h3>
              <EstadoFlujoPill estado={f.estado} />
              <span className="text-[10px] font-mono font-bold text-slate-300">{f.version}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              <span className="font-mono">{f.id}</span> · {f.modulo} · {f.autor} · actualizado {f.actualizado}
            </p>

            <p className="text-[11px] font-mono text-slate-500 mt-2 rounded-lg px-2.5 py-1.5 inline-block" style={{ background: "#f8fafc" }}>
              <span className="text-slate-300">disparador: </span>
              {f.disparador}
            </p>

            {/* Estado vivo del flujo */}
            {vivo.enCurso > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <span className="text-[10px] text-slate-400">Ahora mismo:</span>
                {[
                  { l: "en curso", v: vivo.enCurso, bg: "#e0f2fe", c: "#0369a1" },
                  { l: "en riesgo", v: vivo.enRiesgo, bg: "#fef3c7", c: "#92400e" },
                  { l: "vencidos", v: vivo.vencidas, bg: "#fee2e2", c: "#991b1b" },
                ]
                  .filter(x => x.v > 0)
                  .map(x => (
                    <span
                      key={x.l}
                      onClick={e => {
                        e.stopPropagation()
                        onSeguimiento()
                      }}
                      className="text-[10px] font-bold rounded-full px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: x.bg, color: x.c }}
                    >
                      {x.v} {x.l}
                    </span>
                  ))}
                <span
                  onClick={e => {
                    e.stopPropagation()
                    onSeguimiento()
                  }}
                  className="text-[10px] font-semibold text-slate-300 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  ver casos →
                </span>
              </div>
            )}

            {/* Cadena compacta, con los casos detenidos en cada paso */}
            <div className="mt-3">
              <CadenaPasos pasos={f.pasos} compacta conteos={vivo.enCurso > 0 ? vivo.porPaso : undefined} />
            </div>

            <div className="flex items-center gap-4 flex-wrap mt-3">
              {[
                { l: "Pasos", v: String(f.pasos.length) },
                { l: "Con persona", v: String(humanos) },
                { l: "SLA total", v: `${horas} h` },
                { l: "Ejecuciones", v: nf(f.ejecuciones) },
                { l: "Cumplimiento", v: f.cumplimiento ? `${f.cumplimiento}%` : "—", c: f.cumplimiento >= 90 ? "#059669" : f.cumplimiento > 0 ? "#d97706" : "#94a3b8" },
                { l: "Duración media", v: f.duracionMedia },
              ].map(x => (
                <span key={x.l} className="text-[10px] text-slate-400">
                  {x.l} <span className="font-mono font-bold" style={{ color: x.c ?? "#334155" }}>{x.v}</span>
                </span>
              ))}
            </div>
          </div>

          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-slate-300 transition-transform shrink-0 mt-1"
            style={{ transform: abierta ? "rotate(180deg)" : undefined }}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {abierta && (
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">{f.descripcion}</p>

          {/* Cadena completa */}
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Recorrido del flujo</p>
              {vivo.enCurso > 0 && (
                <p className="text-[10px] text-slate-400">
                  El contador de cada paso indica cuántos casos están detenidos ahí
                </p>
              )}
            </div>
            <CadenaPasos pasos={f.pasos} conteos={vivo.enCurso > 0 ? vivo.porPaso : undefined} />
          </div>

          {/* Detalle de pasos */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["#", "Paso", "Tipo", "Responsable", "SLA", "Chequeo"].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {f.pasos.map((p, i) => {
                    const m = tipoPasoMeta[p.tipo]
                    return (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] font-mono font-bold text-slate-300">{String(i + 1).padStart(2, "0")}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-slate-700">{p.nombre}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 max-w-md">{p.descripcion}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap"
                            style={{ background: m.bg, color: m.color }}
                          >
                            <IconoPaso tipo={p.tipo} className="w-2.5 h-2.5" />
                            {m.corto}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600 whitespace-nowrap">{p.responsable}</span>
                          {p.datosSensibles && (
                            <span className="block text-[9px] text-slate-400 mt-0.5">🔒 datos sensibles</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-mono font-bold text-slate-600">{p.slaHoras} h</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-mono text-slate-400">{p.checklist.length} ítems</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onEditar}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer"
              style={{ background: "#1E3A8A" }}
            >
              Editar flujo
            </button>
            {f.estado === "Activo" ? (
              <button
                onClick={() => onEstado("Pausado")}
                className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
              >
                Pausar
              </button>
            ) : (
              <button
                onClick={() => onEstado("Activo")}
                className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                Activar
              </button>
            )}
            <button className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              Duplicar
            </button>
            <button
              onClick={onSeguimiento}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-slate-50 transition-all cursor-pointer"
            >
              Ver los {vivo.enCurso} casos en curso
            </button>
            <p className="text-[10px] text-slate-300 ml-auto">
              Los cambios crean una versión nueva; las ejecuciones en curso terminan con la versión con la que iniciaron.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Módulo Flujos de Trabajo
───────────────────────────────────────────── */
export default function FlujosTrabajo() {
  const [subvista, setSubvista] = useState<Subvista>("flujos")
  const [flujos, setFlujos] = useState<Flujo[]>(mockFlujos)
  const [tareas, setTareas] = useState<Tarea[]>(mockTareas)
  const [agentes, setAgentes] = useState<Agente[]>(mockAgentes)
  const [desvios, setDesvios] = useState<Desvio[]>(mockDesvios)
  const [filtro, setFiltro] = useState<"Todos" | EstadoFlujo>("Todos")
  const [buscar, setBuscar] = useState("")
  const [abierta, setAbierta] = useState<string | null>(null)
  const [builder, setBuilder] = useState<{ abierto: boolean; base: Flujo | null }>({ abierto: false, base: null })
  const [filtroFlujo, setFiltroFlujo] = useState<string | null>(null)

  const ejecuciones = mockEjecuciones

  /** Estado vivo de un flujo: cuántos casos lo recorren y dónde están detenidos. */
  const estadoVivo = (f: Flujo) => {
    const suyas = ejecuciones.filter(e => e.flujoId === f.id && e.estado !== "Completada")
    const porPaso = f.pasos.map((_, i) => suyas.filter(e => e.pasoIdx === i).length)
    return {
      enCurso: suyas.length,
      enRiesgo: suyas.filter(e => e.estado === "En riesgo").length,
      vencidas: suyas.filter(e => e.estado === "Vencida").length,
      porPaso,
    }
  }

  const abrirSeguimiento = (flujoId: string) => {
    setFiltroFlujo(flujoId)
    setSubvista("ejecuciones")
  }

  /* Indicadores del encabezado */
  const activos = flujos.filter(f => f.estado === "Activo").length
  const enCurso = ejecuciones.filter(e => e.estado !== "Completada").length
  const vencidas = ejecuciones.filter(e => e.estado === "Vencida").length
  const conCumplimiento = flujos.filter(f => f.cumplimiento > 0)
  const cumplimiento = conCumplimiento.length
    ? Math.round((conCumplimiento.reduce((a, f) => a + f.cumplimiento, 0) / conCumplimiento.length) * 10) / 10
    : 0

  const filtrados = flujos.filter(f => {
    if (filtro !== "Todos" && f.estado !== filtro) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      return (
        f.nombre.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.modulo.toLowerCase().includes(q) ||
        f.disparador.toLowerCase().includes(q)
      )
    }
    return true
  })

  const conteos: Record<string, number> = {
    Todos: flujos.length,
    Activo: flujos.filter(f => f.estado === "Activo").length,
    Borrador: flujos.filter(f => f.estado === "Borrador").length,
    Pausado: flujos.filter(f => f.estado === "Pausado").length,
    Archivado: flujos.filter(f => f.estado === "Archivado").length,
  }

  const nextId = `FLW-${String(flujos.length + 1).padStart(3, "0")}`

  /* Acciones de la bandeja */
  const toggleItem = (tareaId: string, itemId: string) =>
    setTareas(prev =>
      prev.map(t =>
        t.id === tareaId
          ? { ...t, checklist: t.checklist.map(c => (c.id === itemId ? { ...c, hecho: !c.hecho } : c)) }
          : t,
      ),
    )

  const completar = (tareaId: string) => setTareas(prev => prev.filter(t => t.id !== tareaId))

  const devolver = (tareaId: string) => setTareas(prev => prev.filter(t => t.id !== tareaId))

  const reasignar = (origen: string, destino: string) =>
    setAgentes(prev =>
      prev.map(a =>
        a.nombre === origen
          ? { ...a, activas: Math.max(0, a.activas - 1) }
          : a.nombre === destino
            ? { ...a, activas: a.activas + 1 }
            : a,
      ),
    )

  const tabs: [Subvista, string, number | null][] = [
    ["flujos", "Flujos", flujos.length],
    ["ejecuciones", "Seguimiento", enCurso],
    ["trabajo", "Mi trabajo", tareas.length],
    ["equipo", "Equipo", null],
    ["ia", "Orquestación IA", null],
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Barra de subvistas */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0 overflow-x-auto">
        {tabs.map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => {
              setSubvista(key)
              if (key === "ejecuciones") setFiltroFlujo(null)
            }}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              subvista === key
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            {label}
            {badge !== null && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold"
                style={{
                  background: subvista === key ? "#eff3ff" : "#f1f5f9",
                  color: subvista === key ? "#1E3A8A" : "#94a3b8",
                }}
              >
                {badge}
              </span>
            )}
            {key === "ia" && (
              <span className="text-[9px] font-bold rounded px-1.5 py-px" style={{ background: "#fef3c7", color: "#92400e" }}>
                FASE 2
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ FLUJOS ═══════════ */}
      {subvista === "flujos" && (
        <div className="flex-1 overflow-auto p-6 space-y-6" style={{ background: "#F8FAFC" }}>

          {/* Banner */}
          <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-6 overflow-hidden relative" style={{ background: "#1E3A8A" }}>
            <div
              className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 75% 50%, #0EA5E9 0%, transparent 70%)" }}
            />
            <div className="relative min-w-0">
              <p className="text-white/50 text-xs mb-0.5">Operación coordinada</p>
              <h2 className="text-white text-xl font-bold">Flujos de Trabajo</h2>
              <p className="text-white/60 text-sm mt-1">
                <span className="text-[#0EA5E9] font-semibold">{activos}</span> flujos activos ·{" "}
                <span className="text-[#0EA5E9] font-semibold">{enCurso}</span> casos en curso ·{" "}
                {vencidas > 0 ? `${vencidas} vencidos` : "ninguno vencido"}
              </p>
            </div>
            <div className="relative flex items-center gap-5 shrink-0">
              <div className="hidden lg:flex flex-col items-end gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Cumplimiento de SLA</span>
                <span className="text-2xl font-bold" style={{ color: "#0EA5E9" }}>{cumplimiento}%</span>
                <span className="text-[10px] text-white/40">promedio de los flujos activos</span>
              </div>
              <button
                onClick={() => setBuilder({ abierto: true, base: null })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
                style={{ background: "#0EA5E9" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0284c7")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0EA5E9")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo flujo
              </button>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800">Cómo funciona un flujo</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Esta pestaña define <span className="font-semibold text-slate-500">la ruta</span>. Los casos que la
              recorren viven en <span className="font-semibold text-slate-500">Seguimiento</span>: un flujo es la
              receta, cada caso es una preparación en marcha.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { n: "1", t: "Disparador", d: "Un evento del sistema pone el flujo en marcha: un radicado nuevo, un cierre, una mora.", c: "#1E3A8A" },
                { n: "2", t: "Pasos", d: "Cada paso define quién responde, en cuánto tiempo y qué debe verificar.", c: "#0EA5E9" },
                { n: "3", t: "Bandeja", d: "El responsable recibe la tarea con su lista de chequeo en “Mi trabajo”.", c: "#059669" },
                { n: "4", t: "Seguimiento", d: "Cada caso que recorre un flujo aparece en “Seguimiento”, con su SLA en vivo.", c: "#d97706" },
              ].map(x => (
                <div key={x.n} className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: x.c }}>
                      {x.n}
                    </span>
                    <p className="text-xs font-bold text-slate-700">{x.t}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{x.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {(["Todos", "Activo", "Borrador", "Pausado"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    filtro === f
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                  }`}
                >
                  {f !== "Todos" && (
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: filtro === f ? "#fff" : estadoFlujoMeta[f].dot }}
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
                placeholder="Buscar flujo o disparador…"
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-56 transition-all"
              />
            </div>
          </div>

          {/* Listado */}
          <div className="space-y-3">
            {filtrados.map(f => (
              <TarjetaFlujo
                key={f.id}
                f={f}
                abierta={abierta === f.id}
                vivo={estadoVivo(f)}
                onToggle={() => setAbierta(a => (a === f.id ? null : f.id))}
                onEditar={() => setBuilder({ abierto: true, base: f })}
                onEstado={e => setFlujos(prev => prev.map(x => (x.id === f.id ? { ...x, estado: e } : x)))}
                onSeguimiento={() => abrirSeguimiento(f.id)}
              />
            ))}

            {filtrados.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-2">
                <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-slate-200">
                  <path d="M8 12h32M8 24h20M8 36h26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-slate-400 font-medium">Sin flujos</p>
                <p className="text-xs text-slate-300">Ajusta los filtros o crea uno nuevo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ OTRAS SUBVISTAS ═══════════ */}
      {subvista === "ejecuciones" && (
        <Ejecuciones
          ejecuciones={ejecuciones}
          desvios={desvios}
          onResolverDesvio={id => setDesvios(prev => prev.filter(d => d.id !== id))}
          filtroFlujo={filtroFlujo}
          nombreFlujo={flujos.find(f => f.id === filtroFlujo)?.nombre}
          onLimpiarFiltro={() => setFiltroFlujo(null)}
        />
      )}

      {subvista === "trabajo" && (
        <MiTrabajo tareas={tareas} onToggleItem={toggleItem} onCompletar={completar} onDevolver={devolver} />
      )}

      {subvista === "equipo" && <EquipoCargas agentes={agentes} onReasignar={reasignar} />}

      {subvista === "ia" && (
        <OrquestacionIA
          ejecucionesRegistradas={flujos.reduce((a, f) => a + f.ejecuciones, 0)}
          flujosActivos={activos}
        />
      )}

      {/* Constructor */}
      {builder.abierto && (
        <FlujoBuilder
          inicial={builder.base}
          nextId={nextId}
          onClose={() => setBuilder({ abierto: false, base: null })}
          onGuardar={f => {
            setFlujos(prev => (prev.some(x => x.id === f.id) ? prev.map(x => (x.id === f.id ? f : x)) : [f, ...prev]))
            setBuilder({ abierto: false, base: null })
            setSubvista("flujos")
            setAbierta(f.id)
          }}
        />
      )}
    </div>
  )
}
