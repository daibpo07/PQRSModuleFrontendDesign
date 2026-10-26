import { useMemo, useState } from "react"
import {
  colaEstilo,
  colorAvatar,
  cop,
  copCorto,
  estadoObligacionEstilo,
  iniciales,
  ley2300,
  moraMaxima,
  nf,
  prescripcion,
  riesgoEstilo,
  saldoDeudor,
  type ColaGestion,
  type Deudor,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Cartera asignada

   La bandeja del asesor. Dos columnas mandan por
   encima del saldo: si hoy se puede llamar a esa
   persona, y cuánto le queda a la obligación antes
   de prescribir. Lo demás es contexto.
───────────────────────────────────────────── */

const colas: (ColaGestion | "todas")[] = ["todas", "autogestion", "asesor", "juridica"]

export default function Cartera({
  deudores,
  colaInicial,
  onAbrir,
}: {
  deudores: Deudor[]
  colaInicial?: ColaGestion | null
  onAbrir: (d: Deudor) => void
}) {
  const [cola, setCola] = useState<ColaGestion | "todas">(colaInicial ?? "todas")
  const [busqueda, setBusqueda] = useState("")
  const [orden, setOrden] = useState("saldo")
  const [soloContactables, setSoloContactables] = useState(false)
  const [soloPrescripcion, setSoloPrescripcion] = useState(false)

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = deudores.filter(d => {
      if (cola !== "todas" && d.cola !== cola) return false
      if (q) {
        const heno = `${d.nombre} ${d.documento} ${d.correo} ${d.telefono} ${d.obligaciones
          .map(o => o.id)
          .join(" ")}`.toLowerCase()
        if (!heno.includes(q)) return false
      }
      if (soloContactables && !ley2300(d).puede) return false
      if (soloPrescripcion) {
        const critico = d.obligaciones.some(o => ["critica", "prescrita"].includes(prescripcion(o).nivel))
        if (!critico) return false
      }
      return true
    })

    return lista.sort((a, b) => {
      if (orden === "mora") return moraMaxima(b) - moraMaxima(a)
      if (orden === "score") return a.score - b.score
      if (orden === "prescripcion") {
        const pa = Math.min(...a.obligaciones.map(o => prescripcion(o).dias))
        const pb = Math.min(...b.obligaciones.map(o => prescripcion(o).dias))
        return pa - pb
      }
      return saldoDeudor(b) - saldoDeudor(a)
    })
  }, [deudores, cola, busqueda, orden, soloContactables, soloPrescripcion])

  const saldoTotal = visibles.reduce((a, d) => a + saldoDeudor(d), 0)
  const contactablesAhora = visibles.filter(d => ley2300(d).puede).length

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* ───── Encabezado ───── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Cartera asignada</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {nf(visibles.length)} deudores · {cop(saldoTotal)} en gestión ·{" "}
            <span className="font-semibold text-emerald-600">{contactablesAhora}</span> se pueden contactar ahora
            mismo.
          </p>
        </div>

        <select
          value={orden}
          onChange={e => setOrden(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer shrink-0"
        >
          <option value="saldo">Mayor saldo primero</option>
          <option value="mora">Mayor mora primero</option>
          <option value="score">Menor propensión de pago</option>
          <option value="prescripcion">Prescripción más cercana</option>
        </select>
      </div>

      {/* ───── Filtros ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Nombre, cédula, NIT, teléfono u obligación…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
            />
          </div>

          {colas.map(c => {
            const activo = cola === c
            const meta = c === "todas" ? null : colaEstilo[c]
            const n = c === "todas" ? deudores.length : deudores.filter(d => d.cola === c).length
            return (
              <button
                key={c}
                onClick={() => setCola(c)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer"
                style={{
                  background: activo ? (meta?.color ?? "#1E3A8A") : "#fff",
                  borderColor: activo ? (meta?.color ?? "#1E3A8A") : "#e2e8f0",
                  color: activo ? "#fff" : "#64748b",
                }}
              >
                {meta && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: activo ? "#fff" : meta.color }}
                  />
                )}
                {c === "todas" ? "Todas" : meta!.label}
                <span
                  className="rounded-full px-1.5 text-[10px] font-bold"
                  style={{
                    background: activo ? "rgba(255,255,255,0.22)" : "#f1f5f9",
                    color: activo ? "#fff" : "#94a3b8",
                  }}
                >
                  {n}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          {[
            { on: soloContactables, set: setSoloContactables, label: "Se pueden contactar ahora", color: "#047857" },
            { on: soloPrescripcion, set: setSoloPrescripcion, label: "Prescripción en riesgo", color: "#dc2626" },
          ].map(f => (
            <button
              key={f.label}
              onClick={() => f.set(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer"
              style={{
                background: f.on ? f.color + "14" : "#fff",
                borderColor: f.on ? f.color : "#e2e8f0",
                color: f.on ? f.color : "#64748b",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───── Tabla ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-slate-100">
                {["Deudor", "Saldo total", "Mora", "Riesgo · score", "Ley 2300", "Prescripción", "Cola"].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map(d => {
                const saldo = saldoDeudor(d)
                const mora = moraMaxima(d)
                const r = riesgoEstilo[d.riesgo]
                const l = ley2300(d)
                const peor = d.obligaciones
                  .map(o => prescripcion(o))
                  .sort((a, b) => a.dias - b.dias)[0]
                const cl = colaEstilo[d.cola]
                const est = estadoObligacionEstilo[d.obligaciones[0].estado]

                return (
                  <tr
                    key={d.id}
                    onClick={() => onAbrir(d)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Deudor */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                          style={{ background: colorAvatar(d.nombre) }}
                        >
                          {iniciales(d.nombre)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#1E3A8A] transition-colors">
                            {d.nombre}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {d.tipoDocumento} {d.documento} · {d.obligaciones.length}{" "}
                            {d.obligaciones.length === 1 ? "obligación" : "obligaciones"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Saldo */}
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold text-slate-800">{copCorto(saldo)}</p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9px] font-bold mt-0.5"
                        style={{ background: est.bg, color: est.text }}
                      >
                        {d.obligaciones[0].estado}
                      </span>
                    </td>

                    {/* Mora */}
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold" style={{ color: mora > 180 ? "#dc2626" : mora > 60 ? "#b45309" : "#64748b" }}>
                        {mora} d
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {d.obligaciones.reduce((a, o) => a + o.cuotasVencidas, 0)} cuotas
                      </p>
                    </td>

                    {/* Riesgo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: r.bg, color: r.color }}
                        >
                          {d.riesgo}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-600">{d.score}</p>
                          <p className="text-[9px] text-slate-400 truncate">{r.label}</p>
                        </div>
                      </div>
                    </td>

                    {/* Ley 2300 — el dato que decide si se marca o no */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold border"
                        style={{ background: l.bg, borderColor: l.borde, color: l.color }}
                        title={l.detalle}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                        {l.puede ? "Contactable" : l.nivel === "tope" ? "Tope semanal" : l.nivel === "bloqueado" ? "No contactar" : "Fuera de franja"}
                      </span>
                    </td>

                    {/* Prescripción */}
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-bold" style={{ color: peor.color }}>
                        {peor.dias <= 0 ? "Prescrita" : `${nf(peor.dias)} d`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{peor.fecha}</p>
                    </td>

                    {/* Cola */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: cl.bg, color: cl.color }}
                        >
                          {cl.label}
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-slate-400">Ningún deudor coincide con los filtros</p>
            <p className="text-xs text-slate-400">Cambia de cola o limpia la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
