import { useState } from "react"
import {
  IconoPaso,
  colorSla,
  formatoSla,
  prioridadMeta,
  tipoPasoMeta,
  type ItemChecklist,
  type Tarea,
} from "./FlujosData"

interface Props {
  tareas: Tarea[]
  onToggleItem: (tareaId: string, itemId: string) => void
  onCompletar: (tareaId: string) => void
  onDevolver: (tareaId: string) => void
}

/* ─────────────────────────────────────────────
   Subvista Mi trabajo
───────────────────────────────────────────── */
export default function MiTrabajo({ tareas, onToggleItem, onCompletar, onDevolver }: Props) {
  const [seleccion, setSeleccion] = useState<string | null>(tareas[0]?.id ?? null)

  const activa = tareas.find(t => t.id === seleccion) ?? tareas[0] ?? null

  const grupos: { titulo: string; color: string; tareas: Tarea[] }[] = [
    { titulo: "Vencidas", color: "#dc2626", tareas: tareas.filter(t => t.restanteHoras < 0) },
    { titulo: "Para hoy", color: "#d97706", tareas: tareas.filter(t => t.restanteHoras >= 0 && t.restanteHoras <= 12) },
    { titulo: "Esta semana", color: "#059669", tareas: tareas.filter(t => t.restanteHoras > 12) },
  ].filter(g => g.tareas.length > 0)

  const progreso = (t: Tarea) => {
    const hechos = t.checklist.filter(c => c.hecho).length
    return { hechos, total: t.checklist.length, pct: t.checklist.length ? Math.round((hechos / t.checklist.length) * 100) : 0 }
  }

  const completo = activa ? activa.checklist.every(c => c.hecho) : false

  return (
    <div className="flex-1 overflow-hidden flex" style={{ background: "#F8FAFC" }}>

      {/* Lista de tareas */}
      <div className="flex flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden" style={{ width: 340 }}>
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-800">Mi plan de trabajo</h2>
            <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#eff3ff", color: "#1E3A8A" }}>
              {tareas.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Ana Martínez · Analista de dependencia</p>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {[
              { l: "Vencidas", v: tareas.filter(t => t.restanteHoras < 0).length, c: "#dc2626", b: "#fef2f2" },
              { l: "Hoy", v: tareas.filter(t => t.restanteHoras >= 0 && t.restanteHoras <= 12).length, c: "#d97706", b: "#fffbeb" },
              { l: "Después", v: tareas.filter(t => t.restanteHoras > 12).length, c: "#059669", b: "#ecfdf5" },
            ].map(x => (
              <div key={x.l} className="rounded-lg px-2 py-1.5 text-center" style={{ background: x.b }}>
                <p className="text-sm font-bold" style={{ color: x.c }}>{x.v}</p>
                <p className="text-[9px] font-medium text-slate-400">{x.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {grupos.map(g => (
            <div key={g.titulo}>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {g.titulo} · {g.tareas.length}
                </p>
              </div>
              {g.tareas.map(t => {
                const activa2 = t.id === seleccion
                const pr = progreso(t)
                const pm = prioridadMeta[t.prioridad]
                const tm = tipoPasoMeta[t.tipo]
                return (
                  <button
                    key={t.id}
                    onClick={() => setSeleccion(t.id)}
                    className="w-full text-left px-4 py-3 border-l-2 transition-all cursor-pointer"
                    style={{
                      background: activa2 ? "#eff3ff" : "transparent",
                      borderLeftColor: activa2 ? "#1E3A8A" : "transparent",
                    }}
                    onMouseEnter={e => {
                      if (!activa2) e.currentTarget.style.background = "#f8fafc"
                    }}
                    onMouseLeave={e => {
                      if (!activa2) e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: tm.bg, color: tm.color }}
                      >
                        <IconoPaso tipo={t.tipo} className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate ${activa2 ? "font-bold text-[#1E3A8A]" : "font-semibold text-slate-700"}`}>
                          {t.titulo}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{t.caso}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pr.pct}%`, background: pr.pct === 100 ? "#10b981" : "#0EA5E9" }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {pr.hechos}/{pr.total}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-mono font-bold" style={{ color: colorSla(t.restanteHoras) }}>
                            {formatoSla(t.restanteHoras)}
                          </span>
                          <span className="text-[9px]" style={{ color: pm.color }}>
                            {pm.icon} {t.prioridad}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}

          {tareas.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <svg viewBox="0 0 20 20" fill="#10b981" className="w-10 h-10">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold text-slate-600">Bandeja al día</p>
              <p className="text-xs text-slate-400">No tienes tareas pendientes asignadas</p>
            </div>
          )}
        </div>
      </div>

      {/* Detalle de la tarea */}
      {activa ? (
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-6 max-w-3xl">
            {/* Cabecera */}
            <div className="flex items-start gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-800">{activa.titulo}</h2>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
                    style={{ background: tipoPasoMeta[activa.tipo].bg, color: tipoPasoMeta[activa.tipo].color }}
                  >
                    <IconoPaso tipo={activa.tipo} className="w-2.5 h-2.5" />
                    {tipoPasoMeta[activa.tipo].label}
                  </span>
                  {activa.datosSensibles && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-500">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Datos sensibles
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="font-mono">{activa.caso}</span> · {activa.flujo} · paso “{activa.paso}”
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Vence</p>
                <p className="text-sm font-mono font-bold" style={{ color: colorSla(activa.restanteHoras) }}>
                  {formatoSla(activa.restanteHoras)}
                </p>
                <p className="text-[10px] text-slate-300">{activa.vence}</p>
              </div>
            </div>

            {/* Contexto */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contexto del caso</p>
              <p className="text-sm text-slate-600 leading-relaxed">{activa.asunto}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-2">{activa.contexto}</p>
            </div>

            {/* Posición en el flujo */}
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {[
                { l: "Paso anterior", v: activa.anterior ?? "Es el primer paso", icon: "←" },
                { l: "Paso siguiente", v: activa.siguiente ?? "Cierra el flujo", icon: "→" },
              ].map(x => (
                <div key={x.l} className="bg-white rounded-xl border border-slate-200 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{x.l}</p>
                  <p className="text-[11px] text-slate-600">
                    <span className="text-slate-300 mr-1">{x.icon}</span>
                    {x.v}
                  </p>
                </div>
              ))}
            </div>

            {/* Lista de chequeo */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-3">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3" style={{ background: "#f8fafc" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lista de chequeo</p>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progreso(activa).pct}%`,
                        background: completo ? "#10b981" : "#0EA5E9",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {progreso(activa).hechos}/{progreso(activa).total}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {activa.checklist.map((c: ItemChecklist) => (
                  <button
                    key={c.id}
                    onClick={() => onToggleItem(activa.id, c.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span
                      className="rounded-md flex items-center justify-center shrink-0 border-2 transition-all"
                      style={{
                        width: 18,
                        height: 18,
                        background: c.hecho ? "#1E3A8A" : "#fff",
                        borderColor: c.hecho ? "#1E3A8A" : "#cbd5e1",
                      }}
                    >
                      {c.hecho && (
                        <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`text-sm transition-all ${c.hecho ? "text-slate-400 line-through" : "text-slate-700"}`}
                    >
                      {c.texto}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Adjuntos */}
            {activa.adjuntos && activa.adjuntos.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Adjuntos del caso</p>
                <div className="space-y-2">
                  {activa.adjuntos.map(a => (
                    <div key={a.nombre} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5" style={{ background: "#f8fafc" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
                        <svg viewBox="0 0 20 20" fill="#1E3A8A" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-700 truncate">{a.nombre}</p>
                        <p className="text-[10px] text-slate-400">{a.peso}</p>
                      </div>
                      <button className="text-[10px] font-semibold text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer shrink-0">
                        Abrir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nota de avance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Nota para el siguiente responsable
              </p>
              <textarea
                rows={3}
                placeholder="Qué encontraste, qué queda pendiente, qué debe tener en cuenta quien sigue…"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => onCompletar(activa.id)}
                disabled={!completo}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default flex items-center gap-2"
                style={{ background: "#1E3A8A" }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completar paso
              </button>
              <button
                onClick={() => onDevolver(activa.id)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Devolver al paso anterior
              </button>
              <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer">
                Reportar bloqueo
              </button>
              {!completo && (
                <p className="text-[11px] text-slate-400 w-full mt-1">
                  Marca todos los ítems de la lista de chequeo para poder completar el paso.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 20 20" fill="#10b981" className="w-12 h-12">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-semibold text-slate-600">No tienes tareas pendientes</p>
          <p className="text-xs text-slate-400">Cuando un flujo te asigne un paso, aparecerá aquí</p>
        </div>
      )}
    </div>
  )
}
