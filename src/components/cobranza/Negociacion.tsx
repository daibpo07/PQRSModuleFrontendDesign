import { useMemo, useState } from "react"
import {
  TASA_USURA,
  colorAvatar,
  cop,
  copCorto,
  estadoAcuerdoEstilo,
  iniciales,
  reglasPorDefecto,
  saldoDeudor,
  simular,
  type Acuerdo,
  type Deudor,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Negociación y acuerdos

   El simulador a la izquierda y la propuesta
   armada a la derecha, siempre visible. Las
   validaciones no son un mensaje al final: se
   encienden mientras se mueve cada perilla, que
   es cuando todavía sirven de algo.
───────────────────────────────────────────── */

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

function Perilla({
  label,
  valor,
  min,
  max,
  paso = 1,
  sufijo,
  onChange,
}: {
  label: string
  valor: number
  min: number
  max: number
  paso?: number
  sufijo: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold text-slate-600">{label}</span>
        <span className="text-[13px] font-bold" style={{ color: "#1E3A8A" }}>
          {valor}
          {sufijo}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[#1E3A8A] cursor-pointer"
      />
      <div className="flex items-center justify-between text-[9px] text-slate-300 mt-0.5">
        <span>
          {min}
          {sufijo}
        </span>
        <span>
          {max}
          {sufijo}
        </span>
      </div>
    </div>
  )
}

function SimuladorModal({
  deudor,
  onClose,
  onEnviar,
}: {
  deudor: Deudor
  onClose: () => void
  onEnviar: (a: Acuerdo) => void
}) {
  const saldoBase = saldoDeudor(deudor)
  const [descuento, setDescuento] = useState(10)
  const [inicial, setInicial] = useState(15)
  const [cuotas, setCuotas] = useState(12)
  const [tasa, setTasa] = useState(19)
  const [enviando, setEnviando] = useState(false)

  const s = useMemo(
    () => simular(saldoBase, descuento, inicial, cuotas, tasa),
    [saldoBase, descuento, inicial, cuotas, tasa],
  )

  const bloqueos = s.alertas.filter(a => a.tipo === "bloqueo")
  const aprobaciones = s.alertas.filter(a => a.tipo === "aprobacion")
  const puedeEnviar = bloqueos.length === 0

  const enviar = () => {
    setEnviando(true)
    setTimeout(() => {
      onEnviar({
        id: `ACU-${Math.floor(3500 + Math.random() * 400)}`,
        fecha: "2026-10-26",
        saldoNegociado: s.saldoNegociado,
        inicial: s.inicial,
        cuotas: s.cuotas,
        valorCuota: s.valorCuota,
        tasa: s.tasaEA,
        estado: aprobaciones.length ? "En aprobación" : "Enviado",
        pdfCifrado: true,
        cuotasPagadas: 0,
      })
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full border border-slate-100 overflow-hidden flex flex-col"
        style={{ maxWidth: 1000, height: "min(92vh, 760px)" }}
      >
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: colorAvatar(deudor.nombre) }}
          >
            {iniciales(deudor.nombre)}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Simulador de acuerdo</h3>
            <p className="text-xs text-slate-400 truncate">
              {deudor.nombre} · saldo de {cop(saldoBase)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_380px]">

          {/* ── Perillas ── */}
          <div className="min-h-0 overflow-y-auto p-6 space-y-6 border-r border-slate-100">
            <div>
              <Etiqueta>Condiciones de la propuesta</Etiqueta>
              <div className="space-y-5 mt-4">
                <Perilla
                  label="Descuento sobre el saldo"
                  valor={descuento}
                  min={0}
                  max={50}
                  sufijo=" %"
                  onChange={setDescuento}
                />
                <Perilla label="Cuota inicial" valor={inicial} min={0} max={60} sufijo=" %" onChange={setInicial} />
                <Perilla label="Plazo" valor={cuotas} min={1} max={36} sufijo=" cuotas" onChange={setCuotas} />
                <Perilla
                  label="Tasa de financiación"
                  valor={tasa}
                  min={0}
                  max={32}
                  paso={0.5}
                  sufijo=" % EA"
                  onChange={setTasa}
                />
              </div>
            </div>

            {/* ───── Validaciones ─────
                Pasarse de la usura no es un detalle contable: hace nulo el
                acuerdo y expone a sanción. Por eso bloquea, no advierte. */}
            <div>
              <Etiqueta>Validación contra las reglas</Etiqueta>

              {s.alertas.length === 0 ? (
                <div
                  className="flex items-start gap-2.5 mt-3 rounded-xl border px-3.5 py-3"
                  style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
                >
                  <svg viewBox="0 0 20 20" fill="#059669" className="w-4 h-4 shrink-0 mt-px">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#065f46" }}>
                    La propuesta cumple los topes de la entidad y queda por debajo de la usura. Se puede enviar sin
                    aprobación.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-3">
                  {s.alertas.map((a, i) => {
                    const bloqueo = a.tipo === "bloqueo"
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3"
                        style={{
                          background: bloqueo ? "#fef2f2" : "#fffbeb",
                          borderColor: bloqueo ? "#fecaca" : "#fde68a",
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill={bloqueo ? "#dc2626" : "#b45309"}
                          className="w-4 h-4 shrink-0 mt-px"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: bloqueo ? "#991b1b" : "#92400e" }}>
                            {bloqueo ? "Bloquea el envío" : "Requiere aprobación"}
                          </p>
                          <p
                            className="text-[11px] leading-relaxed mt-1"
                            style={{ color: bloqueo ? "#991b1b" : "#92400e" }}
                          >
                            {a.texto}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { l: "Tasa de usura vigente", v: `${TASA_USURA} % EA` },
                  { l: "Inicial mínima", v: `${reglasPorDefecto.inicialMinima} %` },
                  { l: "Plazo máximo", v: `${reglasPorDefecto.maxCuotas} cuotas` },
                  { l: "Descuento sin aprobación", v: `${reglasPorDefecto.descuentoSinAprobacion} %` },
                ].map(m => (
                  <div key={m.l} className="rounded-xl border border-slate-200 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.l}</p>
                    <p className="text-[12px] font-bold text-slate-700 mt-0.5">{m.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Propuesta ── */}
          <div className="min-h-0 flex flex-col bg-[#FBFCFE]">
            <div className="px-5 py-2.5 border-b border-slate-100 bg-white shrink-0">
              <Etiqueta>Así queda el compromiso</Etiqueta>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div style={{ height: 3, background: "#1E3A8A" }} />
                <div className="p-4">
                  <p className="text-[11px] font-bold text-slate-500">Compromiso de pago</p>
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5">{deudor.nombre}</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {deudor.tipoDocumento} {deudor.documento}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Cuota mensual</p>
                    <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: "#1E3A8A" }}>
                      {cop(s.valorCuota)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      durante {s.cuotas} {s.cuotas === 1 ? "mes" : "meses"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                    {[
                      { l: "Saldo actual", v: cop(s.saldoBase) },
                      { l: `Descuento (${descuento} %)`, v: `− ${cop(s.descuento)}`, verde: true },
                      { l: "Saldo negociado", v: cop(s.saldoNegociado) },
                      { l: `Cuota inicial (${inicial} %)`, v: cop(s.inicial) },
                      { l: "Monto financiado", v: cop(s.financiado) },
                      { l: "Tasa pactada", v: `${s.tasaEA} % EA` },
                    ].map(m => (
                      <div key={m.l} className="flex items-baseline justify-between gap-3">
                        <span className="text-[11px] text-slate-400">{m.l}</span>
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: m.verde ? "#059669" : "#334155" }}
                        >
                          {m.v}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-baseline justify-between gap-3 mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">Total a pagar</span>
                    <span className="text-sm font-bold text-slate-800">{cop(s.totalPagar)}</span>
                  </div>

                  <div
                    className="flex items-start gap-2 mt-4 rounded-lg border px-2.5 py-2"
                    style={{ background: "#eff3ff", borderColor: "#dce5fb" }}
                  >
                    <svg viewBox="0 0 20 20" fill="#1E3A8A" className="w-3.5 h-3.5 shrink-0 mt-px">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[10px] leading-relaxed" style={{ color: "#1E3A8A" }}>
                      El PDF se envía cifrado. La clave es el número de documento del deudor, así que el archivo
                      solo lo abre quien debe abrirlo aunque el correo se reenvíe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4 shrink-0">
              <button
                onClick={enviar}
                disabled={!puedeEnviar || enviando}
                className="w-full py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: puedeEnviar ? "#1E3A8A" : "#e2e8f0",
                  color: puedeEnviar ? "#fff" : "#94a3b8",
                }}
              >
                {enviando ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generando PDF cifrado…
                  </>
                ) : aprobaciones.length ? (
                  "Enviar a aprobación del coordinador"
                ) : (
                  "Generar y enviar el acuerdo"
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed">
                {puedeEnviar
                  ? "Se despacha por el canal preferido del deudor, dentro de la franja de la Ley 2300."
                  : "Corrige lo que está bloqueado para poder enviar la propuesta."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════ Subvista ═════════ */

export default function Negociacion({
  deudores,
  deudorPreseleccionado,
  onConsumirPreseleccion,
  onGuardarAcuerdo,
}: {
  deudores: Deudor[]
  deudorPreseleccionado?: Deudor | null
  onConsumirPreseleccion: () => void
  onGuardarAcuerdo: (deudorId: string, a: Acuerdo) => void
}) {
  const [simulando, setSimulando] = useState<Deudor | null>(deudorPreseleccionado ?? null)
  const [aviso, setAviso] = useState<string | null>(null)

  const acuerdos = useMemo(
    () =>
      deudores.flatMap(d => d.acuerdos.map(a => ({ deudor: d, acuerdo: a }))).sort((x, y) =>
        y.acuerdo.fecha.localeCompare(x.acuerdo.fecha),
      ),
    [deudores],
  )

  const enAprobacion = acuerdos.filter(x => x.acuerdo.estado === "En aprobación")
  const vigentes = acuerdos.filter(x => x.acuerdo.estado === "Firmado")
  const incumplidos = acuerdos.filter(x => x.acuerdo.estado === "Incumplido")
  const valorVigente = vigentes.reduce((a, x) => a + x.acuerdo.saldoNegociado, 0)

  const cerrar = () => {
    setSimulando(null)
    onConsumirPreseleccion()
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Negociación y acuerdos</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulación de cuotas, validación contra los topes y envío del compromiso cifrado.
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Esperando aprobación", v: String(enAprobacion.length), c: "#b45309", b: "#fffbeb", bd: "#fde68a" },
          { l: "Acuerdos vigentes", v: String(vigentes.length), c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
          { l: "Valor bajo acuerdo", v: copCorto(valorVigente), c: "#1E3A8A", b: "#eff3ff", bd: "#dce5fb" },
          { l: "Incumplidos", v: String(incumplidos.length), c: "#dc2626", b: "#fef2f2", bd: "#fecaca" },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-4 border" style={{ background: s.b, borderColor: s.bd }}>
            <p className="text-2xl font-bold" style={{ color: s.c }}>
              {s.v}
            </p>
            <p className="text-xs font-medium mt-0.5 text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Cola de aprobación */}
      {enAprobacion.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#fde68a" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <Etiqueta>Esperan tu visto bueno</Etiqueta>
            <span className="ml-auto text-[10px] font-bold" style={{ color: "#92400e" }}>
              {enAprobacion.length} pendientes
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {enAprobacion.map(({ deudor, acuerdo }) => (
              <div key={acuerdo.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: colorAvatar(deudor.nombre) }}
                >
                  {iniciales(deudor.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800">{deudor.nombre}</p>
                  <p className="text-[11px] text-slate-400">
                    {acuerdo.id} · {cop(acuerdo.valorCuota)} × {acuerdo.cuotas} cuotas · inicial{" "}
                    {cop(acuerdo.inicial)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setAviso(`Acuerdo ${acuerdo.id} devuelto al asesor con observaciones.`)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Devolver
                  </button>
                  <button
                    onClick={() => setAviso(`Acuerdo ${acuerdo.id} aprobado y despachado al deudor.`)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer"
                    style={{ background: "#059669" }}
                  >
                    Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todos los acuerdos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <Etiqueta>Acuerdos de la cartera</Etiqueta>
        </div>
        <div className="divide-y divide-slate-50">
          {acuerdos.map(({ deudor, acuerdo }) => {
            const est = estadoAcuerdoEstilo[acuerdo.estado]
            return (
              <div key={acuerdo.id} className="px-5 py-4 flex items-center gap-4 flex-wrap hover:bg-slate-50/70 transition-colors">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: colorAvatar(deudor.nombre) }}
                >
                  {iniciales(deudor.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-slate-800">{deudor.nombre}</p>
                    <span className="text-[10px] font-mono text-slate-400">{acuerdo.id}</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: est.bg, color: est.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                      {acuerdo.estado}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cop(acuerdo.saldoNegociado)} en {acuerdo.cuotas} cuotas de {cop(acuerdo.valorCuota)} ·{" "}
                    {acuerdo.tasa} % EA · {acuerdo.cuotasPagadas} pagadas
                  </p>
                </div>
                <button
                  onClick={() => setSimulando(deudor)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0"
                >
                  Renegociar
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Deudores sin acuerdo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <Etiqueta>Sin acuerdo vigente · candidatos a negociar</Etiqueta>
        </div>
        <div className="divide-y divide-slate-50">
          {deudores
            .filter(d => !d.acuerdos.some(a => ["Firmado", "En aprobación", "Enviado"].includes(a.estado)))
            .map(d => (
              <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 flex-wrap hover:bg-slate-50/70 transition-colors">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: colorAvatar(d.nombre) }}
                >
                  {iniciales(d.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-slate-700">{d.nombre}</p>
                  <p className="text-[11px] text-slate-400">
                    {cop(saldoDeudor(d))} · score {d.score} · riesgo {d.riesgo}
                  </p>
                </div>
                <button
                  onClick={() => setSimulando(d)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer shrink-0"
                  style={{ background: "#1E3A8A" }}
                >
                  Simular acuerdo
                </button>
              </div>
            ))}
        </div>
      </div>

      {simulando && (
        <SimuladorModal
          deudor={simulando}
          onClose={cerrar}
          onEnviar={a => {
            onGuardarAcuerdo(simulando.id, a)
            cerrar()
            setAviso(
              a.estado === "En aprobación"
                ? `Acuerdo ${a.id} enviado a aprobación del coordinador.`
                : `Acuerdo ${a.id} despachado al deudor en PDF cifrado.`,
            )
          }}
        />
      )}

      {aviso && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
          <div
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg"
            style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
          >
            <svg viewBox="0 0 20 20" fill="#059669" className="w-4 h-4 shrink-0 mt-px">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] leading-relaxed flex-1" style={{ color: "#065f46" }}>
              {aviso}
            </p>
            <button onClick={() => setAviso(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
