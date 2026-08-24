import { useState } from "react"
import type { View } from "@/App"
import { AreaTendencia, BarrasHorizontales, Embudo, TablaDatos, TarjetaKpi } from "./PanelCharts"
import {
  detalleModulos,
  modulos,
  nf,
  ordenModulos,
  resumenModulos,
  tinta,
  type ModuloId,
} from "./PanelData"

interface Props {
  foco: ModuloId
  setFoco: (id: ModuloId) => void
  onAbrirModulo: (v: View) => void
}

/* ─────────────────────────────────────────────
   Subvista Por módulo

   Los cuatro módulos comparten la misma forma de
   datos, así que la vista es una sola y el módulo
   solo cambia el contenido y su tinta.
───────────────────────────────────────────── */
export default function PorModulo({ foco, setFoco, onAbrirModulo }: Props) {
  const [verTablaDesglose, setVerTablaDesglose] = useState(false)

  const m = modulos[foco]
  const d = detalleModulos[foco]
  const r = resumenModulos.find(x => x.id === foco)!

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* Selector de módulo */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {ordenModulos.map(id => {
            const mm = modulos[id]
            const activo = foco === id
            return (
              <button
                key={id}
                onClick={() => setFoco(id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer"
                style={{
                  borderColor: activo ? mm.color : "#e2e8f0",
                  background: activo ? mm.bg : "#fff",
                  color: activo ? tinta.fuerte : tinta.medio,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: mm.color }} />
                {mm.nombre}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => onAbrirModulo(m.vista)}
          className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
        >
          Ir a {m.nombre} →
        </button>
      </div>

      {/* Encabezado del módulo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div style={{ height: 3, background: m.color }} />
        <div className="px-5 py-4 flex items-start gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold" style={{ color: tinta.fuerte }}>
              {m.nombre}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
              {m.descripcion}
            </p>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
                Volumen
              </p>
              <p className="text-lg font-bold mt-0.5" style={{ color: tinta.fuerte }}>
                {nf(r.volumen)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
                Cumplimiento
              </p>
              <p className="text-lg font-bold mt-0.5" style={{ color: r.sla >= 92 ? "#059669" : "#d97706" }}>
                {r.sla.toLocaleString("es-CO", { minimumFractionDigits: 1 })}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores del módulo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {d.kpis.map((k, i) => (
          <TarjetaKpi
            key={k.label}
            label={k.label}
            valor={k.valor}
            sufijo={k.sufijo}
            delta={k.delta}
            invertido={k.invertido}
            nota={k.nota}
            color={m.color}
            serie={r.serie.slice(i % 3, (i % 3) + 11)}
          />
        ))}
      </div>

      {/* Tendencia */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
          {d.tendenciaTitulo}
        </h3>
        <p className="text-xs mt-0.5 mb-4" style={{ color: tinta.suave }}>
          {d.tendenciaSubtitulo}
        </p>
        <AreaTendencia datos={d.tendencia} color={m.color} unidad={m.unidad} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Desglose */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                {d.desgloseTitulo}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
                {d.desgloseSubtitulo}
              </p>
            </div>
            <button
              onClick={() => setVerTablaDesglose(v => !v)}
              className="text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer shrink-0"
              style={{
                background: verTablaDesglose ? "#eff3ff" : "#fff",
                color: verTablaDesglose ? "#1E3A8A" : tinta.medio,
                borderColor: verTablaDesglose ? "#c7d7fe" : "#e2e8f0",
              }}
            >
              {verTablaDesglose ? "Ver gráfico" : "Ver tabla"}
            </button>
          </div>
          <div className="mt-4">
            {verTablaDesglose ? (
              <TablaDatos
                columnas={["Categoría", "Volumen", "Participación"]}
                filas={(() => {
                  const total = d.desglose.reduce((a, x) => a + x.valor, 0)
                  return d.desglose.map(x => [x.label, nf(x.valor), `${((x.valor / total) * 100).toFixed(1)}%`])
                })()}
              />
            ) : (
              <BarrasHorizontales datos={d.desglose} color={m.color} unidad={m.unidad} />
            )}
          </div>
        </div>

        {/* Embudo o tabla secundaria */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {d.embudo ? (
            <>
              <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                {d.embudoTitulo}
              </h3>
              <p className="text-xs mt-0.5 mb-4" style={{ color: tinta.suave }}>
                Etapas en orden. El tono se oscurece hacia el inicio del recorrido.
              </p>
              <Embudo etapas={d.embudo} />
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                {d.tablaTitulo}
              </h3>
              <p className="text-xs mt-0.5 mb-4" style={{ color: tinta.suave }}>
                Detalle del periodo
              </p>
              <TablaDatos columnas={d.tabla.columnas} filas={d.tabla.filas} />
            </>
          )}
        </div>
      </div>

      {/* Tabla de detalle, cuando el embudo ocupó la columna */}
      {d.embudo && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
            {d.tablaTitulo}
          </h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: tinta.suave }}>
            Detalle del periodo
          </p>
          <TablaDatos columnas={d.tabla.columnas} filas={d.tabla.filas} />
        </div>
      )}
    </div>
  )
}
