import { useEffect, useRef, useState } from "react"
import CampanaWizard from "./CampanaWizard"
import ImportarAudiencia from "./ImportarAudiencia"
import InformeCampana from "./InformeCampana"
import PlantillaEditor from "./PlantillaEditor"
import {
  BarraEmbudo,
  CanalChip,
  CanalIcon,
  EstadoPill,
  aprobacionMeta,
  canalMeta,
  estadoMeta,
  mockCampanas,
  mockPlantillas,
  mockSegmentos,
  nf,
  origenMeta,
  pct,
  seedNoise,
  type Campana,
  type Canal,
  type EstadoCampana,
  type Plantilla,
  type Segmento,
} from "./EnviosMasivosData"

/* ─────────────────────────────────────────────
   Tipos locales
───────────────────────────────────────────── */
type Tab = "campanas" | "plantillas" | "audiencias" | "rendimiento"
type Filtro = "Todas" | EstadoCampana

export interface Evento {
  id: number
  tipo: "ok" | "leido" | "respuesta" | "alerta" | "info"
  texto: string
  hora: string
}

const eventoMeta: Record<Evento["tipo"], { color: string; bg: string }> = {
  ok:        { color: "#059669", bg: "#d1fae5" },
  leido:     { color: "#0EA5E9", bg: "#e0f2fe" },
  respuesta: { color: "#1E3A8A", bg: "#eff3ff" },
  alerta:    { color: "#d97706", bg: "#fef3c7" },
  info:      { color: "#64748B", bg: "#f1f5f9" },
}

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const horasDia = Array.from({ length: 16 }, (_, i) => i + 6)

/** Intensidad histórica de lectura por franja: pico a media mañana y a media tarde. */
function intensidad(dia: number, hora: number) {
  const curva = Math.max(
    Math.exp(-((hora - 10) ** 2) / 8),
    0.86 * Math.exp(-((hora - 17) ** 2) / 10),
  )
  const peso = [1, 0.97, 1, 0.94, 0.86, 0.46, 0.3][dia]
  return Math.max(0.02, Math.min(1, curva * peso + seedNoise(dia, hora) * 0.14 - 0.05))
}

