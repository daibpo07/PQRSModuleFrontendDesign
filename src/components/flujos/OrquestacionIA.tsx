interface Props {
  ejecucionesRegistradas: number
  flujosActivos: number
}

const capacidades = [
  {
    titulo: "Armar el flujo conversando",
    detalle:
      "Le explicas el proceso en lenguaje corriente o cargas una lista de tareas, y ella propone los pasos, los responsables y los tiempos. Tú apruebas o corriges.",
    color: "#1E3A8A",
    bg: "#eff3ff",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    titulo: "Proteger los datos del ciudadano",
    detalle:
      "Reconoce qué pasos tocan información sensible y aplica el enmascaramiento y el registro de consulta sin que haya que configurarlo caso por caso.",
    color: "#059669",
    bg: "#d1fae5",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    titulo: "Repartir el trabajo con equilibrio",
    detalle:
      "Asigna cada paso mirando la carga real, la velocidad histórica de cada persona y la urgencia del caso, en lugar de una regla fija.",
    color: "#0EA5E9",
    bg: "#e0f2fe",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    titulo: "Avisar y proponer la salida",
    detalle:
      "Cuando algo se atrasa o falla, le avisa al líder con la solución ya armada: a quién reasignar, cuánto ampliar el plazo o a quién escalar. Solo hay que autorizar.",
    color: "#6d28d9",
    bg: "#ede9fe",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const conversacionEjemplo = [
  { yo: true, texto: "Necesito un flujo para los reclamos de facturación que lleguen por WhatsApp." },
  {
    yo: false,
    texto:
      "Entendido. Revisé los 517 reclamos de facturación de los últimos tres meses. Propongo seis pasos: recepción automática, verificación en cartera (24 h), una bifurcación según si el cobro procede, elaboración de nota crédito, aprobación de Tesorería y respuesta al ciudadano. ¿Lo armo así?",
  },
  { yo: true, texto: "Sí, pero la verificación en cartera debe hacerla siempre la misma persona que atendió antes al ciudadano." },
  {
    yo: false,
    texto:
      "Listo. Agrego la regla de continuidad del analista en ese paso. Aviso: dos personas del equipo de cartera están al 100 % de capacidad, así que ese paso puede tardar 8 horas más de lo previsto.",
  },
]

/* ─────────────────────────────────────────────
   Subvista Orquestación IA — fase 2
───────────────────────────────────────────── */
export default function OrquestacionIA({ ejecucionesRegistradas, flujosActivos }: Props) {
  const meta = 500
  const avance = Math.min(100, Math.round((ejecucionesRegistradas / meta) * 100))

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* Banner */}
      <div className="rounded-2xl px-6 py-5 relative overflow-hidden" style={{ background: "#1E3A8A" }}>
        <div
          className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at 75% 50%, #0EA5E9 0%, transparent 70%)" }}
        />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                FASE 2 · EN DISEÑO
              </span>
              <span className="text-[10px] text-white/40">No disponible todavía</span>
            </div>
            <h2 className="text-white text-xl font-bold">Orquestación asistida por IA</h2>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              El objetivo es que armar un flujo sea una conversación, no una configuración. Para llegar ahí, primero
              hay que operar la fase manual: cada ejecución registrada es un ejemplo con el que la IA aprenderá a
              proponer pasos, tiempos y responsables.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Capacidades */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Qué hará cuando esté lista</h3>
          {capacidades.map(c => (
            <div key={c.titulo} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg, color: c.color }}>
                {c.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">{c.titulo}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{c.detalle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversación de ejemplo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#cbd5e1" }} />
            <h3 className="text-sm font-semibold text-slate-800">Así se vería armar un flujo</h3>
            <span className="ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-400">
              Simulación
            </span>
          </div>

          <div className="flex-1 p-4 space-y-2.5 overflow-y-auto" style={{ background: "linear-gradient(180deg,#f0f4ff 0%,#F8FAFC 100%)", minHeight: 320 }}>
            {conversacionEjemplo.map((m, i) => (
              <div key={i} className={`flex ${m.yo ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm"
                  style={{
                    background: m.yo ? "#1E3A8A" : "#fff",
                    color: m.yo ? "#fff" : "#334155",
                    border: m.yo ? "none" : "1px solid #e2e8f0",
                    borderBottomRightRadius: m.yo ? 4 : undefined,
                    borderBottomLeftRadius: !m.yo ? 4 : undefined,
                  }}
                >
                  {!m.yo && (
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#0EA5E9" }}>
                      IA orquestadora
                    </p>
                  )}
                  <p className="text-[12px] leading-relaxed">{m.texto}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="text-[12px] text-slate-300 flex-1">Describe el proceso que quieres automatizar…</span>
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-400 shrink-0">
                Fase 2
              </span>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-2">
              Por ahora los flujos se arman en la pestaña Flujos, paso a paso
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
