import { useState } from "react"
import { estadoAgenteMeta, nf, type Agente } from "./FlujosData"

interface Props {
  agentes: Agente[]
  onReasignar: (origen: string, destino: string) => void
}

const reglasAsignacion = [
  {
    id: "r1",
    nombre: "Menor carga activa",
    detalle: "El caso va a quien tenga menos tareas abiertas dentro del rol requerido.",
    activa: true,
  },
  {
    id: "r2",
    nombre: "Por dependencia",
    detalle: "Respeta la dependencia definida en la clasificación del radicado.",
    activa: true,
  },
  {
    id: "r3",
    nombre: "Continuidad del analista",
    detalle: "Si el ciudadano ya fue atendido antes, se prioriza el mismo responsable.",
    activa: true,
  },
  {
    id: "r4",
    nombre: "Rotación equitativa",
    detalle: "Reparte por turnos sin mirar la carga. Se usa como respaldo cuando las anteriores empatan.",
    activa: false,
  },
]

function Avatar({ nombre, size = 36 }: { nombre: string; size?: number }) {
  const paleta = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2"]
  let h = 0
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) % paleta.length
  const iniciales = nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("")
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: paleta[h], fontSize: size * 0.34 }}
    >
      {iniciales}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Subvista Equipo y cargas
───────────────────────────────────────────── */
export default function EquipoCargas({ agentes, onReasignar }: Props) {
  const [origen, setOrigen] = useState<string>("")
  const [destino, setDestino] = useState<string>("")
  const [reglas, setReglas] = useState(reglasAsignacion)

  const totalActivas = agentes.reduce((a, x) => a + x.activas, 0)
  const totalCapacidad = agentes.filter(a => a.estado !== "Ausente").reduce((a, x) => a + x.capacidad, 0)
  const totalVencidas = agentes.reduce((a, x) => a + x.vencidas, 0)
  const ocupacion = totalCapacidad > 0 ? Math.round((totalActivas / totalCapacidad) * 100) : 0
  const maxCarga = Math.max(...agentes.map(a => Math.max(a.activas, a.capacidad)), 1)

  const sobrecargados = agentes.filter(a => a.activas > a.capacidad)
  const disponibles = agentes.filter(a => a.estado === "Disponible" && a.activas < a.capacidad)

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      <div>
        <h2 className="text-sm font-bold text-slate-800">Equipo y distribución de carga</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Cómo está repartido el trabajo hoy y con qué reglas se asignan los casos nuevos.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Tareas activas", v: nf(totalActivas), c: "#1E3A8A", b: "#fff", bd: "#e2e8f0" },
          { l: "Ocupación del equipo", v: `${ocupacion}%`, c: ocupacion > 90 ? "#dc2626" : "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
          { l: "Tareas vencidas", v: nf(totalVencidas), c: "#dc2626", b: "#fef2f2", bd: "#fecaca" },
          { l: "Personas disponibles", v: String(disponibles.length), c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
            <p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* Carga por persona */}
        <div className="space-y-4 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Carga por persona</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                La barra clara es la capacidad definida; la sólida, las tareas que tiene abiertas.
              </p>
            </div>
            <div className="divide-y divide-slate-50">
              {agentes.map(a => {
                const m = estadoAgenteMeta[a.estado]
                const excede = a.activas > a.capacidad
                return (
                  <div key={a.id} className="px-5 py-4 flex items-center gap-4">
                    <Avatar nombre={a.nombre} size={38} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">{a.nombre}</p>
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                          style={{ background: m.bg, color: m.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
                          {a.estado}
                        </span>
                        {a.vencidas > 0 && (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#fee2e2", color: "#991b1b" }}>
                            {a.vencidas} vencida{a.vencidas === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.rol}</p>

                      {/* Barra de carga */}
                      <div className="relative h-2.5 rounded-full mt-2 overflow-hidden" style={{ background: "#f1f5f9" }}>
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${(a.capacidad / maxCarga) * 100}%`, background: "#e2e8f0" }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                          style={{
                            width: `${(a.activas / maxCarga) * 100}%`,
                            background: excede ? "#ef4444" : a.activas === a.capacidad ? "#f59e0b" : "#1E3A8A",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">
                          <span className="font-mono font-bold" style={{ color: excede ? "#dc2626" : "#334155" }}>
                            {a.activas}
                          </span>{" "}
                          / {a.capacidad} tareas
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Completadas hoy <span className="font-mono font-bold text-slate-600">{a.completadasHoy}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tiempo medio <span className="font-mono font-bold text-slate-600">{a.tiempoMedio}</span>
                        </span>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-slate-200 text-slate-500 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0">
                      Ver tareas
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Balanceo manual */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800">Redistribuir carga</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
              Mueve tareas abiertas de una persona a otra. En esta fase el balanceo es manual y queda registrado.
            </p>

            {sobrecargados.length > 0 && (
              <div className="rounded-xl p-3 flex items-start gap-2.5 mb-4" style={{ background: "#fef2f2" }}>
                <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] leading-relaxed" style={{ color: "#991b1b" }}>
                  {sobrecargados.map(a => a.nombre).join(", ")}{" "}
                  {sobrecargados.length === 1 ? "está" : "están"} por encima de su capacidad. Mover dos tareas
                  equilibraría el equipo.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Mover desde</label>
                <select
                  value={origen}
                  onChange={e => setOrigen(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                >
                  <option value="">Selecciona una persona</option>
                  {agentes
                    .filter(a => a.activas > 0)
                    .map(a => (
                      <option key={a.id} value={a.nombre}>
                        {a.nombre} · {a.activas} tareas
                      </option>
                    ))}
                </select>
              </div>

              <div className="hidden sm:flex items-center justify-center pb-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-300">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Asignar a</label>
                <select
                  value={destino}
                  onChange={e => setDestino(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                >
                  <option value="">Selecciona una persona</option>
                  {agentes
                    .filter(a => a.nombre !== origen && a.estado !== "Ausente")
                    .map(a => (
                      <option key={a.id} value={a.nombre}>
                        {a.nombre} · {a.capacidad - a.activas} cupos libres
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (origen && destino) {
                  onReasignar(origen, destino)
                  setOrigen("")
                  setDestino("")
                }
              }}
              disabled={!origen || !destino}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
              style={{ background: "#1E3A8A" }}
            >
              Mover una tarea
            </button>
          </div>
        </div>

        {/* Reglas de asignación */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Reglas de asignación</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Se evalúan en orden hasta que una decide.</p>
            </div>
            <div className="p-4 space-y-2">
              {reglas.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-3"
                  style={{ borderColor: r.activa ? "#c7d7fe" : "#e2e8f0", background: r.activa ? "#f8fafc" : "#fff" }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: r.activa ? "#eff3ff" : "#f1f5f9",
                        color: r.activa ? "#1E3A8A" : "#94a3b8",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-700">{r.nombre}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{r.detalle}</p>
                    </div>
                    <button
                      onClick={() => setReglas(rs => rs.map(x => (x.id === r.id ? { ...x, activa: !x.activa } : x)))}
                      className="shrink-0 mt-0.5"
                    >
                      <span
                        className="w-8 rounded-full relative block transition-colors cursor-pointer"
                        style={{ background: r.activa ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                      >
                        <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: r.activa ? 16 : 2 }} />
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Ocupación del equipo</p>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {agentes.map(a => {
                const pct = Math.min(140, Math.round((a.activas / a.capacidad) * 100))
                return (
                  <div key={a.id} className="flex-1 flex flex-col items-center gap-1.5" title={`${a.nombre}: ${pct}%`}>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t transition-all duration-700"
                        style={{
                          height: `${Math.min(100, (pct / 140) * 100)}%`,
                          background: pct > 100 ? "#ef4444" : pct >= 90 ? "#f59e0b" : "#1E3A8A",
                          opacity: a.estado === "Ausente" ? 0.25 : 1,
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-slate-400">{a.nombre.split(" ")[0]}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
              {[
                { c: "#1E3A8A", l: "Normal" },
                { c: "#f59e0b", l: "Al límite" },
                { c: "#ef4444", l: "Excedido" },
              ].map(x => (
                <span key={x.l} className="flex items-center gap-1 text-[9px] text-slate-400">
                  <span className="w-2 h-2 rounded-sm" style={{ background: x.c }} />
                  {x.l}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#eff3ff" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1E3A8A" }}>
              Fase 2
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              El balanceo automático llegará después. Necesita el histórico de esta fase para aprender cuánto tarda
              realmente cada persona en cada tipo de paso.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
