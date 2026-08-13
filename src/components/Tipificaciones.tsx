import { useState } from "react"
import {
  Avatar,
  Bubble,
  DateSep,
  canalLabel,
  catalogoTipificaciones,
  resultadoMeta,
  type ConversacionCerrada,
  type ResultadoCierre,
} from "./EnviosIndividualesData"

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface Props {
  historial: ConversacionCerrada[]
  destacado?: string | null
}

/* ── Estrellas de satisfacción ── */
function Estrellas({ valor }: { valor?: number }) {
  if (!valor) return <span className="text-[10px] text-slate-300">Sin calificar</span>
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3 h-3"
          style={{ color: i <= valor ? "#f59e0b" : "#e2e8f0" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Visor de la transcripción completa
───────────────────────────────────────────── */
function VisorTranscripcion({ c, onClose }: { c: ConversacionCerrada; onClose: () => void }) {
  const [soloAgente, setSoloAgente] = useState(false)
  const [buscar, setBuscar] = useState("")
  const cl = canalLabel[c.canal]
  const rm = resultadoMeta[c.resultado]

  const dias = c.transcripcion.map(d => ({
    ...d,
    mensajes: d.mensajes.filter(m => {
      if (soloAgente && !m.mine && !m.sistema) return false
      if (buscar && !m.text.toLowerCase().includes(buscar.toLowerCase())) return false
      return true
    }),
  }))
  const hayResultados = dias.some(d => d.mensajes.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Encabezado ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <Avatar name={c.contacto} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{c.contacto}</h3>
              <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>
                {cl.label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2 py-0.5"
                style={{ background: rm.bg, color: rm.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: rm.dot }} />
                {c.resultado}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <span className="font-mono">{c.documento}</span>
              {c.radicado && <> · <span className="font-mono">{c.radicado}</span></>} · Atendido por {c.agente}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#1E3A8A] transition-all cursor-pointer">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Línea de tiempo resumen ── */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-6 flex-wrap shrink-0" style={{ background: "#f8fafc" }}>
          {[
            { l: "Inicio", v: c.inicio },
            { l: "Cierre", v: c.cierre },
            { l: "Duración", v: c.duracion },
            { l: "Mensajes", v: String(c.mensajesTotal) },
          ].map(x => (
            <div key={x.l}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{x.l}</p>
              <p className="text-[11px] font-mono font-semibold text-slate-600 mt-0.5">{x.v}</p>
            </div>
          ))}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Satisfacción</p>
            <div className="mt-1">
              <Estrellas valor={c.satisfaccion} />
            </div>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_280px]">

          {/* Transcripción */}
          <div className="flex flex-col min-w-0 overflow-hidden">
            {/* Controles */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <div className="relative flex-1 max-w-xs">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                  placeholder="Buscar en la conversación…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                />
              </div>
              <button
                onClick={() => setSoloAgente(v => !v)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer shrink-0"
                style={{
                  background: soloAgente ? "#eff3ff" : "#fff",
                  color: soloAgente ? "#1E3A8A" : "#94a3b8",
                  borderColor: soloAgente ? "#c7d7fe" : "#e2e8f0",
                }}
              >
                Solo respuestas del asesor
              </button>
              <span className="ml-auto text-[10px] text-slate-300 shrink-0 hidden sm:block">
                Conversación completa, de inicio a cierre
              </span>
            </div>

            {/* Hilo */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #F8FAFC 100%)" }}
            >
              {!hayResultados && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-400">Sin coincidencias</p>
                </div>
              )}
              {dias.map((d, i) =>
                d.mensajes.length === 0 ? null : (
                  <div key={i}>
                    <DateSep label={d.fecha} />
                    {d.mensajes.map(m => (
                      <Bubble key={m.id} msg={m} chatCanal={c.canal} conAcciones={false} />
                    ))}
                  </div>
                ),
              )}

              {/* Marca de cierre */}
              <div className="flex items-center gap-3 mt-6 mb-2">
                <div className="flex-1 h-px" style={{ background: "#cbd5e1" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Fin de la conversación
                </span>
                <div className="flex-1 h-px" style={{ background: "#cbd5e1" }} />
              </div>
            </div>
          </div>

          {/* Panel de tipificación */}
          <div className="border-l border-slate-100 overflow-y-auto bg-white">
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tipificación</p>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {[
                    { l: "Categoría", v: c.tipificacion.categoria },
                    { l: "Subcategoría", v: c.tipificacion.subcategoria },
                    { l: "Motivo", v: c.tipificacion.motivo },
                  ].map((x, i) => (
                    <div
                      key={x.l}
                      className="px-3 py-2 border-b border-slate-50 last:border-0"
                      style={{ background: i === 2 ? "#eff3ff" : "#fff" }}
                    >
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">{x.l}</p>
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: i === 2 ? "#1E3A8A" : "#334155" }}>
                        {x.v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Nota de cierre</p>
                <p className="text-[11px] leading-relaxed text-slate-600 rounded-xl p-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  {c.notaCierre}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.etiquetas.map(e => (
                    <span key={e} className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100 text-slate-500">
                      {e}
                    </span>
                  ))}
                  {c.etiquetas.length === 0 && <span className="text-[10px] text-slate-300">Sin etiquetas</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {[
                  { l: "Motivo de cierre", v: c.motivoCierre },
                  { l: "Canal", v: cl.label },
                  { l: "Radicado", v: c.radicado ?? "No generó radicado" },
                ].map(x => (
                  <div key={x.l} className="flex items-start justify-between gap-3">
                    <span className="text-[10px] text-slate-400 shrink-0">{x.l}</span>
                    <span className="text-[10px] font-semibold text-slate-600 text-right">{x.v}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <button className="w-full py-2 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer" style={{ background: "#1E3A8A" }}>
                  Reabrir conversación
                </button>
                <button className="w-full py-2 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
                  Corregir tipificación
                </button>
              </div>

              <p className="text-[9px] text-slate-300 leading-relaxed">
                La transcripción es un registro inmutable: se conserva cinco años para auditoría y no puede editarse
                después del cierre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Subvista Tipificaciones
───────────────────────────────────────────── */
export default function Tipificaciones({ historial, destacado }: Props) {
  const [vista, setVista] = useState<"historico" | "catalogo">("historico")
  const [abierta, setAbierta] = useState<ConversacionCerrada | null>(null)
  const [buscar, setBuscar] = useState("")
  const [filtroResultado, setFiltroResultado] = useState<"Todos" | ResultadoCierre>("Todos")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")

  const filtradas = historial.filter(c => {
    if (filtroResultado !== "Todos" && c.resultado !== filtroResultado) return false
    if (filtroCategoria !== "Todas" && c.tipificacion.categoria !== filtroCategoria) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      return (
        c.contacto.toLowerCase().includes(q) ||
        c.documento.includes(q) ||
        (c.radicado ?? "").toLowerCase().includes(q) ||
        c.tipificacion.motivo.toLowerCase().includes(q) ||
        c.notaCierre.toLowerCase().includes(q)
      )
    }
    return true
  })

  /* Indicadores del periodo */
  const calificadas = historial.filter(c => c.satisfaccion)
  const satisfaccion = calificadas.length
    ? Math.round((calificadas.reduce((a, c) => a + (c.satisfaccion ?? 0), 0) / calificadas.length) * 10) / 10
    : 0
  const resueltas = historial.filter(c => c.resultado === "Resuelto").length

  /* Uso por categoría, calculado sobre el histórico */
  const usoCategoria = catalogoTipificaciones.map(cat => ({
    ...cat,
    usos: historial.filter(h => h.tipificacion.categoria === cat.nombre).length,
  }))
  const maxUso = Math.max(...usoCategoria.map(c => c.usos), 1)

  const conteos: Record<string, number> = {
    Todos: historial.length,
    Resuelto: historial.filter(c => c.resultado === "Resuelto").length,
    Escalado: historial.filter(c => c.resultado === "Escalado").length,
    "Sin respuesta": historial.filter(c => c.resultado === "Sin respuesta").length,
    Reabierto: historial.filter(c => c.resultado === "Reabierto").length,
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Tipificaciones e histórico de chat</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada conversación cerrada o archivada queda registrada con su clasificación y su transcripción completa.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shrink-0">
          {([
            ["historico", "Histórico de chat"],
            ["catalogo", "Catálogo"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setVista(k)}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
              style={{
                background: vista === k ? "#1E3A8A" : "transparent",
                color: vista === k ? "#fff" : "#64748b",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ HISTÓRICO ═══════════ */}
      {vista === "historico" && (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Conversaciones cerradas", v: String(historial.length), c: "#1E3A8A", b: "#fff", bd: "#e2e8f0" },
              {
                l: "Resueltas",
                v: historial.length ? `${Math.round((resueltas / historial.length) * 100)}%` : "—",
                c: "#059669",
                b: "#ecfdf5",
                bd: "#a7f3d0",
              },
              { l: "Satisfacción media", v: `${satisfaccion} / 5`, c: "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
              { l: "Sin tipificar", v: "0", c: "#d97706", b: "#fffbeb", bd: "#fde68a" },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
                <p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {(["Todos", "Resuelto", "Escalado", "Sin respuesta", "Reabierto"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroResultado(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    filtroResultado === f
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                  }`}
                >
                  {f !== "Todos" && (
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: filtroResultado === f ? "#fff" : resultadoMeta[f].dot }}
                    />
                  )}
                  {f}
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                      filtroResultado === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {conteos[f]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
              >
                <option>Todas</option>
                {catalogoTipificaciones.map(c => (
                  <option key={c.id}>{c.nombre}</option>
                ))}
              </select>
              <div className="relative">
                <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                  placeholder="Buscar por ciudadano, radicado o motivo…"
                  className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-64 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Listado */}
          <div className="space-y-3">
            {filtradas.map(c => {
              const cl = canalLabel[c.canal]
              const rm = resultadoMeta[c.resultado]
              const esNueva = destacado === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setAbierta(c)}
                  className="w-full text-left bg-white rounded-2xl border p-4 hover:border-[#c7d7fe] hover:shadow-sm transition-all cursor-pointer group"
                  style={{ borderColor: esNueva ? "#0EA5E9" : "#e2e8f0" }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <Avatar name={c.contacto} size={40} />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ background: cl.bg }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cl.color }} />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{c.contacto}</h3>
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                          style={{ background: rm.bg, color: rm.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: rm.dot }} />
                          {c.resultado}
                        </span>
                        {esNueva && (
                          <span className="text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                            Recién cerrada
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{c.documento}</span>
                        {c.radicado && <> · <span className="font-mono">{c.radicado}</span></>} · {c.agente}
                      </p>

                      {/* Ruta de tipificación */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {[c.tipificacion.categoria, c.tipificacion.subcategoria, c.tipificacion.motivo].map((t, i) => (
                          <span key={t} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-slate-300 text-[10px]">›</span>}
                            <span
                              className="text-[10px] font-semibold rounded-md px-2 py-0.5"
                              style={
                                i === 2
                                  ? { background: "#eff3ff", color: "#1E3A8A" }
                                  : { background: "#f1f5f9", color: "#64748b" }
                              }
                            >
                              {t}
                            </span>
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed mt-2 line-clamp-2">{c.notaCierre}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                      <span className="text-[11px] font-mono text-slate-400">{c.cierre}</span>
                      <span className="text-[10px] text-slate-300">
                        {c.duracion} · {c.mensajesTotal} mensajes
                      </span>
                      <Estrellas valor={c.satisfaccion} />
                      <span className="text-[10px] font-semibold text-slate-300 group-hover:text-[#1E3A8A] transition-colors mt-1">
                        Ver conversación →
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            {filtradas.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-2">
                <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-slate-200">
                  <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-slate-400 font-medium">Sin conversaciones cerradas</p>
                <p className="text-xs text-slate-300">Ajusta los filtros o cierra una conversación activa</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════ CATÁLOGO ═══════════ */}
      {vista === "catalogo" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800">Cómo funciona una tipificación</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Al cerrar una conversación el asesor la clasifica en tres niveles. Esa ruta alimenta los informes y
              permite detectar los motivos de contacto más frecuentes.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {["Categoría", "Subcategoría", "Motivo"].map((n, i) => (
                <span key={n} className="flex items-center gap-2">
                  {i > 0 && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-300">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span
                    className="text-[11px] font-semibold rounded-lg px-3 py-1.5 border"
                    style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }}
                  >
                    {n}
                  </span>
                </span>
              ))}
              <span className="text-[11px] text-slate-400 ml-2">
                Ejemplo: Reclamo › Facturación › Cobro no reconocido
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {usoCategoria.map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
                  <span className="w-2 h-8 rounded-full shrink-0" style={{ background: cat.color }} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-800">{cat.nombre}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cat.subcategorias.length} subcategorías ·{" "}
                      {cat.subcategorias.reduce((a, s) => a + s.motivos.length, 0)} motivos
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color: cat.color }}>{cat.usos}</p>
                    <p className="text-[9px] text-slate-400">usos</p>
                  </div>
                </div>

                <div className="h-1 bg-slate-100">
                  <div className="h-full transition-all duration-700" style={{ width: `${(cat.usos / maxUso) * 100}%`, background: cat.color }} />
                </div>

                <div className="p-4 space-y-3">
                  {cat.subcategorias.map(sub => (
                    <div key={sub.nombre}>
                      <p className="text-[11px] font-semibold text-slate-600 mb-1.5">{sub.nombre}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.motivos.map(m => (
                          <span
                            key={m}
                            className="text-[10px] rounded-md px-2 py-1 border"
                            style={{ background: cat.bg, borderColor: "transparent", color: cat.color }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 flex justify-end" style={{ background: "#f8fafc" }}>
                  <button className="text-[10px] font-semibold text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer">
                    Editar categoría
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {abierta && <VisorTranscripcion c={abierta} onClose={() => setAbierta(null)} />}
    </div>
  )
}
