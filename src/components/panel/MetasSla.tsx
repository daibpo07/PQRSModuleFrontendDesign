import { useState } from "react"
import MetaEditor from "./MetaEditor"
import { Medidor } from "./PanelCharts"
import {
  escalaDe,
  estadoDeMeta,
  estadoMeta,
  indicadoresDisponibles,
  metas as metasIniciales,
  modulos,
  ordenModulos,
  tinta,
  type EstadoMetaId,
  type MetaIndicador,
  type ModuloId,
} from "./PanelData"

/* ─────────────────────────────────────────────
   Subvista Metas y SLA

   Una razón contra un límite se lee como medidor,
   no como gráfico de barras. El estado usa la
   paleta reservada, siempre con icono y etiqueta.
───────────────────────────────────────────── */

function IconoEstado({ estado, className = "w-3.5 h-3.5" }: { estado: EstadoMetaId; className?: string }) {
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

export default function MetasSla() {
  const [metas, setMetas] = useState<MetaIndicador[]>(metasIniciales)
  const [filtro, setFiltro] = useState<"Todos" | ModuloId>("Todos")
  const [editor, setEditor] = useState<{ abierto: boolean; base: MetaIndicador | null }>({
    abierto: false,
    base: null,
  })
  const [reciente, setReciente] = useState<string | null>(null)

  const visibles = filtro === "Todos" ? metas : metas.filter(m => m.modulo === filtro)

  /* Indicadores que todavía no tienen meta: alimenta el aviso del pie */
  const sinMeta = indicadoresDisponibles.filter(i => !metas.some(m => m.indicadorId === i.id))

  const guardar = (m: MetaIndicador) => {
    setMetas(prev => (prev.some(x => x.id === m.id) ? prev.map(x => (x.id === m.id ? m : x)) : [m, ...prev]))
    setReciente(m.id)
    setEditor({ abierto: false, base: null })
  }

  const eliminar = (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id))
    setEditor({ abierto: false, base: null })
  }

  const resumen = {
    bien: metas.filter(m => estadoDeMeta(m) === "bien").length,
    atencion: metas.filter(m => estadoDeMeta(m) === "atencion").length,
    critico: metas.filter(m => estadoDeMeta(m) === "critico").length,
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
            Metas e indicadores de servicio
          </h2>
          <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
            Objetivos acordados por módulo y qué tan cerca está la operación de cumplirlos.
          </p>
        </div>
        <button
          onClick={() => setEditor({ abierto: true, base: null })}
          disabled={sinMeta.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-default"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => {
            if (sinMeta.length > 0) e.currentTarget.style.background = "#162d6e"
          }}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          title={sinMeta.length === 0 ? "Todos los indicadores disponibles ya tienen meta" : undefined}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Definir nueva meta
        </button>
      </div>

      {/* Resumen del cumplimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["bien", "atencion", "critico"] as EstadoMetaId[]).map(e => {
          const meta = estadoMeta[e]
          return (
            <div key={e} className="rounded-xl p-4 border" style={{ background: meta.bg, borderColor: meta.bg }}>
              <div className="flex items-center gap-2">
                <span style={{ color: meta.color }}>
                  <IconoEstado estado={e} className="w-4 h-4" />
                </span>
                <p className="text-2xl font-bold" style={{ color: meta.color }}>
                  {resumen[e]}
                </p>
              </div>
              <p className="text-xs font-medium mt-1" style={{ color: tinta.medio }}>
                {meta.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filtro por módulo */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFiltro("Todos")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            filtro === "Todos"
              ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
              : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
          }`}
        >
          Todos
          <span
            className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
              filtro === "Todos" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {metas.length}
          </span>
        </button>
        {ordenModulos.map(id => {
          const mm = modulos[id]
          const activo = filtro === id
          const cuantas = metas.filter(m => m.modulo === id).length
          return (
            <button
              key={id}
              onClick={() => setFiltro(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activo
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
              }`}
            >
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: activo ? "#fff" : mm.color }} />
              {mm.corto}
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                  activo ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {cuantas}
              </span>
            </button>
          )
        })}
      </div>

      {/* Metas */}
      <div className="grid lg:grid-cols-2 gap-4">
        {visibles.map(m => {
          const mm = modulos[m.modulo]
          const est = estadoDeMeta(m)
          const meta = estadoMeta[est]
          const ind = indicadoresDisponibles.find(i => i.id === m.indicadorId)
          const maximo = escalaDe(m.unidad, m.actual, m.objetivo, ind?.escala)
          const esReciente = reciente === m.id
          const brecha = m.actual - m.objetivo
          const favorable = m.direccion === "mayor" ? brecha >= 0 : brecha <= 0

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border shadow-sm p-5 transition-colors"
              style={{ borderColor: esReciente ? "#0EA5E9" : "#e2e8f0" }}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                      {m.nombre}
                    </h3>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-sm" style={{ background: mm.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: tinta.suave }}>
                        {mm.corto}
                      </span>
                    </span>
                    {esReciente && (
                      <span
                        className="text-[9px] font-bold rounded-full px-2 py-0.5 shrink-0"
                        style={{ background: "#e0f2fe", color: "#0369a1" }}
                      >
                        Recién definida
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: tinta.suave }}>
                    {m.detalle}
                  </p>
                </div>

                {/* Estado: icono + etiqueta, nunca color solo */}
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 shrink-0"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <IconoEstado estado={est} className="w-3 h-3" />
                  {meta.label}
                </span>
              </div>

              <div className="mt-4">
                <Medidor
                  actual={m.actual}
                  objetivo={m.objetivo}
                  maximo={maximo}
                  unidad={m.unidad}
                  color={mm.color}
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                <span className="text-[10px]" style={{ color: tinta.suave }}>
                  {m.periodo}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: tinta.suave }}>
                    {favorable ? "Supera el objetivo por" : "Falta"}{" "}
                    <span className="font-mono font-bold" style={{ color: meta.color }}>
                      {Math.abs(brecha).toLocaleString("es-CO", { maximumFractionDigits: 1 })}
                      {m.unidad}
                    </span>
                  </span>
                  <button
                    onClick={() => setEditor({ abierto: true, base: m })}
                    className="text-[10px] font-semibold hover:underline cursor-pointer shrink-0"
                    style={{ color: tinta.suave }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota metodológica */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#eff3ff" }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[11px] leading-relaxed" style={{ color: tinta.medio }}>
          Un indicador se marca <span className="font-semibold">en riesgo</span> cuando está a menos del 5% de
          distancia de su objetivo, y <span className="font-semibold">fuera de meta</span> cuando la brecha es mayor.
          La marca vertical sobre cada medidor señala el objetivo acordado.
          {sinMeta.length > 0 && (
            <>
              {" "}Quedan <span className="font-semibold">{sinMeta.length} indicadores</span> de módulos
              contratados sobre los que todavía no se ha fijado una meta.
            </>
          )}
        </p>
      </div>

      {editor.abierto && (
        <MetaEditor
          inicial={editor.base}
          existentes={metas}
          onClose={() => setEditor({ abierto: false, base: null })}
          onGuardar={guardar}
          onEliminar={eliminar}
        />
      )}
    </div>
  )
}
