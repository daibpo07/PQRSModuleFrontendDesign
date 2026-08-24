import { useState } from "react"
import { Avatar, canalLabel } from "./EnviosIndividualesData"
import {
  ASESOR_ACTUAL,
  estadoEspera,
  estadoTransferenciaEstilo,
  formatoDuracion,
  SLA_ACEPTACION_MIN,
  prioridadEstilo,
  ventanaMeta,
  type EstadoTransferencia,
  type Transferencia,
} from "./TransferenciasData"

/* ─────────────────────────────────────────────
   Subvista Transferencias

   Dos bandejas: lo que me pasaron y lo que pasé.
   La primera es una cola de trabajo —mientras algo
   siga pendiente hay un ciudadano esperando—, la
   segunda es seguimiento: saber si el compañero
   aceptó o me devolvió el caso.
───────────────────────────────────────────── */

type Bandeja = "recibidas" | "enviadas"
type Filtro = EstadoTransferencia | "todas"

function Kpi({
  valor,
  label,
  color,
  destacado = false,
}: {
  valor: number
  label: string
  color: string
  destacado?: boolean
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-3 flex-1 min-w-0"
      style={{
        borderColor: destacado ? color + "45" : "#e2e8f0",
        background: destacado ? color + "0f" : "#fff",
      }}
    >
      <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: valor === 0 ? "#cbd5e1" : color }}>
        {valor}
      </p>
      <p className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-snug">{label}</p>
    </div>
  )
}

function TarjetaTransferencia({
  t,
  bandeja,
  onAbrir,
}: {
  t: Transferencia
  bandeja: Bandeja
  onAbrir: () => void
}) {
  const cl = canalLabel[t.canal]
  const pr = prioridadEstilo[t.prioridad]
  const est = estadoTransferenciaEstilo[t.estado]
  const espera = estadoEspera(t.esperaMin)
  const ventana = ventanaMeta(t)
  const pendiente = t.estado === "pendiente"
  const contraparte = bandeja === "recibidas" ? t.origen : t.destino

  return (
    <button
      onClick={onAbrir}
      className="w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1E3A8A]/30 transition-all cursor-pointer overflow-hidden flex group"
    >
      {/* Filo de color: pendiente urge, resuelta ya no */}
      <span
        className="w-1 shrink-0"
        style={{ background: pendiente ? (bandeja === "recibidas" ? espera.color : "#1E3A8A") : est.dot }}
      />

      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start gap-3">
          <Avatar name={t.contacto} size={40} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-800 truncate">{t.contacto}</h4>
              <span
                className="text-[10px] font-bold rounded px-1.5 py-0.5"
                style={{ background: cl.bg, color: cl.color }}
              >
                {cl.label}
              </span>
              {t.radicado && <span className="text-[10px] font-mono text-slate-400">{t.radicado}</span>}
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: pr.bg, color: pr.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: pr.dot }} />
                {t.prioridad}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              {bandeja === "recibidas" ? "De" : "Para"}{" "}
              <span className="font-semibold text-slate-600">{contraparte.nombre}</span> ·{" "}
              {contraparte.equipo} · {t.motivo}
            </p>

            {/* Adelanto de la nota interna: es lo que permite priorizar sin abrir */}
            <div
              className="flex items-start gap-1.5 mt-2.5 rounded-lg px-2.5 py-1.5 border"
              style={{ background: "#fffbeb", borderColor: "#fef3c7" }}
            >
              <svg viewBox="0 0 20 20" fill="#b45309" className="w-3 h-3 shrink-0 mt-px">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[11px] leading-snug line-clamp-2" style={{ color: "#78350f" }}>
                {t.notaInterna}
              </p>
            </div>

            {/* Señales de tiempo */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {pendiente ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border"
                  style={{ background: espera.bg, borderColor: espera.borde, color: espera.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: espera.color }} />
                  Esperando {formatoDuracion(t.esperaMin)}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: est.bg, color: est.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                  {est.label} · {t.respuesta?.hora}
                </span>
              )}

              {ventana.aplica && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                  style={{ background: ventana.bg, borderColor: ventana.borde, color: ventana.color }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {ventana.abierta ? `Ventana ${formatoDuracion(ventana.restante)}` : "Ventana cerrada"}
                </span>
              )}

              <span className="text-[10px] text-slate-300">
                {t.mensajes.filter(m => !m.sistema).length} mensajes
              </span>
            </div>
          </div>

          {/* Llamado a la acción */}
          <span
            className="shrink-0 self-center inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all"
            style={{
              background: pendiente ? "#eff3ff" : "#f8fafc",
              color: pendiente ? "#1E3A8A" : "#94a3b8",
            }}
          >
            {pendiente && bandeja === "recibidas" ? "Revisar" : "Ver"}
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </button>
  )
}

