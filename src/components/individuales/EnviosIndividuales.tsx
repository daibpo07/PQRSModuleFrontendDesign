import { useEffect, useRef, useState } from "react"
import Contactos from "./Contactos"
import PlantillasMeta from "./PlantillasMeta"
import Tipificaciones from "./Tipificaciones"
import Transferencias from "./Transferencias"
import TransferenciaModal from "./TransferenciaModal"
import TransferirModal from "./TransferirModal"
import {
  ASESOR_ACTUAL,
  mockTransferencias,
  type AgenteDisponible,
  type PrioridadTransferencia,
  type Transferencia,
} from "./TransferenciasData"
import {
  Avatar,
  Bubble,
  DateSep,
  canalLabel,
  canalPlantillaMeta,
  catalogoTipificaciones,
  initialChats,
  mockContactos,
  mockHistorial,
  mockPlantillas,
  type Chat,
  type ConversacionCerrada,
  type Message,
  type PlantillaIndividual,
  type ResultadoCierre,
  type Tipificacion,
} from "./EnviosIndividualesData"

type Subvista = "conversaciones" | "transferencias" | "contactos" | "tipificaciones" | "plantillas"

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function duracionDesde(inicio?: string) {
  if (!inicio) return "—"
  const d = new Date(inicio.replace(" ", "T"))
  if (Number.isNaN(d.getTime())) return "—"
  const min = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000))
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h ${min % 60} min`
  return `${Math.floor(h / 24)} d ${h % 24} h`
}

function ahoraHora() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
}

function ahoraFecha() {
  return new Date().toISOString().split("T")[0]
}

/** Rellena las variables de una respuesta rápida con los datos del chat abierto. */
function interpolarChat(texto: string, chat: Chat) {
  return texto
    .replace(/\{\{nombre\}\}/g, chat.nombre.split(" ")[0])
    .replace(/\{\{radicado\}\}/g, chat.radicado ?? "tu radicado")
    .replace(/\{\{estado\}\}/g, "En gestión")
    .replace(/\{\{dependencia\}\}/g, "la dependencia asignada")
    .replace(/\{\{fecha\}\}/g, "el 22 de agosto de 2026")
    .replace(/\{\{agente\}\}/g, "Ana Martínez")
    .replace(/\{\{codigo\}\}/g, "482913")
    .replace(/\{\{documento\}\}/g, "el documento solicitado")
}

/** Texto completo que se inserta en el chat: encabezado + cuerpo. */
function plantillaATexto(p: PlantillaIndividual, chat: Chat) {
  const partes = [p.encabezado, p.cuerpo].filter(Boolean).join("\n\n")
  return interpolarChat(partes, chat)
}

/* ─────────────────────────────────────────────
   Elemento de la lista de chats
───────────────────────────────────────────── */
function ChatItem({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) {
  const cl = canalLabel[chat.canal]
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-100 cursor-pointer border-l-2"
      style={{
        background: active ? "#eff3ff" : "transparent",
        borderLeftColor: active ? "#1E3A8A" : "transparent",
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = "#f8fafc"
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = "transparent"
      }}
    >
      <div className="relative shrink-0">
        <Avatar name={chat.nombre} size={42} />
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#22c55e" }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${active ? "font-bold text-[#1E3A8A]" : "font-semibold text-slate-800"}`}>
            {chat.nombre}
          </span>
          <span className={`text-[10px] ml-2 shrink-0 ${chat.noLeidos > 0 ? "font-bold text-[#0EA5E9]" : "text-slate-400"}`}>
            {chat.hora}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className={`text-xs truncate ${chat.noLeidos > 0 ? "font-medium text-slate-600" : "text-slate-400"}`}>
            {chat.typing ? <span className="italic text-[#0EA5E9]">escribiendo…</span> : chat.ultimoMensaje}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-bold rounded px-1.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>
              {cl.label}
            </span>
            {chat.noLeidos > 0 && (
              <span className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center text-white" style={{ background: "#0EA5E9" }}>
                {chat.noLeidos}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────────
   Modal de cierre y tipificación
───────────────────────────────────────────── */
const etiquetasSugeridas = [
  "Primer contacto",
  "Escalado",
  "Requiere seguimiento",
  "Ciudadano satisfecho",
  "Reincidente",
  "Documentación pendiente",
]

function CerrarConversacionModal({
  chat,
  onClose,
  onCerrar,
}: {
  chat: Chat
  onClose: () => void
  onCerrar: (t: Tipificacion, r: ResultadoCierre, nota: string, etiquetas: string[], archivar: boolean) => void
}) {
  const [categoria, setCategoria] = useState(catalogoTipificaciones[0].nombre)
  const [subcategoria, setSubcategoria] = useState(catalogoTipificaciones[0].subcategorias[0].nombre)
  const [motivo, setMotivo] = useState(catalogoTipificaciones[0].subcategorias[0].motivos[0])
  const [resultado, setResultado] = useState<ResultadoCierre>("Resuelto")
  const [nota, setNota] = useState("")
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [archivar, setArchivar] = useState(false)
  const [encuesta, setEncuesta] = useState(true)
  const [error, setError] = useState("")

  const cat = catalogoTipificaciones.find(c => c.nombre === categoria) ?? catalogoTipificaciones[0]
  const sub = cat.subcategorias.find(s => s.nombre === subcategoria) ?? cat.subcategorias[0]

  const cambiarCategoria = (nombre: string) => {
    const c = catalogoTipificaciones.find(x => x.nombre === nombre)!
    setCategoria(nombre)
    setSubcategoria(c.subcategorias[0].nombre)
    setMotivo(c.subcategorias[0].motivos[0])
  }

  const cambiarSub = (nombre: string) => {
    const s = cat.subcategorias.find(x => x.nombre === nombre)!
    setSubcategoria(nombre)
    setMotivo(s.motivos[0])
  }

  const confirmar = () => {
    if (nota.trim().length < 15) {
      setError("La nota de cierre debe tener al menos 15 caracteres: es el resumen que queda en el histórico.")
      return
    }
    onCerrar({ categoria, subcategoria, motivo }, resultado, nota.trim(), etiquetas, archivar)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <Avatar name={chat.nombre} size={38} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Cerrar y tipificar conversación</h3>
            <p className="text-xs text-slate-400 truncate">
              {chat.nombre} · {chat.messages.length} mensajes · {duracionDesde(chat.inicio)} de conversación
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Ruta de tipificación */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Tipificación</p>
            <div className="grid sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={e => cambiarCategoria(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                >
                  {catalogoTipificaciones.map(c => (
                    <option key={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Subcategoría</label>
                <select
                  value={subcategoria}
                  onChange={e => cambiarSub(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                >
                  {cat.subcategorias.map(s => (
                    <option key={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Motivo</label>
                <select
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border-2 bg-white text-[11px] font-semibold focus:outline-none cursor-pointer transition-all"
                  style={{ borderColor: "#1E3A8A", color: "#1E3A8A" }}
                >
                  {sub.motivos.map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Resultado de la gestión</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Resuelto", "Escalado", "Sin respuesta", "Reabierto"] as ResultadoCierre[]).map(r => (
                <button
                  key={r}
                  onClick={() => setResultado(r)}
                  className="px-3 py-2 rounded-lg text-[11px] font-semibold border-2 transition-all cursor-pointer"
                  style={{
                    borderColor: resultado === r ? "#1E3A8A" : "#e2e8f0",
                    background: resultado === r ? "#eff3ff" : "#fff",
                    color: resultado === r ? "#1E3A8A" : "#64748b",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nota de cierre</label>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              rows={4}
              placeholder="Resume qué pidió el ciudadano, qué se hizo y cómo quedó. Este texto es lo que se lee en el histórico."
              className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
              style={{ borderColor: error ? "#fca5a5" : "#e2e8f0" }}
            />
            {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
          </div>

          {/* Etiquetas */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">
              Etiquetas <span className="text-slate-300 font-normal">(opcional)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {etiquetasSugeridas.map(e => {
                const sel = etiquetas.includes(e)
                return (
                  <button
                    key={e}
                    onClick={() => setEtiquetas(prev => (sel ? prev.filter(x => x !== e) : [...prev, e]))}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer"
                    style={{
                      background: sel ? "#1E3A8A" : "#f8fafc",
                      color: sel ? "#fff" : "#64748b",
                      borderColor: sel ? "#1E3A8A" : "#e2e8f0",
                    }}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-2 pt-1">
            {[
              {
                on: encuesta,
                set: setEncuesta,
                label: "Enviar encuesta de satisfacción al cerrar",
                sub: "El ciudadano recibe una calificación de 1 a 5 por el mismo canal",
              },
              {
                on: archivar,
                set: setArchivar,
                label: "Archivar en lugar de cerrar",
                sub: "Se guarda en el histórico sin marcarla como gestión finalizada",
              },
            ].map(o => (
              <button
                key={o.label}
                onClick={() => o.set(!o.on)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-left transition-all cursor-pointer hover:border-slate-300"
              >
                <span
                  className="w-8 rounded-full relative shrink-0 transition-colors"
                  style={{ background: o.on ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                >
                  <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: o.on ? 16 : 2 }} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700">{o.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{o.sub}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#eff3ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Al cerrar, la conversación completa se guarda en{" "}
              <span className="font-semibold">Tipificaciones › Histórico de chat</span>, donde podrás leer todo lo
              hablado desde el primer mensaje hasta el cierre. El registro es inmutable.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <p className="text-[11px] text-slate-400 hidden sm:block ml-1 truncate">
            {categoria} › {subcategoria} › <span className="font-semibold text-slate-600">{motivo}</span>
          </p>
          <button
            onClick={confirmar}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {archivar ? "Archivar conversación" : "Cerrar conversación"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Subvista Conversaciones
───────────────────────────────────────────── */
function PanelConversaciones({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  plantillas,
  aviso,
  onVerHistorico,
  onCerrarAviso,
  onSolicitarCierre,
  onSolicitarTransferencia,
}: {
  chats: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  activeChatId: string
  setActiveChatId: (id: string) => void
  plantillas: PlantillaIndividual[]
  aviso: { id: string; nombre: string } | null
  onVerHistorico: () => void
  onCerrarAviso: () => void
  onSolicitarCierre: () => void
  onSolicitarTransferencia: () => void
}) {
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [filterCanal, setFilterCanal] = useState<string>("todos")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? chats[0]

  const filteredChats = chats.filter(c => {
    const matchSearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.ultimoMensaje.toLowerCase().includes(search.toLowerCase())
    const matchCanal = filterCanal === "todos" || c.canal === filterCanal
    return matchSearch && matchCanal
  })

  const pinnedChats = filteredChats.filter(c => c.pinned)
  const otherChats = filteredChats.filter(c => !c.pinned)

  /* Plantillas sugeridas cuando el borrador empieza por "/".
     Se priorizan las del canal del chat; si no hay ninguna, se ofrecen todas. */
  const coincidentes = /^\/\w*$/.test(draft)
    ? plantillas.filter(p => p.atajo.startsWith(draft.toLowerCase()) && p.aprobacion !== "Rechazada")
    : []
  const delCanal = coincidentes.filter(p => p.canal === activeChat?.canal)
  const sugerencias = delCanal.length > 0 ? delCanal : coincidentes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChatId, activeChat?.messages.length])

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: "#F8FAFC" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-200">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm font-medium text-slate-400">No hay conversaciones abiertas</p>
        <button onClick={onVerHistorico} className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer">
          Ver el histórico de conversaciones cerradas →
        </button>
      </div>
    )
  }

  const sendMessage = (texto?: string) => {
    const contenido = (texto ?? draft).trim()
    if (!contenido) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: contenido,
      time: ahoraHora(),
      mine: true,
      status: "sent",
    }
    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMsg], ultimoMensaje: newMsg.text, hora: newMsg.time, noLeidos: 0 }
          : c,
      ),
    )
    setDraft("")
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (sugerencias.length > 0) {
        setDraft(plantillaATexto(sugerencias[0], activeChat))
        return
      }
      sendMessage()
    }
  }

  const openChat = (id: string) => {
    setActiveChatId(id)
    setChats(prev => prev.map(c => (c.id === id ? { ...c, noLeidos: 0 } : c)))
    setShowInfo(false)
  }

  const quickEmojis = ["👍", "❤️", "😊", "🙏", "✅", "🔔"]
  const cl = canalLabel[activeChat.canal]

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: "#F8FAFC" }}>

      {/* ── IZQUIERDA: lista de chats ── */}
      <div className="flex flex-col border-r border-slate-200 bg-white shrink-0" style={{ width: 320 }}>
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Conversaciones activas</h2>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer" title="Nuevo chat">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer" title="Más opciones">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversación…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
            />
          </div>

          <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5">
            {[["todos", "Todos"], ["whatsapp", "WhatsApp"], ["sms", "SMS"], ["internal", "Interno"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterCanal(val)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer"
                style={{
                  background: filterCanal === val ? "#1E3A8A" : "#f8fafc",
                  color: filterCanal === val ? "#fff" : "#64748b",
                  borderColor: filterCanal === val ? "#1E3A8A" : "#e2e8f0",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {pinnedChats.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Fijados</p>
              {pinnedChats.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onClick={() => openChat(c.id)} />
              ))}
            </>
          )}
          {otherChats.length > 0 && (
            <>
              {pinnedChats.length > 0 && (
                <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Todos los chats
                </p>
              )}
              {otherChats.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onClick={() => openChat(c.id)} />
              ))}
            </>
          )}
          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium text-slate-400">Sin resultados</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100">
          <button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva conversación
          </button>
        </div>
      </div>

      {/* ── CENTRO: ventana de chat ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Aviso de cierre reciente */}
        {aviso && (
          <div className="flex items-center gap-3 px-5 py-2.5 border-b" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
            <svg viewBox="0 0 20 20" fill="#059669" className="w-4 h-4 shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] flex-1 min-w-0" style={{ color: "#065f46" }}>
              La conversación con <span className="font-semibold">{aviso.nombre}</span> quedó cerrada y guardada con su
              transcripción completa.
            </p>
            <button
              onClick={onVerHistorico}
              className="text-[11px] font-bold cursor-pointer hover:underline shrink-0"
              style={{ color: "#065f46" }}
            >
              Ver en histórico →
            </button>
            <button onClick={onCerrarAviso} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Barra superior del chat */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 shadow-sm">
          <div className="relative">
            <Avatar name={activeChat.nombre} size={38} />
            {activeChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{activeChat.nombre}</h3>
              <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>
                {cl.label}
              </span>
              {activeChat.tag && (
                <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {activeChat.tag}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {activeChat.typing ? (
                <span className="italic text-[#0EA5E9] animate-pulse">escribiendo…</span>
              ) : activeChat.online ? (
                "En línea"
              ) : (
                activeChat.cargo
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onSolicitarTransferencia}
              title="Pasar esta conversación a otro asesor con una nota de contexto"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-slate-50 transition-all cursor-pointer mr-1"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Transferir
            </button>
            <button
              onClick={onSolicitarCierre}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-slate-50 transition-all cursor-pointer mr-1"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cerrar y tipificar
            </button>
            {[
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                ),
                title: "Llamar",
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                ),
                title: "Buscar",
              },
            ].map(btn => (
              <button
                key={btn.title}
                title={btn.title}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer"
              >
                {btn.icon}
              </button>
            ))}
            <button
              onClick={() => setShowInfo(v => !v)}
              title="Info del contacto"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer"
              style={{ background: showInfo ? "#eff3ff" : "transparent", color: showInfo ? "#1E3A8A" : "#94a3b8" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #F8FAFC 100%)" }}>
          <DateSep label="Hoy" />
          {activeChat.messages.map(msg => (
            <Bubble key={msg.id} msg={msg} chatCanal={activeChat.canal} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de entrada */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 relative">
          {/* Sugerencias de respuesta rápida */}
          {sugerencias.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10">
              <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                Plantillas
              </p>
              <div className="max-h-56 overflow-y-auto">
                {sugerencias.map(p => {
                  const cm = canalPlantillaMeta[p.canal]
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDraft(plantillaATexto(p, activeChat))
                        inputRef.current?.focus()
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono font-bold rounded px-1.5 py-0.5 shrink-0" style={{ background: "#eff3ff", color: "#1E3A8A" }}>
                          {p.atajo}
                        </code>
                        <span className="text-[11px] font-semibold text-slate-700 truncate">{p.nombre}</span>
                        <span className="ml-auto text-[9px] font-bold rounded px-1.5 py-0.5 shrink-0" style={{ background: cm.bg, color: cm.color }}>
                          {cm.corto}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{plantillaATexto(p, activeChat)}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {emojiOpen && (
            <div className="flex gap-2 mb-3 px-1">
              {quickEmojis.map(e => (
                <button
                  key={e}
                  onClick={() => {
                    setDraft(d => d + e)
                    setEmojiOpen(false)
                  }}
                  className="text-xl hover:scale-125 transition-transform cursor-pointer"
                >
                  {e}
                </button>
              ))}
              <button onClick={() => setEmojiOpen(false)} className="ml-auto text-xs text-slate-400 hover:text-slate-600 cursor-pointer px-1">
                ✕
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => setEmojiOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0"
              style={{ background: emojiOpen ? "#eff3ff" : undefined, color: emojiOpen ? "#1E3A8A" : undefined }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribe un mensaje… o usa / para insertar una plantilla"
                rows={1}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none overflow-hidden leading-relaxed"
                style={{ minHeight: 42, maxHeight: 120 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = "auto"
                  el.style.height = Math.min(el.scrollHeight, 120) + "px"
                }}
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!draft.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-40"
              style={{ background: draft.trim() ? "#1E3A8A" : "#e2e8f0" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: draft.trim() ? "#fff" : "#94a3b8" }}>
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>

          <p className="text-[10px] text-slate-300 text-center mt-2">
            <kbd className="font-mono bg-slate-100 rounded px-1">Enter</kbd> para enviar ·{" "}
            <kbd className="font-mono bg-slate-100 rounded px-1">Shift+Enter</kbd> nueva línea ·{" "}
            <kbd className="font-mono bg-slate-100 rounded px-1">/</kbd> plantillas
          </p>
        </div>
      </div>

      {/* ── DERECHA: info del contacto ── */}
      {showInfo && (
        <div className="flex flex-col bg-white border-l border-slate-200 shrink-0 overflow-y-auto" style={{ width: 280 }}>
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Información</h4>
              <button
                onClick={() => setShowInfo(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-all"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 pb-2">
              <Avatar name={activeChat.nombre} size={60} />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{activeChat.nombre}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeChat.cargo}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>
                    {cl.label}
                  </span>
                  {activeChat.online ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5">En línea</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">Desconectado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3 border-b border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Datos de la conversación</p>
            {[
              { label: "Documento", value: activeChat.documento ?? "—" },
              { label: "Radicado", value: activeChat.radicado ?? "Sin radicado" },
              { label: "Inicio", value: activeChat.inicio ?? "—" },
              { label: "Duración", value: duracionDesde(activeChat.inicio) },
              { label: "Mensajes", value: String(activeChat.messages.length) },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 shrink-0">{s.label}</span>
                <span className="text-[11px] font-semibold text-slate-700 text-right truncate">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 mt-auto border-t border-slate-100 space-y-1.5">
            <button
              onClick={onSolicitarCierre}
              className="w-full text-left text-[11px] font-semibold text-white rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-2"
              style={{ background: "#1E3A8A" }}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M13.485 2.929a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5.778 9.22l6.293-6.292a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cerrar y tipificar
            </button>
            <button className="w-full text-left text-[11px] font-medium text-slate-500 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 2a.5.5 0 01.5.5V12a.5.5 0 01-1 0V2.5A.5.5 0 018 2z" />
                <path d="M.146 8.146a.5.5 0 000 .708l2 2a.5.5 0 10.708-.708L1.707 9H5.5a.5.5 0 000-1H1.707l1.147-1.146a.5.5 0 10-.708-.708l-2 2z" />
              </svg>
              Exportar conversación
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Módulo Envíos Individuales
───────────────────────────────────────────── */
export default function EnviosIndividuales() {
  const [subvista, setSubvista] = useState<Subvista>("conversaciones")
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [historial, setHistorial] = useState<ConversacionCerrada[]>(mockHistorial)
  const [transferencias, setTransferencias] = useState<Transferencia[]>(mockTransferencias)
  const [plantillas, setPlantillas] = useState<PlantillaIndividual[]>(mockPlantillas)
  const [activeChatId, setActiveChatId] = useState<string>("c1")
  const [modalCierre, setModalCierre] = useState(false)
  const [modalTransferir, setModalTransferir] = useState(false)
  const [transferenciaAbierta, setTransferenciaAbierta] = useState<Transferencia | null>(null)
  const [toast, setToast] = useState<{ tono: "ok" | "info"; texto: string } | null>(null)
  const temporizadorToast = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [aviso, setAviso] = useState<{ id: string; nombre: string } | null>(null)
  const [destacado, setDestacado] = useState<string | null>(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? chats[0] ?? null
  const noLeidos = chats.reduce((a, c) => a + c.noLeidos, 0)

  /* Solo las recibidas y sin decidir cuentan como trabajo pendiente */
  const transferenciasPorRevisar = transferencias.filter(
    t => t.destino.nombre === ASESOR_ACTUAL && t.estado === "pendiente",
  ).length

  const avisar = (tono: "ok" | "info", texto: string) => {
    if (temporizadorToast.current) clearTimeout(temporizadorToast.current)
    setToast({ tono, texto })
    temporizadorToast.current = setTimeout(() => setToast(null), 6000)
  }

  /* Cierra la conversación abierta y la guarda en el histórico con toda su transcripción */
  const cerrarConversacion = (
    tipificacion: Tipificacion,
    resultado: ResultadoCierre,
    nota: string,
    etiquetas: string[],
    archivar: boolean,
  ) => {
    if (!activeChat) return
    const hora = ahoraHora()
    const id = `h${Date.now()}`

    const registro: ConversacionCerrada = {
      id,
      contacto: activeChat.nombre,
      documento: activeChat.documento ?? "—",
      canal: activeChat.canal,
      radicado: activeChat.radicado,
      agente: "Ana Martínez",
      inicio: activeChat.inicio ?? "—",
      cierre: `${ahoraFecha()} ${hora}`,
      duracion: duracionDesde(activeChat.inicio),
      mensajesTotal: activeChat.messages.length,
      tipificacion,
      resultado,
      motivoCierre: archivar ? "Archivada" : "Cerrada por el asesor",
      notaCierre: nota,
      etiquetas,
      transcripcion: [
        {
          fecha: "Conversación completa",
          mensajes: [
            {
              id: `${id}-ini`,
              text: `Conversación iniciada por ${canalLabel[activeChat.canal].label}`,
              time: activeChat.inicio?.split(" ")[1] ?? "—",
              mine: false,
              sistema: true,
            },
            ...activeChat.messages,
            {
              id: `${id}-fin`,
              text: archivar ? "Conversación archivada por Ana Martínez" : "Conversación cerrada por Ana Martínez",
              time: hora,
              mine: false,
              sistema: true,
            },
          ],
        },
      ],
    }

    const resto = chats.filter(c => c.id !== activeChat.id)
    setHistorial(prev => [registro, ...prev])
    setChats(resto)
    setActiveChatId(resto[0]?.id ?? "")
    setAviso({ id, nombre: activeChat.nombre })
    setDestacado(id)
    setModalCierre(false)
  }

  /* ── Aceptar: la conversación entra a mi bandeja con todo su historial ── */
  const aceptarTransferencia = (id: string) => {
    const t = transferencias.find(x => x.id === id)
    if (!t) return
    const hora = ahoraHora()

    const nuevoChat: Chat = {
      id: `tc-${t.id}`,
      nombre: t.contacto,
      cargo: t.radicado ? `Peticionario — ${t.radicado}` : `Transferida por ${t.origen.nombre}`,
      documento: t.documento,
      radicado: t.radicado,
      canal: t.canal,
      inicio: t.inicioConversacion,
      ultimoMensaje: [...t.mensajes].reverse().find(m => !m.sistema)?.text ?? "",
      hora,
      noLeidos: 0,
      online: false,
      tag: "Transferida",
      messages: [
        ...t.mensajes,
        {
          id: `${t.id}-aceptada`,
          text: `${ASESOR_ACTUAL} aceptó la transferencia de ${t.origen.nombre}`,
          time: hora,
          mine: false,
          sistema: true,
        },
      ],
    }

    setChats(prev => [nuevoChat, ...prev])
    setActiveChatId(nuevoChat.id)
    setTransferencias(prev =>
      prev.map(x => (x.id === id ? { ...x, estado: "aceptada", respuesta: { hora: `Hoy ${hora}` } } : x)),
    )
    setTransferenciaAbierta(null)
    setSubvista("conversaciones")
    avisar("ok", `Aceptaste la conversación de ${t.contacto}. Está en tu bandeja con todo el historial.`)
  }

  /* ── Rechazar: vuelve al origen con el motivo, nunca en silencio ── */
  const rechazarTransferencia = (id: string, motivo: string, nota: string) => {
    const t = transferencias.find(x => x.id === id)
    if (!t) return
    const hora = ahoraHora()

    setTransferencias(prev =>
      prev.map(x =>
        x.id === id
          ? { ...x, estado: "rechazada", respuesta: { hora: `Hoy ${hora}`, motivo, nota: nota || undefined } }
          : x,
      ),
    )
    setTransferenciaAbierta(null)
    avisar("info", `La conversación de ${t.contacto} volvió a ${t.origen.nombre} con tu motivo.`)
  }

  /* ── Ofrecer una conversación propia a otro asesor ── */
  const transferirConversacion = (
    destino: AgenteDisponible,
    motivo: string,
    nota: string,
    prioridad: PrioridadTransferencia,
  ) => {
    if (!activeChat) return
    const hora = ahoraHora()

    const nueva: Transferencia = {
      id: `tr-${Date.now()}`,
      contacto: activeChat.nombre,
      documento: activeChat.documento ?? "—",
      canal: activeChat.canal,
      radicado: activeChat.radicado,
      origen: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
      destino: { nombre: destino.nombre, cargo: destino.cargo, equipo: destino.equipo },
      motivo,
      notaInterna: nota,
      prioridad,
      solicitada: `Hoy ${hora}`,
      esperaMin: 0,
      inicioConversacion: activeChat.inicio ?? "—",
      minutosUltimoMensaje: 5,
      etiquetas: activeChat.tag ? [activeChat.tag] : [],
      avance: "Transferida desde la bandeja de conversaciones.",
      mensajes: activeChat.messages,
      estado: "pendiente",
    }

    const resto = chats.filter(c => c.id !== activeChat.id)
    setTransferencias(prev => [nueva, ...prev])
    setChats(resto)
    setActiveChatId(resto[0]?.id ?? "")
    setModalTransferir(false)
    setSubvista("transferencias")
    avisar("info", `${destino.nombre} tiene la conversación de ${activeChat.nombre} esperando su decisión.`)
  }

  const irAlHistorico = () => {
    setSubvista("tipificaciones")
    setAviso(null)
  }

  const abrirConversacionDe = (documento: string) => {
    const chat = chats.find(c => c.documento === documento)
    if (chat) setActiveChatId(chat.id)
    setSubvista("conversaciones")
  }

  const tabs: [Subvista, string, number | null][] = [
    ["conversaciones", "Conversaciones", noLeidos > 0 ? noLeidos : null],
    ["transferencias", "Transferencias", transferenciasPorRevisar > 0 ? transferenciasPorRevisar : null],
    ["contactos", "Contactos", null],
    ["tipificaciones", "Tipificaciones", historial.length],
    ["plantillas", "Plantillas", null],
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Barra de subvistas */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0">
        {tabs.map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => {
              setSubvista(key)
              if (key !== "tipificaciones") setDestacado(null)
            }}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              subvista === key
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            {label}
            {badge !== null && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold"
                style={{
                  background: subvista === key ? "#eff3ff" : "#f1f5f9",
                  color: subvista === key ? "#1E3A8A" : "#94a3b8",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Subvistas */}
      {subvista === "conversaciones" && (
        <PanelConversaciones
          chats={chats}
          setChats={setChats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          plantillas={plantillas}
          aviso={aviso}
          onVerHistorico={irAlHistorico}
          onCerrarAviso={() => setAviso(null)}
          onSolicitarCierre={() => setModalCierre(true)}
          onSolicitarTransferencia={() => setModalTransferir(true)}
        />
      )}

      {subvista === "transferencias" && (
        <Transferencias transferencias={transferencias} onAbrir={t => setTransferenciaAbierta(t)} />
      )}

      {subvista === "contactos" && (
        <Contactos contactos={mockContactos} historial={historial} onEscribir={abrirConversacionDe} />
      )}

      {subvista === "tipificaciones" && <Tipificaciones historial={historial} destacado={destacado} />}

      {subvista === "plantillas" && (
        <PlantillasMeta
          plantillas={plantillas}
          onGuardar={p =>
            setPlantillas(prev => (prev.some(x => x.id === p.id) ? prev.map(x => (x.id === p.id ? p : x)) : [p, ...prev]))
          }
          onEliminar={id => setPlantillas(prev => prev.filter(p => p.id !== id))}
        />
      )}

      {/* Modal de cierre */}
      {modalCierre && activeChat && (
        <CerrarConversacionModal chat={activeChat} onClose={() => setModalCierre(false)} onCerrar={cerrarConversacion} />
      )}

      {/* Revisión de una transferencia */}
      {transferenciaAbierta && (
        <TransferenciaModal
          transferencia={transferenciaAbierta}
          soloLectura={transferenciaAbierta.origen.nombre === ASESOR_ACTUAL}
          onAceptar={aceptarTransferencia}
          onRechazar={rechazarTransferencia}
          onClose={() => setTransferenciaAbierta(null)}
        />
      )}

      {/* Ofrecer la conversación abierta a otro asesor */}
      {modalTransferir && activeChat && (
        <TransferirModal
          chat={activeChat}
          onClose={() => setModalTransferir(false)}
          onTransferir={transferirConversacion}
        />
      )}

      {/* Aviso de lo que acaba de pasar */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm entra" style={{ "--retraso": "0ms" } as React.CSSProperties}>
          <div
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg"
            style={{
              background: toast.tono === "ok" ? "#ecfdf5" : "#eff3ff",
              borderColor: toast.tono === "ok" ? "#a7f3d0" : "#dce5fb",
            }}
          >
            <svg
              viewBox="0 0 20 20"
              fill={toast.tono === "ok" ? "#059669" : "#1E3A8A"}
              className="w-4 h-4 shrink-0 mt-px"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p
              className="text-[11px] leading-relaxed flex-1"
              style={{ color: toast.tono === "ok" ? "#065f46" : "#1E3A8A" }}
            >
              {toast.texto}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            >
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
