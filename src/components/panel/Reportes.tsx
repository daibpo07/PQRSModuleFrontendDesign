import { useState } from "react"
import {
  formatoMeta,
  modulos,
  ordenModulos,
  reportes as reportesIniciales,
  tinta,
  type ModuloId,
  type Reporte,
} from "./PanelData"

/* ─────────────────────────────────────────────
   Constructor de reportes
───────────────────────────────────────────── */
const metricasPorModulo: Record<ModuloId | "transversal", string[]> = {
  transversal: ["Casos gestionados", "Cumplimiento de SLA", "Tiempo medio de resolución", "Costo de mensajería", "Consumo del plan"],
  pqrs: ["Radicados recibidos", "Cerrados en término", "Tiempo medio de respuesta", "Reaperturas", "Volumen por dependencia", "Volumen por tipo"],
  masivos: ["Mensajes despachados", "Tasa de entrega", "Tasa de lectura", "Rebotes por causa", "Costo por respuesta", "Rendimiento por plantilla"],
  individuales: ["Conversaciones atendidas", "Primera respuesta", "Resueltas en primer contacto", "Satisfacción media", "Volumen por tipificación"],
  flujos: ["Ejecuciones completadas", "Cumplimiento de SLA", "Duración media", "Pasos devueltos", "Carga por persona", "Cuellos de botella"],
}

const agrupaciones = ["Día", "Semana", "Mes", "Dependencia", "Responsable", "Canal"]

