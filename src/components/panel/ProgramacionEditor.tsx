import { useMemo, useState } from "react"
import { formatoMeta, modulos, reportes, tinta, type Reporte } from "./PanelData"
import {
  analisisDeMuestra,
  analisisDisponibles,
  diasSemana,
  type FrecuenciaEnvio,
  type Programacion,
} from "./ReporteriaData"

/* ─────────────────────────────────────────────
   Configurar un envío periódico

   A la izquierda se arma; a la derecha se ve el
   correo exacto que va a recibir el destinatario,
   análisis de IA incluido. Y antes de activarlo
   se puede mandar una prueba: nadie debería
   enterarse de que el formato quedó mal por un
   correo del director.
───────────────────────────────────────────── */

export const CORREO_SESION = "dairon.betancur@pqrslab.com"

const frecuencias: FrecuenciaEnvio[] = ["Diario", "Semanal", "Quincenal", "Mensual"]
const horas = ["06:00", "07:00", "08:00", "08:30", "12:00", "17:00", "18:00", "20:00"]

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

const esCorreo = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

/** El asunto admite variables que se resuelven al despachar. */
function resolverAsunto(asunto: string) {
  return asunto.replace(/\{\{mes\}\}/g, "septiembre 2026").replace(/\{\{fecha\}\}/g, "22 sep 2026")
}

