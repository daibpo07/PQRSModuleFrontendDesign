import { useState } from "react"

/* ─────────────────────────────────────────────
   Envíos Individuales — tipos, átomos y datos
   compartidos entre las cuatro subvistas.
───────────────────────────────────────────── */

/* ── Tipos ── */
export type MsgStatus = "sent" | "delivered" | "read"
export type CanalChat = "whatsapp" | "sms" | "email" | "internal"

export interface Message {
  id: string
  text: string
  time: string
  mine: boolean
  /** Evento del sistema: se dibuja centrado, no como burbuja. */
  sistema?: boolean
  status?: MsgStatus
  attachment?: { name: string; size: string; type: "file" | "image" }
  reactions?: string[]
}

export interface Chat {
  id: string
  nombre: string
  cargo?: string
  documento?: string
  radicado?: string
  canal: CanalChat
  inicio?: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
  typing?: boolean
  pinned?: boolean
  messages: Message[]
  tag?: string
}

export interface Contacto {
  id: string
  nombre: string
  documento: string
  telefono?: string
  email?: string
  ciudad: string
  canalPreferido: CanalChat
  canales: CanalChat[]
  radicados: string[]
  conversaciones: number
  ultimaInteraccion: string
  estado: "Activo" | "Sin actividad" | "Opt-out"
  optIn: boolean
  etiquetas: string[]
  nota?: string
}

export interface CategoriaTipificacion {
  id: string
  nombre: string
  color: string
  bg: string
  subcategorias: { nombre: string; motivos: string[] }[]
}

export interface Tipificacion {
  categoria: string
  subcategoria: string
  motivo: string
}

export type ResultadoCierre = "Resuelto" | "Escalado" | "Sin respuesta" | "Reabierto"

export interface DiaConversacion {
  fecha: string
  mensajes: Message[]
}

export interface ConversacionCerrada {
  id: string
  contacto: string
  documento: string
  canal: CanalChat
  radicado?: string
  agente: string
  inicio: string
  cierre: string
  duracion: string
  mensajesTotal: number
  tipificacion: Tipificacion
  resultado: ResultadoCierre
  motivoCierre: "Cerrada por el asesor" | "Archivada" | "Cierre automático por inactividad"
  satisfaccion?: number
  notaCierre: string
  etiquetas: string[]
  transcripcion: DiaConversacion[]
}

/* ── Plantillas de mensajería (Meta + SMS) ── */
export type CanalPlantilla = "whatsapp" | "instagram" | "sms"
export type CategoriaMeta = "Utilidad" | "Servicio" | "Autenticación" | "Marketing"
export type AprobacionMeta = "Aprobada" | "En revisión" | "Rechazada" | "No requiere"
export type CalidadMeta = "Alta" | "Media" | "Baja"

export interface BotonPlantilla {
  tipo: "respuesta" | "enlace" | "telefono"
  texto: string
  url?: string
}

export interface PlantillaIndividual {
  id: string
  nombre: string
  atajo: string
  canal: CanalPlantilla
  categoria: CategoriaMeta
  aprobacion: AprobacionMeta
  idioma: string
  encabezado?: string
  cuerpo: string
  pie?: string
  botones?: BotonPlantilla[]
  variables: string[]
  usos: number
  tasaLectura: number
  calidad?: CalidadMeta
  autor: string
  actualizado: string
}

/** Reglas reales de cada canal: qué bloques admite y si pasa por revisión de Meta. */
export const canalPlantillaMeta: Record<
  CanalPlantilla,
  {
    label: string
    corto: string
    color: string
    bg: string
    border: string
    limite: number
    esMeta: boolean
    encabezado: boolean
    pie: boolean
    botones: number
    requiereAprobacion: boolean
    nota: string
  }
> = {
  whatsapp: {
    label: "WhatsApp Business",
    corto: "WhatsApp",
    color: "#059669",
    bg: "#d1fae5",
    border: "#a7f3d0",
    limite: 1024,
    esMeta: true,
    encabezado: true,
    pie: true,
    botones: 3,
    requiereAprobacion: true,
    nota:
      "Para escribir fuera de la ventana de 24 horas se necesita una plantilla aprobada por Meta. Dentro de la ventana puedes responder con texto libre.",
  },
  instagram: {
    label: "Instagram Direct",
    corto: "Instagram",
    color: "#d62976",
    bg: "#fce7f3",
    border: "#fbcfe8",
    limite: 1000,
    esMeta: true,
    encabezado: false,
    pie: false,
    botones: 3,
    requiereAprobacion: false,
    nota:
      "Instagram no usa plantillas preaprobadas: solo se puede responder dentro de la ventana de 24 horas desde el último mensaje del usuario. Los botones se envían como respuestas rápidas.",
  },
  sms: {
    label: "SMS",
    corto: "SMS",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
    limite: 160,
    esMeta: false,
    encabezado: false,
    pie: false,
    botones: 0,
    requiereAprobacion: false,
    nota:
      "Canal externo a Meta. Sin formato ni botones, y cada 160 caracteres se factura como un mensaje adicional.",
  },
}

