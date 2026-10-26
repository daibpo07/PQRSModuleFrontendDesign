import { useState } from "react"
import {
  colaEstilo,
  colorAvatar,
  cop,
  copCorto,
  estadoAcuerdoEstilo,
  estadoObligacionEstilo,
  iniciales,
  ley2300,
  moraMaxima,
  nf,
  prescripcion,
  riesgoEstilo,
  saldoDeudor,
  saldoObligacion,
  type Deudor,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Ficha 360° del deudor

   Una sola pantalla con todo lo que el asesor
   necesita antes de marcar: cuánto debe, qué se
   le prometió, qué pagó, qué se le puede decir
   hoy y en qué va el proceso si ya está en
   jurídica.
───────────────────────────────────────────── */

type Pestana = "resumen" | "obligaciones" | "gestiones" | "acuerdos" | "pagos" | "documentos" | "juridico"

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

function Tarjeta({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Etiqueta>{titulo}</Etiqueta>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
    </div>
  )
}

function Dato({ label, valor, mono = false }: { label: string; valor?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[11px] font-semibold text-slate-700 text-right ${mono ? "font-mono" : ""}`}>
        {valor || "—"}
      </span>
    </div>
  )
}

const resultadoEstilo: Record<string, { bg: string; text: string }> = {
  "Promesa de pago":  { bg: "#e0f2fe", text: "#075985" },
  "Acuerdo firmado":  { bg: "#d1fae5", text: "#065f46" },
  "Pago registrado":  { bg: "#d1fae5", text: "#065f46" },
  "No contesta":      { bg: "#f1f5f9", text: "#475569" },
  "Sin respuesta":    { bg: "#f1f5f9", text: "#475569" },
  Renuente:           { bg: "#fee2e2", text: "#991b1b" },
  "Número errado":    { bg: "#fef3c7", text: "#92400e" },
}

export default function DeudorFicha({
  deudor,
  onVolver,
  onNegociar,
  onVerExpediente,
}: {
  deudor: Deudor
  onVolver: () => void
  onNegociar: (d: Deudor) => void
  onVerExpediente: (d: Deudor) => void
}) {
  const [pestana, setPestana] = useState<Pestana>("resumen")

  const d = deudor
  const saldo = saldoDeudor(d)
  const mora = moraMaxima(d)
  const r = riesgoEstilo[d.riesgo]
  const cl = colaEstilo[d.cola]
  const l = ley2300(d)
  const peor = d.obligaciones.map(o => prescripcion(o)).sort((a, b) => a.dias - b.dias)[0]
  const pagado = d.pagos.reduce((a, p) => a + p.valor, 0)
  const comisiones = d.pagos.reduce((a, p) => a + p.comision, 0)

  const pestanas: [Pestana, string, number | null][] = [
    ["resumen", "Resumen", null],
    ["obligaciones", "Obligaciones", d.obligaciones.length],
    ["gestiones", "Gestiones", d.gestiones.length],
    ["acuerdos", "Acuerdos", d.acuerdos.length],
    ["pagos", "Pagos", d.pagos.length],
    ["documentos", "Documentos", d.documentos.length],
    ...(d.expediente ? ([["juridico", "Jurídico", null]] as [Pestana, string, number | null][]) : []),
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ═══════════ Cabecera ═══════════ */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-6 pt-4">
          <button
            onClick={onVolver}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Volver a la cartera
          </button>

          <div className="flex items-start gap-4 mt-3.5 flex-wrap">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white shrink-0"
              style={{ background: colorAvatar(d.nombre) }}
            >
              {iniciales(d.nombre)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{d.nombre}</h2>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: cl.bg, color: cl.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cl.color }} />
                  {cl.label}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: r.bg, color: r.color }}
                >
                  Riesgo {d.riesgo} · {r.label}
                </span>
                {d.etiquetas.map(e => (
                  <span
                    key={e}
                    className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded-full px-2.5 py-1"
                  >
                    {e}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-x-5 gap-y-1 mt-2 flex-wrap text-[11px] text-slate-500">
                <span className="font-mono">
                  {d.tipoDocumento} {d.documento}
                </span>
                <span>{d.correo}</span>
                <span className="font-mono">{d.telefono}</span>
                <span>
                  {d.municipio}, {d.departamento}
                </span>
                {d.asesor && <span>Asesor: <span className="font-semibold text-slate-600">{d.asesor}</span></span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* El botón de llamar se apaga solo si la ley no lo permite */}
              <button
                disabled={!l.puede}
                title={l.detalle}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed"
                style={{
                  borderColor: l.puede ? "#c7d7fb" : "#e2e8f0",
                  color: l.puede ? "#1E3A8A" : "#cbd5e1",
                  background: "#fff",
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Llamar
              </button>
              <button
                onClick={() => onNegociar(d)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98]"
                style={{ background: "#1E3A8A", boxShadow: "0 10px 24px -12px rgba(30,58,138,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.511 1.31c.562.649 1.413 1.076 2.354 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.562-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                Negociar acuerdo
              </button>
            </div>
          </div>

          {/* ───── Los indicadores que deciden la gestión ───── */}
          <div className="flex items-stretch gap-3 mt-4 flex-wrap">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex-1 min-w-[160px]">
              <p className="text-xl font-bold tracking-tight leading-none text-slate-800">{copCorto(saldo)}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Saldo total</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex-1 min-w-[160px]">
              <p
                className="text-xl font-bold tracking-tight leading-none"
                style={{ color: mora > 180 ? "#dc2626" : mora > 60 ? "#b45309" : "#64748b" }}
              >
                {mora} días
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Mora máxima</p>
            </div>

            {/* Semáforo de la Ley 2300 */}
            <div
              className="rounded-xl border px-4 py-2.5 flex-1 min-w-[260px]"
              style={{ background: l.bg, borderColor: l.borde }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <p className="text-[11px] font-bold" style={{ color: l.color }}>
                  {l.motivo}
                </p>
              </div>
              <p className="text-[10px] mt-1 leading-snug" style={{ color: l.color, opacity: 0.8 }}>
                {l.detalle}
              </p>
            </div>

            {/* Reloj de prescripción */}
            <div
              className="rounded-xl border px-4 py-2.5 flex-1 min-w-[200px]"
              style={{ background: peor.bg, borderColor: peor.borde }}
            >
              <p className="text-xl font-bold tracking-tight leading-none" style={{ color: peor.color }}>
                {peor.dias <= 0 ? "Prescrita" : `${nf(peor.dias)} días`}
              </p>
              <p className="text-[10px] font-semibold mt-1" style={{ color: peor.color, opacity: 0.85 }}>
                {peor.dias <= 0 ? "Ya no se puede cobrar por la vía ejecutiva" : `Para prescribir · ${peor.fecha}`}
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex items-center px-6 mt-3 overflow-x-auto">
          {pestanas.map(([key, label, n]) => (
            <button
              key={key}
              onClick={() => setPestana(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                pestana === key
                  ? "border-[#1E3A8A] text-[#1E3A8A]"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              {label}
              {n !== null && (
                <span
                  className="rounded-full px-1.5 py-px text-[10px] font-bold"
                  style={{
                    background: pestana === key ? "#eff3ff" : "#f1f5f9",
                    color: pestana === key ? "#1E3A8A" : "#94a3b8",
                  }}
                >
                  {n}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ Cuerpo ═══════════ */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "#F8FAFC" }}>

        {/* ───── Resumen ───── */}
        {pestana === "resumen" && (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-5">
            <div className="break-inside-avoid mb-5">
              <Tarjeta titulo="Identificación y contacto">
                <Dato label="Documento" valor={`${d.tipoDocumento} ${d.documento}`} mono />
                <Dato label="Correo" valor={d.correo} />
                <Dato label="Teléfono" valor={d.telefono} mono />
                <Dato label="Teléfono alterno" valor={d.telefonoAlterno} mono />
                <Dato label="Dirección" valor={d.direccion} />
                <Dato label="Municipio" valor={`${d.municipio}, ${d.departamento}`} />
                <Dato label="Ocupación" valor={d.ocupacion} />
              </Tarjeta>
            </div>

            <div className="break-inside-avoid mb-5">
              <Tarjeta titulo="Composición del saldo">
                {(["capital", "intereses", "moratorios", "honorarios"] as const).map(k => {
                  const total = d.obligaciones.reduce((a, o) => a + o[k], 0)
                  const pct = saldo ? (total / saldo) * 100 : 0
                  return (
                    <div key={k} className="py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[11px] text-slate-400 capitalize">{k}</span>
                        <span className="text-[11px] font-semibold text-slate-700">{cop(total)}</span>
                      </div>
                      <div className="h-1 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1E3A8A" }} />
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-baseline justify-between gap-3 pt-3 mt-1 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Total</span>
                  <span className="text-sm font-bold text-slate-800">{cop(saldo)}</span>
                </div>
              </Tarjeta>
            </div>

            <div className="break-inside-avoid mb-5">
              <Tarjeta titulo="Preferencias de contacto">
                <Dato label="Canal preferido" valor={d.canalPreferido} />
                <Dato label="Día preferido" valor={d.diaPreferido} />
                <Dato label="Contactos esta semana" valor={`${d.contactosSemana} de 1 permitido`} />
                <Dato label="Solicitud de no contacto" valor={d.noContactar ? "Vigente" : "No"} />
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  La Ley 2300 de 2023 deja que el titular elija día y canal, y limita las comunicaciones de cobro
                  a una por semana.
                </p>
              </Tarjeta>
            </div>

            <div className="break-inside-avoid mb-5">
              <Tarjeta titulo="Recaudo y comisiones">
                <Dato label="Total pagado" valor={cop(pagado)} />
                <Dato label="Pagos registrados" valor={String(d.pagos.length)} />
                <Dato label="Comisión generada" valor={cop(comisiones)} />
                <Dato
                  label="Último pago"
                  valor={d.pagos[0] ? `${d.pagos[0].fecha} · ${d.pagos[0].medio}` : undefined}
                />
              </Tarjeta>
            </div>

            {d.gestiones[0] && (
              <div className="break-inside-avoid mb-5">
                <Tarjeta titulo="Última gestión">
                  <p className="text-[11px] font-bold text-slate-700">
                    {d.gestiones[0].canal} · {d.gestiones[0].resultado}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {d.gestiones[0].fecha} · {d.gestiones[0].hora} · {d.gestiones[0].asesor}
                  </p>
                  {d.gestiones[0].nota && (
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5">{d.gestiones[0].nota}</p>
                  )}
                </Tarjeta>
              </div>
            )}

            {d.expediente && (
              <div className="break-inside-avoid mb-5">
                <Tarjeta titulo="Proceso judicial">
                  <Dato label="Radicado" valor={d.expediente.radicado} mono />
                  <Dato label="Juzgado" valor={d.expediente.juzgado} />
                  <Dato label="Etapa" valor={d.expediente.etapa} />
                  <Dato label="Cuantía" valor={cop(d.expediente.cuantia)} />
                  <button
                    onClick={() => onVerExpediente(d)}
                    className="w-full mt-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                    style={{ background: "#ede9fe", color: "#6d28d9" }}
                  >
                    Abrir el expediente
                  </button>
                </Tarjeta>
              </div>
            )}
          </div>
        )}

        {/* ───── Obligaciones ───── */}
        {pestana === "obligaciones" && (
          <div className="flex flex-col gap-3">
            {d.obligaciones.map(o => {
              const est = estadoObligacionEstilo[o.estado]
              const p = prescripcion(o)
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{o.producto}</p>
                        <span className="text-[10px] font-mono text-slate-400">{o.id}</span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: est.bg, color: est.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                          {o.estado}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Desembolsado el {o.desembolso} · tasa corriente {o.tasaCorriente} % EA ·{" "}
                        {o.cuotasVencidas} cuotas vencidas
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{cop(saldoObligacion(o))}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
                    {[
                      { l: "Capital", v: cop(o.capital) },
                      { l: "Intereses", v: cop(o.intereses) },
                      { l: "Moratorios", v: cop(o.moratorios) },
                      { l: "Honorarios", v: cop(o.honorarios) },
                      { l: "Días de mora", v: `${o.diasMora}` },
                    ].map(m => (
                      <div key={m.l}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.l}</p>
                        <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{m.v}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-start gap-2.5 mt-4 rounded-xl border px-3.5 py-3"
                    style={{ background: p.bg, borderColor: p.borde }}
                  >
                    <svg viewBox="0 0 20 20" fill={p.color} className="w-4 h-4 shrink-0 mt-px">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[11px] leading-relaxed" style={{ color: p.color }}>
                      {p.dias <= 0 ? (
                        <>
                          <span className="font-bold">La acción cambiaria ya prescribió</span> ({p.fecha}). La deuda
                          existe, pero no se puede exigir por proceso ejecutivo.
                        </>
                      ) : (
                        <>
                          <span className="font-bold">Prescribe el {p.fecha}</span> — quedan {nf(p.dias)} días para
                          demandar. El pagaré prescribe a los tres años del último vencimiento.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ───── Gestiones ───── */}
        {pestana === "gestiones" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
            {d.gestiones.map(g => {
              const re = resultadoEstilo[g.resultado] ?? { bg: "#f1f5f9", text: "#475569" }
              return (
                <div key={g.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">
                      {g.fecha} · {g.hora}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 border border-slate-200 rounded px-1.5 py-px">
                      {g.canal}
                    </span>
                    <span
                      className="text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: re.bg, color: re.text }}
                    >
                      {g.resultado}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{g.asesor}</span>
                  </div>
                  {g.nota && <p className="text-[12px] text-slate-600 leading-relaxed mt-2">{g.nota}</p>}
                  {g.grabacion && (
                    <button className="inline-flex items-center gap-2 mt-2.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Grabación {g.grabacion.id} · {g.grabacion.duracion}
                    </button>
                  )}
                </div>
              )
            })}
            {d.gestiones.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-slate-400">Sin gestiones registradas</p>
              </div>
            )}
          </div>
        )}

        {/* ───── Acuerdos ───── */}
        {pestana === "acuerdos" && (
          <div className="flex flex-col gap-3">
            {d.acuerdos.map(a => {
              const est = estadoAcuerdoEstilo[a.estado]
              return (
                <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{a.id}</p>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: est.bg, color: est.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                          {a.estado}
                        </span>
                        {a.pdfCifrado && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: "#eff3ff", color: "#1E3A8A" }}
                            title="El PDF sale cifrado: la clave es el número de documento del deudor"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            PDF cifrado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Firmado el {a.fecha}
                        {a.aprobadoPor && ` · aprobado por ${a.aprobadoPor}`}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{cop(a.valorCuota)}<span className="text-[11px] font-semibold text-slate-400"> / cuota</span></p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
                    {[
                      { l: "Saldo negociado", v: cop(a.saldoNegociado) },
                      { l: "Inicial", v: cop(a.inicial) },
                      { l: "Plazo", v: `${a.cuotas} cuotas` },
                      { l: "Tasa", v: `${a.tasa} % EA` },
                      { l: "Avance", v: `${a.cuotasPagadas} de ${a.cuotas}` },
                    ].map(m => (
                      <div key={m.l}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.l}</p>
                        <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{m.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-100 mt-4 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(a.cuotasPagadas / a.cuotas) * 100}%`, background: est.dot }}
                    />
                  </div>
                </div>
              )
            })}
            {d.acuerdos.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                <p className="text-sm font-medium text-slate-400">Este deudor no tiene acuerdos</p>
                <button
                  onClick={() => onNegociar(d)}
                  className="mt-3 px-4 py-2 rounded-xl text-[11px] font-bold text-white cursor-pointer"
                  style={{ background: "#1E3A8A" }}
                >
                  Simular uno ahora
                </button>
              </div>
            )}
          </div>
        )}

        {/* ───── Pagos ───── */}
        {pestana === "pagos" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
            {d.pagos.map(p => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{cop(p.valor)}</p>
                    <span className="text-[10px] font-semibold text-slate-500 border border-slate-200 rounded px-1.5 py-px">
                      {p.medio}
                    </span>
                    {/* Un pago en línea frena la gestión: eso evita cobrarle a quien ya pagó */}
                    {p.detuvoGestion && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#d1fae5", color: "#065f46" }}
                      >
                        Detuvo la gestión en curso
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {p.fecha} · {p.hora} · {p.aplicadoA}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-bold text-slate-600">{cop(p.comision)}</p>
                  <p className="text-[10px] text-slate-400">comisión del asesor</p>
                </div>
              </div>
            ))}
            {d.pagos.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-slate-400">Sin pagos registrados</p>
              </div>
            )}
          </div>
        )}

        {/* ───── Documentos ───── */}
        {pestana === "documentos" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {d.documentos.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:border-[#1E3A8A]/30 transition-all cursor-pointer"
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#eff3ff", color: "#1E3A8A" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-slate-700 truncate">{doc.nombre}</p>
                  <p className="text-[10px] text-slate-400">
                    {doc.tipo} · {doc.fecha} · {doc.peso}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ───── Jurídico ───── */}
        {pestana === "juridico" && d.expediente && (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <Etiqueta>Actuaciones del proceso</Etiqueta>
              <div className="mt-4">
                {d.expediente.actuaciones.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#7c3aed" }} />
                      {i < d.expediente!.actuaciones.length - 1 && (
                        <span className="flex-1 w-px my-1 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400">{a.fecha}</span>
                        <span
                          className="text-[10px] font-bold rounded px-1.5 py-0.5"
                          style={{ background: "#ede9fe", color: "#6d28d9" }}
                        >
                          {a.etapa}
                        </span>
                        {a.porRpa && (
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-bold rounded px-1.5 py-0.5"
                            style={{ background: "#f1f5f9", color: "#64748b" }}
                            title="Leída automáticamente del portal de la Rama Judicial"
                          >
                            RPA
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed mt-1">{a.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <Tarjeta titulo="Expediente">
                <Dato label="Radicado" valor={d.expediente.radicado} mono />
                <Dato label="Juzgado" valor={d.expediente.juzgado} />
                <Dato label="Ciudad" valor={d.expediente.ciudad} />
                <Dato label="Proceso" valor={d.expediente.tipoProceso} />
                <Dato label="Apoderado" valor={d.expediente.apoderado} />
                <Dato label="Cuantía" valor={cop(d.expediente.cuantia)} />
                <Dato label="Radicación" valor={d.expediente.radicacion} />
              </Tarjeta>

              {d.expediente.medidas.length > 0 && (
                <Tarjeta titulo="Medidas cautelares">
                  <div className="flex flex-col gap-2">
                    {d.expediente.medidas.map(m => (
                      <div
                        key={m}
                        className="rounded-lg border px-2.5 py-2 text-[11px] font-semibold"
                        style={{ background: "#ede9fe", borderColor: "#ddd6fe", color: "#5b21b6" }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </Tarjeta>
              )}

              <button
                onClick={() => onVerExpediente(d)}
                className="py-3 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                style={{ background: "#7c3aed" }}
              >
                Ver en Gestión jurídica
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
