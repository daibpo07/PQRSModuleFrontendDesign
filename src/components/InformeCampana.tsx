import {
  BarraEmbudo,
  CanalChip,
  CanalIcon,
  EstadoPill,
  benchmark,
  canalMeta,
  curvaHoraria,
  motivosFallo,
  nf,
  pct,
  type Campana,
} from "./EnviosMasivosData"

interface Props {
  campana: Campana
  onClose: () => void
}

/* ─────────────────────────────────────────────
   Tarjeta de indicador comparado
───────────────────────────────────────────── */
function Indicador({
  label,
  valor,
  referencia,
  color,
}: {
  label: string
  valor: number
  referencia: number
  color: string
}) {
  const delta = Math.round((valor - referencia) * 10) / 10
  const mejor = delta >= 0
  return (
    <div className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>
        {valor}
        <span className="text-sm text-slate-400">%</span>
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="inline-flex items-center gap-0.5 text-[10px] font-bold"
          style={{ color: mejor ? "#059669" : "#dc2626" }}
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
            <path d={mejor ? "M6 2l4 6H2z" : "M6 10L2 4h8z"} />
          </svg>
          {Math.abs(delta)} pts
        </span>
        <span className="text-[10px] text-slate-400">vs. promedio {referencia}%</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Informe de campaña
───────────────────────────────────────────── */
export default function InformeCampana({ campana: c, onClose }: Props) {
  const curva = curvaHoraria(c)
  const maxCurva = Math.max(...curva.map(x => x.enviados), 1)
  const fallos = motivosFallo(c).filter(m => m.cantidad > 0)
  const maxFallo = Math.max(...fallos.map(m => m.cantidad), 1)

  /* Referencia promediada entre los canales que usa la campaña */
  const ref = c.canales.reduce(
    (a, cn) => ({
      entrega: a.entrega + benchmark[cn].entrega / c.canales.length,
      lectura: a.lectura + benchmark[cn].lectura / c.canales.length,
      respuesta: a.respuesta + benchmark[cn].respuesta / c.canales.length,
    }),
    { entrega: 0, lectura: 0, respuesta: 0 },
  )

  const costoTotal = c.canales.reduce(
    (a, cn) => a + (c.enviados / c.canales.length) * ({ whatsapp: 38, sms: 52, email: 4, push: 1 }[cn]),
    0,
  )
  const costoRespuesta = c.respondidos > 0 ? Math.round(costoTotal / c.respondidos) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Encabezado ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{c.nombre}</h3>
              <EstadoPill estado={c.estado} />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <span className="font-mono">{c.id}</span> · {c.fecha} {c.hora} · {c.autor}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { l: "PDF", d: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" },
              { l: "CSV", d: "M3 4a1 1 0 011-1h12a1 1 0 011 1v2H3V4zm0 4h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" },
            ].map(b => (
              <button
                key={b.l}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#1E3A8A] transition-all cursor-pointer"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d={b.d} clipRule="evenodd" />
                </svg>
                {b.l}
              </button>
            ))}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Contenido ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ background: "#f8fafc" }}>

          {/* Resumen ejecutivo */}
          <div className="rounded-2xl px-5 py-4 relative overflow-hidden" style={{ background: "#1E3A8A" }}>
            <div
              className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 75% 50%, #0EA5E9 0%, transparent 70%)" }}
            />
            <div className="relative flex items-center justify-between gap-6 flex-wrap">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Resumen ejecutivo</p>
                <p className="text-white text-sm mt-1.5 leading-relaxed max-w-xl">
                  Se despacharon <span className="font-bold" style={{ color: "#0EA5E9" }}>{nf(c.enviados)}</span> mensajes
                  a la audiencia <span className="font-semibold">{c.segmento}</span>, de los cuales{" "}
                  <span className="font-bold" style={{ color: "#0EA5E9" }}>{nf(c.entregados)}</span> llegaron a destino y{" "}
                  <span className="font-bold" style={{ color: "#0EA5E9" }}>{nf(c.respondidos)}</span> generaron respuesta
                  del ciudadano.
                </p>
              </div>
              <div className="flex gap-5 shrink-0">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Costo total</p>
                  <p className="text-xl font-bold text-white mt-0.5">$ {nf(Math.round(costoTotal))}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Por respuesta</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "#0EA5E9" }}>$ {nf(costoRespuesta)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores comparados */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Indicador label="Entrega" valor={pct(c.entregados, c.enviados)} referencia={Math.round(ref.entrega * 10) / 10} color="#059669" />
            <Indicador label="Lectura" valor={pct(c.leidos, c.entregados)} referencia={Math.round(ref.lectura * 10) / 10} color="#0EA5E9" />
            <Indicador label="Respuesta" valor={pct(c.respondidos, c.entregados)} referencia={Math.round(ref.respuesta * 10) / 10} color="#6d28d9" />
            <div className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rebotes</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#dc2626" }}>
                {pct(c.fallidos, c.enviados)}
                <span className="text-sm text-slate-400">%</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">{nf(c.fallidos)} mensajes no entregados</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Embudo */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">Embudo de la campaña</h4>
              <div className="space-y-3">
                <BarraEmbudo label="Audiencia objetivo" valor={c.total} base={c.total} color="#94a3b8" />
                <BarraEmbudo label="Enviados" valor={c.enviados} base={c.total} color="#1E3A8A" />
                <BarraEmbudo label="Entregados" valor={c.entregados} base={c.total} color="#2d4fa8" />
                <BarraEmbudo label="Leídos" valor={c.leidos} base={c.total} color="#0EA5E9" />
                <BarraEmbudo label="Respondidos" valor={c.respondidos} base={c.total} color="#38bdf8" />
              </div>
            </div>

            {/* Curva horaria */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="text-sm font-semibold text-slate-800">Distribución del envío</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
                Mensajes despachados y leídos por hora de la jornada.
              </p>
              <div className="flex items-end gap-1.5 h-32">
                {curva.map(x => (
                  <div key={x.hora} className="flex-1 flex flex-col justify-end gap-px group" title={`${x.hora}:00 · ${nf(x.enviados)} enviados`}>
                    <span
                      className="rounded-t transition-all group-hover:opacity-80"
                      style={{ height: `${(x.enviados / maxCurva) * 100}%`, background: "#c7d7fe" }}
                    />
                    <span
                      className="rounded-b transition-all"
                      style={{ height: `${(x.leidos / maxCurva) * 100}%`, background: "#0EA5E9" }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {curva.map(x => (
                  <span key={x.hora} className="flex-1 text-center text-[8px] font-mono text-slate-300">
                    {x.hora}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                {[
                  { l: "Enviados", c: "#c7d7fe" },
                  { l: "Leídos", c: "#0EA5E9" },
                ].map(l => (
                  <span key={l.l} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.c }} />
                    {l.l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Desglose por canal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Desempeño por canal</h4>
            <div className="space-y-4">
              {c.canales.map(cn => {
                const m = canalMeta[cn]
                const parte = 1 / c.canales.length
                const env = Math.round(c.enviados * parte)
                const ent = Math.round(c.entregados * parte)
                const lei = Math.round(c.leidos * parte)
                const b = benchmark[cn]
                return (
                  <div key={cn} className="rounded-xl border border-slate-100 p-3.5" style={{ background: "#f8fafc" }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.color }}>
                        <CanalIcon canal={cn} className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{m.label}</p>
                        <p className="text-[10px] text-slate-400">{nf(env)} mensajes despachados</p>
                      </div>
                      <span className="ml-auto text-[10px] text-slate-400">
                        Costo unitario{" "}
                        <span className="font-mono font-bold text-slate-600">
                          $ {{ whatsapp: 38, sms: 52, email: 4, push: 1 }[cn]}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { l: "Entrega", v: pct(ent, env), r: b.entrega },
                        { l: "Lectura", v: pct(lei, ent), r: b.lectura },
                        { l: "Respuesta", v: pct(Math.round(c.respondidos * parte), ent), r: b.respuesta },
                      ].map(x => (
                        <div key={x.l}>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-[10px] text-slate-400">{x.l}</span>
                            <span className="text-[11px] font-mono font-bold" style={{ color: m.color }}>{x.v}%</span>
                          </div>
                          <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, x.v)}%`, background: m.color }} />
                            <span
                              className="absolute top-0 bottom-0 w-px bg-slate-500"
                              style={{ left: `${Math.min(100, x.r)}%` }}
                              title={`Promedio histórico: ${x.r}%`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">
              La línea vertical en cada barra marca el promedio histórico del canal.
            </p>
          </div>

          {/* Motivos de fallo */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Análisis de rebotes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {nf(c.fallidos)} mensajes no llegaron a destino y por qué.
                </p>
              </div>
              {c.fallidos > 0 && (
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                  Exportar lista
                </button>
              )}
            </div>
            {fallos.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2">
                <svg viewBox="0 0 20 20" fill="#10b981" className="w-8 h-8">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-slate-500">Sin rebotes registrados</p>
                <p className="text-xs text-slate-300">Todos los mensajes despachados llegaron a destino</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {fallos.map(f => (
                  <div key={f.motivo} className="px-5 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{f.motivo}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{f.accion}</p>
                    </div>
                    <div className="w-32 shrink-0">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(f.cantidad / maxFallo) * 100}%`, background: "#ef4444" }} />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 w-12 text-right shrink-0">
                      {nf(f.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ficha técnica y cumplimiento */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Ficha técnica</h4>
              <div className="divide-y divide-slate-50">
                {[
                  { l: "Identificador", v: c.id },
                  { l: "Audiencia", v: c.segmento },
                  { l: "Plantilla", v: c.plantilla },
                  { l: "Responsable", v: c.autor },
                  { l: "Fecha de ejecución", v: `${c.fecha} · ${c.hora}` },
                  { l: "Destinatarios objetivo", v: nf(c.total) },
                ].map(f => (
                  <div key={f.l} className="flex items-start justify-between gap-4 py-2">
                    <span className="text-[11px] text-slate-400 shrink-0">{f.l}</span>
                    <span className="text-[11px] font-semibold text-slate-700 text-right">{f.v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-[11px] text-slate-400">Canales</span>
                  <div className="flex gap-1">
                    {c.canales.map(cn => (
                      <CanalChip key={cn} canal={cn} size="xs" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Cumplimiento</h4>
              <div className="space-y-2.5">
                {[
                  { l: "Destinatarios con opt-in vigente", v: "100%", ok: true },
                  { l: "Ventana de silencio respetada (20:00 – 07:00)", v: "Sí", ok: true },
                  { l: "Cancelaciones durante la campaña", v: nf(Math.round(c.enviados * 0.004)), ok: true },
                  { l: "Trazabilidad de entrega conservada", v: "5 años", ok: true },
                  { l: "Datos personales enmascarados en el informe", v: "Sí", ok: true },
                ].map(x => (
                  <div key={x.l} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-px" style={{ background: "#d1fae5" }}>
                      <svg viewBox="0 0 20 20" fill="#059669" className="w-2.5 h-2.5">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-[11px] text-slate-500 flex-1 leading-snug">{x.l}</span>
                    <span className="text-[11px] font-semibold text-slate-700 shrink-0">{x.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-4 pt-3 border-t border-slate-100">
                Informe generado conforme a la Ley 1581 de 2012 de protección de datos personales. Los identificadores
                de los destinatarios se conservan cifrados y solo son visibles con permiso de auditoría.
              </p>
            </div>
          </div>
        </div>

        {/* ── Pie ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Programar informe recurrente
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            Cerrar informe
          </button>
        </div>
      </div>
    </div>
  )
}
