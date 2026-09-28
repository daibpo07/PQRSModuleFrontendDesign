import { useCallback, useEffect, useRef, useState } from "react"
import { formatoMeta, modulos, nf, tinta, type Reporte } from "./PanelData"
import {
  LIMITE_DESCARGA_DIRECTA,
  MS_ESTIMACION,
  UMBRAL_EXPLAIN,
  estimar,
  formatoBytes,
  formatoDuracion,
  saturaElMotor,
  ventanas,
  type Estimacion,
  type VentanaId,
} from "./ReporteriaData"

/* ─────────────────────────────────────────────
   Estimación previa a la descarga

   Antes había que generar el reporte para saber
   si era de 300 filas o de seis millones. Esta
   ventana responde esa pregunta en 300 ms y, si
   el volumen no cabe en una descarga, empuja
   hacia el envío programado en vez de dejar al
   usuario esperando un archivo que no va a llegar.
───────────────────────────────────────────── */

type Estado = "calculando" | "listo" | "vacio" | "error"

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

/* Las barras del esqueleto ocupan el sitio exacto del resultado: nada salta al llegar */
function Esqueleto() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-40 rounded bg-slate-100" />
      <div className="h-10 w-56 rounded-lg bg-slate-100 mt-3" />
      <div className="h-2 w-full rounded-full bg-slate-100 mt-5" />
      <div className="flex items-center gap-4 mt-4">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function EstimacionModal({
  reporte,
  onClose,
  onProgramar,
}: {
  reporte: Reporte
  onClose: () => void
  /** Cuando el volumen no cabe en una descarga, el camino correcto es programarlo. */
  onProgramar: (reporte: Reporte) => void
}) {
  const [ventana, setVentana] = useState<VentanaId>("30d")
  const [soloAbiertos, setSoloAbiertos] = useState(false)
  const [estado, setEstado] = useState<Estado>("calculando")
  const [resultado, setResultado] = useState<Estimacion | null>(null)
  const [ms, setMs] = useState(0)
  const [intento, setIntento] = useState(0)

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fm = formatoMeta[reporte.formato]

  const calcular = useCallback(
    (nIntento: number) => {
      if (temporizador.current) clearTimeout(temporizador.current)
      setEstado("calculando")
      const arranque = performance.now()

      temporizador.current = setTimeout(() => {
        setMs(Math.round(performance.now() - arranque))

        if (saturaElMotor(reporte, ventana, nIntento)) {
          setResultado(null)
          setEstado("error")
          return
        }

        const e = estimar(reporte, ventana, soloAbiertos)
        setResultado(e)
        setEstado(e.total === 0 ? "vacio" : "listo")
      }, MS_ESTIMACION)
    },
    [reporte, ventana, soloAbiertos],
  )

  /* Cada cambio de filtro vuelve a estimar: el número nunca queda desfasado del criterio */
  useEffect(() => {
    calcular(intento)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [calcular, intento])

  const reintentar = () => setIntento(i => i + 1)

  const v = ventanas.find(x => x.id === ventana)!
  const superaLimite = resultado?.superaDescarga ?? false
  const puedeDescargar = estado === "listo" && !superaLimite

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full border border-slate-100 flex flex-col"
        style={{ maxWidth: 680, maxHeight: "92vh" }}
      >

        {/* ───── Encabezado ───── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#eff3ff", color: "#1E3A8A" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800">Alcance de este reporte</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-slate-400 truncate">{reporte.nombre}</p>
              <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: fm.bg, color: fm.color }}>
                {reporte.formato}
              </span>
            </div>
          </div>

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

        <div className="flex-1 overflow-y-auto">

          {/* ───── Filtros que definen el alcance ───── */}
          <div className="px-6 py-4 border-b border-slate-100">
            <Etiqueta>Periodo</Etiqueta>
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {ventanas.map(w => {
                const activo = ventana === w.id
                return (
                  <button
                    key={w.id}
                    onClick={() => setVentana(w.id)}
                    title={w.descripcion}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                    style={{
                      background: activo ? "#1E3A8A" : "#fff",
                      borderColor: activo ? "#1E3A8A" : "#e2e8f0",
                      color: activo ? "#fff" : "#64748b",
                    }}
                  >
                    {w.label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setSoloAbiertos(s => !s)}
              className="flex items-center gap-2.5 mt-3.5 cursor-pointer group"
            >
              <span
                className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-all"
                style={{
                  background: soloAbiertos ? "#1E3A8A" : "#fff",
                  borderColor: soloAbiertos ? "#1E3A8A" : "#cbd5e1",
                }}
              >
                {soloAbiertos && (
                  <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                Solo casos abiertos o sin cerrar
              </span>
            </button>
          </div>

          {/* ───── Resultado ───── */}
          <div className="px-6 py-5">

            {estado === "calculando" && <Esqueleto />}

            {/* Error del estimador: se ofrece salida, no un callejón */}
            {estado === "error" && (
              <div className="rounded-xl border p-4" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-0.5">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-bold" style={{ color: "#991b1b" }}>
                      No se pudo estimar el volumen
                    </p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#991b1b", opacity: 0.85 }}>
                      El motor de consultas está saturado en este momento. Puedes reintentar la estimación o
                      generar el reporte directamente: se procesará igual, solo que sin saber de antemano cuánto
                      pesa.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    onClick={reintentar}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer active:scale-[0.98]"
                    style={{ background: "#dc2626" }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Reintentar
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Generar sin estimar
                  </button>
                </div>
              </div>
            )}

            {/* Cero resultados: el problema no es descargar, es el filtro */}
            {estado === "vacio" && (
              <div className="rounded-xl border p-4" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 20 20" fill="#b45309" className="w-4 h-4 shrink-0 mt-0.5">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-bold" style={{ color: "#92400e" }}>
                      Total estimado: 0 registros
                    </p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#92400e", opacity: 0.85 }}>
                      {resultado?.motivoVacio ??
                        `Con «${v.label}»${soloAbiertos ? " y solo casos abiertos" : ""} no hay nada que exportar.`}{" "}
                      Ajusta los filtros antes de descargar: el archivo saldría vacío.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                  {/* Ampliar el periodo solo ayuda si el vacío es por fechas */}
                  {!resultado?.motivoVacio && ventana !== "30d" && (
                    <button
                      onClick={() => setVentana("30d")}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                      style={{ background: "#b45309" }}
                    >
                      Ampliar a 30 días
                    </button>
                  )}
                  {soloAbiertos && (
                    <button
                      onClick={() => setSoloAbiertos(false)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-amber-200 bg-white transition-all cursor-pointer"
                      style={{ color: "#92400e" }}
                    >
                      Incluir casos cerrados
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Estimación lograda */}
            {estado === "listo" && resultado && (
              <div>
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <Etiqueta>Total estimado</Etiqueta>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-4xl font-bold tracking-tight leading-none" style={{ color: "#1E3A8A" }}>
                        {nf(resultado.total)}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">registros</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cómo se obtuvo el número: contarlo y estimarlo no son lo mismo */}
                    {resultado.metodo === "explain" ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{ background: "#fffbeb", color: "#92400e" }}
                        title={`Por encima de ${nf(UMBRAL_EXPLAIN)} filas se lee el plan de consulta en vez de contar`}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Aproximado vía EXPLAIN · ±{Math.round((resultado.margen ?? 0) * 100)} %
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{ background: "#ecfdf5", color: "#065f46" }}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Conteo exacto
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-300">{ms} ms</span>
                  </div>
                </div>

                {resultado.metodo === "explain" && (
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Contar exacto por encima de {nf(UMBRAL_EXPLAIN)} filas bloquearía las tablas más tiempo del que
                    tarda el propio reporte, así que la cifra viene del estimado de filas del plan de consulta.
                  </p>
                )}

                {/* Desglose por origen */}
                {resultado.desglose.length > 1 && (
                  <div className="mt-5">
                    <Etiqueta>De dónde salen</Etiqueta>
                    <div className="flex h-2 rounded-full overflow-hidden mt-2.5 gap-[2px]">
                      {resultado.desglose.map(d => (
                        <span
                          key={d.modulo}
                          style={{
                            width: `${(d.filas / resultado.total) * 100}%`,
                            background: d.modulo === "transversal" ? "#1E3A8A" : modulos[d.modulo].color,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                      {resultado.desglose.map(d => {
                        const color = d.modulo === "transversal" ? "#1E3A8A" : modulos[d.modulo].color
                        const label = d.modulo === "transversal" ? "Transversal" : modulos[d.modulo].corto
                        return (
                          <span key={d.modulo} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                            {label} {nf(d.filas)}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Lo que implica descargarlo */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
                    { l: "Peso aproximado", v: formatoBytes(resultado.bytes) },
                    { l: "Tiempo de generación", v: formatoDuracion(resultado.segundos) },
                    { l: "Periodo", v: v.label },
                  ].map(m => (
                    <div key={m.l} className="rounded-xl border border-slate-200 px-3 py-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.l}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: tinta.fuerte }}>
                        {m.v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Supera lo que una descarga aguanta: el camino es programarlo */}
                {superaLimite && (
                  <div className="rounded-xl border p-4 mt-5" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                    <div className="flex items-start gap-2.5">
                      <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-0.5">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs font-bold" style={{ color: "#991b1b" }}>
                          Supera el límite de descarga directa
                        </p>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#991b1b", opacity: 0.85 }}>
                          El navegador entrega hasta {nf(LIMITE_DESCARGA_DIRECTA)} filas por descarga. Con este
                          alcance el archivo se cortaría a la mitad. Prográmalo como envío periódico: se genera en
                          el servidor y llega por correo completo.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onProgramar(reporte)}
                      className="inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-2 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer active:scale-[0.98]"
                      style={{ background: "#1E3A8A" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Programarlo como envío periódico
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ───── Pie ───── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {estado === "vacio" ? "Ajustar filtros" : "Cancelar"}
          </button>

          <button
            disabled={!puedeDescargar}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: puedeDescargar ? "#1E3A8A" : "#e2e8f0",
              color: puedeDescargar ? "#fff" : "#94a3b8",
              boxShadow: puedeDescargar ? "0 10px 24px -12px rgba(30,58,138,0.7)" : "none",
            }}
            onMouseEnter={e => {
              if (puedeDescargar) e.currentTarget.style.background = "#162d6e"
            }}
            onMouseLeave={e => {
              if (puedeDescargar) e.currentTarget.style.background = "#1E3A8A"
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            {resultado && estado === "listo"
              ? `Generar y descargar ${nf(resultado.total)} registros`
              : "Generar y descargar"}
          </button>
        </div>
      </div>
    </div>
  )
}