export const categoriaMetaEstilo: Record<CategoriaMeta, { color: string; bg: string; desc: string }> = {
  Utilidad:       { color: "#1E3A8A", bg: "#eff3ff", desc: "Confirmaciones, avisos y actualizaciones de un trámite en curso." },
  Servicio:       { color: "#059669", bg: "#d1fae5", desc: "Respuestas dentro de una conversación abierta por el ciudadano." },
  Autenticación:  { color: "#0891b2", bg: "#cffafe", desc: "Códigos de verificación de un solo uso." },
  Marketing:      { color: "#6d28d9", bg: "#ede9fe", desc: "Invitaciones, novedades y difusión. Requiere opt-in explícito." },
}

export const aprobacionMetaEstilo: Record<AprobacionMeta, { bg: string; text: string }> = {
  Aprobada:       { bg: "#d1fae5", text: "#065f46" },
  "En revisión":  { bg: "#fef3c7", text: "#92400e" },
  Rechazada:      { bg: "#fee2e2", text: "#991b1b" },
  "No requiere":  { bg: "#f1f5f9", text: "#475569" },
}

export const calidadMetaEstilo: Record<CalidadMeta, { color: string; bg: string }> = {
  Alta:  { color: "#059669", bg: "#d1fae5" },
  Media: { color: "#d97706", bg: "#fef3c7" },
  Baja:  { color: "#dc2626", bg: "#fee2e2" },
}

/** Variables que el sistema rellena con el contexto de la conversación abierta. */
export const variablesPlantilla: Record<string, string> = {
  nombre: "Carlos Morales",
  radicado: "PQR-2026-000012",
  estado: "En gestión",
  dependencia: "Planeación Municipal",
  fecha: "22 de agosto de 2026",
  agente: "Ana Martínez",
  codigo: "482913",
  documento: "la copia de tu cédula",
}

/* ── Catálogos de estilo ── */
export const canalLabel: Record<CanalChat, { label: string; color: string; bg: string }> = {
  whatsapp: { label: "WhatsApp", color: "#059669", bg: "#d1fae5" },
  sms:      { label: "SMS",      color: "#d97706", bg: "#fef3c7" },
  email:    { label: "Email",    color: "#0EA5E9", bg: "#e0f2fe" },
  internal: { label: "Interno",  color: "#6d28d9", bg: "#ede9fe" },
}

