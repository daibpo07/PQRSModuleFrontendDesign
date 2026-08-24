import { useState } from "react"
import { Avatar, Bubble, DateSep, canalLabel } from "./EnviosIndividualesData"
import {
  estadoEspera,
  estadoTransferenciaEstilo,
  formatoDuracion,
  motivosRechazo,
  prioridadEstilo,
  SLA_ACEPTACION_MIN,
  ventanaMeta,
  type Transferencia,
} from "./TransferenciasData"

/* ─────────────────────────────────────────────
   Revisión de una transferencia recibida

   Antes de decidir, el asesor de destino necesita
   tres cosas en la misma pantalla: qué se habló,
   qué le dejó dicho el compañero y con qué reglas
   va a poder responder si acepta.
───────────────────────────────────────────── */

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
  )
}

function IconoCandado({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function TransferenciaModal({
  transferencia,
  soloLectura = false,
  onAceptar,
  onRechazar,
  onClose,
}: {
  transferencia: Transferencia
  /** Las transferencias ya resueltas y las enviadas se consultan, no se deciden. */
  soloLectura?: boolean
  onAceptar: (id: string) => void
  onRechazar: (id: string, motivo: string, nota: string) => void
  onClose: () => void
}) {
  const [rechazando, setRechazando] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [notaRechazo, setNotaRechazo] = useState("")
  const [error, setError] = useState("")

  const t = transferencia
  const cl = canalLabel[t.canal]
  const pr = prioridadEstilo[t.prioridad]
  const est = estadoTransferenciaEstilo[t.estado]
  const espera = estadoEspera(t.esperaMin)
  const ventana = ventanaMeta(t)
  const decidible = !soloLectura && t.estado === "pendiente"

  const confirmarRechazo = () => {
    if (!motivoRechazo) {
      setError("Elige un motivo: es lo que va a leer quien te la transfirió.")
      return
    }
    onRechazar(t.id, motivoRechazo, notaRechazo.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full border border-slate-100 overflow-hidden flex flex-col"
        style={{ maxWidth: 1040, height: "min(92vh, 780px)" }}
      >

        {/* ───── Encabezado ───── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <Avatar name={t.contacto} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 truncate">{t.contacto}</h3>
              <span
                className="text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0"
                style={{ background: cl.bg, color: cl.color }}
              >
                {cl.label}
              </span>
              {t.radicado && (
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{t.radicado}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              CC {t.documento} · {t.mensajes.filter(m => !m.sistema).length} mensajes ·{" "}
              {t.estado === "pendiente" ? "esperando tu decisión" : `transferencia ${est.label.toLowerCase()}`}
            </p>
          </div>

          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0"
            style={{ background: est.bg, color: est.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
            {est.label}
          </span>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer shrink-0"
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

        {/* ───── Cuerpo en dos columnas ───── */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_400px]">

          {/* ── Izquierda · la conversación hasta el momento ── */}
          <div className="flex flex-col min-h-0 border-r border-slate-100">
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <Etiqueta>Conversación hasta el momento</Etiqueta>
              <span className="text-[10px] text-slate-300 ml-auto">
                Inició {t.inicioConversacion.replace(" ", " · ")}
              </span>
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto px-5 py-4"
              style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #F8FAFC 100%)" }}
            >
              <DateSep label={`Atendida por ${t.origen.nombre}`} />
              {t.mensajes.map(m => (
                <Bubble key={m.id} msg={m} chatCanal={t.canal} conAcciones={false} />
              ))}

              {/* Cierra el hilo: deja claro dónde termina lo ya hecho */}
              <div className="flex justify-center mt-4">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-3 py-1.5 border"
                  style={{ background: "#eff3ff", borderColor: "#dce5fb", color: "#1E3A8A" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M10 3a1 1 0 011 1v5.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 9.586V4a1 1 0 011-1z" />
                  </svg>
                  {t.origen.nombre} te transfirió la conversación aquí · {t.solicitada}
                </span>
              </div>
            </div>

            {/* Pie de la transcripción: lo que ya se hizo, en una línea */}
            <div className="px-5 py-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-start gap-2">
                <svg viewBox="0 0 20 20" fill="#94a3b8" className="w-3.5 h-3.5 shrink-0 mt-px">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t.avance}</p>
              </div>
            </div>
          </div>

          {/* ── Derecha · el informe de la transferencia ── */}
          <div className="flex flex-col min-h-0 bg-[#FBFCFE]">
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">

              {/* Quién y por qué */}
              <div>
                <Etiqueta>Quién te la transfiere</Etiqueta>
                <div className="flex items-center gap-2.5 mt-2.5">
                  <Avatar name={t.origen.nombre} size={34} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{t.origen.nombre}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {t.origen.cargo} · {t.origen.equipo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Motivo</p>
                    <p className="text-[11px] font-semibold text-slate-700 mt-1 leading-snug">{t.motivo}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Prioridad</p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1"
                      style={{ background: pr.bg, color: pr.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pr.dot }} />
                      {t.prioridad}
                    </span>
                  </div>
                </div>
              </div>

              {/* ───── La nota interna ─────
                  Es lo que evita que el ciudadano tenga que repetir su historia,
                  así que va con el peso visual de una nota escrita a mano. */}
              <div>
                <div className="flex items-center gap-1.5">
                  <IconoCandado className="w-3 h-3 text-amber-600" />
                  <Etiqueta>Nota interna del asesor</Etiqueta>
                </div>
                <div
                  className="mt-2.5 rounded-xl border px-4 py-3.5"
                  style={{
                    background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)",
                    borderColor: "#fde68a",
                    boxShadow: "0 8px 20px -14px rgba(146,64,14,0.45)",
                  }}
                >
                  <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "#78350f" }}>
                    {t.notaInterna}
                  </p>
                  <p
                    className="text-[10px] font-semibold mt-3 pt-2.5 border-t"
                    style={{ color: "#b45309", borderColor: "rgba(180,83,9,0.20)" }}
                  >
                    — {t.origen.nombre} · {t.solicitada}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <IconoCandado className="w-2.5 h-2.5" />
                  Visible solo para el equipo. El ciudadano nunca la recibe.
                </p>
              </div>

              {/* ───── Los dos relojes ───── */}
              <div>
                <Etiqueta>Con qué reglas vas a responder</Etiqueta>

                {/* Reloj 1: cuánto lleva esperando la transferencia */}
                <div
                  className="mt-2.5 rounded-xl border px-3.5 py-3 flex items-center gap-3"
                  style={{ background: espera.bg, borderColor: espera.borde }}
                >
                  <svg viewBox="0 0 20 20" fill={espera.color} className="w-4 h-4 shrink-0">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold" style={{ color: espera.color }}>
                      Sin respuesta hace {formatoDuracion(t.esperaMin)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: espera.color, opacity: 0.75 }}>
                      {espera.id === "vencida"
                        ? `El ciudadano lleva esperando más de los ${SLA_ACEPTACION_MIN} min comprometidos`
                        : `${espera.texto} · el compromiso es responder en ${SLA_ACEPTACION_MIN} min`}
                    </p>
                  </div>
                </div>

                {/* Reloj 2: la ventana de 24 h de Meta */}
                {ventana.aplica ? (
                  <div
                    className="mt-2 rounded-xl border px-3.5 py-3"
                    style={{ background: ventana.bg, borderColor: ventana.borde }}
                  >
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 20 20" fill={ventana.color} className="w-4 h-4 shrink-0">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <p className="text-[11px] font-bold flex-1" style={{ color: ventana.color }}>
                        Ventana de 24 h de WhatsApp
                      </p>
                      <span className="text-[11px] font-mono font-bold" style={{ color: ventana.color }}>
                        {ventana.abierta ? formatoDuracion(ventana.restante) : "cerrada"}
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-white/70 mt-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ventana.porcentaje}%`, background: ventana.color }}
                      />
                    </div>

                    <p className="text-[10px] mt-2 leading-relaxed" style={{ color: ventana.color, opacity: 0.85 }}>
                      {ventana.abierta
                        ? "Puedes responder con texto libre. Si la ventana se cierra antes de que contestes, solo quedará la vía de una plantilla aprobada."
                        : "Ya no se puede responder con texto libre: para reabrir la conversación tendrás que enviar una plantilla aprobada."}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Por {cl.label} no aplica la ventana de 24 h de Meta: puedes responder cuando lo necesites.
                    </p>
                  </div>
                )}
              </div>

              {/* Etiquetas */}
              {t.etiquetas.length > 0 && (
                <div>
                  <Etiqueta>Etiquetas del caso</Etiqueta>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {t.etiquetas.map(e => (
                      <span
                        key={e}
                        className="text-[10px] font-semibold rounded-full px-2.5 py-1 border border-slate-200 bg-white text-slate-600"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolución, cuando ya se decidió */}
              {t.respuesta && (
                <div>
                  <Etiqueta>Resolución</Etiqueta>
                  <div
                    className="mt-2.5 rounded-xl border px-3.5 py-3"
                    style={{ background: est.bg, borderColor: est.dot + "40" }}
                  >
                    <p className="text-[11px] font-bold" style={{ color: est.text }}>
                      {est.label} · {t.respuesta.hora}
                    </p>
                    {t.respuesta.motivo && (
                      <p className="text-[11px] font-semibold mt-1.5" style={{ color: est.text }}>
                        {t.respuesta.motivo}
                      </p>
                    )}
                    {t.respuesta.nota && (
                      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: est.text, opacity: 0.85 }}>
                        {t.respuesta.nota}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ───── Decisión ───── */}
            {decidible && (
              <div className="border-t border-slate-200 bg-white p-4 shrink-0">
                {!rechazando ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setRechazando(true)
                          setError("")
                        }}
                        className="px-4 py-3 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => onAceptar(t.id)}
                        className="flex-1 py-3 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
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
                        Aceptar y atender
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed">
                      Al aceptar, la conversación pasa a tu bandeja con todo el historial y {t.origen.nombre}{" "}
                      queda notificado.
                    </p>
                  </>
                ) : (
                  /* Rechazar no es un botón suelto: el caso vuelve a alguien
                     que necesita saber por qué, o el ciudadano queda en el limbo. */
                  <div>
                    <div className="flex items-center gap-2">
                      <Etiqueta>Motivo del rechazo</Etiqueta>
                      <span className="text-[9px] font-bold text-red-500">Obligatorio</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {motivosRechazo.map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            setMotivoRechazo(m)
                            setError("")
                          }}
                          className="text-[10px] font-semibold rounded-full px-2.5 py-1.5 border transition-all cursor-pointer"
                          style={{
                            background: motivoRechazo === m ? "#1E3A8A" : "#fff",
                            borderColor: motivoRechazo === m ? "#1E3A8A" : "#e2e8f0",
                            color: motivoRechazo === m ? "#fff" : "#64748b",
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={notaRechazo}
                      onChange={e => setNotaRechazo(e.target.value)}
                      rows={2}
                      placeholder={`¿A quién debería ir? Escríbelo aquí para ${t.origen.nombre}.`}
                      className="w-full mt-2.5 px-3 py-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all resize-none"
                    />

                    {error && <p className="text-[10px] font-semibold text-red-500 mt-1.5">{error}</p>}

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setRechazando(false)
                          setError("")
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Volver
                      </button>
                      <button
                        onClick={confirmarRechazo}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98]"
                        style={{ background: "#dc2626" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
                      >
                        Devolver a {t.origen.nombre}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!decidible && (
              <div className="border-t border-slate-200 bg-white p-4 shrink-0">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
