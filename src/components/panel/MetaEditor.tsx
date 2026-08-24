import { useState } from "react"
import { Medidor } from "./PanelCharts"
import {
  escalaDe,
  estadoDeMeta,
  estadoMeta,
  indicadoresDisponibles,
  modulos,
  ordenModulos,
  periodosMeta,
  responsablesMeta,
  tinta,
  type EstadoMetaId,
  type IndicadorDisponible,
  type MetaIndicador,
  type ModuloId,
} from "./PanelData"

interface Props {
  inicial?: MetaIndicador | null
  /** Metas ya definidas, para no permitir dos sobre el mismo indicador. */
  existentes: MetaIndicador[]
  onClose: () => void
  onGuardar: (m: MetaIndicador) => void
  onEliminar?: (id: string) => void
}

const pasos = ["Indicador", "Objetivo y seguimiento"]

/* ── Icono de estado: la severidad nunca se comunica solo con color ── */
function IconoEstado({ estado, className = "w-3 h-3" }: { estado: EstadoMetaId; className?: string }) {
  if (estado === "bien")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  if (estado === "atencion")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Editor de metas
───────────────────────────────────────────── */
export default function MetaEditor({ inicial, existentes, onClose, onGuardar, onEliminar }: Props) {
  const editando = Boolean(inicial)

  const indicadorInicial = inicial
    ? indicadoresDisponibles.find(i => i.id === inicial.indicadorId) ?? null
    : null

  const [paso, setPaso] = useState(editando ? 2 : 1)
  const [modulo, setModulo] = useState<ModuloId>(inicial?.modulo ?? "pqrs")
  const [indicador, setIndicador] = useState<IndicadorDisponible | null>(indicadorInicial)
  const [objetivo, setObjetivo] = useState<string>(inicial ? String(inicial.objetivo) : "")
  const [periodo, setPeriodo] = useState(inicial?.periodo ?? periodosMeta[0])
  const [responsable, setResponsable] = useState(responsablesMeta[0])
  const [alertar, setAlertar] = useState(true)
  const [error, setError] = useState("")

  const delModulo = indicadoresDisponibles.filter(i => i.modulo === modulo)

  /** Un indicador ya tomado no puede recibir una segunda meta. */
  const yaTieneMeta = (i: IndicadorDisponible) =>
    existentes.some(m => m.indicadorId === i.id && m.id !== inicial?.id)

  const objetivoNum = Number(objetivo.replace(",", "."))
  const objetivoValido = objetivo !== "" && !Number.isNaN(objetivoNum)

  /* Meta provisional: alimenta la vista previa mientras se edita */
  const provisional: MetaIndicador | null =
    indicador && objetivoValido
      ? {
          id: inicial?.id ?? "preview",
          indicadorId: indicador.id,
          modulo: indicador.modulo,
          nombre: indicador.nombre,
          detalle: indicador.detalle,
          actual: indicador.actual,
          objetivo: objetivoNum,
          unidad: indicador.unidad,
          direccion: indicador.direccion,
          periodo,
        }
      : null

  const estado = provisional ? estadoDeMeta(provisional) : null
  const brecha = provisional ? provisional.actual - provisional.objetivo : 0
  const favorable = provisional
    ? provisional.direccion === "mayor"
      ? brecha >= 0
      : brecha <= 0
    : false

  const validar = (n: number) => {
    if (n === 1 && !indicador) {
      setError("Elige el indicador que quieres medir")
      return false
    }
    if (n === 2) {
      if (!objetivoValido) {
        setError("Escribe un valor numérico para el objetivo")
        return false
      }
      if (objetivoNum < 0) {
        setError("El objetivo no puede ser negativo")
        return false
      }
      if (indicador?.unidad === "%" && objetivoNum > 100) {
        setError("Un porcentaje no puede superar 100")
        return false
      }
      if (indicador?.unidad === "/5" && objetivoNum > 5) {
        setError("La calificación máxima es 5")
        return false
      }
    }
    setError("")
    return true
  }

  const guardar = () => {
    if (!validar(1)) {
      setPaso(1)
      return
    }
    if (!validar(2) || !provisional) return
    onGuardar({ ...provisional, id: inicial?.id ?? `m${Date.now()}` })
  }

  const usarReferencia = () => {
    if (indicador) setObjetivo(String(indicador.referencia))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ height: "min(92vh, 680px)" }}
      >
        {/* ── Encabezado ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                {editando ? "Editar meta" : "Definir nueva meta"}
              </h3>
              <p className="text-xs" style={{ color: tinta.suave }}>
                Eliges qué medir y a qué valor quieres llegar; el sistema ya sabe cómo va hoy
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

          {/* Barra de pasos */}
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
                    {i + 1 < paso ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
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

        {/* ── Cuerpo: formulario a la izquierda, previsualización anclada ── */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_300px]">

          <div className="overflow-y-auto p-6 min-w-0" style={{ background: "#f8fafc" }}>

            {/* Paso 1 · Indicador */}
            {paso === 1 && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                    ¿Qué quieres medir?
                  </h4>
                  <p className="text-xs mt-1" style={{ color: tinta.suave }}>
                    Solo aparecen indicadores de módulos contratados. Cada uno ya trae su valor actual.
                  </p>
                </div>

                {/* Módulo */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {ordenModulos.map(id => {
                    const mm = modulos[id]
                    const activo = modulo === id
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setModulo(id)
                          setIndicador(null)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border-2 transition-all cursor-pointer"
                        style={{
                          borderColor: activo ? mm.color : "#e2e8f0",
                          background: activo ? mm.bg : "#fff",
                          color: activo ? tinta.fuerte : tinta.medio,
                        }}
                      >
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: mm.color }} />
                        {mm.corto}
                      </button>
                    )
                  })}
                </div>

                {/* Indicadores del módulo */}
                <div className="space-y-2">
                  {delModulo.map(i => {
                    const tomado = yaTieneMeta(i)
                    const sel = indicador?.id === i.id
                    return (
                      <button
                        key={i.id}
                        onClick={() => {
                          if (tomado) return
                          setIndicador(i)
                          setObjetivo(String(i.referencia))
                          setError("")
                        }}
                        disabled={tomado}
                        className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: sel ? modulos[modulo].color : "#e2e8f0",
                          background: sel ? modulos[modulo].bg : tomado ? "#f8fafc" : "#fff",
                          opacity: tomado ? 0.6 : 1,
                          cursor: tomado ? "default" : "pointer",
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                          style={{ borderColor: sel ? modulos[modulo].color : "#cbd5e1" }}
                        >
                          {sel && <span className="w-2 h-2 rounded-full" style={{ background: modulos[modulo].color }} />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold" style={{ color: tinta.fuerte }}>
                              {i.nombre}
                            </p>
                            {tomado && (
                              <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-slate-100" style={{ color: tinta.suave }}>
                                Ya tiene meta
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: tinta.suave }}>
                            {i.detalle}
                          </p>
                          <p className="text-[10px] mt-1.5" style={{ color: tinta.suave }}>
                            Hoy va en{" "}
                            <span className="font-mono font-bold" style={{ color: tinta.medio }}>
                              {i.actual.toLocaleString("es-CO")}
                              {i.unidad}
                            </span>{" "}
                            · {i.direccion === "mayor" ? "subir es mejor" : "bajar es mejor"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Paso 2 · Objetivo y seguimiento */}
            {paso === 2 && indicador && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                    ¿A qué valor quieres llegar?
                  </h4>
                  <p className="text-xs mt-1" style={{ color: tinta.suave }}>
                    Midiendo{" "}
                    <span className="font-semibold" style={{ color: tinta.medio }}>
                      {indicador.nombre}
                    </span>{" "}
                    · {indicador.direccion === "mayor" ? "conviene superar el objetivo" : "conviene quedar por debajo"}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Objetivo */}
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                      Valor objetivo
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          value={objetivo}
                          onChange={e => setObjetivo(e.target.value.replace(/[^\d.,]/g, ""))}
                          inputMode="decimal"
                          autoFocus
                          placeholder="0"
                          className="w-full px-3 py-2.5 pr-16 rounded-lg border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                          style={{ borderColor: error ? "#fca5a5" : "#e2e8f0", color: tinta.fuerte }}
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold pointer-events-none"
                          style={{ color: tinta.suave }}
                        >
                          {indicador.unidad.trim() || "unid."}
                        </span>
                      </div>
                      <button
                        onClick={usarReferencia}
                        className="px-3 py-2.5 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0"
                        style={{ color: tinta.medio }}
                      >
                        Usar histórico
                      </button>
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: tinta.suave }}>
                      Promedio de los últimos tres meses:{" "}
                      <span className="font-mono font-bold" style={{ color: tinta.medio }}>
                        {indicador.referencia.toLocaleString("es-CO")}
                        {indicador.unidad}
                      </span>
                      {" · "}valor actual:{" "}
                      <span className="font-mono font-bold" style={{ color: tinta.medio }}>
                        {indicador.actual.toLocaleString("es-CO")}
                        {indicador.unidad}
                      </span>
                    </p>
                  </div>

                  {/* Periodo */}
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                      Periodo de medición
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {periodosMeta.map(p => (
                        <button
                          key={p}
                          onClick={() => setPeriodo(p)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                          style={{
                            background: periodo === p ? "#1E3A8A" : "#fff",
                            color: periodo === p ? "#fff" : tinta.medio,
                            borderColor: periodo === p ? "#1E3A8A" : "#e2e8f0",
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Responsable */}
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tinta.medio }}>
                      Responsable del indicador
                    </label>
                    <select
                      value={responsable}
                      onChange={e => setResponsable(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                      style={{ color: tinta.fuerte }}
                    >
                      {responsablesMeta.map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Alerta */}
                  <button
                    onClick={() => setAlertar(v => !v)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white text-left transition-all cursor-pointer hover:border-slate-300"
                  >
                    <span
                      className="w-8 rounded-full relative shrink-0 transition-colors"
                      style={{ background: alertar ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                    >
                      <span
                        className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all"
                        style={{ left: alertar ? 16 : 2 }}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold" style={{ color: tinta.fuerte }}>
                        Avisar cuando el indicador se salga de meta
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
                        Aparece en “Asuntos que requieren atención” del Resumen y le llega al responsable
                      </p>
                    </div>
                  </button>
                </div>

                {editando && onEliminar && (
                  <button
                    onClick={() => onEliminar(inicial!.id)}
                    className="mt-5 text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Eliminar esta meta
                  </button>
                )}
              </>
            )}

            {error && (
              <p className="text-[11px] text-red-500 rounded-lg px-3 py-2 mt-4" style={{ background: "#fef2f2" }}>
                {error}
              </p>
            )}
          </div>

          {/* ── Vista previa, visible en los dos pasos ── */}
          <div className="border-l border-slate-100 bg-white overflow-y-auto p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
              Así quedará la meta
            </p>

            {provisional && indicador && estado ? (
              <>
                {/* Réplica de la tarjeta real */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold" style={{ color: tinta.fuerte }}>
                          {provisional.nombre}
                        </p>
                        <span className="flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-sm" style={{ background: modulos[provisional.modulo].color }} />
                          <span className="text-[9px] font-semibold" style={{ color: tinta.suave }}>
                            {modulos[provisional.modulo].corto}
                          </span>
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
                        {provisional.detalle}
                      </p>
                    </div>
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 mt-2.5"
                    style={{ background: estadoMeta[estado].bg, color: estadoMeta[estado].color }}
                  >
                    <IconoEstado estado={estado} />
                    {estadoMeta[estado].label}
                  </span>

                  <div className="mt-3">
                    <Medidor
                      actual={provisional.actual}
                      objetivo={provisional.objetivo}
                      maximo={escalaDe(indicador.unidad, provisional.actual, provisional.objetivo, indicador.escala)}
                      unidad={provisional.unidad}
                      color={modulos[provisional.modulo].color}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                    <span className="text-[10px]" style={{ color: tinta.suave }}>
                      {provisional.periodo}
                    </span>
                    <span className="text-[10px]" style={{ color: tinta.suave }}>
                      {favorable ? "Supera por" : "Falta"}{" "}
                      <span className="font-mono font-bold" style={{ color: estadoMeta[estado].color }}>
                        {Math.abs(brecha).toLocaleString("es-CO", { maximumFractionDigits: 1 })}
                        {provisional.unidad}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Veredicto */}
                <div className="rounded-xl p-3" style={{ background: estadoMeta[estado].bg }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: estadoMeta[estado].color }}>
                    {estado === "bien" && "Con el desempeño actual la meta ya se cumple. Considera un objetivo más exigente para que empuje al equipo."}
                    {estado === "atencion" && "La operación está muy cerca del objetivo. Es una meta alcanzable que exige sostener el ritmo."}
                    {estado === "critico" && "El objetivo está lejos del desempeño actual. Verifica que sea alcanzable en el periodo elegido."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
                      Definición
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { l: "Módulo", v: modulos[provisional.modulo].nombre },
                      { l: "Sentido", v: provisional.direccion === "mayor" ? "Mayor es mejor" : "Menor es mejor" },
                      { l: "Responsable", v: responsable },
                      { l: "Alerta", v: alertar ? "Activada" : "Desactivada" },
                    ].map(f => (
                      <div key={f.l} className="flex items-start justify-between gap-2 px-3 py-1.5">
                        <span className="text-[10px] shrink-0" style={{ color: tinta.suave }}>
                          {f.l}
                        </span>
                        <span className="text-[10px] font-semibold text-right" style={{ color: tinta.medio }}>
                          {f.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 flex flex-col items-center gap-2 px-4 text-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" style={{ color: tinta.tenue }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] font-medium" style={{ color: tinta.suave }}>
                  Sin meta todavía
                </p>
                <p className="text-[10px]" style={{ color: tinta.tenue }}>
                  Elige un indicador y fija su objetivo para ver aquí cómo quedaría frente al desempeño actual
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Pie ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={() => (paso === 1 || editando ? onClose() : setPaso(1))}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            style={{ color: tinta.medio }}
          >
            {paso === 1 || editando ? "Cancelar" : "Atrás"}
          </button>
          <p className="text-[11px] hidden sm:block ml-1" style={{ color: tinta.suave }}>
            {editando ? "Editando una meta existente" : `Paso ${paso} de 2 · ${pasos[paso - 1]}`}
          </p>
          <button
            onClick={() => (paso === 2 ? guardar() : validar(1) && setPaso(2))}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {paso === 2 ? (editando ? "Guardar cambios" : "Crear meta") : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