function ConstructorReporte({
  onClose,
  onCrear,
}: {
  onClose: () => void
  onCrear: (r: Reporte) => void
}) {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState("")
  const [modulo, setModulo] = useState<ModuloId | "transversal">("transversal")
  const [metricas, setMetricas] = useState<string[]>([])
  const [agrupacion, setAgrupacion] = useState("Semana")
  const [formato, setFormato] = useState<Reporte["formato"]>("PDF")
  const [frecuencia, setFrecuencia] = useState<Reporte["frecuencia"]>("Mensual")
  const [destinatarios, setDestinatarios] = useState("")
  const [error, setError] = useState("")

  const pasos = ["Origen", "Métricas", "Entrega"]
  const disponibles = metricasPorModulo[modulo]

  const validar = (n: number) => {
    if (n === 1 && nombre.trim().length < 5) {
      setError("Dale un nombre de al menos 5 caracteres al reporte")
      return false
    }
    if (n === 2 && metricas.length === 0) {
      setError("Selecciona al menos una métrica")
      return false
    }
    setError("")
    return true
  }

  const crear = () => {
    if (!validar(1) || !validar(2)) {
      setPaso(nombre.trim().length < 5 ? 1 : 2)
      return
    }
    onCrear({
      id: `r${Date.now()}`,
      nombre: nombre.trim(),
      modulo,
      descripcion: `${metricas.length} métricas agrupadas por ${agrupacion.toLowerCase()}.`,
      formato,
      frecuencia,
      ultimaGeneracion: "—",
      destinatarios: destinatarios
        .split(",")
        .map(d => d.trim())
        .filter(Boolean),
      activo: frecuencia !== "Manual",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ height: "min(92vh, 680px)" }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                Nuevo reporte
              </h3>
              <p className="text-xs" style={{ color: tinta.suave }}>
                Elige el origen, las métricas y cómo se entrega
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-0 mt-4">
            {pasos.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i + 1 < paso && setPaso(i + 1)}
                  className={`flex items-center gap-2 ${i + 1 < paso ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0"
                    style={{
                      background: i + 1 <= paso ? "#1E3A8A" : "#fff",
                      borderColor: i + 1 <= paso ? "#1E3A8A" : "#e2e8f0",
                      color: i + 1 <= paso ? "#fff" : tinta.suave,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[11px] font-semibold whitespace-nowrap hidden sm:block"
                    style={{ color: i + 1 <= paso ? "#1E3A8A" : tinta.suave }}
                  >
                    {s}
                  </span>
                </button>
                {i < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3" style={{ background: i + 1 < paso ? "#1E3A8A" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: "#f8fafc" }}>
          {paso === 1 && (
            <>
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                  Nombre del reporte
                </label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  autoFocus
                  placeholder="Ej. Cumplimiento mensual por dependencia"
                  className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                  style={{ borderColor: error ? "#fca5a5" : "#e2e8f0", color: tinta.fuerte }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-2" style={{ color: tinta.medio }}>
                  Origen de los datos
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setModulo("transversal")
                      setMetricas([])
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                    style={{
                      borderColor: modulo === "transversal" ? "#1E3A8A" : "#e2e8f0",
                      background: modulo === "transversal" ? "#eff3ff" : "#fff",
                    }}
                  >
                    <span className="flex gap-0.5 shrink-0">
                      {ordenModulos.map(id => (
                        <span key={id} className="w-1.5 h-4 rounded-sm" style={{ background: modulos[id].color }} />
                      ))}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold" style={{ color: tinta.fuerte }}>
                        Transversal
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
                        Combina métricas de todos los módulos contratados
                      </p>
                    </div>
                  </button>

                  {ordenModulos.map(id => {
                    const mm = modulos[id]
                    const sel = modulo === id
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setModulo(id)
                          setMetricas([])
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                        style={{ borderColor: sel ? mm.color : "#e2e8f0", background: sel ? mm.bg : "#fff" }}
                      >
                        <span className="w-1.5 h-4 rounded-sm shrink-0" style={{ background: mm.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold" style={{ color: tinta.fuerte }}>
                            {mm.nombre}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
                            {mm.descripcion}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <div>
                <p className="text-[11px] font-semibold mb-2" style={{ color: tinta.medio }}>
                  Métricas a incluir
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {disponibles.map(met => {
                    const sel = metricas.includes(met)
                    return (
                      <button
                        key={met}
                        onClick={() => setMetricas(p => (sel ? p.filter(x => x !== met) : [...p, met]))}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer"
                        style={{ borderColor: sel ? "#1E3A8A" : "#e2e8f0", background: sel ? "#eff3ff" : "#fff" }}
                      >
                        <span
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2"
                          style={{ background: sel ? "#1E3A8A" : "#fff", borderColor: sel ? "#1E3A8A" : "#cbd5e1" }}
                        >
                          {sel && (
                            <svg viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: tinta.medio }}>
                          {met}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold mb-2" style={{ color: tinta.medio }}>
                  Agrupar por
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {agrupaciones.map(a => (
                    <button
                      key={a}
                      onClick={() => setAgrupacion(a)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                      style={{
                        background: agrupacion === a ? "#1E3A8A" : "#fff",
                        color: agrupacion === a ? "#fff" : tinta.medio,
                        borderColor: agrupacion === a ? "#1E3A8A" : "#e2e8f0",
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {paso === 3 && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                    Formato
                  </label>
                  <div className="flex gap-1.5">
                    {(["PDF", "Excel", "CSV"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormato(f)}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold border-2 transition-all cursor-pointer"
                        style={{
                          borderColor: formato === f ? formatoMeta[f].color : "#e2e8f0",
                          background: formato === f ? formatoMeta[f].bg : "#fff",
                          color: formato === f ? formatoMeta[f].color : tinta.suave,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                    Frecuencia
                  </label>
                  <select
                    value={frecuencia}
                    onChange={e => setFrecuencia(e.target.value as Reporte["frecuencia"])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                    style={{ color: tinta.fuerte }}
                  >
                    {["Manual", "Diario", "Semanal", "Mensual"].map(f => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                  Destinatarios <span className="font-normal" style={{ color: tinta.tenue }}>(separados por coma)</span>
                </label>
                <input
                  value={destinatarios}
                  onChange={e => setDestinatarios(e.target.value)}
                  placeholder="direccion@pqrslab.com, calidad@pqrslab.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                  style={{ color: tinta.fuerte }}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
                    Resumen
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { l: "Nombre", v: nombre || "—" },
                    { l: "Origen", v: modulo === "transversal" ? "Transversal" : modulos[modulo].nombre },
                    { l: "Métricas", v: `${metricas.length} seleccionadas` },
                    { l: "Agrupación", v: agrupacion },
                    { l: "Entrega", v: `${formato} · ${frecuencia}` },
                  ].map(f => (
                    <div key={f.l} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <span className="text-[11px]" style={{ color: tinta.suave }}>
                        {f.l}
                      </span>
                      <span className="text-[11px] font-semibold text-right" style={{ color: tinta.fuerte }}>
                        {f.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-[11px] text-red-500 rounded-lg px-3 py-2" style={{ background: "#fef2f2" }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={() => (paso === 1 ? onClose() : setPaso(p => p - 1))}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            style={{ color: tinta.medio }}
          >
            {paso === 1 ? "Cancelar" : "Atrás"}
          </button>
          <p className="text-[11px] hidden sm:block ml-1" style={{ color: tinta.suave }}>
            Paso {paso} de 3 · {pasos[paso - 1]}
          </p>
          <button
            onClick={() => (paso === 3 ? crear() : validar(paso) && setPaso(p => p + 1))}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {paso === 3 ? "Crear reporte" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Subvista Reportes
───────────────────────────────────────────── */
export default function Reportes() {
  const [lista, setLista] = useState<Reporte[]>(reportesIniciales)
  const [filtro, setFiltro] = useState<"Todos" | ModuloId | "transversal">("Todos")
  const [constructor, setConstructor] = useState(false)

  const visibles = filtro === "Todos" ? lista : lista.filter(r => r.modulo === filtro)
  const programados = lista.filter(r => r.activo).length

  const etiquetaOrigen = (m: Reporte["modulo"]) => (m === "transversal" ? "Transversal" : modulos[m].corto)
  const colorOrigen = (m: Reporte["modulo"]) => (m === "transversal" ? "#1E3A8A" : modulos[m].color)

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
            Reportería
          </h2>
          <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
            Informes de cualquier módulo, generados a demanda o programados con envío automático.
          </p>
        </div>
        <button
          onClick={() => setConstructor(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo reporte
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Reportes definidos", v: String(lista.length), c: "#1E3A8A", b: "#fff", bd: "#e2e8f0" },
          { l: "Con envío programado", v: String(programados), c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
          { l: "Generados este mes", v: "34", c: "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
          { l: "Destinatarios únicos", v: "7", c: "#7c3aed", b: "#ede9fe", bd: "#ddd6fe" },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
            <p className="text-2xl font-bold" style={{ color: s.c }}>
              {s.v}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: tinta.medio }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["Todos", "transversal", ...ordenModulos] as const).map(f => {
          const activo = filtro === f
          const color = f === "Todos" ? null : f === "transversal" ? "#1E3A8A" : modulos[f].color
          const label = f === "Todos" ? "Todos" : f === "transversal" ? "Transversal" : modulos[f].corto
          const cuantos = f === "Todos" ? lista.length : lista.filter(r => r.modulo === f).length
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activo
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
              }`}
            >
              {color && <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: activo ? "#fff" : color }} />}
              {label}
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                  activo ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {cuantos}
              </span>
            </button>
          )
        })}
      </div>

      {/* Listado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {visibles.map(r => {
            const fm = formatoMeta[r.formato]
            return (
              <div key={r.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors group">
                <span className="w-1.5 h-10 rounded-sm shrink-0 mt-0.5" style={{ background: colorOrigen(r.modulo) }} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                      {r.nombre}
                    </p>
                    <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: fm.bg, color: fm.color }}>
                      {r.formato}
                    </span>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100" style={{ color: tinta.medio }}>
                      {etiquetaOrigen(r.modulo)}
                    </span>
                    {r.activo ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
                        style={{ background: "#d1fae5", color: "#065f46" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                        {r.frecuencia}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100" style={{ color: tinta.suave }}>
                        Manual
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: tinta.medio }}>
                    {r.descripcion}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap mt-2">
                    <span className="text-[10px]" style={{ color: tinta.suave }}>
                      Última generación{" "}
                      <span className="font-mono font-semibold" style={{ color: tinta.medio }}>
                        {r.ultimaGeneracion}
                      </span>
                    </span>
                    {r.destinatarios.length > 0 && (
                      <span className="text-[10px]" style={{ color: tinta.suave }}>
                        Se envía a{" "}
                        <span className="font-semibold" style={{ color: tinta.medio }}>
                          {r.destinatarios.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer"
                    style={{ background: "#1E3A8A" }}
                  >
                    Generar
                  </button>
                  <button
                    onClick={() => setLista(p => p.map(x => (x.id === r.id ? { ...x, activo: !x.activo } : x)))}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-white transition-all cursor-pointer"
                    style={{ color: tinta.medio }}
                  >
                    {r.activo ? "Pausar" : "Programar"}
                  </button>
                  <button
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    style={{ color: tinta.suave }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            )
          })}

          {visibles.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-2">
              <p className="text-sm font-medium" style={{ color: tinta.suave }}>
                Sin reportes para este origen
              </p>
              <p className="text-xs" style={{ color: tinta.tenue }}>
                Crea uno nuevo o cambia el filtro
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#eff3ff" }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[11px] leading-relaxed" style={{ color: tinta.medio }}>
          Los reportes solo pueden usar datos de los módulos contratados. Si activas un módulo nuevo, sus métricas
          aparecen automáticamente como origen disponible en el constructor.
        </p>
      </div>

      {constructor && (
        <ConstructorReporte
          onClose={() => setConstructor(false)}
          onCrear={r => {
            setLista(p => [r, ...p])
            setConstructor(false)
          }}
        />
      )}
    </div>
  )
}
