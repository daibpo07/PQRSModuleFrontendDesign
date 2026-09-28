import { useState } from "react"
import ProgramacionEditor, { CORREO_SESION } from "./ProgramacionEditor"
import { formatoMeta, modulos, tinta, type Reporte } from "./PanelData"
import { analisisDisponibles, estadoEnvioEstilo, type Programacion } from "./ReporteriaData"

/* ─────────────────────────────────────────────
   Subvista Envíos programados

   Un reporte que hay que acordarse de generar no
   se genera. Aquí se deja andando solo, con la
   lectura de IA incluida y con la posibilidad de
   probarlo antes de que le llegue a alguien.
───────────────────────────────────────────── */

export default function EnviosProgramados({
  lista,
  setLista,
  reportePendiente,
  onConsumirPendiente,
}: {
  lista: Programacion[]
  setLista: React.Dispatch<React.SetStateAction<Programacion[]>>
  /** Llega con un reporte cuando se viene desde la estimación de volumen. */
  reportePendiente?: Reporte | null
  onConsumirPendiente?: () => void
}) {
  const [editor, setEditor] = useState<{ abierto: boolean; inicial?: Programacion }>({ abierto: false })
  const [aviso, setAviso] = useState<string | null>(null)
  const [probando, setProbando] = useState<string | null>(null)

  /* Si venimos de la estimación, el editor abre con ese reporte ya puesto */
  const abrirDesdePendiente = Boolean(reportePendiente)

  const activos = lista.filter(p => p.estado === "Activo").length
  const conIA = lista.filter(p => p.analisis.length > 0).length
  const conError = lista.filter(p => p.estado === "Con error").length
  const destinatarios = new Set(lista.flatMap(p => p.destinatarios)).size

  const avisar = (texto: string) => {
    setAviso(texto)
    setTimeout(() => setAviso(null), 5000)
  }

  const alternarEstado = (id: string) =>
    setLista(l =>
      l.map(p =>
        p.id === id
          ? {
              ...p,
              estado: p.estado === "Activo" ? "Pausado" : "Activo",
              proximoEnvio: p.estado === "Activo" ? "—" : `29 sep 2026 · ${p.hora}`,
            }
          : p,
      ),
    )

  const enviarPrueba = (p: Programacion) => {
    setProbando(p.id)
    setTimeout(() => {
      setProbando(null)
      avisar(`Prueba de «${p.nombre}» enviada a ${CORREO_SESION}. No llegó a los destinatarios reales.`)
    }, 900)
  }

  const guardar = (p: Programacion) => {
    setLista(l => (l.some(x => x.id === p.id) ? l.map(x => (x.id === p.id ? p : x)) : [p, ...l]))
    setEditor({ abierto: false })
    onConsumirPendiente?.()
    avisar(`«${p.nombre}» quedó programado: ${p.frecuencia.toLowerCase()} a las ${p.hora}.`)
  }

  const cerrarEditor = () => {
    setEditor({ abierto: false })
    onConsumirPendiente?.()
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* ───── Encabezado ───── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
            Envíos programados
          </h2>
          <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
            Indicadores que salen solos por correo, con la opción de que la IA los lea antes de despacharlos.
          </p>
        </div>
        <button
          onClick={() => setEditor({ abierto: true })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo envío programado
        </button>
      </div>

      {/* ───── Resumen ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Envíos activos", v: String(activos), c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
          { l: "Con análisis de IA", v: String(conIA), c: "#7c3aed", b: "#ede9fe", bd: "#ddd6fe" },
          { l: "Destinatarios únicos", v: String(destinatarios), c: "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
          {
            l: "Con error de entrega",
            v: String(conError),
            c: conError ? "#dc2626" : "#94a3b8",
            b: conError ? "#fef2f2" : "#fff",
            bd: conError ? "#fecaca" : "#e2e8f0",
          },
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

      {/* ───── Listado ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {lista.map(p => {
            const fm = formatoMeta[p.formato]
            const est = estadoEnvioEstilo[p.estado]
            const color = p.modulo === "transversal" ? "#1E3A8A" : modulos[p.modulo].color
            const origen = p.modulo === "transversal" ? "Transversal" : modulos[p.modulo].corto

            return (
              <div key={p.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors group">
                <span className="w-1.5 h-10 rounded-sm shrink-0 mt-0.5" style={{ background: color }} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                      {p.nombre}
                    </p>
                    <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: fm.bg, color: fm.color }}>
                      {p.formato}
                    </span>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100" style={{ color: tinta.medio }}>
                      {origen}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: est.bg, color: est.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                      {p.estado}
                    </span>
                    {p.analisis.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
                        style={{ background: "#ede9fe", color: "#6d28d9" }}
                        title={analisisDisponibles
                          .filter(a => p.analisis.includes(a.id))
                          .map(a => a.nombre)
                          .join(" · ")}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                          <path d="M11 3a1 1 0 10-2 0v1.07A6.002 6.002 0 004.07 9H3a1 1 0 000 2h1.07A6.002 6.002 0 009 15.93V17a1 1 0 102 0v-1.07A6.002 6.002 0 0015.93 11H17a1 1 0 100-2h-1.07A6.002 6.002 0 0011 4.07V3zm-1 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                        IA · {p.analisis.length}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: tinta.medio }}>
                    {p.reporteNombre} · {p.frecuencia}
                    {p.dia !== "—" && ` · ${p.dia}`} a las {p.hora}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap mt-2">
                    <span className="text-[10px]" style={{ color: tinta.suave }}>
                      Próximo{" "}
                      <span className="font-mono font-semibold" style={{ color: tinta.medio }}>
                        {p.proximoEnvio}
                      </span>
                    </span>
                    <span className="text-[10px]" style={{ color: tinta.suave }}>
                      A{" "}
                      <span className="font-semibold" style={{ color: tinta.medio }}>
                        {p.destinatarios.join(", ")}
                      </span>
                    </span>
                    {/* Las aperturas dicen si a alguien le sirve el envío o solo llena bandejas */}
                    {p.aperturas && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold"
                        style={{ color: p.aperturas.abiertos === 0 ? "#b45309" : tinta.medio }}
                        title="Aperturas del último envío"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-60">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {p.aperturas.abiertos} de {p.aperturas.total} lo abrieron
                      </span>
                    )}
                  </div>

                  {/* Un envío con error no se arregla solo: hay que decir qué pasó */}
                  {p.estado === "Con error" && p.motivoError && (
                    <div
                      className="flex items-start gap-2 mt-2.5 rounded-lg border px-2.5 py-2"
                      style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                    >
                      <svg viewBox="0 0 20 20" fill="#dc2626" className="w-3.5 h-3.5 shrink-0 mt-px">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#991b1b" }}>
                        {p.motivoError}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => enviarPrueba(p)}
                    disabled={probando === p.id}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:cursor-wait inline-flex items-center gap-1.5"
                    style={{ borderColor: "#c7d7fb", color: "#1E3A8A" }}
                  >
                    {probando === p.id ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] animate-spin" />
                        Enviando
                      </>
                    ) : (
                      "Enviar prueba"
                    )}
                  </button>
                  <button
                    onClick={() => alternarEstado(p.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-white transition-all cursor-pointer"
                    style={{ color: tinta.medio }}
                  >
                    {p.estado === "Activo" ? "Pausar" : "Reanudar"}
                  </button>
                  <button
                    onClick={() => setEditor({ abierto: true, inicial: p })}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    style={{ color: tinta.suave }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            )
          })}

          {lista.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-2">
              <p className="text-sm font-medium" style={{ color: tinta.suave }}>
                Todavía no hay envíos programados
              </p>
              <p className="text-xs" style={{ color: tinta.tenue }}>
                Crea uno para que los indicadores lleguen solos cada semana.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#eff3ff" }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[11px] leading-relaxed" style={{ color: tinta.medio }}>
          Los envíos programados se generan en el servidor, así que no tienen el límite de filas de una descarga
          directa. Es el camino para los reportes que no caben en el navegador.
        </p>
      </div>

      {/* Editor */}
      {(editor.abierto || abrirDesdePendiente) && (
        <ProgramacionEditor
          inicial={editor.inicial}
          reportePrevio={editor.inicial ? undefined : (reportePendiente ?? undefined)}
          onClose={cerrarEditor}
          onGuardar={guardar}
        />
      )}

      {/* Aviso de lo que acaba de pasar */}
      {aviso && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
          <div
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg"
            style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
          >
            <svg viewBox="0 0 20 20" fill="#059669" className="w-4 h-4 shrink-0 mt-px">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] leading-relaxed flex-1" style={{ color: "#065f46" }}>
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