/* ─────────────────────────────────────────────
   Átomos de presentación
───────────────────────────────────────────── */
function Kpi({
  label,
  valor,
  sufijo,
  delta,
  color,
  spark,
}: {
  label: string
  valor: string
  sufijo?: string
  delta: number
  color: string
  spark: number[]
}) {
  const max = Math.max(...spark, 1)
  const sube = delta >= 0
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex items-end gap-1.5 mt-1.5">
        <p className="text-2xl font-bold leading-none" style={{ color }}>
          {valor}
        </p>
        {sufijo && <span className="text-xs font-semibold text-slate-400 mb-0.5">{sufijo}</span>}
      </div>
      <div className="flex items-end justify-between gap-3 mt-3">
        <span
          className="inline-flex items-center gap-0.5 text-[10px] font-bold"
          style={{ color: sube ? "#059669" : "#dc2626" }}
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
            <path d={sube ? "M6 2l4 6H2z" : "M6 10L2 4h8z"} />
          </svg>
          {Math.abs(delta)}%
        </span>
        <div className="flex items-end gap-0.5 h-6">
          {spark.map((v, i) => (
            <span
              key={i}
              className="w-1 rounded-sm"
              style={{
                height: `${Math.max(12, (v / max) * 100)}%`,
                background: color,
                opacity: 0.25 + (i / spark.length) * 0.75,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Consola de envío en vivo
───────────────────────────────────────────── */
export function ConsolaEnVivo({
  campana,
  enVivo,
  tput,
  eventos,
  onToggle,
  onInforme,
}: {
  campana: Campana
  enVivo: boolean
  tput: number[]
  eventos: Evento[]
  onToggle: () => void
  onInforme: () => void
}) {
  const progreso = campana.total > 0 ? Math.min(1, campana.enviados / campana.total) : 0
  const R = 52
  const C = 2 * Math.PI * R
  const maxT = Math.max(...tput, 1)
  const ritmo = tput[tput.length - 1] ?? 0
  const faltan = Math.max(0, campana.total - campana.enviados)
  const etaMin = ritmo > 0 ? Math.ceil(faltan / ritmo) : 0

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#1E3A8A" }}>
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10">
        <span className="relative flex w-2.5 h-2.5 shrink-0">
          {enVivo && (
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: "#0EA5E9" }} />
          )}
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full" style={{ background: enVivo ? "#0EA5E9" : "#f59e0b" }} />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            {enVivo ? "Transmisión en curso" : "Transmisión en pausa"}
          </p>
          <p className="text-sm font-bold text-white truncate">{campana.nombre}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={onInforme}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/80 bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Informe
          </button>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            {enVivo ? (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Reanudar
              </>
            )}
          </button>
          <span className="font-mono text-[10px] text-white/30 hidden lg:block">{campana.id}</span>
        </div>
      </div>

      {/* Cuerpo — la bitácora tiene altura fija, así la consola no crece con los eventos */}
      <div className="grid lg:grid-cols-[205px_1fr_270px] gap-5 p-5">

        {/* Anillo de progreso */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="w-24 h-24 -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progreso)}
                style={{ transition: "stroke-dashoffset 900ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white leading-none">
                {Math.round(progreso * 100)}
                <span className="text-xs text-white/40">%</span>
              </span>
              <span className="text-[9px] text-white/40 mt-0.5">completado</span>
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            {[
              { l: "Enviados", v: nf(campana.enviados), c: "#fff" },
              { l: "Pendientes", v: nf(faltan), c: "rgba(255,255,255,0.55)" },
              { l: "ETA", v: etaMin < 60 ? `${etaMin} min` : `${Math.floor(etaMin / 60)} h`, c: "#0EA5E9" },
            ].map(x => (
              <div key={x.l}>
                <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">{x.l}</p>
                <p className="text-sm font-mono font-bold truncate" style={{ color: x.c }}>{x.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento + métricas */}
        <div className="min-w-0 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                Rendimiento en tiempo real
              </p>
              <p className="text-[11px] font-mono font-bold" style={{ color: "#0EA5E9" }}>
                {nf(ritmo)} msg/min
              </p>
            </div>
            <div className="flex items-end gap-[3px] h-14">
              {tput.map((v, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t transition-all duration-500"
                  style={{
                    height: `${Math.max(8, (v / maxT) * 100)}%`,
                    background: i === tput.length - 1 ? "#38bdf8" : "rgba(14,165,233,0.45)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { l: "Entregados", v: campana.entregados, c: "#10b981" },
              { l: "Leídos", v: campana.leidos, c: "#0EA5E9" },
              { l: "Respuestas", v: campana.respondidos, c: "#a78bfa" },
              { l: "Fallidos", v: campana.fallidos, c: "#f87171" },
            ].map(m => (
              <div key={m.l} className="rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="text-[9px] text-white/40 font-semibold truncate">{m.l}</p>
                <p className="text-sm font-bold font-mono" style={{ color: m.c }}>{nf(m.v)}</p>
                <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct(m.v, campana.enviados)}%`, background: m.c }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bitácora — altura fija con desplazamiento propio */}
        <div className="rounded-xl p-3 min-w-0 flex flex-col" style={{ background: "rgba(0,0,0,0.18)", height: 196 }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2 shrink-0">
            Bitácora del envío
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {eventos.map(ev => {
              const m = eventoMeta[ev.tipo]
              return (
                <div key={ev.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: m.color }} />
                  <p className="text-[10px] leading-snug text-white/70 flex-1 min-w-0">{ev.texto}</p>
                  <span className="text-[9px] font-mono text-white/25 shrink-0">{ev.hora}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Consola en reposo — evita que la página salte
   cuando no hay ninguna campaña transmitiendo
───────────────────────────────────────────── */
function ConsolaEnReposo({
  proxima,
  onNueva,
}: {
  proxima: Campana | null
  onNueva: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-6 flex items-center gap-5 flex-wrap">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#f1f5f9" }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-300">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293 1.293a1 1 0 101.414 1.414l1.586-1.586A1 1 0 0011 11V7z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-700">No hay envíos en curso</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {proxima
            ? `La siguiente campaña programada es “${proxima.nombre}” el ${proxima.fecha} a las ${proxima.hora}.`
            : "Cuando lances una campaña, aquí verás el avance en tiempo real."}
        </p>
      </div>
      <button
        onClick={onNueva}
        className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
        style={{ background: "#1E3A8A" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
        onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
      >
        Crear campaña
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tarjeta de campaña
───────────────────────────────────────────── */
function TarjetaCampana({
  c,
  abierta,
  onToggle,
  onEstado,
  onInforme,
}: {
  c: Campana
  abierta: boolean
  onToggle: () => void
  onEstado: (e: EstadoCampana) => void
  onInforme: () => void
}) {
  const progreso = c.total > 0 ? Math.round((c.enviados / c.total) * 100) : 0

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: abierta ? "#c7d7fe" : "#e2e8f0", boxShadow: abierta ? "0 4px 20px rgba(30,58,138,0.07)" : undefined }}
    >
      <button onClick={onToggle} className="w-full text-left px-5 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors">
        <div className="flex items-start gap-3.5">
          {/* Icono de canal */}
          <div className="flex -space-x-2 shrink-0 pt-0.5">
            {c.canales.map(cn => (
              <span
                key={cn}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white"
                style={{ background: canalMeta[cn].bg, color: canalMeta[cn].color }}
                title={canalMeta[cn].label}
              >
                <CanalIcon canal={cn} className="w-4 h-4" />
              </span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{c.nombre}</h3>
              <EstadoPill estado={c.estado} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              <span className="font-mono">{c.id}</span> · {c.segmento} · {c.plantilla} · {c.autor}
            </p>

            {/* Progreso */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progreso}%`,
                    background: c.estado === "Fallida" ? "#ef4444" : "linear-gradient(90deg,#1E3A8A,#0EA5E9)",
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                <span className="font-bold text-slate-600">{nf(c.enviados)}</span> / {nf(c.total)}
              </span>
            </div>

            {/* Métricas resumidas */}
            <div className="flex items-center gap-4 flex-wrap mt-2">
              {[
                { l: "Entrega", v: pct(c.entregados, c.enviados), c: "#059669" },
                { l: "Lectura", v: pct(c.leidos, c.enviados), c: "#0EA5E9" },
                { l: "Respuesta", v: pct(c.respondidos, c.enviados), c: "#6d28d9" },
                { l: "Fallidos", v: pct(c.fallidos, c.enviados), c: "#dc2626" },
              ].map(x => (
                <span key={x.l} className="text-[10px] text-slate-400">
                  {x.l} <span className="font-mono font-bold" style={{ color: x.c }}>{x.v}%</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-400">{c.fecha}</span>
            <span className="text-[10px] text-slate-300">{c.hora}</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-slate-300 transition-transform"
              style={{ transform: abierta ? "rotate(180deg)" : undefined }}
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </button>

      {/* Panel expandido */}
      {abierta && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 grid md:grid-cols-[1fr_240px] gap-5">
          <div className="space-y-3 pt-4 min-w-0">
            <p className="text-xs text-slate-500 leading-relaxed">{c.descripcion}</p>
            <div className="space-y-2.5">
              <BarraEmbudo label="Enviados" valor={c.enviados} base={c.total} color="#1E3A8A" />
              <BarraEmbudo label="Entregados" valor={c.entregados} base={c.total} color="#2d4fa8" />
              <BarraEmbudo label="Leídos" valor={c.leidos} base={c.total} color="#0EA5E9" />
              <BarraEmbudo label="Respondidos" valor={c.respondidos} base={c.total} color="#38bdf8" />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 p-3" style={{ background: "#f8fafc" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Detalle</p>
              {[
                { l: "Canales", v: c.canales.map(x => canalMeta[x].label).join(", ") },
                { l: "Audiencia", v: c.segmento },
                { l: "Plantilla", v: c.plantilla },
                { l: "Responsable", v: c.autor },
                { l: "Fallidos", v: nf(c.fallidos) },
              ].map(f => (
                <div key={f.l} className="flex items-start justify-between gap-3 py-1">
                  <span className="text-[10px] text-slate-400 shrink-0">{f.l}</span>
                  <span className="text-[10px] font-semibold text-slate-600 text-right">{f.v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {c.estado === "Enviando" && (
                <button
                  onClick={() => onEstado("Pausada")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                >
                  Pausar
                </button>
              )}
              {(c.estado === "Pausada" || c.estado === "Programada") && (
                <button
                  onClick={() => onEstado("Enviando")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer"
                  style={{ background: "#1E3A8A" }}
                >
                  {c.estado === "Pausada" ? "Reanudar" : "Enviar ahora"}
                </button>
              )}
              {c.estado === "Borrador" && (
                <button
                  onClick={() => onEstado("Programada")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer"
                  style={{ background: "#1E3A8A" }}
                >
                  Programar
                </button>
              )}
              {c.estado === "Fallida" && (
                <button
                  onClick={() => onEstado("Programada")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Reintentar fallidos
                </button>
              )}
              <button className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                Duplicar
              </button>
              <button
                onClick={onInforme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Ver informe
              </button>
            </div>
            <p className="text-[9px] text-slate-300 leading-relaxed">
              Las respuestas de esta campaña se enrutan automáticamente al módulo de Envíos Individuales.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Módulo
───────────────────────────────────────────── */
interface Props {
  /** Simula el avance de la campaña en curso. Apagarlo congela la consola, útil para capturas y videos. */
  simularEnvio?: boolean
}

export default function EnviosMasivos({ simularEnvio = true }: Props) {
  const [tab, setTab] = useState<Tab>("campanas")
  const [campanas, setCampanas] = useState<Campana[]>(mockCampanas)
  const [plantillas, setPlantillas] = useState<Plantilla[]>(mockPlantillas)
  const [segmentos, setSegmentos] = useState<Segmento[]>(mockSegmentos)
  const [filtro, setFiltro] = useState<Filtro>("Todas")
  const [busqueda, setBusqueda] = useState("")
  const [abierta, setAbierta] = useState<string | null>(null)
  const [wizard, setWizard] = useState(false)
  const [informe, setInforme] = useState<Campana | null>(null)
  const [editorPlantilla, setEditorPlantilla] = useState<{ abierto: boolean; base: Plantilla | null }>({
    abierto: false,
    base: null,
  })
  const [importador, setImportador] = useState(false)
  const [enVivo, setEnVivo] = useState(true)
  const [tput, setTput] = useState<number[]>(() =>
    Array.from({ length: 30 }, (_, i) => 210 + Math.round(seedNoise(i, 5) * 160)),
  )
  const [eventos, setEventos] = useState<Evento[]>([
    { id: 5, tipo: "ok", texto: "Lote #27 entregado a 42 destinatarios", hora: "09:41" },
    { id: 4, tipo: "leido", texto: "31 mensajes marcados como leídos", hora: "09:40" },
    { id: 3, tipo: "alerta", texto: "3 números sin WhatsApp — reenviados por SMS", hora: "09:40" },
    { id: 2, tipo: "respuesta", texto: "6 respuestas enrutadas a Envíos Individuales", hora: "09:39" },
    { id: 1, tipo: "info", texto: "Campaña iniciada · ritmo 300 msg/min", hora: "09:00" },
  ])
  const contador = useRef(0)
  const eventoId = useRef(100)

  const activa = campanas.find(c => c.estado === "Enviando") ?? null

  /* Simulación del envío en curso */
  useEffect(() => {
    if (!simularEnvio || !enVivo || !activa) return
    const t = setInterval(() => {
      const k = ++contador.current

      setCampanas(prev =>
        prev.map(c => {
          if (c.estado !== "Enviando") return c
          const faltan = c.total - c.enviados
          if (faltan <= 0) return { ...c, estado: "Completada" as EstadoCampana }
          const lote = Math.min(faltan, 22 + Math.round(seedNoise(k, 3) * 30))
          const fallidos = Math.round(lote * 0.018)
          const entregados = lote - fallidos
          return {
            ...c,
            enviados: c.enviados + lote,
            entregados: c.entregados + entregados,
            leidos: c.leidos + Math.round(entregados * 0.61),
            respondidos: c.respondidos + Math.round(entregados * 0.09),
            fallidos: c.fallidos + fallidos,
          }
        }),
      )

      setTput(prev => [...prev.slice(1), 210 + Math.round(seedNoise(k, 11) * 170)])

      const guiones: { tipo: Evento["tipo"]; texto: string }[] = [
        { tipo: "ok", texto: `Lote #${27 + k} entregado a ${34 + Math.round(seedNoise(k, 2) * 22)} destinatarios` },
        { tipo: "leido", texto: `${18 + Math.round(seedNoise(k, 6) * 24)} mensajes marcados como leídos` },
        { tipo: "respuesta", texto: `${2 + Math.round(seedNoise(k, 9) * 7)} respuestas enrutadas a Envíos Individuales` },
        { tipo: "alerta", texto: `${1 + Math.round(seedNoise(k, 4) * 4)} números sin WhatsApp — reenviados por SMS` },
        { tipo: "info", texto: `Ritmo ajustado a ${210 + Math.round(seedNoise(k, 11) * 170)} msg/min` },
      ]
      const ev = guiones[k % guiones.length]
      setEventos(prev =>
        [
          {
            id: ++eventoId.current,
            ...ev,
            hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ].slice(0, 30),
      )
    }, 1700)
    return () => clearInterval(t)
  }, [simularEnvio, enVivo, activa?.id])

  /* Agregados */
  const agg = campanas.reduce(
    (a, c) => ({
      enviados: a.enviados + c.enviados,
      entregados: a.entregados + c.entregados,
      leidos: a.leidos + c.leidos,
      respondidos: a.respondidos + c.respondidos,
      fallidos: a.fallidos + c.fallidos,
    }),
    { enviados: 0, entregados: 0, leidos: 0, respondidos: 0, fallidos: 0 },
  )

  const filtradas = campanas.filter(c => {
    if (filtro !== "Todas" && c.estado !== filtro) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.segmento.toLowerCase().includes(q)
      )
    }
    return true
  })

  const conteos: Record<Filtro, number> = {
    Todas: campanas.length,
    Borrador: campanas.filter(c => c.estado === "Borrador").length,
    Programada: campanas.filter(c => c.estado === "Programada").length,
    Enviando: campanas.filter(c => c.estado === "Enviando").length,
    Pausada: campanas.filter(c => c.estado === "Pausada").length,
    Completada: campanas.filter(c => c.estado === "Completada").length,
    Fallida: campanas.filter(c => c.estado === "Fallida").length,
  }

  /* Rendimiento por canal, repartido entre los canales de cada campaña */
  const porCanal = (Object.keys(canalMeta) as Canal[]).map(cn => {
    const cs = campanas.filter(c => c.canales.includes(cn))
    const tot = cs.reduce(
      (a, c) => {
        const n = c.canales.length
        return {
          enviados: a.enviados + c.enviados / n,
          entregados: a.entregados + c.entregados / n,
          leidos: a.leidos + c.leidos / n,
          respondidos: a.respondidos + c.respondidos / n,
        }
      },
      { enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
    )
    return { canal: cn, campanas: cs.length, ...tot }
  })

  /* Mejor franja horaria */
  let mejor = { dia: 0, hora: 6, v: 0 }
  diasSemana.forEach((_, d) =>
    horasDia.forEach(h => {
      const v = intensidad(d, h)
      if (v > mejor.v) mejor = { dia: d, hora: h, v }
    }),
  )

  const nextId = `CMP-2026-${String(42 + campanas.length - mockCampanas.length).padStart(4, "0")}`

  const cambiarEstado = (id: string, estado: EstadoCampana) =>
    setCampanas(prev => prev.map(c => (c.id === id ? { ...c, estado } : c)))

  const tabs: [Tab, string][] = [
    ["campanas", "Campañas"],
    ["plantillas", "Plantillas"],
    ["audiencias", "Audiencias"],
    ["rendimiento", "Rendimiento"],
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Barra de pestañas */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === key
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            {label}
            {key === "campanas" && conteos.Enviando > 0 && (
              <span className="ml-2 inline-flex w-1.5 h-1.5 rounded-full align-middle animate-pulse" style={{ background: "#0EA5E9" }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* ═══════════ CAMPAÑAS ═══════════ */}
        {tab === "campanas" && (
          <>
            {/* Banner */}
            <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-6 overflow-hidden relative" style={{ background: "#1E3A8A" }}>
              <div
                className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle at 75% 50%, #0EA5E9 0%, transparent 70%)" }}
              />
              <div className="relative min-w-0">
                <p className="text-white/50 text-xs mb-0.5">Centro de comando</p>
                <h2 className="text-white text-xl font-bold">Envíos Masivos</h2>
                <p className="text-white/60 text-sm mt-1">
                  <span className="text-[#0EA5E9] font-semibold">{conteos.Enviando + conteos.Programada}</span> campañas activas ·{" "}
                  {nf(agg.enviados)} mensajes despachados este mes
                </p>
              </div>
              <div className="relative flex items-center gap-5 shrink-0">
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Tasa de entrega</span>
                  <span className="text-2xl font-bold" style={{ color: "#0EA5E9" }}>
                    {pct(agg.entregados, agg.enviados)}%
                  </span>
                  <span className="text-[10px] text-white/40">{nf(agg.fallidos)} rebotes acumulados</span>
                </div>
                <button
                  onClick={() => setWizard(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
                  style={{ background: "#0EA5E9" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0284c7")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#0EA5E9")}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nueva campaña
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi
                label="Mensajes despachados"
                valor={nf(agg.enviados)}
                delta={18.2}
                color="#1E3A8A"
                spark={[38, 52, 44, 61, 58, 74, 69, 88]}
              />
              <Kpi
                label="Tasa de entrega"
                valor={String(pct(agg.entregados, agg.enviados))}
                sufijo="%"
                delta={1.4}
                color="#059669"
                spark={[92, 94, 93, 95, 96, 95, 97, 96]}
              />
              <Kpi
                label="Tasa de lectura"
                valor={String(pct(agg.leidos, agg.entregados))}
                sufijo="%"
                delta={6.7}
                color="#0EA5E9"
                spark={[54, 58, 61, 59, 66, 71, 69, 74]}
              />
              <Kpi
                label="Rebotes"
                valor={String(pct(agg.fallidos, agg.enviados))}
                sufijo="%"
                delta={-2.3}
                color="#dc2626"
                spark={[9, 8, 7, 8, 6, 5, 5, 4]}
              />
            </div>

            {/* Consola en vivo */}
            {activa ? (
              <ConsolaEnVivo
                campana={activa}
                enVivo={enVivo}
                tput={tput}
                eventos={eventos}
                onToggle={() => setEnVivo(v => !v)}
                onInforme={() => setInforme(activa)}
              />
            ) : (
              <ConsolaEnReposo
                proxima={campanas.find(c => c.estado === "Programada") ?? null}
                onNueva={() => setWizard(true)}
              />
            )}

            {/* Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {(["Todas", "Enviando", "Programada", "Completada", "Pausada", "Borrador", "Fallida"] as Filtro[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      filtro === f
                        ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                    }`}
                  >
                    {f !== "Todas" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: filtro === f ? "#fff" : estadoMeta[f as EstadoCampana].dot }}
                      />
                    )}
                    {f}
                    <span
                      className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                        filtro === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {conteos[f]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative ml-auto">
                <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar campaña…"
                  className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-52 transition-all"
                />
              </div>
            </div>

            {/* Listado */}
            <div className="space-y-3">
              {filtradas.map(c => (
                <TarjetaCampana
                  key={c.id}
                  c={c}
                  abierta={abierta === c.id}
                  onToggle={() => setAbierta(a => (a === c.id ? null : c.id))}
                  onEstado={e => cambiarEstado(c.id, e)}
                  onInforme={() => setInforme(c)}
                />
              ))}
              {filtradas.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-2">
                  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-slate-200">
                    <path d="M8 12h32M8 24h20M8 36h26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-slate-400 font-medium">Sin campañas</p>
                  <p className="text-xs text-slate-300">Ajusta los filtros o crea una nueva campaña</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════ PLANTILLAS ═══════════ */}
        {tab === "plantillas" && (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Biblioteca de plantillas</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mensajes reutilizables con variables dinámicas. Las de WhatsApp requieren aprobación de Meta.
                </p>
              </div>
              <button
                onClick={() => setEditorPlantilla({ abierto: true, base: null })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nueva plantilla
              </button>
            </div>

            {/* Anatomía de una plantilla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800">Anatomía de una plantilla</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">
                Cada plantilla se arma con cuatro bloques. Solo el cuerpo es obligatorio.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { n: "1", t: "Encabezado", d: "Una línea en negrita que resume el mensaje.", req: "Opcional", c: "#0EA5E9" },
                  { n: "2", t: "Cuerpo", d: "El contenido, con variables como {{nombre}}.", req: "Obligatorio", c: "#1E3A8A" },
                  { n: "3", t: "Pie de página", d: "Texto pequeño para la firma o el aviso legal.", req: "Opcional", c: "#6d28d9" },
                  { n: "4", t: "Botones", d: "Respuestas rápidas o enlaces a una página.", req: "Opcional", c: "#059669" },
                ].map(b => (
                  <div key={b.n} className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: b.c }}
                      >
                        {b.n}
                      </span>
                      <p className="text-xs font-bold text-slate-700">{b.t}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{b.d}</p>
                    <p className="text-[9px] font-semibold mt-1.5" style={{ color: b.req === "Obligatorio" ? "#dc2626" : "#94a3b8" }}>
                      {b.req}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {plantillas.map(p => {
                const cm = canalMeta[p.canal]
                const ap = aprobacionMeta[p.aprobacion]
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-[#c7d7fe] transition-colors group">
                    <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cm.bg, color: cm.color }}>
                        <CanalIcon canal={p.canal} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.nombre}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.categoria}</p>
                      </div>
                      <span className="text-[9px] font-bold rounded-full px-2 py-0.5 shrink-0" style={{ background: ap.bg, color: ap.text }}>
                        {p.aprobacion}
                      </span>
                    </div>

                    {/* Vista previa estructurada */}
                    <div className="mx-4 mb-3 rounded-xl p-3 flex-1 space-y-1.5" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      {p.encabezado && (
                        <p className="text-[11px] font-bold text-slate-700 leading-snug">{p.encabezado}</p>
                      )}
                      <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap line-clamp-5">
                        {p.cuerpo}
                      </p>
                      {p.pie && <p className="text-[10px] text-slate-400 italic">{p.pie}</p>}
                      {p.botones && p.botones.length > 0 && (
                        <div className="flex gap-1 flex-wrap pt-1.5 border-t border-slate-200">
                          {p.botones.map((b, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-semibold rounded px-1.5 py-0.5 border"
                              style={{ borderColor: cm.border, color: cm.color, background: "#fff" }}
                            >
                              {b.tipo === "enlace" ? "↗ " : "↩ "}
                              {b.texto}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-4 pb-3 flex gap-1 flex-wrap">
                      {p.variables.map(v => (
                        <span key={v} className="text-[9px] font-mono font-semibold rounded px-1.5 py-0.5" style={{ background: "#fef9c3", color: "#854d0e" }}>
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>

                    <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2" style={{ background: "#f8fafc" }}>
                      <span className="text-[10px] text-slate-400">
                        <span className="font-mono font-bold text-slate-600">{nf(p.usos)}</span> envíos ·{" "}
                        <span className="font-mono font-bold" style={{ color: cm.color }}>{p.tasaLectura}%</span> lectura
                      </span>
                      <button
                        onClick={() => setEditorPlantilla({ abierto: true, base: p })}
                        className="text-[10px] font-semibold text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Tarjeta para crear */}
              <button
                onClick={() => setEditorPlantilla({ abierto: true, base: null })}
                className="rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 py-12 text-slate-300 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer min-h-[240px]"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold">Crear plantilla</span>
              </button>
            </div>
          </>
        )}

        {/* ═══════════ AUDIENCIAS ═══════════ */}
        {tab === "audiencias" && (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Audiencias y segmentos</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Una audiencia es una lista de destinatarios con su canal de contacto verificado.
                </p>
              </div>
              <button
                onClick={() => setImportador(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nueva audiencia
              </button>
            </div>

            {/* ¿De dónde salen los contactos? */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800">¿De dónde salen estos contactos?</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">
                Los destinatarios llegan al módulo por tres caminos. Todos terminan en la misma tabla de contactos.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {(["pqrs", "regla", "importacion"] as const).map((o, i) => {
                  const m = origenMeta[o]
                  const cuantos = segmentos.filter(s => s.origen === o).length
                  return (
                    <div key={o} className="relative rounded-xl border border-slate-200 p-4" style={{ background: "#f8fafc" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: m.bg, color: m.color }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-700">{m.label}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{m.descripcion}</p>
                      <p className="text-[10px] font-semibold mt-2.5" style={{ color: m.color }}>
                        {cuantos} audiencia{cuantos === 1 ? "" : "s"} de este tipo
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-slate-300">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Un contacto solo entra a una campaña si tiene al menos un canal alcanzable —teléfono o correo— y su
                  autorización de tratamiento de datos vigente. Los que cancelan la suscripción se excluyen de forma
                  automática en todos los envíos siguientes.
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: "Contactos únicos", v: nf(segmentos.reduce((a, s) => a + s.total, 0)), c: "#1E3A8A", b: "#fff", bd: "#e2e8f0" },
                { l: "Con opt-in vigente", v: "96,9%", c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
                { l: "Audiencias activas", v: String(segmentos.length), c: "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
                { l: "Contactos sin canal", v: "412", c: "#d97706", b: "#fffbeb", bd: "#fde68a" },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
                  <p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {segmentos.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-[#c7d7fe] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{s.nombre}</h3>
                        <span
                          className="text-[9px] font-bold rounded-full px-2 py-0.5 shrink-0"
                          style={{ background: origenMeta[s.origen].bg, color: origenMeta[s.origen].color }}
                        >
                          {origenMeta[s.origen].corto}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{s.descripcion}</p>
                      {s.archivo && (
                        <p className="text-[10px] font-mono text-slate-300 mt-1 truncate">📄 {s.archivo}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold" style={{ color: "#1E3A8A" }}>{nf(s.total)}</p>
                      <p
                        className="text-[10px] font-bold"
                        style={{ color: s.crecimiento >= 0 ? "#059669" : "#dc2626" }}
                      >
                        {s.crecimiento >= 0 ? "▲" : "▼"} {Math.abs(s.crecimiento)}%
                      </p>
                    </div>
                  </div>

                  {/* Reglas */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.filtros.map((f, i) => (
                      <span key={f} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-[9px] font-bold text-slate-300">Y</span>}
                        <span className="text-[10px] font-mono font-medium rounded-md px-2 py-1 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }}>
                          {f}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Mezcla de canales */}
                  <div className="mt-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Cobertura por canal
                    </p>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      {(["whatsapp", "sms", "email"] as const).map(cn => (
                        <span key={cn} style={{ width: `${s.mix[cn]}%`, background: canalMeta[cn].color }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {(["whatsapp", "sms", "email"] as const).map(cn => (
                        <span key={cn} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: canalMeta[cn].color }} />
                          {canalMeta[cn].label} <span className="font-semibold text-slate-600">{s.mix[cn]}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Actualizado {s.actualizado.toLowerCase()}</span>
                    <div className="flex gap-1.5">
                      <button className="px-3 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
                        Editar reglas
                      </button>
                      <button
                        onClick={() => setWizard(true)}
                        className="px-3 py-1 rounded-lg text-[10px] font-semibold text-white transition-all cursor-pointer"
                        style={{ background: "#1E3A8A" }}
                      >
                        Enviar a este grupo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════ RENDIMIENTO ═══════════ */}
        {tab === "rendimiento" && (
          <>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Rendimiento de los envíos</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comportamiento acumulado de todas las campañas del periodo.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Embudo */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Embudo de conversión</h3>
                <div className="space-y-3">
                  <BarraEmbudo label="Enviados" valor={agg.enviados} base={agg.enviados} color="#1E3A8A" />
                  <BarraEmbudo label="Entregados" valor={agg.entregados} base={agg.enviados} color="#2d4fa8" />
                  <BarraEmbudo label="Leídos" valor={agg.leidos} base={agg.enviados} color="#0EA5E9" />
                  <BarraEmbudo label="Respondidos" valor={agg.respondidos} base={agg.enviados} color="#38bdf8" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
                  {[
                    { l: "Pérdida en entrega", v: `${pct(agg.enviados - agg.entregados, agg.enviados)}%`, c: "#dc2626" },
                    { l: "Apertura sobre entregados", v: `${pct(agg.leidos, agg.entregados)}%`, c: "#0EA5E9" },
                    { l: "Interacción sobre leídos", v: `${pct(agg.respondidos, agg.leidos)}%`, c: "#059669" },
                  ].map(x => (
                    <div key={x.l}>
                      <p className="text-lg font-bold" style={{ color: x.c }}>{x.v}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{x.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparativa por canal */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Por canal</h3>
                <div className="space-y-4">
                  {porCanal.map(x => {
                    const cm = canalMeta[x.canal]
                    const lectura = pct(x.leidos, x.entregados)
                    return (
                      <div key={x.canal}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: cm.bg, color: cm.color }}>
                            <CanalIcon canal={x.canal} className="w-3 h-3" />
                          </span>
                          <span className="text-xs font-semibold text-slate-600">{cm.label}</span>
                          <span className="ml-auto text-[11px] font-mono font-bold" style={{ color: cm.color }}>
                            {lectura}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${lectura}%`, background: cm.color }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {nf(Math.round(x.enviados))} enviados · {x.campanas} campaña{x.campanas === 1 ? "" : "s"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mapa de calor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Mejor franja para enviar</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tasa de lectura histórica por día y hora, sobre los últimos 90 días.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Menor</span>
                  <div className="flex gap-0.5">
                    {[0.12, 0.3, 0.5, 0.7, 0.92].map(v => (
                      <span key={v} className="w-4 h-3 rounded-sm" style={{ background: `rgba(30,58,138,${v})` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">Mayor</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Horas */}
                  <div className="flex gap-0.5 pl-9 mb-1">
                    {horasDia.map(h => (
                      <span key={h} className="flex-1 min-w-[22px] text-center text-[8px] font-mono text-slate-300">
                        {h}
                      </span>
                    ))}
                  </div>
                  {diasSemana.map((d, di) => (
                    <div key={d} className="flex gap-0.5 items-center mb-0.5">
                      <span className="w-9 text-[9px] font-semibold text-slate-400 shrink-0">{d}</span>
                      {horasDia.map(h => {
                        const v = intensidad(di, h)
                        const esMejor = di === mejor.dia && h === mejor.hora
                        return (
                          <span
                            key={h}
                            title={`${d} ${h}:00 · ${Math.round(v * 100)}% de lectura`}
                            className="flex-1 min-w-[22px] h-6 rounded-sm transition-transform hover:scale-110 cursor-default"
                            style={{
                              background: `rgba(30,58,138,${0.08 + v * 0.9})`,
                              boxShadow: esMejor ? "0 0 0 2px #0EA5E9" : undefined,
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#eff3ff" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#1E3A8A" }}>
                  <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  La mejor franja histórica es el{" "}
                  <span className="font-bold text-[#1E3A8A]">
                    {diasSemana[mejor.dia]} a las {mejor.hora}:00
                  </span>
                  , con una lectura estimada del{" "}
                  <span className="font-bold text-[#1E3A8A]">{Math.round(mejor.v * 100)}%</span>. Programar los
                  envíos en esta ventana puede subir la interacción frente a un envío nocturno.
                </p>
              </div>
            </div>

            {/* Tabla comparativa */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Detalle por campaña</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Campaña", "Canal", "Estado", "Enviados", "Entrega", "Lectura", "Respuesta", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campanas.map(c => (
                      <tr
                        key={c.id}
                        onClick={() => setInforme(c)}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-slate-700 truncate max-w-[220px]">{c.nombre}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{c.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {c.canales.map(cn => (
                              <CanalChip key={cn} canal={cn} size="xs" />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3"><EstadoPill estado={c.estado} /></td>
                        <td className="px-4 py-3 text-[11px] font-mono font-bold text-slate-600">{nf(c.enviados)}</td>
                        {[
                          { v: pct(c.entregados, c.enviados), c: "#059669" },
                          { v: pct(c.leidos, c.enviados), c: "#0EA5E9" },
                          { v: pct(c.respondidos, c.enviados), c: "#6d28d9" },
                        ].map((x, i) => (
                          <td key={i} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${x.v}%`, background: x.c }} />
                              </div>
                              <span className="text-[11px] font-mono font-semibold" style={{ color: x.c }}>{x.v}%</span>
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold text-slate-300 group-hover:text-[#1E3A8A] transition-colors">
                            Ver informe →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pie */}
      <div className="bg-white border-t border-slate-100 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span>© 2026 Concept BPO. Meta Business Partner.</span>
        <div className="flex gap-4">
          {["Política de privacidad", "Términos del servicio", "Seguridad"].map(l => (
            <button key={l} className="hover:text-slate-600 transition-colors cursor-pointer">
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Asistente de campaña */}
      {wizard && (
        <CampanaWizard
          segmentos={segmentos}
          plantillas={plantillas}
          nextId={nextId}
          onClose={() => setWizard(false)}
          onCreate={c => {
            setCampanas(prev => [c, ...prev])
            setWizard(false)
            setTab("campanas")
            setFiltro("Todas")
            setAbierta(c.id)
          }}
        />
      )}

      {/* Informe de campaña */}
      {informe && <InformeCampana campana={informe} onClose={() => setInforme(null)} />}

      {/* Editor de plantillas */}
      {editorPlantilla.abierto && (
        <PlantillaEditor
          inicial={editorPlantilla.base}
          onClose={() => setEditorPlantilla({ abierto: false, base: null })}
          onGuardar={p => {
            setPlantillas(prev => {
              const existe = prev.some(x => x.id === p.id)
              return existe ? prev.map(x => (x.id === p.id ? p : x)) : [p, ...prev]
            })
            setEditorPlantilla({ abierto: false, base: null })
            setTab("plantillas")
          }}
        />
      )}

      {/* Importador de audiencias */}
      {importador && (
        <ImportarAudiencia
          onClose={() => setImportador(false)}
          onCrear={s => {
            setSegmentos(prev => [s, ...prev])
            setImportador(false)
            setTab("audiencias")
          }}
        />
      )}
    </div>
  )
}
