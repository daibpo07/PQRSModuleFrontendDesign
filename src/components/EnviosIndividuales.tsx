import { useState, useRef, useEffect } from "react"

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type MsgStatus = "sent" | "delivered" | "read"

interface Message {
  id: string
  text: string
  time: string
  mine: boolean
  status?: MsgStatus
  attachment?: { name: string; size: string; type: "file" | "image" }
  reactions?: string[]
}

interface Chat {
  id: string
  nombre: string
  cargo?: string
  canal: "whatsapp" | "sms" | "email" | "internal"
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
  typing?: boolean
  pinned?: boolean
  messages: Message[]
  tag?: string
}

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const initialChats: Chat[] = [
  {
    id: "c1",
    nombre: "Carlos Morales",
    cargo: "Peticionario — PQR-2026-000012",
    canal: "whatsapp",
    ultimoMensaje: "Muchas gracias por la información 🙏",
    hora: "09:41",
    noLeidos: 0,
    online: true,
    pinned: true,
    tag: "Resuelto",
    messages: [
      { id: "m1", text: "Buenos días, necesito saber el estado de mi radicado PQR-2026-000012", time: "09:02", mine: false },
      { id: "m2", text: "Hola Carlos, con gusto te ayudo. Tu radicado está en estado 'En gestión'. El equipo lo revisará antes del viernes.", time: "09:05", mine: true, status: "read" },
      { id: "m3", text: "¿Hay algún documento adicional que deba adjuntar?", time: "09:08", mine: false },
      { id: "m4", text: "No, con lo que enviaste es suficiente. Te notificaremos al correo registrado en cuanto tengamos la respuesta.", time: "09:12", mine: true, status: "read" },
      { id: "m5", text: "Perfecto, quedo pendiente entonces.", time: "09:14", mine: false },
      { id: "m6", text: "Claro que sí. Cualquier duda estamos a tu disposición 😊", time: "09:15", mine: true, status: "read" },
      { id: "m7", text: "Muchas gracias por la información 🙏", time: "09:41", mine: false },
    ],
  },
  {
    id: "c2",
    nombre: "María López",
    cargo: "Peticionaria — PQR-2026-000011",
    canal: "whatsapp",
    ultimoMensaje: "¿Me pueden confirmar cuando este listo?",
    hora: "Ayer",
    noLeidos: 2,
    online: false,
    typing: false,
    messages: [
      { id: "m1", text: "Buenas tardes, estoy esperando el certificado que solicitamos la semana pasada.", time: "15:30", mine: false },
      { id: "m2", text: "Hola María, disculpa la espera. El certificado está en proceso de firma. Lo tendrás disponible mañana antes del mediodía.", time: "15:45", mine: true, status: "delivered" },
      { id: "m3", text: "¿Me pueden confirmar cuando este listo?", time: "16:02", mine: false },
    ],
  },
  {
    id: "c3",
    nombre: "Pedro Ramírez",
    cargo: "Peticionario — PQR-2026-000010",
    canal: "sms",
    ultimoMensaje: "De acuerdo, espero su respuesta.",
    hora: "Lun",
    noLeidos: 0,
    online: false,
    messages: [
      { id: "m1", text: "Señor Ramírez, le informamos que su queja ha sido recibida y asignada al área de atención.", time: "10:00", mine: true, status: "read" },
      { id: "m2", text: "De acuerdo, espero su respuesta.", time: "10:30", mine: false },
    ],
  },
  {
    id: "c4",
    nombre: "Equipo PQRS",
    cargo: "Grupo interno",
    canal: "internal",
    ultimoMensaje: "Recuerden el cierre de radicados este viernes",
    hora: "Lun",
    noLeidos: 5,
    online: true,
    messages: [
      { id: "m1", text: "Buenos días equipo 👋", time: "08:00", mine: true, status: "read" },
      { id: "m2", text: "Hola! Todo listo para hoy?", time: "08:05", mine: false },
      { id: "m3", text: "Sí, ya revisé la cola. Tenemos 4 pendientes urgentes.", time: "08:07", mine: false },
      { id: "m4", text: "Recuerden el cierre de radicados este viernes", time: "09:00", mine: false },
    ],
  },
  {
    id: "c5",
    nombre: "Ana Sofía Rodríguez",
    cargo: "Supervisora",
    canal: "internal",
    ultimoMensaje: "Perfecto, lo reviso y te aviso.",
    hora: "Dom",
    noLeidos: 0,
    online: false,
    messages: [
      { id: "m1", text: "Ana, ¿puedes revisar el informe de PQR del mes?", time: "17:00", mine: true, status: "read" },
      { id: "m2", text: "Perfecto, lo reviso y te aviso.", time: "17:10", mine: false },
    ],
  },
  {
    id: "c6",
    nombre: "Lucia Fernández",
    cargo: "Peticionaria — PQR-2026-000009",
    canal: "whatsapp",
    ultimoMensaje: "Gracias, quedo atenta.",
    hora: "Dom",
    noLeidos: 0,
    online: false,
    messages: [
      { id: "m1", text: "Señora Fernández, le confirmamos que su reclamo fue escalado al área de Tesorería.", time: "11:00", mine: true, status: "read" },
      { id: "m2", text: "Gracias, quedo atenta.", time: "11:20", mine: false },
    ],
  },
]

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const avatarPalette = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2", "#be185d"]
function avatarColor(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % avatarPalette.length
  return avatarPalette[h]
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("")
}

