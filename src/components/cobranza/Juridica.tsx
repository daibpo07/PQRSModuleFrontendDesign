import { useState } from "react"
import {
  colorAvatar,
  cop,
  copCorto,
  iniciales,
  nf,
  prescripcion,
  saldoDeudor,
  type Deudor,
  type EtapaProcesal,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Gestión jurídica

   Dos trabajos distintos en una sola pantalla:
   los procesos que ya están en el juzgado y las
   obligaciones que deberían estarlo. Lo segundo
   es lo que se olvida, y es lo que prescribe.
───────────────────────────────────────────── */

type Vista = "expedientes" | "candidatos" | "plantillas"

const etapas: EtapaProcesal[] = [
  "Preparación",
  "Radicada",
  "Mandamiento de pago",
  "Notificación",
  "Medidas cautelares",
  "Sentencia",
  "Terminado",
]

const plantillas = [
  {
    id: "pl1",
    nombre: "Demanda ejecutiva singular",
    descripcion: "Mínima y menor cuantía con pagaré como título ejecutivo.",
    usos: 128,
    campos: ["Datos del ejecutado", "Obligación y saldo", "Juzgado competente", "Pretensiones"],
  },
  {
    id: "pl2",
    nombre: "Solicitud de medidas cautelares",
    descripcion: "Embargo y retención de sumas de dinero e inscripción de demanda.",
    usos: 94,
    campos: ["Bienes identificados", "Cuantía de la medida", "Entidad destinataria"],
  },
  {
    id: "pl3",
    nombre: "Notificación personal (art. 291 CGP)",
    descripcion: "Citación para notificación personal del mandamiento de pago.",
    usos: 112,
    campos: ["Dirección de notificación", "Radicado", "Fecha de citación"],
  },
  {
    id: "pl4",
    nombre: "Liquidación del crédito",
    descripcion: "Liquidación de capital, intereses y costas para aprobación del juzgado.",
    usos: 61,
    campos: ["Capital", "Intereses de mora", "Agencias en derecho"],
  },
]

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

export default function Juridica({
  deudores,
  expedienteInicial,
  onConsumirInicial,
  onAbrirDeudor,
}: {
  deudores: Deudor[]
  expedienteInicial?: Deudor | null
  onConsumirInicial: () => void
  onAbrirDeudor: (d: Deudor) => void
}) {
  const [vista, setVista] = useState<Vista>("expedientes")
  const [abierto, setAbierto] = useState<string | null>(expedienteInicial?.id ?? null)
  const [sincronizando, setSincronizando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const conProceso = deudores.filter(d => d.expediente)
  const cuantiaTotal = conProceso.reduce((a, d) => a + (d.expediente?.cuantia ?? 0), 0)
  const desactualizados = conProceso.filter(d => d.expediente!.rpa.estado !== "Sincronizado").length
  const quietos = conProceso.filter(d => d.expediente!.diasSinActuacion > 60).length

  /* Candidatos: todavía no están demandados y el reloj de prescripción aprieta */
  const candidatos = deudores
    .filter(d => !d.expediente)
    .map(d => ({ d, p: d.obligaciones.map(o => prescripcion(o)).sort((a, b) => a.dias - b.dias)[0] }))
    .filter(x => x.p.nivel !== "holgada" || x.d.obligaciones.some(o => o.diasMora > 360))
    .sort((a, b) => a.p.dias - b.p.dias)

  const sincronizar = () => {
    setSincronizando(true)
    setTimeout(() => {
      setSincronizando(false)
      setAviso(`Rama Judicial consultada: ${conProceso.length} radicados revisados, 1 actuación nueva.`)
      setTimeout(() => setAviso(null), 5000)
    }, 1400)
  }

  const vistas: [Vista, string, number][] = [
    ["expedientes", "Expedientes", conProceso.length],
    ["candidatos", "Por demandar", candidatos.length],
    ["plantillas", "Plantillas", plantillas.length],
  ]

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* ───── Encabezado ───── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Gestión jurídica</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Expedientes, estados procesales y generación de demandas. El seguimiento en la Rama Judicial lo hace
            un robot cada madrugada.
          </p>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0 disabled:cursor-wait"
          style={{ background: "#7c3aed" }}
        >
          {sincronizando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Consultando la Rama…
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Sincronizar RPA ahora
            </>
          )}
        </button>
      </div>

      {/* ───── Resumen ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Procesos activos", v: String(conProceso.length), c: "#7c3aed", b: "#ede9fe", bd: "#ddd6fe" },
          { l: "Cuantía en litigio", v: copCorto(cuantiaTotal), c: "#1E3A8A", b: "#eff3ff", bd: "#dce5fb" },
          {
            l: "Sin actuación hace 60+ días",
            v: String(quietos),
            c: quietos ? "#b45309" : "#94a3b8",
            b: quietos ? "#fffbeb" : "#fff",
            bd: quietos ? "#fde68a" : "#e2e8f0",
          },
          {
            l: "Radicados desactualizados",
            v: String(desactualizados),
            c: desactualizados ? "#dc2626" : "#94a3b8",
            b: desactualizados ? "#fef2f2" : "#fff",
            bd: desactualizados ? "#fecaca" : "#e2e8f0",
          },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
            <p className="text-2xl font-bold" style={{ color: s.c }}>
              {s.v}
            </p>
            <p className="text-xs font-medium mt-0.5 text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>

      {/* ───── Segmentos ───── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 w-fit">
        {vistas.map(([key, label, n]) => (
          <button
            key={key}
            onClick={() => setVista(key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
            style={{ background: vista === key ? "#7c3aed" : "transparent", color: vista === key ? "#fff" : "#64748b" }}
          >
            {label}
            <span
              className="rounded-full px-1.5 py-px text-[10px] font-bold"
              style={{
                background: vista === key ? "rgba(255,255,255,0.22)" : "#f1f5f9",
                color: vista === key ? "#fff" : "#94a3b8",
              }}
            >
              {n}
            </span>
          </button>
        ))}
      </div>

      {/* ───── Expedientes ───── */}
      {vista === "expedientes" && (
        <div className="flex flex-col gap-3">
          {conProceso.map(d => {
            const e = d.expediente!
            const idx = etapas.indexOf(e.etapa)
            const quieto = e.diasSinActuacion > 60
            const desync = e.rpa.estado !== "Sincronizado"
            const expandido = abierto === d.id

            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => {
                    setAbierto(expandido ? null : d.id)
                    onConsumirInicial()
                  }}
                  className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer flex-wrap"
                >
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: colorAvatar(d.nombre) }}
                  >
                    {iniciales(d.nombre)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-bold text-slate-800">{d.nombre}</p>
                      <span
                        className="text-[10px] font-bold rounded-full px-2 py-0.5"
                        style={{ background: "#ede9fe", color: "#6d28d9" }}
                      >
                        {e.etapa}
                      </span>
                      {quieto && (
                        <span
                          className="text-[10px] font-bold rounded-full px-2 py-0.5"
                          style={{ background: "#fffbeb", color: "#92400e" }}
                        >
                          {e.diasSinActuacion} días sin actuación
                        </span>
                      )}
                      {desync && (
                        <span
                          className="text-[10px] font-bold rounded-full px-2 py-0.5"
                          style={{ background: "#fef2f2", color: "#991b1b" }}
                        >
                          RPA {e.rpa.estado.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{e.radicado}</p>
                    <p className="text-[11px] text-slate-400">
                      {e.juzgado} · {e.ciudad} · {e.tipoProceso}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-slate-800">{copCorto(e.cuantia)}</p>
                    <p className="text-[10px] text-slate-400">radicada {e.radicacion}</p>
                  </div>

                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 shrink-0 self-center text-slate-300 transition-transform ${expandido ? "rotate-90" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Barra de etapas: dónde va el proceso de un vistazo */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-[2px]">
                    {etapas.map((et, i) => (
                      <span
                        key={et}
                        title={et}
                        className="flex-1 h-1.5 rounded-sm"
                        style={{ background: i <= idx ? "#7c3aed" : "#f1f5f9" }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] text-slate-300">{etapas[0]}</span>
                    <span className="text-[9px] font-bold" style={{ color: "#7c3aed" }}>
                      {e.etapa}
                    </span>
                    <span className="text-[9px] text-slate-300">{etapas[etapas.length - 1]}</span>
                  </div>
                </div>

                {expandido && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                      <div>
                        <Etiqueta>Actuaciones</Etiqueta>
                        <div className="mt-3">
                          {e.actuaciones.map((a, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex flex-col items-center shrink-0 pt-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: "#7c3aed" }} />
                                {i < e.actuaciones.length - 1 && <span className="flex-1 w-px my-1 bg-slate-200" />}
                              </div>
                              <div className="flex-1 min-w-0 pb-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-mono text-slate-400">{a.fecha}</span>
                                  <span className="text-[10px] font-bold text-slate-500">{a.etapa}</span>
                                  {a.porRpa && (
                                    <span
                                      className="text-[9px] font-bold rounded px-1.5 py-0.5"
                                      style={{ background: "#f1f5f9", color: "#64748b" }}
                                      title="Leída por el robot en el portal de la Rama Judicial"
                                    >
                                      RPA
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{a.texto}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="rounded-xl border border-slate-200 p-3.5">
                          <Etiqueta>Rastreo automático</Etiqueta>
                          <p className="text-[11px] font-semibold text-slate-600 mt-2">
                            Última consulta: <span className="font-mono">{e.rpa.ultimaSync}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                            El robot entra al portal de consulta de procesos, compara las actuaciones con las que ya
                            tenemos y solo registra las nuevas.
                          </p>
                        </div>

                        {e.medidas.length > 0 && (
                          <div className="rounded-xl border p-3.5" style={{ borderColor: "#ddd6fe", background: "#f9f7ff" }}>
                            <Etiqueta>Medidas decretadas</Etiqueta>
                            <div className="flex flex-col gap-1.5 mt-2">
                              {e.medidas.map(m => (
                                <p key={m} className="text-[11px] font-semibold" style={{ color: "#5b21b6" }}>
                                  · {m}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => onAbrirDeudor(d)}
                          className="py-2.5 rounded-xl text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer"
                        >
                          Ver la ficha del deudor
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ───── Por demandar ───── */}
      {vista === "candidatos" && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-0.5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] leading-relaxed" style={{ color: "#991b1b" }}>
              El pagaré prescribe a los tres años del último vencimiento. Pasada esa fecha la deuda sigue
              existiendo pero ya no se puede cobrar por proceso ejecutivo, así que estas obligaciones hay que
              demandarlas antes de que el reloj llegue a cero.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
            {candidatos.map(({ d, p }) => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4 flex-wrap hover:bg-slate-50/70 transition-colors">
                <span className="w-1.5 h-10 rounded-sm shrink-0" style={{ background: p.color }} />
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: colorAvatar(d.nombre) }}
                >
                  {iniciales(d.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800">{d.nombre}</p>
                  <p className="text-[11px] text-slate-400">
                    {cop(saldoDeudor(d))} · mora de{" "}
                    {Math.max(...d.obligaciones.map(o => o.diasMora))} días · riesgo {d.riesgo}
                  </p>
                </div>
                <div
                  className="rounded-lg border px-3 py-2 shrink-0"
                  style={{ background: p.bg, borderColor: p.borde }}
                >
                  <p className="text-[12px] font-bold" style={{ color: p.color }}>
                    {p.dias <= 0 ? "Prescrita" : `${nf(p.dias)} días`}
                  </p>
                  <p className="text-[9px] font-mono" style={{ color: p.color, opacity: 0.8 }}>
                    {p.fecha}
                  </p>
                </div>
                <button
                  onClick={() => setAviso(`Demanda de ${d.nombre} generada desde la plantilla ejecutiva singular.`)}
                  className="px-3.5 py-2 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer shrink-0"
                  style={{ background: "#7c3aed" }}
                >
                  Generar demanda
                </button>
              </div>
            ))}

            {candidatos.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-slate-400">Ninguna obligación con prescripción en riesgo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───── Plantillas ───── */}
      {vista === "plantillas" && (
        <div className="grid gap-4 md:grid-cols-2">
          {plantillas.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#ede9fe", color: "#7c3aed" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800">{p.nombre}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{p.descripcion}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-300 shrink-0">{p.usos} usos</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
                {p.campos.map(c => (
                  <span
                    key={c}
                    className="text-[10px] font-semibold rounded-full px-2.5 py-1 border border-slate-200 bg-slate-50 text-slate-500"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                Los campos se llenan solos con los datos del deudor y de la obligación; el apoderado solo revisa y
                firma.
              </p>
            </div>
          ))}
        </div>
      )}

      {aviso && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
          <div
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg"
            style={{ background: "#f9f7ff", borderColor: "#ddd6fe" }}
          >
            <svg viewBox="0 0 20 20" fill="#7c3aed" className="w-4 h-4 shrink-0 mt-px">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] leading-relaxed flex-1" style={{ color: "#5b21b6" }}>
              {aviso}
            </p>
            <button onClick={() => setAviso(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