export const resultadoMeta: Record<ResultadoCierre, { bg: string; text: string; dot: string }> = {
  Resuelto:        { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Escalado:        { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "Sin respuesta": { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  Reabierto:       { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

/* ── Helpers ── */
export const avatarPalette = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2", "#be185d"]

export function avatarColor(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % avatarPalette.length
  return avatarPalette[h]
}

export function initials(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("")
}

export const nf = (n: number) => n.toLocaleString("es-CO")

/* ── Átomos de presentación ── */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.33 }}
    >
      {initials(name)}
    </div>
  )
}

export function StatusIcon({ status }: { status?: MsgStatus }) {
  if (!status) return null
  if (status === "sent")
    return (
      <svg viewBox="0 0 16 11" fill="none" className="w-3.5 h-2.5 inline-block ml-1 opacity-60">
        <path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (status === "delivered")
    return (
      <svg viewBox="0 0 20 11" fill="none" className="w-4 h-2.5 inline-block ml-1 opacity-60">
        <path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 9.5L16 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 11" fill="none" className="w-4 h-2.5 inline-block ml-1" style={{ color: "#38bdf8" }}>
      <path d="M1 5.5L5 9.5L14 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.5L16 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] font-semibold text-slate-400 bg-[#F8FAFC] px-2 rounded-full">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

/** Evento del sistema dentro del hilo. */
export function EventoSistema({ texto, hora }: { texto: string; hora: string }) {
  return (
    <div className="flex justify-center my-2">
      <span className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
        {texto} · <span className="font-mono text-slate-300">{hora}</span>
      </span>
    </div>
  )
}

export function Bubble({
  msg,
  chatCanal,
  conAcciones = true,
}: {
  msg: Message
  chatCanal: string
  conAcciones?: boolean
}) {
  const [hov, setHov] = useState(false)

  if (msg.sistema) return <EventoSistema texto={msg.text} hora={msg.time} />

  const isMine = msg.mine
  const bgMine = chatCanal === "internal" ? "#1E3A8A" : "#0EA5E9"

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {conAcciones && hov && (
        <button
          className="self-end mb-2 mx-2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          style={{ order: isMine ? -1 : 1 }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
      )}

      <div className="max-w-[72%]">
        {msg.attachment && (
          <div className="mb-1 rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="#1E3A8A" className="w-4 h-4">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{msg.attachment.name}</p>
              <p className="text-[10px] text-slate-400">{msg.attachment.size}</p>
            </div>
          </div>
        )}

        <div
          className="rounded-2xl px-3.5 py-2.5 shadow-sm"
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

        {msg.reactions && msg.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {msg.reactions.map((r, i) => (
              <span key={i} className="text-sm bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Catálogo de tipificaciones
───────────────────────────────────────────── */
export const catalogoTipificaciones: CategoriaTipificacion[] = [
  {
    id: "t1",
    nombre: "Consulta de estado",
    color: "#1E3A8A",
    bg: "#eff3ff",
    subcategorias: [
      { nombre: "Radicado en trámite", motivos: ["Consulta de avance", "Solicitud de fecha de respuesta", "Cambio de dependencia"] },
      { nombre: "Radicado cerrado", motivos: ["Solicitud de copia de respuesta", "Inconformidad con la respuesta"] },
    ],
  },
  {
    id: "t2",
    nombre: "Radicación",
    color: "#0EA5E9",
    bg: "#e0f2fe",
    subcategorias: [
      { nombre: "Nueva solicitud", motivos: ["Petición de información", "Solicitud de certificado", "Derecho de petición"] },
      { nombre: "Anexo de documentos", motivos: ["Envío de soportes", "Corrección de datos del radicado"] },
    ],
  },
  {
    id: "t3",
    nombre: "Reclamo",
    color: "#ea580c",
    bg: "#ffedd5",
    subcategorias: [
      { nombre: "Facturación", motivos: ["Cobro no reconocido", "Error en el valor facturado", "Doble cobro"] },
      { nombre: "Prestación del servicio", motivos: ["Suspensión no informada", "Servicio deficiente", "Daño en la infraestructura"] },
    ],
  },
  {
    id: "t4",
    nombre: "Queja",
    color: "#dc2626",
    bg: "#fee2e2",
    subcategorias: [
      { nombre: "Atención al ciudadano", motivos: ["Trato descortés", "Demora en la atención", "Información contradictoria"] },
      { nombre: "Trámites", motivos: ["Exigencia de requisitos no previstos", "Incumplimiento de términos"] },
    ],
  },
  {
    id: "t5",
    nombre: "Soporte del canal",
    color: "#6d28d9",
    bg: "#ede9fe",
    subcategorias: [
      { nombre: "Portal ciudadano", motivos: ["No puede iniciar sesión", "Error al cargar archivos", "No recibe el correo de confirmación"] },
      { nombre: "Mensajería", motivos: ["No recibe notificaciones", "Solicita cambio de canal", "Solicita baja de mensajes"] },
    ],
  },
]

/* ─────────────────────────────────────────────
   Conversaciones activas
───────────────────────────────────────────── */
export const initialChats: Chat[] = [
  {
    id: "c1",
    nombre: "Carlos Morales",
    cargo: "Peticionario — PQR-2026-000012",
    documento: "1020304050",
    radicado: "PQR-2026-000012",
    canal: "whatsapp",
    inicio: "2026-08-13 09:02",
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
    documento: "1017245512",
    radicado: "PQR-2026-000011",
    canal: "whatsapp",
    inicio: "2026-08-12 15:30",
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
    documento: "71234567",
    radicado: "PQR-2026-000010",
    canal: "sms",
    inicio: "2026-08-10 10:00",
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
    inicio: "2026-08-10 08:00",
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
    inicio: "2026-08-09 17:00",
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
    documento: "43112233",
    radicado: "PQR-2026-000009",
    canal: "whatsapp",
    inicio: "2026-08-09 11:00",
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
   Histórico de conversaciones cerradas
───────────────────────────────────────────── */
export const mockHistorial: ConversacionCerrada[] = [
  {
    id: "h1",
    contacto: "Juan García Pineda",
    documento: "1122334455",
    canal: "whatsapp",
    radicado: "PQR-2026-000008",
    agente: "Lic. Martínez, A.",
    inicio: "2026-08-10 08:14",
    cierre: "2026-08-11 10:05",
    duracion: "1 d 1 h 51 min",
    mensajesTotal: 14,
    tipificacion: { categoria: "Reclamo", subcategoria: "Facturación", motivo: "Cobro no reconocido" },
    resultado: "Resuelto",
    motivoCierre: "Cerrada por el asesor",
    satisfaccion: 5,
    notaCierre:
      "Se verificó con Tesorería que el cobro correspondía a un ajuste del periodo anterior mal aplicado. Se generó nota crédito y se informó al ciudadano. Confirma conformidad.",
    etiquetas: ["Nota crédito", "Primer contacto", "Tesorería"],
    transcripcion: [
      {
        fecha: "Lunes, 10 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación iniciada por el ciudadano desde WhatsApp", time: "08:14", mine: false, sistema: true },
          { id: "m1", text: "Buenos días. En mi factura de agosto aparece un cobro de $148.500 que no reconozco. Nunca solicité ese servicio.", time: "08:14", mine: false },
          { id: "s2", text: "Asignada a Lic. Martínez, A.", time: "08:17", mine: false, sistema: true },
          { id: "m2", text: "Buenos días Juan, lamento el inconveniente. Voy a revisar el detalle de tu factura ahora mismo. ¿Me confirmas tu número de documento?", time: "08:19", mine: true, status: "read" },
          { id: "m3", text: "Claro, es 1122334455", time: "08:21", mine: false },
          { id: "m4", text: "Gracias. Veo el cargo. Aparece registrado como “ajuste periodo anterior”. Voy a escalarlo con el área de Tesorería para que verifiquen el origen.", time: "08:26", mine: true, status: "read" },
          { id: "s3", text: "Radicado PQR-2026-000008 creado automáticamente desde la conversación", time: "08:27", mine: false, sistema: true },
          { id: "m5", text: "¿Me puedes enviar la foto de la factura donde aparece el cobro?", time: "08:28", mine: true, status: "read" },
          { id: "m6", text: "Ahí va", time: "08:33", mine: false, attachment: { name: "factura_agosto_2026.pdf", size: "412 KB", type: "file" } },
          { id: "m7", text: "Perfecto, recibido. Te confirmo mañana con la respuesta de Tesorería. Gracias por la paciencia.", time: "08:35", mine: true, status: "read" },
          { id: "m8", text: "Listo, quedo pendiente. Gracias.", time: "08:37", mine: false },
        ],
      },
      {
        fecha: "Martes, 11 de agosto de 2026",
        mensajes: [
          { id: "s4", text: "Tesorería respondió el escalamiento", time: "09:40", mine: false, sistema: true },
          { id: "m9", text: "Buenos días Juan. Tesorería confirmó que el cobro se aplicó por error: correspondía a otra cuenta. Ya generamos la nota crédito por los $148.500.", time: "09:44", mine: true, status: "read" },
          { id: "m10", text: "Qué alivio. ¿Y cuándo se ve reflejado?", time: "09:48", mine: false },
          { id: "m11", text: "Se refleja en tu próxima factura, la de septiembre. Te adjunto el soporte de la nota crédito.", time: "09:51", mine: true, status: "read", attachment: { name: "nota_credito_NC-4482.pdf", size: "188 KB", type: "file" } },
          { id: "m12", text: "Muchas gracias por la gestión, muy amable 🙏", time: "09:58", mine: false, reactions: ["👍"] },
          { id: "m13", text: "Con mucho gusto. Cerramos entonces tu radicado. Que tengas buen día.", time: "10:02", mine: true, status: "read" },
          { id: "s5", text: "Conversación cerrada por Lic. Martínez, A. · Encuesta de satisfacción enviada", time: "10:05", mine: false, sistema: true },
        ],
      },
    ],
  },
  {
    id: "h2",
    contacto: "Sandra Osorio Vélez",
    documento: "39887766",
    canal: "whatsapp",
    radicado: "PQR-2026-000007",
    agente: "Dir. Castro, L.",
    inicio: "2026-08-09 14:02",
    cierre: "2026-08-09 14:41",
    duracion: "39 min",
    mensajesTotal: 8,
    tipificacion: { categoria: "Radicación", subcategoria: "Nueva solicitud", motivo: "Solicitud de certificado" },
    resultado: "Resuelto",
    motivoCierre: "Cerrada por el asesor",
    satisfaccion: 4,
    notaCierre:
      "Ciudadana solicita certificado de residencia. Se radicó la petición y se explicaron los tiempos de ley. No requiere seguimiento adicional.",
    etiquetas: ["Certificado", "Primer contacto"],
    transcripcion: [
      {
        fecha: "Domingo, 9 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación iniciada por la ciudadana desde WhatsApp", time: "14:02", mine: false, sistema: true },
          { id: "m1", text: "Buenas tardes, necesito un certificado de residencia para un trámite notarial. ¿Cómo lo solicito?", time: "14:02", mine: false },
          { id: "m2", text: "Buenas tardes Sandra. Con gusto lo radico por este mismo canal. ¿Me confirmas nombre completo y documento?", time: "14:06", mine: true, status: "read" },
          { id: "m3", text: "Sandra Osorio Vélez, cédula 39887766", time: "14:09", mine: false },
          { id: "m4", text: "Gracias. Ya quedó radicado bajo el número PQR-2026-000007. El término legal de respuesta es de 15 días hábiles.", time: "14:18", mine: true, status: "read" },
          { id: "s2", text: "Radicado PQR-2026-000007 creado desde la conversación", time: "14:18", mine: false, sistema: true },
          { id: "m5", text: "¿Y me llega por correo o lo tengo que recoger?", time: "14:24", mine: false },
          { id: "m6", text: "Te llega al correo registrado en formato PDF con firma digital, tiene plena validez. Si necesitas copia física, puedes reclamarla en la ventanilla 3.", time: "14:31", mine: true, status: "read" },
          { id: "m7", text: "Listo, muchas gracias.", time: "14:38", mine: false },
          { id: "s3", text: "Conversación cerrada por Dir. Castro, L.", time: "14:41", mine: false, sistema: true },
        ],
      },
    ],
  },
  {
    id: "h3",
    contacto: "Roberto Silva Cano",
    documento: "98765432",
    canal: "email",
    radicado: "PQR-2026-000006",
    agente: "Téc. Vargas, C.",
    inicio: "2026-08-06 11:20",
    cierre: "2026-08-08 16:30",
    duracion: "2 d 5 h 10 min",
    mensajesTotal: 9,
    tipificacion: { categoria: "Queja", subcategoria: "Trámites", motivo: "Incumplimiento de términos" },
    resultado: "Escalado",
    motivoCierre: "Cerrada por el asesor",
    satisfaccion: 2,
    notaCierre:
      "El ciudadano reclama demora en la licencia de construcción más allá del término legal. Se escaló a la Secretaría de Planeación con alerta de vencimiento. Conversación cerrada; el seguimiento continúa por el radicado.",
    etiquetas: ["Vencimiento", "Escalado", "Planeación"],
    transcripcion: [
      {
        fecha: "Jueves, 6 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación creada desde el buzón pqrs@pqrslab.com", time: "11:20", mine: false, sistema: true },
          { id: "m1", text: "Radiqué la solicitud de licencia de construcción hace 42 días hábiles y no he recibido respuesta. El término legal ya venció.", time: "11:20", mine: false },
          { id: "m2", text: "Señor Silva, tiene razón y lamentamos la demora. Estoy verificando el estado del expediente con Planeación Municipal.", time: "11:52", mine: true, status: "read" },
          { id: "m3", text: "Agradezco una respuesta concreta, ya he llamado tres veces.", time: "12:10", mine: false },
        ],
      },
      {
        fecha: "Viernes, 7 de agosto de 2026",
        mensajes: [
          { id: "m4", text: "Buenos días. Planeación informa que el expediente está en revisión estructural y les faltaba un concepto de bomberos.", time: "09:15", mine: true, status: "read" },
          { id: "m5", text: "Ese concepto lo entregué el 2 de julio. Tengo el radicado de entrega.", time: "09:41", mine: false, attachment: { name: "radicado_bomberos_3391.jpg", size: "1,2 MB", type: "image" } },
          { id: "m6", text: "Gracias por el soporte, lo remito de inmediato. Voy a escalar el caso con alerta de vencimiento para que se priorice.", time: "10:02", mine: true, status: "read" },
          { id: "s2", text: "Caso escalado a Secretaría de Planeación · Prioridad Alta", time: "10:04", mine: false, sistema: true },
        ],
      },
      {
        fecha: "Sábado, 8 de agosto de 2026",
        mensajes: [
          { id: "m7", text: "Señor Silva, Planeación asignó el caso a un revisor con fecha límite del 14 de agosto. Le llegará la notificación al correo.", time: "16:12", mine: true, status: "read" },
          { id: "m8", text: "Espero que esta vez sí se cumpla.", time: "16:25", mine: false },
          { id: "s3", text: "Conversación cerrada por Téc. Vargas, C. · Seguimiento continúa en el radicado PQR-2026-000006", time: "16:30", mine: false, sistema: true },
        ],
      },
    ],
  },
  {
    id: "h4",
    contacto: "Paula Restrepo Uribe",
    documento: "1098776655",
    canal: "whatsapp",
    agente: "Coord. Ruiz, M.",
    inicio: "2026-08-05 10:30",
    cierre: "2026-08-07 10:30",
    duracion: "2 d",
    mensajesTotal: 4,
    tipificacion: { categoria: "Soporte del canal", subcategoria: "Portal ciudadano", motivo: "No puede iniciar sesión" },
    resultado: "Sin respuesta",
    motivoCierre: "Cierre automático por inactividad",
    notaCierre:
      "Se enviaron las instrucciones de recuperación de contraseña. La ciudadana no volvió a responder en 48 horas, la conversación se cerró de forma automática.",
    etiquetas: ["Inactividad", "Portal"],
    transcripcion: [
      {
        fecha: "Miércoles, 5 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación iniciada por la ciudadana desde WhatsApp", time: "10:30", mine: false, sistema: true },
          { id: "m1", text: "Hola, no puedo entrar al portal para ver mi PQRS. Dice que la contraseña es incorrecta.", time: "10:30", mine: false },
          { id: "m2", text: "Hola Paula. Te envío el enlace de recuperación; revisa también la carpeta de spam. Si en 10 minutos no llega, avísame y lo reenvío.", time: "10:44", mine: true, status: "delivered" },
          { id: "m3", text: "Quedo atenta a tu confirmación para cerrar el caso 🙂", time: "15:10", mine: true, status: "delivered" },
        ],
      },
      {
        fecha: "Viernes, 7 de agosto de 2026",
        mensajes: [
          { id: "s2", text: "Sin respuesta del ciudadano durante 48 horas", time: "10:30", mine: false, sistema: true },
          { id: "s3", text: "Conversación cerrada automáticamente por inactividad", time: "10:30", mine: false, sistema: true },
        ],
      },
    ],
  },
  {
    id: "h5",
    contacto: "Diego Zapata Muñoz",
    documento: "15667788",
    canal: "sms",
    radicado: "PQR-2026-000005",
    agente: "Lic. Martínez, A.",
    inicio: "2026-08-04 09:00",
    cierre: "2026-08-04 09:52",
    duracion: "52 min",
    mensajesTotal: 6,
    tipificacion: { categoria: "Consulta de estado", subcategoria: "Radicado en trámite", motivo: "Consulta de avance" },
    resultado: "Resuelto",
    motivoCierre: "Cerrada por el asesor",
    satisfaccion: 5,
    notaCierre: "Consulta de avance resuelta en el primer contacto. Se informó fecha estimada de respuesta.",
    etiquetas: ["Primer contacto"],
    transcripcion: [
      {
        fecha: "Martes, 4 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación iniciada por SMS entrante", time: "09:00", mine: false, sistema: true },
          { id: "m1", text: "Buenos dias quiero saber como va mi pqr numero 5", time: "09:00", mine: false },
          { id: "m2", text: "Buenos días señor Zapata. Su radicado PQR-2026-000005 está en gestión en Planeación Municipal.", time: "09:11", mine: true, status: "read" },
          { id: "m3", text: "Y cuanto se demora", time: "09:26", mine: false },
          { id: "m4", text: "El término legal vence el 22 de agosto. Le llegará la respuesta a este mismo número y a su correo.", time: "09:33", mine: true, status: "read" },
          { id: "m5", text: "Gracias", time: "09:48", mine: false },
          { id: "s2", text: "Conversación cerrada por Lic. Martínez, A.", time: "09:52", mine: false, sistema: true },
        ],
      },
    ],
  },
  {
    id: "h6",
    contacto: "Andrés Betancur Flórez",
    documento: "1035700881",
    canal: "whatsapp",
    radicado: "PQR-2026-000004",
    agente: "Dir. Castro, L.",
    inicio: "2026-08-01 16:40",
    cierre: "2026-08-03 09:15",
    duracion: "1 d 16 h 35 min",
    mensajesTotal: 7,
    tipificacion: { categoria: "Queja", subcategoria: "Atención al ciudadano", motivo: "Demora en la atención" },
    resultado: "Reabierto",
    motivoCierre: "Archivada",
    satisfaccion: 3,
    notaCierre:
      "Se presentaron disculpas y se explicó el plan de mejora de la sucursal norte. El ciudadano reabrió la conversación una semana después por un tema relacionado.",
    etiquetas: ["Sucursal norte", "Reabierto"],
    transcripcion: [
      {
        fecha: "Sábado, 1 de agosto de 2026",
        mensajes: [
          { id: "s1", text: "Conversación iniciada por el ciudadano desde WhatsApp", time: "16:40", mine: false, sistema: true },
          { id: "m1", text: "Estuve dos horas en la sucursal norte y nadie me atendió. Muy mal servicio.", time: "16:40", mine: false },
          { id: "m2", text: "Señor Betancur, lamento mucho lo ocurrido. Voy a registrar su queja formalmente para que quede trazabilidad.", time: "17:02", mine: true, status: "read" },
          { id: "s2", text: "Radicado PQR-2026-000004 creado desde la conversación", time: "17:05", mine: false, sistema: true },
        ],
      },
      {
        fecha: "Lunes, 3 de agosto de 2026",
        mensajes: [
          { id: "m3", text: "Buenos días. La coordinación de la sucursal revisó el caso: ese día hubo una falla en el sistema de turnos.", time: "08:50", mine: true, status: "read" },
          { id: "m4", text: "Se implementó un plan de contingencia y se reforzó el personal en horas pico. Le ofrecemos disculpas.", time: "08:52", mine: true, status: "read" },
          { id: "m5", text: "Bueno, espero que mejore.", time: "09:05", mine: false },
          { id: "s3", text: "Conversación archivada por Dir. Castro, L.", time: "09:15", mine: false, sistema: true },
        ],
      },
    ],
  },
]

/* ─────────────────────────────────────────────
   Contactos
───────────────────────────────────────────── */
export const mockContactos: Contacto[] = [
  {
    id: "k1",
    nombre: "Carlos Morales",
    documento: "1020304050",
    telefono: "+57 300 123 4567",
    email: "carlos.morales@gmail.com",
    ciudad: "Medellín",
    canalPreferido: "whatsapp",
    canales: ["whatsapp", "email"],
    radicados: ["PQR-2026-000012"],
    conversaciones: 4,
    ultimaInteraccion: "Hoy, 09:41",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Frecuente", "Portal Web"],
    nota: "Prefiere que le respondan por WhatsApp en horario de la mañana.",
  },
  {
    id: "k2",
    nombre: "María López",
    documento: "1017245512",
    telefono: "+57 310 987 6543",
    email: "maria.lopez@hotmail.com",
    ciudad: "Envigado",
    canalPreferido: "whatsapp",
    canales: ["whatsapp", "email"],
    radicados: ["PQR-2026-000011"],
    conversaciones: 2,
    ultimaInteraccion: "Ayer, 16:02",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Certificados"],
  },
  {
    id: "k3",
    nombre: "Pedro Ramírez",
    documento: "71234567",
    telefono: "+57 314 555 8899",
    ciudad: "Itagüí",
    canalPreferido: "sms",
    canales: ["sms"],
    radicados: ["PQR-2026-000010"],
    conversaciones: 1,
    ultimaInteraccion: "Lun, 10:30",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Sin correo"],
    nota: "No tiene correo registrado; toda la comunicación va por SMS.",
  },
  {
    id: "k4",
    nombre: "Juan García Pineda",
    documento: "1122334455",
    telefono: "+57 302 111 2233",
    email: "juan.garcia@gmail.com",
    ciudad: "Medellín",
    canalPreferido: "whatsapp",
    canales: ["whatsapp", "email"],
    radicados: ["PQR-2026-000008"],
    conversaciones: 3,
    ultimaInteraccion: "11 Ago, 10:05",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Tesorería", "Satisfecho"],
  },
  {
    id: "k5",
    nombre: "Lucia Fernández",
    documento: "43112233",
    telefono: "+57 311 222 3344",
    email: "lucia.fernandez@outlook.com",
    ciudad: "Bello",
    canalPreferido: "whatsapp",
    canales: ["whatsapp", "email"],
    radicados: ["PQR-2026-000009"],
    conversaciones: 2,
    ultimaInteraccion: "Dom, 11:20",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Tesorería"],
  },
  {
    id: "k6",
    nombre: "Roberto Silva Cano",
    documento: "98765432",
    telefono: "+57 300 999 8877",
    email: "roberto.silva@gmail.com",
    ciudad: "Sabaneta",
    canalPreferido: "email",
    canales: ["email"],
    radicados: ["PQR-2026-000006"],
    conversaciones: 5,
    ultimaInteraccion: "8 Ago, 16:30",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Escalado", "Planeación"],
    nota: "Caso con alerta de vencimiento. Solicita respuestas por escrito.",
  },
  {
    id: "k7",
    nombre: "Paula Restrepo Uribe",
    documento: "1098776655",
    telefono: "+57 318 444 5566",
    email: "paula.restrepo@gmail.com",
    ciudad: "Rionegro",
    canalPreferido: "whatsapp",
    canales: ["whatsapp", "email"],
    radicados: [],
    conversaciones: 1,
    ultimaInteraccion: "7 Ago, 10:30",
    estado: "Sin actividad",
    optIn: true,
    etiquetas: ["Portal"],
  },
  {
    id: "k8",
    nombre: "Sandra Osorio Vélez",
    documento: "39887766",
    telefono: "+57 315 666 7788",
    ciudad: "Caldas",
    canalPreferido: "whatsapp",
    canales: ["whatsapp"],
    radicados: ["PQR-2026-000007"],
    conversaciones: 1,
    ultimaInteraccion: "9 Ago, 14:41",
    estado: "Activo",
    optIn: true,
    etiquetas: ["Certificados"],
  },
  {
    id: "k9",
    nombre: "Diego Zapata Muñoz",
    documento: "15667788",
    telefono: "+57 316 333 2211",
    email: "diego.zapata@yahoo.com",
    ciudad: "La Estrella",
    canalPreferido: "sms",
    canales: ["sms", "email"],
    radicados: ["PQR-2026-000005"],
    conversaciones: 2,
    ultimaInteraccion: "4 Ago, 09:52",
    estado: "Activo",
    optIn: true,
    etiquetas: [],
  },
  {
    id: "k10",
    nombre: "Andrés Betancur Flórez",
    documento: "1035700881",
    telefono: "+57 300 777 8899",
    email: "andres.betancur@gmail.com",
    ciudad: "Medellín",
    canalPreferido: "whatsapp",
    canales: ["whatsapp"],
    radicados: ["PQR-2026-000004"],
    conversaciones: 3,
    ultimaInteraccion: "3 Ago, 09:15",
    estado: "Opt-out",
    optIn: false,
    etiquetas: ["Baja voluntaria"],
    nota: "Solicitó no recibir más mensajes masivos. Solo se le puede escribir en respuesta a un radicado propio.",
  },
]

/* ─────────────────────────────────────────────
   Plantillas de mensajería individual
───────────────────────────────────────────── */
export const mockPlantillas: PlantillaIndividual[] = [
  {
    id: "p1",
    nombre: "Confirmación de radicado",
    atajo: "/radicado",
    canal: "whatsapp",
    categoria: "Utilidad",
    aprobacion: "Aprobada",
    idioma: "Español (CO)",
    encabezado: "Recibimos tu solicitud",
    cuerpo:
      "Hola {{nombre}} 👋\n\nTu solicitud quedó radicada bajo el número {{radicado}} y fue asignada a {{dependencia}}.\n\nEl término legal de respuesta vence el {{fecha}}. Te avisaremos por este mismo canal apenas tengamos novedades.",
    pie: "Pqrslab · Atención al ciudadano",
    botones: [
      { tipo: "enlace", texto: "Ver mi radicado", url: "https://pqrslab.com/radicado" },
      { tipo: "respuesta", texto: "Hablar con un asesor" },
    ],
    variables: ["nombre", "radicado", "dependencia", "fecha"],
    usos: 4820,
    tasaLectura: 89.2,
    calidad: "Alta",
    autor: "Lic. Martínez, A.",
    actualizado: "2026-08-05",
  },
  {
    id: "p2",
    nombre: "Recordatorio de vencimiento",
    atajo: "/vence",
    canal: "whatsapp",
    categoria: "Utilidad",
    aprobacion: "Aprobada",
    idioma: "Español (CO)",
    encabezado: "Tu radicado está por vencer",
    cuerpo:
      "Hola {{nombre}}, tu radicado {{radicado}} vence el {{fecha}}. Nuestro equipo ya está trabajando en tu caso y te contactará antes de esa fecha.",
    pie: "Pqrslab · Atención al ciudadano",
    botones: [{ tipo: "respuesta", texto: "Consultar estado" }],
    variables: ["nombre", "radicado", "fecha"],
    usos: 3104,
    tasaLectura: 87.4,
    calidad: "Alta",
    autor: "Lic. Martínez, A.",
    actualizado: "2026-08-02",
  },
  {
    id: "p3",
    nombre: "Código de verificación",
    atajo: "/codigo",
    canal: "whatsapp",
    categoria: "Autenticación",
    aprobacion: "Aprobada",
    idioma: "Español (CO)",
    cuerpo:
      "{{codigo}} es tu código de verificación para acceder al portal ciudadano. No lo compartas con nadie. Vence en 10 minutos.",
    pie: "Este código es de un solo uso",
    botones: [{ tipo: "respuesta", texto: "Copiar código" }],
    variables: ["codigo"],
    usos: 2266,
    tasaLectura: 94.1,
    calidad: "Alta",
    autor: "Sistema PQRS",
    actualizado: "2026-07-18",
  },
  {
    id: "p4",
    nombre: "Retomar conversación",
    atajo: "/retomar",
    canal: "whatsapp",
    categoria: "Servicio",
    aprobacion: "Aprobada",
    idioma: "Español (CO)",
    cuerpo:
      "Hola {{nombre}}, soy {{agente}} del equipo de atención. Retomo tu caso {{radicado}} porque ya tengo la respuesta que estabas esperando. ¿Te va bien si continuamos por aquí?",
    botones: [
      { tipo: "respuesta", texto: "Sí, continuemos" },
      { tipo: "respuesta", texto: "Prefiero por correo" },
    ],
    variables: ["nombre", "agente", "radicado"],
    usos: 1487,
    tasaLectura: 81.6,
    calidad: "Media",
    autor: "Coord. Ruiz, M.",
    actualizado: "2026-08-09",
  },
  {
    id: "p5",
    nombre: "Invitación jornada ciudadana",
    atajo: "/jornada",
    canal: "whatsapp",
    categoria: "Marketing",
    aprobacion: "En revisión",
    idioma: "Español (CO)",
    encabezado: "Te invitamos a la jornada de atención",
    cuerpo:
      "Hola {{nombre}}, este sábado tendremos jornada de atención presencial en el Centro Cívico, de 8:00 a 2:00. Podrás radicar y resolver tus trámites sin cita previa.",
    pie: "Puedes darte de baja respondiendo BAJA",
    botones: [
      { tipo: "enlace", texto: "Cómo llegar", url: "https://maps.example.com" },
      { tipo: "respuesta", texto: "No me interesa" },
    ],
    variables: ["nombre"],
    usos: 0,
    tasaLectura: 0,
    autor: "Dir. Castro, L.",
    actualizado: "2026-08-12",
  },
  {
    id: "p6",
    nombre: "Saludo desde Direct",
    atajo: "/igsaludo",
    canal: "instagram",
    categoria: "Servicio",
    aprobacion: "No requiere",
    idioma: "Español (CO)",
    cuerpo:
      "¡Hola {{nombre}}! 👋 Gracias por escribirnos por Instagram. Soy {{agente}} del equipo de atención de Pqrslab. Cuéntame en qué puedo ayudarte y lo gestionamos por aquí mismo.",
    botones: [
      { tipo: "respuesta", texto: "Radicar una PQRS" },
      { tipo: "respuesta", texto: "Consultar mi caso" },
      { tipo: "respuesta", texto: "Otra consulta" },
    ],
    variables: ["nombre", "agente"],
    usos: 640,
    tasaLectura: 76.3,
    calidad: "Alta",
    autor: "Coord. Ruiz, M.",
    actualizado: "2026-08-10",
  },
  {
    id: "p7",
    nombre: "Solicitud de datos por Direct",
    atajo: "/igdatos",
    canal: "instagram",
    categoria: "Servicio",
    aprobacion: "No requiere",
    idioma: "Español (CO)",
    cuerpo:
      "Para poder ayudarte necesito verificar tu identidad. ¿Me confirmas tu nombre completo y número de documento? Por seguridad, no compartas contraseñas ni datos bancarios por este medio.",
    botones: [{ tipo: "respuesta", texto: "Prefiero por WhatsApp" }],
    variables: [],
    usos: 388,
    tasaLectura: 71.9,
    calidad: "Alta",
    autor: "Téc. Vargas, C.",
    actualizado: "2026-08-04",
  },
  {
    id: "p8",
    nombre: "Aviso de respuesta lista",
    atajo: "/smsaviso",
    canal: "sms",
    categoria: "Utilidad",
    aprobacion: "No requiere",
    idioma: "Español (CO)",
    cuerpo: "{{nombre}}, la respuesta a tu radicado {{radicado}} ya esta disponible en el portal. Pqrslab.",
    variables: ["nombre", "radicado"],
    usos: 5120,
    tasaLectura: 62.7,
    autor: "Sistema PQRS",
    actualizado: "2026-07-22",
  },
  {
    id: "p9",
    nombre: "Confirmación de cita",
    atajo: "/smscita",
    canal: "sms",
    categoria: "Utilidad",
    aprobacion: "No requiere",
    idioma: "Español (CO)",
    cuerpo: "{{nombre}}, tu cita quedo confirmada para el {{fecha}}. Presenta tu documento. Pqrslab.",
    variables: ["nombre", "fecha"],
    usos: 1940,
    tasaLectura: 58.4,
    autor: "Lic. Martínez, A.",
    actualizado: "2026-08-01",
  },
]