const canalLabel: Record<string, { label: string; color: string; bg: string }> = {
  whatsapp: { label: "WhatsApp", color: "#059669", bg: "#d1fae5" },
  sms:      { label: "SMS",      color: "#d97706", bg: "#fef3c7" },
  email:    { label: "Email",    color: "#0EA5E9", bg: "#e0f2fe" },
  internal: { label: "Interno",  color: "#6d28d9", bg: "#ede9fe" },
}

function StatusIcon({ status }: { status?: MsgStatus }) {
  if (!status) return null
  if (status === "sent")      return <svg viewBox="0 0 16 11" fill="none" className="w-3.5 h-2.5 inline-block ml-1 opacity-60"><path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (status === "delivered") return <svg viewBox="0 0 20 11" fill="none" className="w-4 h-2.5 inline-block ml-1 opacity-60"><path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9.5L16 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return <svg viewBox="0 0 20 11" fill="none" className="w-4 h-2.5 inline-block ml-1" style={{ color: "#38bdf8" }}><path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9.5L16 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.33 }}>
      {initials(name)}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Chat list item
───────────────────────────────────────────── */
function ChatItem({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) {
  const cl = canalLabel[chat.canal]
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-100 cursor-pointer border-l-2"
      style={{
        background: active ? "#eff3ff" : "transparent",
        borderLeftColor: active ? "#1E3A8A" : "transparent",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8fafc" }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
    >
      {/* Avatar + online dot */}
      <div className="relative shrink-0">
        <Avatar name={chat.nombre} size={42} />
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#22c55e" }} />
        )}
      </div>

      {/* Content */}
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
            <span className="text-[9px] font-bold rounded px-1.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>{cl.label}</span>
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
   Message bubble
───────────────────────────────────────────── */
function Bubble({ msg, chatCanal }: { msg: Message; chatCanal: string }) {
  const [hov, setHov] = useState(false)

  const isMine = msg.mine
  const bgMine = chatCanal === "internal" ? "#1E3A8A" : "#0EA5E9"

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Quick action on hover */}
      {hov && (
        <button
          className="self-end mb-2 mx-2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          style={{ order: isMine ? -1 : 1 }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
        </button>
      )}

      <div className="max-w-[72%]">
        {/* Attachment */}
        {msg.attachment && (
          <div className="mb-1 rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="#1E3A8A" className="w-4 h-4"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{msg.attachment.name}</p>
              <p className="text-[10px] text-slate-400">{msg.attachment.size}</p>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className="rounded-2xl px-3.5 py-2.5 shadow-sm"
          style={{
            background: isMine ? bgMine : "#fff",
            color: isMine ? "#fff" : "#1e293b",
            borderBottomRightRadius: isMine ? 4 : undefined,
            borderBottomLeftRadius: !isMine ? 4 : undefined,
            border: isMine ? "none" : "1px solid #e2e8f0",
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
          <div className={`flex items-center justify-end gap-0.5 mt-1 text-[10px] ${isMine ? "text-white/70" : "text-slate-400"}`}>
            <span>{msg.time}</span>
            {isMine && <StatusIcon status={msg.status} />}
          </div>
        </div>

        {/* Reactions */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {msg.reactions.map((r, i) => (
              <span key={i} className="text-sm bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm">{r}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Date separator
───────────────────────────────────────────── */
function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] font-semibold text-slate-400 bg-[#F8FAFC] px-2">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function EnviosIndividuales() {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState<string>("c1")
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [filterCanal, setFilterCanal] = useState<string>("todos")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? chats[0]

  const filteredChats = chats.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.ultimoMensaje.toLowerCase().includes(search.toLowerCase())
    const matchCanal = filterCanal === "todos" || c.canal === filterCanal
    return matchSearch && matchCanal
  })

  const pinnedChats = filteredChats.filter(c => c.pinned)
  const otherChats  = filteredChats.filter(c => !c.pinned)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChatId, activeChat?.messages.length])

  const sendMessage = () => {
    if (!draft.trim()) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: draft.trim(),
      time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
      status: "sent",
    }
    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, messages: [...c.messages, newMsg], ultimoMensaje: newMsg.text, hora: newMsg.time, noLeidos: 0 }
        : c
    ))
    setDraft("")
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const openChat = (id: string) => {
    setActiveChatId(id)
    setChats(prev => prev.map(c => c.id === id ? { ...c, noLeidos: 0 } : c))
    setShowInfo(false)
  }

  const quickEmojis = ["👍", "❤️", "😊", "🙏", "✅", "🔔"]
  const cl = canalLabel[activeChat.canal]

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#F8FAFC" }}>

      {/* ── LEFT PANEL: Chat list ── */}
      <div className="flex flex-col border-r border-slate-200 bg-white shrink-0" style={{ width: 320 }}>

        {/* Panel header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Mensajes</h2>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer" title="Nuevo chat">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer" title="Más opciones">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversación…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
            />
          </div>

          {/* Canal filter pills */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {[["todos","Todos"],["whatsapp","WhatsApp"],["sms","SMS"],["internal","Interno"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterCanal(val)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer"
                style={{
                  background: filterCanal === val ? "#1E3A8A" : "#f8fafc",
                  color:      filterCanal === val ? "#fff"    : "#64748b",
                  borderColor:filterCanal === val ? "#1E3A8A" : "#e2e8f0",
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {pinnedChats.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Fijados</p>
              {pinnedChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onClick={() => openChat(c.id)} />)}
            </>
          )}
          {otherChats.length > 0 && (
            <>
              {pinnedChats.length > 0 && <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Todos los chats</p>}
              {otherChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onClick={() => openChat(c.id)} />)}
            </>
          )}
          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p className="text-sm font-medium text-slate-400">Sin resultados</p>
            </div>
          )}
        </div>

        {/* New chat CTA */}
        <div className="px-4 py-3 border-t border-slate-100">
          <button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Nueva conversación
          </button>
        </div>
      </div>

      {/* ── CENTER: Chat window ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Chat top bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 shadow-sm">
          <div className="relative">
            <Avatar name={activeChat.nombre} size={38} />
            {activeChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{activeChat.nombre}</h3>
              <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>{cl.label}</span>
              {activeChat.tag && (
                <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100">{activeChat.tag}</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {activeChat.typing ? <span className="italic text-[#0EA5E9] animate-pulse">escribiendo…</span>
                : activeChat.online ? "En línea" : activeChat.cargo}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {[
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>, title: "Llamar" },
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>, title: "Video" },
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>, title: "Buscar" },
            ].map(btn => (
              <button key={btn.title} title={btn.title}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer">
                {btn.icon}
              </button>
            ))}
            <button onClick={() => setShowInfo(v => !v)} title="Info del contacto"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer"
              style={{ background: showInfo ? "#eff3ff" : "transparent", color: showInfo ? "#1E3A8A" : "#94a3b8" }}
              onMouseEnter={e => { if (!showInfo) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1E3A8A" }}}
              onMouseLeave={e => { if (!showInfo) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8" }}}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4"
          style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #F8FAFC 100%)" }}>
          <DateSep label="Hoy" />
          {activeChat.messages.map((msg, i) => {
            const showDate = i === 0
            return (
              <div key={msg.id}>
                {showDate && i > 0 && <DateSep label="Anterior" />}
                <Bubble msg={msg} chatCanal={activeChat.canal} />
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          {/* Quick emoji bar */}
          {emojiOpen && (
            <div className="flex gap-2 mb-3 px-1">
              {quickEmojis.map(e => (
                <button key={e} onClick={() => { setDraft(d => d + e); setEmojiOpen(false) }}
                  className="text-xl hover:scale-125 transition-transform cursor-pointer">
                  {e}
                </button>
              ))}
              <button onClick={() => setEmojiOpen(false)}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600 cursor-pointer px-1">✕</button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Emoji */}
            <button onClick={() => setEmojiOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0"
              style={{ background: emojiOpen ? "#eff3ff" : undefined, color: emojiOpen ? "#1E3A8A" : undefined }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/></svg>
            </button>

            {/* Attachment */}
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"/></svg>
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribe un mensaje…"
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

            {/* Send */}
            <button onClick={sendMessage}
              disabled={!draft.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-40"
              style={{ background: draft.trim() ? "#1E3A8A" : "#e2e8f0" }}
              onMouseEnter={e => { if (draft.trim()) e.currentTarget.style.background = "#162d6e" }}
              onMouseLeave={e => { if (draft.trim()) e.currentTarget.style.background = "#1E3A8A" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: draft.trim() ? "#fff" : "#94a3b8" }}>
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </button>
          </div>

          <p className="text-[10px] text-slate-300 text-center mt-2">
            Presiona <kbd className="font-mono bg-slate-100 rounded px-1">Enter</kbd> para enviar · <kbd className="font-mono bg-slate-100 rounded px-1">Shift+Enter</kbd> para nueva línea
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Contact info ── */}
      {showInfo && (
        <div className="flex flex-col bg-white border-l border-slate-200 shrink-0 overflow-y-auto" style={{ width: 280 }}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Información</h4>
              <button onClick={() => setShowInfo(false)} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-all">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 pb-2">
              <Avatar name={activeChat.nombre} size={60} />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{activeChat.nombre}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeChat.cargo}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5" style={{ background: cl.bg, color: cl.color }}>{cl.label}</span>
                  {activeChat.online
                    ? <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5">En línea</span>
                    : <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">Desconectado</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-slate-100">
            {[
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>, label: "Llamar" },
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>, label: "PQRS" },
              { icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/></svg>, label: "Gestionar" },
            ].map(a => (
              <button key={a.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-[#eff3ff] hover:text-[#1E3A8A] text-slate-500 transition-all cursor-pointer">
                {a.icon}
                <span className="text-[9px] font-semibold">{a.label}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Estadísticas</p>
            {[
              { label: "Mensajes enviados", value: String(activeChat.messages.filter(m => m.mine).length) },
              { label: "Mensajes recibidos", value: String(activeChat.messages.filter(m => !m.mine).length) },
              { label: "Canal", value: cl.label },
              { label: "Estado", value: activeChat.online ? "En línea" : "Offline" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{s.label}</span>
                <span className="text-[11px] font-semibold text-slate-700">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="px-5 py-4 mt-auto border-t border-slate-100 space-y-1.5">
            <button className="w-full text-left text-[11px] font-medium text-slate-500 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 2a.5.5 0 01.5.5V12a.5.5 0 01-1 0V2.5A.5.5 0 018 2z"/><path d="M.146 8.146a.5.5 0 000 .708l2 2a.5.5 0 10.708-.708L1.707 9H5.5a.5.5 0 000-1H1.707l1.147-1.146a.5.5 0 10-.708-.708l-2 2z"/></svg>
              Exportar conversación
            </button>
            <button className="w-full text-left text-[11px] font-medium text-red-400 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              Archivar conversación
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
