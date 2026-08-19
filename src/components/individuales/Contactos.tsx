import { useState } from "react"
import {
  Avatar,
  canalLabel,
  type CanalChat,
  type Contacto,
  type ConversacionCerrada,
} from "./EnviosIndividualesData"

interface Props {
  contactos: Contacto[]
  historial: ConversacionCerrada[]
  onEscribir: (documento: string) => void
}

const estadoMeta: Record<Contacto["estado"], { bg: string; text: string; dot: string }> = {
  Activo:          { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Sin actividad": { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  "Opt-out":       { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

function IconoCanal({ canal, className = "w-3 h-3" }: { canal: CanalChat; className?: string }) {
  if (canal === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  if (canal === "sms")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
      </svg>
    )
  if (canal === "email")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Subvista Contactos
───────────────────────────────────────────── */
export default function Contactos({ contactos, historial, onEscribir }: Props) {
  const [buscar, setBuscar] = useState("")
  const [filtro, setFiltro] = useState<"Todos" | Contacto["estado"]>("Todos")
  const [seleccion, setSeleccion] = useState<Contacto | null>(null)

  const filtrados = contactos.filter(c => {
    if (filtro !== "Todos" && c.estado !== filtro) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.documento.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.telefono ?? "").includes(q) ||
        c.radicados.some(r => r.toLowerCase().includes(q))
      )
    }
    return true
  })

  const conteos: Record<string, number> = {
    Todos: contactos.length,
    Activo: contactos.filter(c => c.estado === "Activo").length,
    "Sin actividad": contactos.filter(c => c.estado === "Sin actividad").length,
    "Opt-out": contactos.filter(c => c.estado === "Opt-out").length,
  }

  /* Conversaciones cerradas del contacto seleccionado */
  const historialContacto = seleccion ? historial.filter(h => h.documento === seleccion.documento) : []

  return (
    <div className="flex-1 overflow-hidden flex" style={{ background: "#F8FAFC" }}>

      {/* Listado */}
      <div className="flex-1 overflow-auto p-6 space-y-5 min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Contactos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos los ciudadanos con los que se ha abierto una conversación, con sus canales verificados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
              style={{ background: "#1E3A8A" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo contacto
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {(["Todos", "Activo", "Sin actividad", "Opt-out"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filtro === f
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                }`}
              >
                {f !== "Todos" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: filtro === f ? "#fff" : estadoMeta[f].dot }}
                  />
                )}
                {f}
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                    filtro === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {conteos[f]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar por nombre, documento o radicado…"
              className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-64 transition-all"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Contacto", "Canales", "Radicados", "Conversaciones", "Última interacción", "Estado"].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => {
                  const em = estadoMeta[c.estado]
                  const activo = seleccion?.id === c.id
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSeleccion(activo ? null : c)}
                      className="border-b border-slate-50 cursor-pointer transition-colors"
                      style={{ background: activo ? "#eff3ff" : undefined }}
                      onMouseEnter={e => {
                        if (!activo) e.currentTarget.style.background = "#f8fafc"
                      }}
                      onMouseLeave={e => {
                        if (!activo) e.currentTarget.style.background = ""
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.nombre} size={32} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">{c.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.documento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {c.canales.map(cn => (
                            <span
                              key={cn}
                              title={canalLabel[cn].label}
                              className="w-6 h-6 rounded-md flex items-center justify-center"
                              style={{ background: canalLabel[cn].bg, color: canalLabel[cn].color }}
                            >
                              <IconoCanal canal={cn} />
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.radicados.length === 0 ? (
                          <span className="text-[11px] text-slate-300">—</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">{c.radicados[0]}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-bold text-slate-600">{c.conversaciones}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-400">{c.ultimaInteraccion}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
                          style={{ background: em.bg, color: em.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: em.dot }} />
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <p className="text-sm text-slate-400 font-medium">Sin contactos</p>
                      <p className="text-xs text-slate-300 mt-1">Ajusta los filtros o la búsqueda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-600">{filtrados.length}</span> contactos · haz clic en uno para
              ver su ficha
            </p>
          </div>
        </div>
      </div>

      {/* Ficha del contacto */}
      {seleccion && (
        <div className="flex flex-col bg-white border-l border-slate-200 shrink-0 overflow-y-auto" style={{ width: 300 }}>
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ficha del contacto</h4>
              <button
                onClick={() => setSeleccion(null)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-all"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Avatar name={seleccion.nombre} size={60} />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{seleccion.nombre}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{seleccion.documento}</p>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-0.5 mt-2"
                  style={{ background: estadoMeta[seleccion.estado].bg, color: estadoMeta[seleccion.estado].text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: estadoMeta[seleccion.estado].dot }} />
                  {seleccion.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Datos de contacto</p>
            {[
              { l: "Teléfono", v: seleccion.telefono ?? "No registrado" },
              { l: "Correo", v: seleccion.email ?? "No registrado" },
              { l: "Ciudad", v: seleccion.ciudad },
              { l: "Canal preferido", v: canalLabel[seleccion.canalPreferido].label },
            ].map(x => (
              <div key={x.l}>
                <p className="text-[10px] text-slate-400">{x.l}</p>
                <p className={`text-[11px] mt-0.5 ${x.v.startsWith("No registrado") ? "text-slate-300 italic" : "font-semibold text-slate-700"}`}>
                  {x.v}
                </p>
              </div>
            ))}
          </div>

          {/* Autorización */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div
              className="rounded-xl p-3 flex items-start gap-2.5"
              style={{ background: seleccion.optIn ? "#ecfdf5" : "#fef2f2" }}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 shrink-0 mt-px"
                style={{ color: seleccion.optIn ? "#059669" : "#dc2626" }}
              >
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-[10px] leading-relaxed" style={{ color: seleccion.optIn ? "#065f46" : "#991b1b" }}>
                {seleccion.optIn
                  ? "Autorización de tratamiento de datos vigente. Puede recibir campañas masivas."
                  : "Canceló la suscripción. Solo puede recibir mensajes en respuesta a un radicado propio."}
              </p>
            </div>
          </div>

          {/* Radicados */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Radicados asociados
            </p>
            {seleccion.radicados.length === 0 ? (
              <p className="text-[11px] text-slate-300">Sin radicados</p>
            ) : (
              <div className="space-y-1.5">
                {seleccion.radicados.map(r => (
                  <button
                    key={r}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 border border-slate-200 hover:border-[#1E3A8A]/40 hover:bg-slate-50 transition-all cursor-pointer text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#0EA5E9" }} />
                    <span className="text-[10px] font-mono font-semibold text-slate-600 flex-1">{r}</span>
                    <span className="text-[10px] text-slate-300">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de conversaciones */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Conversaciones cerradas
            </p>
            {historialContacto.length === 0 ? (
              <p className="text-[11px] text-slate-300">Aún no hay conversaciones cerradas</p>
            ) : (
              <div className="space-y-2">
                {historialContacto.map(h => (
                  <div key={h.id} className="rounded-lg p-2.5" style={{ background: "#f8fafc" }}>
                    <p className="text-[10px] font-semibold text-slate-600">{h.tipificacion.motivo}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {h.cierre} · {h.duracion} · {h.resultado}
                    </p>
                  </div>
                ))}
                <p className="text-[9px] text-slate-300 leading-relaxed pt-1">
                  Abre la subvista de Tipificaciones para leer la transcripción completa.
                </p>
              </div>
            )}
          </div>

          {/* Etiquetas y nota */}
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5">
                {seleccion.etiquetas.map(e => (
                  <span key={e} className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100 text-slate-500">
                    {e}
                  </span>
                ))}
                {seleccion.etiquetas.length === 0 && <span className="text-[10px] text-slate-300">Sin etiquetas</span>}
              </div>
            </div>
            {seleccion.nota && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nota interna</p>
                <p className="text-[11px] leading-relaxed text-slate-500 rounded-lg p-2.5" style={{ background: "#fefce8" }}>
                  {seleccion.nota}
                </p>
              </div>
            )}
          </div>

          <div className="px-5 py-4 mt-auto border-t border-slate-100">
            <button
              onClick={() => onEscribir(seleccion.documento)}
              disabled={!seleccion.optIn}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
              style={{ background: "#1E3A8A" }}
            >
              Abrir conversación
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
