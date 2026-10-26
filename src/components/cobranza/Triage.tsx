import { useEffect, useRef, useState } from "react"
import {
  asesoresCartera,
  colaEstilo,
  copCorto,
  nf,
  reglasTriage as reglasIniciales,
  type ColaGestion,
  type ReglaTriage,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Triage · enrutamiento diario

   Cada madrugada la cartera se reparte sola. Lo
   que importa no es que corra, sino poder ver por
   qué cada obligación terminó donde terminó: una
   regla mal puesta manda a un asesor cuentas que
   se habrían pagado con un enlace, y manda a un
   enlace cuentas que necesitaban una llamada.
───────────────────────────────────────────── */

const pasosCorrida = [
  "Leyendo saldos y días de mora del core",
  "Calculando score de propensión de pago",
  "Aplicando reglas de enrutamiento",
  "Excluyendo titulares con solicitud de no contacto",
  "Validando franjas y topes de la Ley 2300",
  "Balanceando carga entre asesores",
  "Despachando enlaces de autogestión",
]

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

export default function Triage({ onVerCartera }: { onVerCartera: (cola: ColaGestion) => void }) {
  const [reglas, setReglas] = useState<ReglaTriage[]>(reglasIniciales)
  const [corriendo, setCorriendo] = useState(false)
  const [paso, setPaso] = useState(-1)
  const [ultimaCorrida, setUltimaCorrida] = useState("Hoy · 05:00")
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    if (reloj.current) clearInterval(reloj.current)
  }, [])

  const ejecutar = () => {
    if (corriendo) return
    setCorriendo(true)
    setPaso(0)
    let i = 0
    reloj.current = setInterval(() => {
      i += 1
      if (i >= pasosCorrida.length) {
        if (reloj.current) clearInterval(reloj.current)
        setCorriendo(false)
        setPaso(-1)
        setUltimaCorrida(
          "Hoy · " +
            new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
        )
        return
      }
      setPaso(i)
    }, 420)
  }

  const activas = reglas.filter(r => r.activa)
  const porCola = (c: ColaGestion) => activas.filter(r => r.destino === c)
  const totalObl = activas.reduce((a, r) => a + r.obligaciones, 0)
  const totalSaldo = activas.reduce((a, r) => a + r.saldo, 0)

  const colas: ColaGestion[] = ["autogestion", "asesor", "juridica"]

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* ───── Encabezado ───── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Triage de cartera</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reparto diario de las obligaciones entre autogestión, asesores y jurídica. Última corrida:{" "}
            <span className="font-mono font-semibold text-slate-500">{ultimaCorrida}</span>.
          </p>
        </div>

        <button
          onClick={ejecutar}
          disabled={corriendo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0 disabled:cursor-wait"
          style={{ background: "#1E3A8A" }}
        >
          {corriendo ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Enrutando…
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Ejecutar triage ahora
            </>
          )}
        </button>
      </div>

      {/* Consola de la corrida */}
      {corriendo && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2">
            <Etiqueta>Corrida en curso</Etiqueta>
            <span className="ml-auto text-[10px] font-mono text-slate-400">
              {paso + 1} de {pasosCorrida.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 mt-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((paso + 1) / pasosCorrida.length) * 100}%`, background: "#1E3A8A" }}
            />
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            {pasosCorrida.map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: i < paso ? "#d1fae5" : i === paso ? "#eff3ff" : "#f1f5f9" }}
                >
                  {i < paso && (
                    <svg viewBox="0 0 20 20" fill="#059669" className="w-2.5 h-2.5">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {i === paso && <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] latido" />}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: i < paso ? "#64748b" : i === paso ? "#1E3A8A" : "#cbd5e1" }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───── Resultado del reparto ───── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: "#1E3A8A" }}>
            {nf(totalObl)}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-1.5">Obligaciones enrutadas hoy</p>
          <p className="text-[10px] text-slate-300 mt-0.5">{copCorto(totalSaldo)} en gestión</p>
        </div>

        {colas.map(c => {
          const meta = colaEstilo[c]
          const rs = porCola(c)
          const n = rs.reduce((a, r) => a + r.obligaciones, 0)
          const s = rs.reduce((a, r) => a + r.saldo, 0)
          return (
            <button
              key={c}
              onClick={() => onVerCartera(c)}
              className="rounded-xl border px-4 py-3 text-left transition-all cursor-pointer hover:shadow-sm"
              style={{ borderColor: meta.color + "33", background: meta.bg }}
            >
              <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: meta.color }}>
                {nf(n)}
              </p>
              <p className="text-[10px] font-bold text-slate-600 mt-1.5">{meta.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {copCorto(s)} · {totalObl ? Math.round((n / totalObl) * 100) : 0} % de la corrida
              </p>
            </button>
          )
        })}
      </div>

      {/* Reparto en una barra */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <Etiqueta>Cómo quedó repartida la cartera</Etiqueta>
        <div className="flex h-2.5 rounded-full overflow-hidden mt-3 gap-[2px]">
          {colas.map(c => {
            const n = porCola(c).reduce((a, r) => a + r.obligaciones, 0)
            return (
              <span
                key={c}
                style={{ width: `${(n / totalObl) * 100}%`, background: colaEstilo[c].color }}
                title={`${colaEstilo[c].label}: ${nf(n)}`}
              />
            )
          })}
        </div>
        <div className="flex items-start gap-6 mt-4 flex-wrap">
          {colas.map(c => {
            const meta = colaEstilo[c]
            return (
              <div key={c} className="flex items-start gap-2 min-w-[200px] flex-1">
                <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: meta.color }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-700">{meta.label}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{meta.descripcion}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ───── Reglas ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Etiqueta>Reglas que decidieron el reparto</Etiqueta>
          <span className="ml-auto text-[10px] text-slate-300">
            {activas.length} de {reglas.length} activas · se evalúan en orden
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {reglas.map((r, i) => {
            const meta = colaEstilo[r.destino]
            return (
              <div
                key={r.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors"
                style={{ opacity: r.activa ? 1 : 0.5 }}
              >
                <span className="text-[10px] font-mono font-bold text-slate-300 w-5 shrink-0">{i + 1}</span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-slate-800">{r.nombre}</p>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{r.condicion}</p>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-700">{nf(r.obligaciones)}</p>
                  <p className="text-[10px] text-slate-400">{copCorto(r.saldo)}</p>
                </div>

                <button
                  onClick={() => setReglas(l => l.map(x => (x.id === r.id ? { ...x, activa: !x.activa } : x)))}
                  className="shrink-0 w-10 h-5 rounded-full transition-all cursor-pointer relative"
                  style={{ background: r.activa ? "#1E3A8A" : "#cbd5e1" }}
                  title={r.activa ? "Desactivar regla" : "Activar regla"}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: r.activa ? 22 : 2 }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ───── Carga por asesor ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <Etiqueta>Carga que quedó en cada asesor</Etiqueta>
        <div className="flex flex-col gap-3 mt-4">
          {asesoresCartera.map(a => {
            const avance = Math.min(100, Math.round((a.recaudo / a.meta) * 100))
            const color = avance >= 100 ? "#059669" : avance >= 70 ? "#0EA5E9" : "#b45309"
            return (
              <div key={a.nombre} className="flex items-center gap-3">
                <div className="min-w-0 w-40 shrink-0">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{a.nombre}</p>
                  <p className="text-[10px] text-slate-400">{a.cuentas} cuentas</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${avance}%`, background: color }} />
                  </div>
                </div>
                <div className="text-right shrink-0 w-32">
                  <p className="text-[11px] font-bold" style={{ color }}>
                    {copCorto(a.recaudo)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {avance} % de {copCorto(a.meta)}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 w-14 text-right hidden sm:block">
                  {a.efectividad} % ef.
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ───── Nota normativa ───── */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#eff3ff" }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[11px] leading-relaxed text-slate-600">
          El triage nunca despacha un contacto por su cuenta: solo prepara la cola. Cada comunicación se valida
          contra la franja horaria y el tope semanal de la Ley 2300 en el momento de salir, de modo que una
          corrida de madrugada no genera llamadas de madrugada.
        </p>
      </div>
    </div>
  )
}