export default function ProgramacionEditor({
  inicial,
  reportePrevio,
  onClose,
  onGuardar,
}: {
  inicial?: Programacion
  /** Cuando se llega desde la estimación, el reporte ya viene elegido. */
  reportePrevio?: Reporte
  onClose: () => void
  onGuardar: (p: Programacion) => void
}) {
  const base = reportePrevio ?? reportes.find(r => r.id === inicial?.reporteId) ?? reportes[0]

  const [nombre, setNombre] = useState(inicial?.nombre ?? (reportePrevio ? `Envío de ${reportePrevio.nombre}` : ""))
  const [reporteId, setReporteId] = useState(inicial?.reporteId ?? base.id)
  const [formato, setFormato] = useState<Reporte["formato"]>(inicial?.formato ?? base.formato)
  const [frecuencia, setFrecuencia] = useState<FrecuenciaEnvio>(inicial?.frecuencia ?? "Semanal")
  const [dia, setDia] = useState(inicial?.dia ?? "Lunes")
  const [hora, setHora] = useState(inicial?.hora ?? "07:00")
  const [destinatarios, setDestinatarios] = useState<string[]>(inicial?.destinatarios ?? [])
  const [borradorCorreo, setBorradorCorreo] = useState("")
  const [asunto, setAsunto] = useState(inicial?.asunto ?? "Indicadores de {{mes}} · Pqrslab")
  const [analisis, setAnalisis] = useState<string[]>(inicial?.analisis ?? ["resumen", "desvios"])
  const [error, setError] = useState("")

  const [prueba, setPrueba] = useState<"inactivo" | "enviando" | "enviado">("inactivo")
  const [horaPrueba, setHoraPrueba] = useState("")

  const reporte = reportes.find(r => r.id === reporteId) ?? base
  const fm = formatoMeta[formato]
  const colorOrigen = reporte.modulo === "transversal" ? "#1E3A8A" : modulos[reporte.modulo].color
  const conIA = analisis.length > 0

  const cuandoSeEnvia = useMemo(() => {
    if (frecuencia === "Diario") return `Todos los días a las ${hora}`
    if (frecuencia === "Semanal") return `Cada ${dia.toLowerCase()} a las ${hora}`
    if (frecuencia === "Quincenal") return `Los días 1 y 15 a las ${hora}`
    return `El día ${dia} de cada mes a las ${hora}`
  }, [frecuencia, dia, hora])

  const agregarCorreo = () => {
    const c = borradorCorreo.trim().toLowerCase()
    if (!c) return
    if (!esCorreo(c)) {
      setError("Ese correo no tiene un formato válido")
      return
    }
    if (destinatarios.includes(c)) {
      setError("Ese destinatario ya está en la lista")
      return
    }
    setDestinatarios(d => [...d, c])
    setBorradorCorreo("")
    setError("")
  }

  const alternarAnalisis = (id: string) =>
    setAnalisis(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]))

  const validar = () => {
    if (nombre.trim().length < 5) {
      setError("Ponle un nombre de al menos 5 caracteres a la programación")
      return false
    }
    if (destinatarios.length === 0) {
      setError("Agrega al menos un destinatario: sin correo no hay a quién enviarle")
      return false
    }
    setError("")
    return true
  }

  /* La prueba va solo a quien la dispara, nunca a la lista real */
  const enviarPrueba = () => {
    if (nombre.trim().length < 5) {
      setError("Ponle nombre a la programación antes de enviar la prueba")
      return
    }
    setError("")
    setPrueba("enviando")
    setTimeout(() => {
      setPrueba("enviado")
      setHoraPrueba(
        new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
      )
    }, 900)
  }

  const guardar = () => {
    if (!validar()) return
    onGuardar({
      id: inicial?.id ?? `p${Date.now()}`,
      nombre: nombre.trim(),
      reporteId,
      reporteNombre: reporte.nombre,
      modulo: reporte.modulo,
      formato,
      frecuencia,
      dia: frecuencia === "Diario" ? "—" : dia,
      hora,
      destinatarios,
      asunto,
      analisis,
      estado: inicial?.estado === "Pausado" ? "Pausado" : "Activo",
      proximoEnvio: inicial?.proximoEnvio ?? "29 sep 2026 · " + hora,
      ultimoEnvio: inicial?.ultimoEnvio,
      aperturas: inicial?.aperturas,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full border border-slate-100 overflow-hidden flex flex-col"
        style={{ maxWidth: 1060, height: "min(92vh, 800px)" }}
      >

        {/* ───── Encabezado ───── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#eff3ff", color: "#1E3A8A" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">
              {inicial ? "Editar envío programado" : "Nuevo envío programado"}
            </h3>
            <p className="text-xs text-slate-400 truncate">{cuandoSeEnvia}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_400px]">

          {/* ═══════ Configuración ═══════ */}
          <div className="min-h-0 overflow-y-auto p-6 space-y-6 border-r border-slate-100">

            {/* Qué se envía */}
            <div>
              <Etiqueta>Qué se envía</Etiqueta>

              <input
                value={nombre}
                onChange={e => {
                  setNombre(e.target.value)
                  setError("")
                }}
                placeholder="Nombre de la programación · ej. Comité de dirección"
                className="w-full mt-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
              />

              <div className="grid sm:grid-cols-[1fr_120px] gap-2.5 mt-2.5">
                <select
                  value={reporteId}
                  onChange={e => setReporteId(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
                >
                  {reportes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={formato}
                  onChange={e => setFormato(e.target.value as Reporte["formato"])}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
                >
                  {(["PDF", "Excel", "CSV"] as const).map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cuándo */}
            <div>
              <Etiqueta>Cuándo</Etiqueta>

              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                {frecuencias.map(f => {
                  const activo = frecuencia === f
                  return (
                    <button
                      key={f}
                      onClick={() => setFrecuencia(f)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                      style={{
                        background: activo ? "#1E3A8A" : "#fff",
                        borderColor: activo ? "#1E3A8A" : "#e2e8f0",
                        color: activo ? "#fff" : "#64748b",
                      }}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
                {frecuencia !== "Diario" && frecuencia !== "Quincenal" && (
                  <select
                    value={dia}
                    onChange={e => setDia(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
                  >
                    {frecuencia === "Semanal"
                      ? diasSemana.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))
                      : ["1", "5", "10", "15", "20", "25", "Último día"].map(d => (
                          <option key={d} value={d}>
                            Día {d}
                          </option>
                        ))}
                  </select>
                )}

                <select
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
                >
                  {horas.map(h => (
                    <option key={h} value={h}>
                      {h} · hora de Bogotá
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5">{cuandoSeEnvia}.</p>
            </div>

            {/* A quién */}
            <div>
              <Etiqueta>A quién</Etiqueta>

              <div className="flex items-center gap-2 mt-2.5">
                <input
                  value={borradorCorreo}
                  onChange={e => {
                    setBorradorCorreo(e.target.value)
                    setError("")
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      agregarCorreo()
                    }
                  }}
                  placeholder="correo@organizacion.com y Enter"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                />
                <button
                  onClick={agregarCorreo}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0"
                >
                  Agregar
                </button>
              </div>

              {destinatarios.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {destinatarios.map(d => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full pl-2.5 pr-1.5 py-1 border border-slate-200 bg-slate-50 text-slate-600"
                    >
                      {d}
                      <button
                        onClick={() => setDestinatarios(l => l.filter(x => x !== d))}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-200 hover:text-slate-600 transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                placeholder="Asunto del correo"
                className="w-full mt-3 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Puedes usar <code className="font-mono text-slate-500">{"{{mes}}"}</code> y{" "}
                <code className="font-mono text-slate-500">{"{{fecha}}"}</code>: se reemplazan al despachar.
              </p>
            </div>

            {/* ───── Análisis con IA ───── */}
            <div>
              <div className="flex items-center gap-2">
                <Etiqueta>Análisis con IA</Etiqueta>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
                  style={{ background: conIA ? "#ede9fe" : "#f1f5f9", color: conIA ? "#6d28d9" : "#94a3b8" }}
                >
                  {conIA ? `${analisis.length} activos` : "desactivado"}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                El correo puede llegar con las cifras ya leídas. Sin esto el destinatario recibe un adjunto que
                casi nadie abre; con esto recibe el titular en el cuerpo del mensaje.
              </p>

              <div className="flex flex-col gap-1.5 mt-3">
                {analisisDisponibles.map(a => {
                  const activo = analisis.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => alternarAnalisis(a.id)}
                      className="flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer"
                      style={{
                        borderColor: activo ? "#ddd6fe" : "#e2e8f0",
                        background: activo ? "#f9f7ff" : "#fff",
                      }}
                    >
                      <span
                        className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-all mt-px"
                        style={{
                          background: activo ? "#7c3aed" : "#fff",
                          borderColor: activo ? "#7c3aed" : "#cbd5e1",
                        }}
                      >
                        {activo && (
                          <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-700">{a.nombre}</span>
                        <span className="block text-[10px] text-slate-400 leading-snug mt-0.5">{a.descripcion}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {conIA && (
                <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
                  El modelo solo lee los datos de este reporte. Si un indicador no está en el origen elegido, no
                  aparece en el análisis.
                </p>
              )}
            </div>

            {/* ───── Envío de prueba ───── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <Etiqueta>Antes de activarlo</Etiqueta>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Manda una prueba a tu propio correo y revisa cómo se ve el adjunto y el análisis. La prueba{" "}
                <span className="font-semibold">no llega a los destinatarios</span> de la lista.
              </p>

              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                <button
                  onClick={enviarPrueba}
                  disabled={prueba === "enviando"}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:cursor-wait"
                  style={{ borderColor: "#c7d7fb", background: "#fff", color: "#1E3A8A" }}
                >
                  {prueba === "enviando" ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      Enviar prueba a mi correo
                    </>
                  )}
                </button>
                <span className="text-[10px] font-mono text-slate-400">{CORREO_SESION}</span>
              </div>

              {prueba === "enviado" && (
                <div
                  className="flex items-start gap-2 mt-3 rounded-lg border px-3 py-2.5"
                  style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
                >
                  <svg viewBox="0 0 20 20" fill="#059669" className="w-3.5 h-3.5 shrink-0 mt-px">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#065f46" }}>
                    Prueba enviada a las {horaPrueba}. Revisa tu bandeja: si el formato no es el que esperabas,
                    ajusta aquí y vuelve a probar antes de activar.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-px">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-[11px] font-medium" style={{ color: "#991b1b" }}>
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* ═══════ Vista previa del correo ═══════ */}
          <div className="min-h-0 flex flex-col bg-[#FBFCFE]">
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <Etiqueta>Así llega el correo</Etiqueta>
              <span className="ml-auto text-[10px] text-slate-300">vista previa en vivo</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Cabecera del cliente de correo */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ background: "#1E3A8A" }}
                    >
                      CC
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">Concept CRM · Pqrslab</p>
                      <p className="text-[9px] text-slate-400 truncate">
                        para {destinatarios.length ? destinatarios.join(", ") : "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2.5 leading-snug">
                    {resolverAsunto(asunto) || "Sin asunto"}
                  </p>
                </div>

                {/* Franja del origen */}
                <div style={{ height: 3, background: colorOrigen }} />

                <div className="p-4">
                  <p className="text-[13px] font-bold text-slate-800 leading-snug">{reporte.nombre}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Periodo cerrado el 22 sep 2026 · generado automáticamente
                  </p>

                  {/* Indicadores de portada */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5">
                    {[
                      { l: "Casos", v: "12.480" },
                      { l: "SLA", v: "94,1 %" },
                      { l: "Δ mes", v: "+8,4 %" },
                    ].map(k => (
                      <div key={k.l} className="rounded-lg border border-slate-200 px-2.5 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{k.l}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: tinta.fuerte }}>
                          {k.v}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bloques de análisis */}
                  {conIA ? (
                    <div
                      className="rounded-xl border p-3.5 mt-4"
                      style={{ background: "#f9f7ff", borderColor: "#ddd6fe" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <svg viewBox="0 0 20 20" fill="#7c3aed" className="w-3.5 h-3.5">
                          <path d="M11 3a1 1 0 10-2 0v1.07A6.002 6.002 0 004.07 9H3a1 1 0 000 2h1.07A6.002 6.002 0 009 15.93V17a1 1 0 102 0v-1.07A6.002 6.002 0 0015.93 11H17a1 1 0 100-2h-1.07A6.002 6.002 0 0011 4.07V3zm-1 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#6d28d9" }}>
                          Lectura automática
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 mt-3">
                        {analisisDisponibles
                          .filter(a => analisis.includes(a.id))
                          .map(a => {
                            const m = analisisDeMuestra[a.id]
                            return (
                              <div key={a.id}>
                                <p className="text-[11px] font-bold" style={{ color: "#5b21b6" }}>
                                  {m.titulo}
                                </p>
                                <p className="text-[10px] leading-relaxed mt-1" style={{ color: "#6d28d9" }}>
                                  {m.cuerpo}
                                </p>
                              </div>
                            )
                          })}
                      </div>

                      <p className="text-[9px] mt-3 pt-2.5 border-t leading-relaxed" style={{ color: "#7c3aed", opacity: 0.7, borderColor: "#ddd6fe" }}>
                        Redactado por el modelo sobre las cifras del periodo. Verifica antes de decidir sobre él.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed rounded-lg border border-dashed border-slate-200 p-3">
                      Sin análisis: el correo llega solo con el adjunto y los tres indicadores de arriba.
                    </p>
                  )}

                  {/* Adjunto */}
                  <div className="flex items-center gap-2.5 mt-4 rounded-lg border border-slate-200 px-3 py-2.5">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ background: fm.bg, color: fm.color }}
                    >
                      {formato === "Excel" ? "XLS" : formato}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-slate-600 truncate">
                        {reporte.nombre.toLowerCase().replace(/\s+/g, "-")}-2026-09.
                        {formato === "Excel" ? "xlsx" : formato.toLowerCase()}
                      </p>
                      <p className="text-[9px] text-slate-400">Adjunto</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-300 mt-4 leading-relaxed">
                    Recibes este correo porque estás en la lista de «{nombre || "sin nombre"}». Para dejar de
                    recibirlo, responde a este mensaje o pídelo al administrador del tenant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───── Pie ───── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            {destinatarios.length} {destinatarios.length === 1 ? "destinatario" : "destinatarios"} ·{" "}
            {conIA ? `${analisis.length} análisis` : "sin análisis"}
          </span>
          <button
            onClick={guardar}
            className="ml-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] flex items-center gap-2"
            style={{ background: "#1E3A8A", boxShadow: "0 10px 24px -12px rgba(30,58,138,0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {inicial ? "Guardar cambios" : "Activar envío"}
          </button>
        </div>
      </div>
    </div>
  )
}
