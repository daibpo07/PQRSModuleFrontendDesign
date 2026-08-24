import { useState } from "react"
import { Avatar, canalLabel, type Chat } from "./EnviosIndividualesData"
import {
  agentesDisponibles,
  motivosTransferencia,
  prioridadEstilo,
  type AgenteDisponible,
  type PrioridadTransferencia,
} from "./TransferenciasData"

/* ─────────────────────────────────────────────
   Ofrecer una conversación a otro asesor

   El campo que importa es la nota interna: es lo
   único que evita que el ciudadano tenga que
   contar su historia otra vez desde el principio.
───────────────────────────────────────────── */

const estadoAgente: Record<AgenteDisponible["estado"], { color: string; bg: string }> = {
  Disponible: { color: "#059669", bg: "#d1fae5" },
  Ocupado:    { color: "#b45309", bg: "#fef3c7" },
  Ausente:    { color: "#64748b", bg: "#f1f5f9" },
}

export default function TransferirModal({
  chat,
  onClose,
  onTransferir,
}: {
  chat: Chat
  onClose: () => void
  onTransferir: (destino: AgenteDisponible, motivo: string, nota: string, prioridad: PrioridadTransferencia) => void
}) {
  const [destino, setDestino] = useState<AgenteDisponible | null>(null)
  const [motivo, setMotivo] = useState(motivosTransferencia[0])
  const [prioridad, setPrioridad] = useState<PrioridadTransferencia>("Media")
  const [nota, setNota] = useState("")
  const [error, setError] = useState("")

  const cl = canalLabel[chat.canal]

  const confirmar = () => {
    if (!destino) {
      setError("Elige a quién le vas a pasar la conversación.")
      return
    }
    if (nota.trim().length < 25) {
      setError(
        "La nota interna necesita al menos 25 caracteres: es lo que evita que el ciudadano repita todo desde cero.",
      )
      return
    }
    onTransferir(destino, motivo, nota.trim(), prioridad)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >

        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <Avatar name={chat.nombre} size={38} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Transferir conversación</h3>
            <p className="text-xs text-slate-400 truncate">
              {chat.nombre} · {cl.label} · {chat.messages.filter(m => !m.sistema).length} mensajes
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Destino ── */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Para quién</p>
            <div className="flex flex-col gap-1.5 mt-2.5">
              {agentesDisponibles.map(a => {
                const sel = destino?.nombre === a.nombre
                const ea = estadoAgente[a.estado]
                const ausente = a.estado === "Ausente"
                return (
                  <button
                    key={a.nombre}
                    disabled={ausente}
                    onClick={() => {
                      setDestino(a)
                      setError("")
                    }}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: sel ? "#1E3A8A" : "#e2e8f0",
                      background: sel ? "#eff3ff" : "#fff",
                    }}
                  >
                    <Avatar name={a.nombre} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-700 truncate">{a.nombre}</p>
                        <span
                          className="text-[9px] font-bold rounded-full px-1.5 py-px shrink-0"
                          style={{ background: ea.bg, color: ea.color }}
                        >
                          {a.estado}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {a.equipo} · {a.especialidad}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold leading-none" style={{ color: a.carga >= 8 ? "#dc2626" : "#64748b" }}>
                        {a.carga}
                      </p>
                      <p className="text-[9px] text-slate-300 mt-0.5">abiertas</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Motivo y prioridad ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Motivo</p>
              <select
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className="w-full mt-2.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
              >
                {motivosTransferencia.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Prioridad</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                {(["Alta", "Media", "Baja"] as PrioridadTransferencia[]).map(p => {
                  const est = prioridadEstilo[p]
                  const sel = prioridad === p
                  return (
                    <button
                      key={p}
                      onClick={() => setPrioridad(p)}
                      className="flex-1 py-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer"
                      style={{
                        background: sel ? est.bg : "#fff",
                        borderColor: sel ? est.dot : "#e2e8f0",
                        color: sel ? est.text : "#94a3b8",
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Nota interna ── */}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Nota interna para {destino ? destino.nombre.split(" ")[0] : "el asesor"}
              </p>
              <span className="text-[9px] font-bold text-[#1E3A8A]">Obligatoria</span>
            </div>
            <textarea
              value={nota}
              onChange={e => {
                setNota(e.target.value)
                setError("")
              }}
              rows={5}
              placeholder="Qué ya intentaste, qué verificaste y qué falta por hacer. Escríbelo como si el compañero no supiera nada del caso."
              className="w-full mt-2.5 px-3.5 py-3 rounded-xl border text-xs leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all resize-none"
              style={{ borderColor: nota.trim().length >= 25 ? "#a7f3d0" : "#e2e8f0", background: "#fffbeb" }}
            />
            <div className="flex items-center justify-between gap-3 mt-1.5">
              <p className="text-[10px] text-slate-400">
                El ciudadano nunca la ve. Queda en el histórico del caso.
              </p>
              <span
                className="text-[10px] font-mono font-bold shrink-0"
                style={{ color: nota.trim().length >= 25 ? "#059669" : "#cbd5e1" }}
              >
                {nota.trim().length} / 25
              </span>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-px">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[11px] font-medium" style={{ color: "#991b1b" }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            className="flex-1 py-3 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: "#1E3A8A", boxShadow: "0 10px 24px -12px rgba(30,58,138,0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            {destino ? `Transferir a ${destino.nombre.split(" ")[0]}` : "Transferir"}
          </button>
        </div>
      </div>
    </div>
  )
}