export default function Transferencias({
  transferencias,
  onAbrir,
}: {
  transferencias: Transferencia[]
  onAbrir: (t: Transferencia) => void
}) {
  const [bandeja, setBandeja] = useState<Bandeja>("recibidas")
  const [filtro, setFiltro] = useState<Filtro>("pendiente")

  const recibidas = transferencias.filter(t => t.destino.nombre === ASESOR_ACTUAL)
  const enviadas = transferencias.filter(t => t.origen.nombre === ASESOR_ACTUAL)
  const lista = bandeja === "recibidas" ? recibidas : enviadas

  const pendientes = lista.filter(t => t.estado === "pendiente")
  const fueraDeSla = pendientes.filter(t => estadoEspera(t.esperaMin).id === "vencida")
  const aceptadas = lista.filter(t => t.estado === "aceptada")
  const rechazadas = lista.filter(t => t.estado === "rechazada")

  const visibles = (filtro === "todas" ? lista : lista.filter(t => t.estado === filtro)).sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === "pendiente" ? -1 : 1
    return b.esperaMin - a.esperaMin
  })

  const filtros: [Filtro, string, number][] = [
    ["pendiente", "Pendientes", pendientes.length],
    ["aceptada", "Aceptadas", aceptadas.length],
    ["rechazada", "Rechazadas", rechazadas.length],
    ["todas", "Todas", lista.length],
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto">

        {/* ───── Encabezado ───── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Transferencias</h2>
            <p className="text-xs text-slate-400 mt-1">
              Conversaciones que otro asesor te ofrece con su contexto, y las que tú entregaste.
            </p>
          </div>

          {/* Segmentos */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shrink-0">
            {(
              [
                ["recibidas", "Recibidas", recibidas.filter(t => t.estado === "pendiente").length],
                ["enviadas", "Enviadas", enviadas.filter(t => t.estado === "pendiente").length],
              ] as [Bandeja, string, number][]
            ).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => {
                  setBandeja(key)
                  setFiltro("pendiente")
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                style={{
                  background: bandeja === key ? "#1E3A8A" : "transparent",
                  color: bandeja === key ? "#fff" : "#64748b",
                }}
              >
                {label}
                {n > 0 && (
                  <span
                    className="rounded-full px-1.5 py-px text-[10px] font-bold"
                    style={{
                      background: bandeja === key ? "rgba(255,255,255,0.22)" : "#eff3ff",
                      color: bandeja === key ? "#fff" : "#1E3A8A",
                    }}
                  >
                    {n}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ───── Estado de la bandeja ───── */}
        <div className="flex items-stretch gap-3 mt-5">
          <Kpi
            valor={pendientes.length}
            label={bandeja === "recibidas" ? "Esperando tu decisión" : "Esperando respuesta del destino"}
            color="#1E3A8A"
            destacado={pendientes.length > 0}
          />
          <Kpi
            valor={fueraDeSla.length}
            label={`Fuera del SLA de ${SLA_ACEPTACION_MIN} min`}
            color="#dc2626"
            destacado={fueraDeSla.length > 0}
          />
          <Kpi valor={aceptadas.length} label="Aceptadas" color="#059669" />
          <Kpi valor={rechazadas.length} label="Devueltas al origen" color="#94a3b8" />
        </div>

        {/* Aviso cuando hay algo vencido: es la única alarma real de esta vista */}
        {fueraDeSla.length > 0 && bandeja === "recibidas" && (
          <div
            className="flex items-start gap-2.5 mt-3 rounded-xl border px-4 py-3"
            style={{ background: "#fef2f2", borderColor: "#fecaca" }}
          >
            <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-px">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] leading-relaxed" style={{ color: "#991b1b" }}>
              <span className="font-bold">
                {fueraDeSla.length}{" "}
                {fueraDeSla.length === 1 ? "transferencia pasó" : "transferencias pasaron"} los{" "}
                {SLA_ACEPTACION_MIN} min
              </span>{" "}
              sin decisión. Mientras nadie acepta o rechaza, el ciudadano sigue esperando sin que ningún
              asesor tenga el caso asignado.
            </p>
          </div>
        )}

        {/* ───── Filtros ───── */}
        <div className="flex items-center gap-1.5 mt-5 flex-wrap">
          {filtros.map(([key, label, n]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer"
              style={{
                background: filtro === key ? "#eff3ff" : "#fff",
                borderColor: filtro === key ? "#1E3A8A" : "#e2e8f0",
                color: filtro === key ? "#1E3A8A" : "#64748b",
              }}
            >
              {label}
              <span
                className="rounded-full px-1.5 text-[10px] font-bold"
                style={{
                  background: filtro === key ? "#dce5fb" : "#f1f5f9",
                  color: filtro === key ? "#1E3A8A" : "#94a3b8",
                }}
              >
                {n}
              </span>
            </button>
          ))}
        </div>

        {/* ───── Lista ───── */}
        <div className="flex flex-col gap-2.5 mt-4 pb-6">
          {visibles.map(t => (
            <TarjetaTransferencia key={t.id} t={t} bandeja={bandeja} onAbrir={() => onAbrir(t)} />
          ))}

          {visibles.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "#eff3ff", color: "#1E3A8A" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7h11m0 0l-3-3m3 3l-3 3M16 17H5m0 0l3 3m-3-3l3-3"
                  />
                </svg>
              </span>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">
                  {filtro === "pendiente"
                    ? bandeja === "recibidas"
                      ? "No tienes transferencias por revisar"
                      : "No tienes transferencias esperando respuesta"
                    : "Nada en este filtro"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {filtro === "pendiente" && bandeja === "recibidas"
                    ? "Cuando un compañero te pase una conversación, aparecerá aquí con su nota interna."
                    : "Cambia de filtro para ver el resto del historial."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
