import { useState } from "react"
import type { View } from "@/App"
import MetasSla from "./MetasSla"
import { BarraParticipacion, ColumnasApiladas, Sparkline, TarjetaKpi } from "./PanelCharts"
import PorModulo from "./PorModulo"
import Reportes from "./Reportes"
import {
  actividadDiaria,
  alertasPanel,
  consumoPlan,
  estadoMeta,
  kpisTransversales,
  metas,
  modulos,
  modulosDisponibles,
  nf,
  ordenModulos,
  resumenModulos,
  tenant,
  tinta,
  estadoDeMeta,
  type ModuloId,
} from "./PanelData"

type Subvista = "resumen" | "modulos" | "metas" | "reportes"
type Periodo = "7d" | "30d" | "trimestre"

interface Props {
  setView: (v: View) => void
}

const periodos: [Periodo, string][] = [
  ["7d", "7 días"],
  ["30d", "30 días"],
  ["trimestre", "Trimestre"],
]

/* ─────────────────────────────────────────────
   Tarjeta de módulo contratado
───────────────────────────────────────────── */
export function TarjetaModulo({
  id,
  onAbrir,
  onDetalle,
}: {
  id: ModuloId
  onAbrir: () => void
  onDetalle: () => void
}) {
  const m = modulos[id]
  const r = resumenModulos.find(x => x.id === id)!
  const sube = r.delta >= 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-colors">
      {/* Franja de identidad del módulo */}
      <div style={{ height: 3, background: m.color }} />

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0 mt-1" style={{ background: m.color }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate" style={{ color: tinta.fuerte }}>
              {m.nombre}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
              Contratado
            </p>
          </div>
          {r.alertas > 0 && (
            <span
              className="text-[9px] font-bold rounded-full px-1.5 py-0.5 shrink-0"
              style={{ background: "#fee2e2", color: "#991b1b" }}
            >
              {r.alertas}
            </span>
          )}
        </div>

        <div className="flex items-end gap-1.5 mt-3">
          <p className="text-2xl font-bold leading-none" style={{ color: tinta.fuerte }}>
            {nf(r.volumen)}
          </p>
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-bold mb-0.5"
            style={{ color: sube ? "#059669" : "#dc2626" }}
          >
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-2 h-2">
              <path d={sube ? "M6 2l4 6H2z" : "M6 10L2 4h8z"} />
            </svg>
            {Math.abs(r.delta)}%
          </span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: tinta.suave }}>
          {r.volumenLabel}
        </p>

        <div className="mt-2.5">
          <Sparkline serie={r.serie} color={m.color} alto={28} />
        </div>

        <div className="space-y-1 mt-3 pt-3 border-t" style={{ borderColor: "#f1f5f9" }}>
          {r.secundarios.map(s => (
            <div key={s.label} className="flex items-center justify-between gap-2">
              <span className="text-[10px] truncate" style={{ color: tinta.suave }}>
                {s.label}
              </span>
              <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: tinta.medio }}>
                {s.valor}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: "#f1f5f9", background: "#f8fafc" }}>
        <button
          onClick={onDetalle}
          className="text-[10px] font-semibold transition-colors cursor-pointer hover:underline"
          style={{ color: tinta.medio }}
        >
          Ver métricas
        </button>
        <span style={{ color: tinta.tenue }}>·</span>
        <button
          onClick={onAbrir}
          className="text-[10px] font-semibold transition-colors cursor-pointer hover:underline"
          style={{ color: m.color }}
        >
          Ir al módulo →
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Módulo Panel
───────────────────────────────────────────── */
export default function Panel({ setView }: Props) {
  const [subvista, setSubvista] = useState<Subvista>("resumen")
  const [periodo, setPeriodo] = useState<Periodo>("30d")
  const [moduloFoco, setModuloFoco] = useState<ModuloId>("pqrs")

  const alertasCriticas = alertasPanel.filter(a => a.severidad === "critico").length
  const metasFuera = metas.filter(m => estadoDeMeta(m) !== "bien").length

  const irAlDetalle = (id: ModuloId) => {
    setModuloFoco(id)
    setSubvista("modulos")
  }

  const tabs: [Subvista, string, number | null][] = [
    ["resumen", "Resumen", null],
    ["modulos", "Por módulo", null],
    ["metas", "Metas y SLA", metasFuera > 0 ? metasFuera : null],
    ["reportes", "Reportes", null],
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Barra de subvistas */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0 overflow-x-auto">
        {tabs.map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => setSubvista(key)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              subvista === key
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            {label}
            {badge !== null && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold"
                style={{ background: "#fef3c7", color: "#92400e" }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ RESUMEN ═══════════ */}
      {subvista === "resumen" && (
        <div className="flex-1 overflow-auto p-6 space-y-6" style={{ background: "#F8FAFC" }}>

          {/* Banner del tenant */}
          <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-6 flex-wrap overflow-hidden relative" style={{ background: "#1E3A8A" }}>
            <div
              className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 75% 50%, #0EA5E9 0%, transparent 70%)" }}
            />
            <div className="relative min-w-0">
              <p className="text-white/50 text-xs mb-0.5">
                {tenant.organizacion} · {tenant.plan}
              </p>
              <h2 className="text-white text-xl font-bold">Panel de control</h2>
              <p className="text-white/60 text-sm mt-1">
                <span className="text-[#0EA5E9] font-semibold">{tenant.modulosActivos}</span> de{" "}
                {tenant.modulosDisponibles} módulos contratados ·{" "}
                {alertasCriticas > 0 ? (
                  <span className="text-white/80">{alertasCriticas} asuntos requieren atención</span>
                ) : (
                  "sin asuntos críticos"
                )}
              </p>
            </div>

            {/* Selector de periodo */}
            <div className="relative flex items-center gap-1 rounded-xl p-0.5 shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
              {periodos.map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: periodo === p ? "#fff" : "transparent",
                    color: periodo === p ? "#1E3A8A" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicadores transversales */}
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                Indicadores transversales
              </h3>
              <p className="text-[11px]" style={{ color: tinta.suave }}>
                Consolidado de los cuatro módulos · últimos {periodo === "7d" ? "7 días" : periodo === "30d" ? "30 días" : "90 días"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpisTransversales.map(k => (
                <TarjetaKpi key={k.label} {...k} />
              ))}
            </div>
          </div>

          {/* Módulos */}
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold" style={{ color: tinta.fuerte }}>
                Módulos contratados
              </h3>
              <p className="text-[11px]" style={{ color: tinta.suave }}>
                Cada módulo se contrata por separado y aporta sus métricas a este panel
              </p>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {ordenModulos.map(id => (
                <TarjetaModulo
                  key={id}
                  id={id}
                  onAbrir={() => setView(modulos[id].vista)}
                  onDetalle={() => irAlDetalle(id)}
                />
              ))}
            </div>
          </div>

          {/* Actividad */}
          <div className="grid xl:grid-cols-[1fr_320px] gap-4">
            <ColumnasApiladas dias={actividadDiaria} />
            <BarraParticipacion dias={actividadDiaria} />
          </div>

          {/* Alertas y consumo */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-4">
            {/* Alertas transversales */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                  Asuntos que requieren atención
                </h3>
                <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#fee2e2", color: "#991b1b" }}>
                  {alertasPanel.length}
                </span>
                <p className="ml-auto text-[11px] hidden sm:block" style={{ color: tinta.suave }}>
                  Consolidado de todos los módulos
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {alertasPanel.map(a => {
                  const m = modulos[a.modulo]
                  const sev = estadoMeta[a.severidad]
                  return (
                    <button
                      key={a.id}
                      onClick={() => setView(m.vista)}
                      className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3"
                    >
                      {/* La severidad se marca con icono + etiqueta, nunca solo con color */}
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        {a.severidad === "critico" ? (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold" style={{ color: tinta.fuerte }}>
                            {a.titulo}
                          </p>
                          <span className="flex items-center gap-1 shrink-0">
                            <span className="w-2 h-2 rounded-sm" style={{ background: m.color }} />
                            <span className="text-[10px] font-semibold" style={{ color: tinta.suave }}>
                              {m.corto}
                            </span>
                          </span>
                          <span className="text-[9px] font-bold rounded px-1.5 py-0.5" style={{ background: sev.bg, color: sev.color }}>
                            {a.severidad === "critico" ? "Crítico" : "Atención"}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed mt-1" style={{ color: tinta.medio }}>
                          {a.detalle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px]" style={{ color: tinta.tenue }}>
                          {a.hora}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-300 group-hover:text-[#1E3A8A] transition-colors">
                          Abrir →
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Plan y módulos disponibles */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                  Consumo del plan
                </h3>
                <p className="text-[11px] mt-0.5 mb-4" style={{ color: tinta.suave }}>
                  {tenant.plan} · activo desde {tenant.desde}
                </p>
                <div className="space-y-3.5">
                  {consumoPlan.map(c => {
                    const pct = (c.usado / c.incluido) * 100
                    const color = pct >= 90 ? "#dc2626" : pct >= 75 ? "#d97706" : "#2d4fa8"
                    return (
                      <div key={c.concepto}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="text-[11px] truncate" style={{ color: tinta.medio }}>
                            {c.concepto}
                          </span>
                          <span className="text-[10px] font-mono shrink-0" style={{ color: tinta.suave }}>
                            <span className="font-bold" style={{ color: tinta.fuerte }}>
                              {nf(c.usado)}
                            </span>
                            {" / "}
                            {nf(c.incluido)}
                          </span>
                        </div>
                        <div className="h-2 rounded-sm" style={{ background: "#f1f5f9" }}>
                          <div
                            className="h-full transition-all duration-700"
                            style={{ width: `${Math.min(100, pct)}%`, background: color, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
                    Módulos disponibles
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: tinta.suave }}>
                    No incluidos en tu plan actual
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  {modulosDisponibles.map(d => (
                    <div key={d.nombre} className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "#f1f5f9", color: tinta.suave }}
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold" style={{ color: tinta.medio }}>
                            {d.nombre}
                          </p>
                          <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: tinta.suave }}>
                            {d.descripcion}
                          </p>
                          <p className="text-[10px] font-mono font-semibold mt-1" style={{ color: tinta.medio }}>
                            desde {d.desde}
                          </p>
                        </div>
                      </div>
                      <button className="w-full mt-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer" style={{ color: tinta.medio }}>
                        Solicitar activación
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ OTRAS SUBVISTAS ═══════════ */}
      {subvista === "modulos" && (
        <PorModulo foco={moduloFoco} setFoco={setModuloFoco} onAbrirModulo={v => setView(v)} />
      )}

      {subvista === "metas" && <MetasSla />}

      {subvista === "reportes" && <Reportes />}
    </div>
  )
}
