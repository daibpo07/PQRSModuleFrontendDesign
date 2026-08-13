/* ─────────────────────────────────────────────
   Envíos Masivos — tipos, catálogos y átomos
   compartidos entre el módulo y el asistente.
───────────────────────────────────────────── */

/* ── Tipos ── */
export type Canal = "whatsapp" | "sms" | "email" | "push"

export type EstadoCampana =
  | "Borrador"
  | "Programada"
  | "Enviando"
  | "Pausada"
  | "Completada"
  | "Fallida"

export interface Campana {
  id: string
  nombre: string
  descripcion: string
  canales: Canal[]
  estado: EstadoCampana
  segmento: string
  plantilla: string
  autor: string
  fecha: string
  hora: string
  total: number
  enviados: number
  entregados: number
  leidos: number
  respondidos: number
  fallidos: number
}

/** De dónde provienen los contactos de una audiencia. */
export type OrigenSegmento = "pqrs" | "regla" | "importacion" | "integracion"

export interface Segmento {
  id: string
  nombre: string
  descripcion: string
  total: number
  filtros: string[]
  origen: OrigenSegmento
  archivo?: string
  actualizado: string
  crecimiento: number
  mix: Record<Exclude<Canal, "push">, number>
}

export interface BotonPlantilla {
  tipo: "respuesta" | "enlace"
  texto: string
  url?: string
}

export interface Plantilla {
  id: string
  nombre: string
  canal: Canal
  categoria: "Notificación" | "Recordatorio" | "Encuesta" | "Alerta" | "Cierre"
  aprobacion: "Aprobada" | "En revisión" | "Rechazada"
  encabezado?: string
  cuerpo: string
  pie?: string
  botones?: BotonPlantilla[]
  variables: string[]
  usos: number
  tasaLectura: number
}

/* ── Catálogos de estilo ── */
export const canalMeta: Record<
  Canal,
  { label: string; color: string; bg: string; border: string; limite: number }
> = {
  whatsapp: { label: "WhatsApp", color: "#059669", bg: "#d1fae5", border: "#a7f3d0", limite: 1024 },
  sms:      { label: "SMS",      color: "#d97706", bg: "#fef3c7", border: "#fde68a", limite: 160 },
  email:    { label: "Email",    color: "#0EA5E9", bg: "#e0f2fe", border: "#bae6fd", limite: 4000 },
  push:     { label: "Push",     color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe", limite: 180 },
}

export const estadoMeta: Record<
  EstadoCampana,
  { bg: string; text: string; dot: string }
> = {
  Borrador:   { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  Programada: { bg: "#eff3ff", text: "#1E3A8A", dot: "#1E3A8A" },
  Enviando:   { bg: "#e0f2fe", text: "#0369a1", dot: "#0EA5E9" },
  Pausada:    { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Completada: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Fallida:    { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

export const aprobacionMeta: Record<
  Plantilla["aprobacion"],
  { bg: string; text: string }
> = {
  Aprobada:      { bg: "#d1fae5", text: "#065f46" },
  "En revisión": { bg: "#fef3c7", text: "#92400e" },
  Rechazada:     { bg: "#fee2e2", text: "#991b1b" },
}

export const origenMeta: Record<
  OrigenSegmento,
  { label: string; corto: string; color: string; bg: string; descripcion: string }
> = {
  pqrs: {
    label: "Peticionarios del sistema",
    corto: "Sistema PQRS",
    color: "#1E3A8A",
    bg: "#eff3ff",
    descripcion:
      "Cada ciudadano que radica una PQRS deja sus datos de contacto. Esa base crece sola con cada radicado del portal, el buzón de correos o la línea telefónica.",
  },
  regla: {
    label: "Regla dinámica",
    corto: "Regla dinámica",
    color: "#0EA5E9",
    bg: "#e0f2fe",
    descripcion:
      "Un filtro guardado sobre los datos del sistema: estado, dependencia, días para vencer. La audiencia se recalcula sola antes de cada envío.",
  },
  importacion: {
    label: "Importación de archivo",
    corto: "Importación",
    color: "#6d28d9",
    bg: "#ede9fe",
    descripcion:
      "Una base externa que subes en CSV o Excel. Mapeas las columnas del archivo a los campos del sistema y quedan disponibles como audiencia.",
  },
  integracion: {
    label: "Integración externa",
    corto: "Integración",
    color: "#d97706",
    bg: "#fef3c7",
    descripcion:
      "Contactos sincronizados desde otro módulo o sistema, como Cobranza o el core del negocio, que se actualizan de forma periódica.",
  },
}

/* ── Helpers ── */
export const nf = (n: number) => n.toLocaleString("es-CO")

export const pct = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 1000) / 10 : 0

/** Ruido determinista: mismas entradas → mismo valor, sin Math.random. */
export function seedNoise(a: number, b: number) {
  return ((a * 73 + b * 151) % 97) / 97
}

/** Reparte los envíos de una campaña a lo largo de la jornada (8:00 – 19:00). */
export function curvaHoraria(c: Campana) {
  const horas = Array.from({ length: 12 }, (_, i) => i + 8)
  const pesos = horas.map(
    (h, i) =>
      Math.exp(-((h - 11) ** 2) / 14) +
      0.65 * Math.exp(-((h - 16) ** 2) / 10) +
      seedNoise(i, c.total % 41) * 0.22,
  )
  const suma = pesos.reduce((a, b) => a + b, 0)
  return horas.map((h, i) => ({
    hora: h,
    enviados: Math.round((c.enviados * pesos[i]) / suma),
    leidos: Math.round((c.leidos * pesos[i]) / suma),
  }))
}

/** Desglose de los rebotes de una campaña por causa. */
export function motivosFallo(c: Campana) {
  const base = [
    { motivo: "Número sin cuenta de WhatsApp activa", peso: 0.32, accion: "Reenviado por SMS" },
    { motivo: "Número inexistente o fuera de servicio", peso: 0.24, accion: "Marcar para depuración" },
    { motivo: "Dominio rechazó el correo (spam)", peso: 0.15, accion: "Revisar reputación del remitente" },
    { motivo: "Buzón de destino lleno", peso: 0.12, accion: "Reintento automático en 24 h" },
    { motivo: "Ventana de 24 horas expirada", peso: 0.1, accion: "Requiere plantilla aprobada" },
    { motivo: "Destinatario canceló la suscripción", peso: 0.07, accion: "Excluido permanentemente" },
  ]
  let asignado = 0
  return base.map((m, i) => {
    const v = i === base.length - 1 ? c.fallidos - asignado : Math.round(c.fallidos * m.peso)
    asignado += v
    return { ...m, cantidad: Math.max(0, v) }
  })
}

/** Promedios históricos del canal, para comparar contra la campaña. */
export const benchmark: Record<Canal, { entrega: number; lectura: number; respuesta: number }> = {
  whatsapp: { entrega: 96.2, lectura: 71.4, respuesta: 12.8 },
  sms:      { entrega: 93.5, lectura: 58.1, respuesta: 4.2 },
  email:    { entrega: 91.8, lectura: 42.6, respuesta: 6.1 },
  push:     { entrega: 88.4, lectura: 38.9, respuesta: 3.4 },
}

/* ── Barra de embudo reutilizable ── */
export function BarraEmbudo({
  label,
  valor,
  base,
  color,
}: {
  label: string
  valor: number
  base: number
  color: string
}) {
  const p = pct(valor, base)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-[11px] text-slate-400">
          <span className="font-mono font-bold text-slate-700">{nf(valor)}</span> · {p}%
        </span>
      </div>
      <div className="h-6 rounded-lg bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(4, p)}%`, background: color }}
        >
          <span className="text-[9px] font-bold text-white/90">{p}%</span>
        </div>
      </div>
    </div>
  )
}

/* ── Iconografía de canal ── */
export function CanalIcon({ canal, className = "w-4 h-4" }: { canal: Canal; className?: string }) {
  if (canal === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  if (canal === "sms")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
          clipRule="evenodd"
        />
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
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  )
}

export function CanalChip({ canal, size = "sm" }: { canal: Canal; size?: "sm" | "xs" }) {
  const m = canalMeta[canal]
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[9px] px-1.5 py-0.5"
      }`}
      style={{ background: m.bg, color: m.color }}
    >
      <CanalIcon canal={canal} className={size === "sm" ? "w-3 h-3" : "w-2.5 h-2.5"} />
      {m.label}
    </span>
  )
}

export function EstadoPill({ estado }: { estado: EstadoCampana }) {
  const m = estadoMeta[estado]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 shrink-0"
      style={{ background: m.bg, color: m.text }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${estado === "Enviando" ? "animate-pulse" : ""}`}
        style={{ background: m.dot }}
      />
      {estado}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Datos simulados
───────────────────────────────────────────── */
export const mockSegmentos: Segmento[] = [
  {
    id: "s1",
    nombre: "Radicados por vencer",
    descripcion: "Peticionarios con radicados activos a menos de 7 días hábiles del vencimiento legal.",
    total: 1284,
    filtros: ["Estado = En gestión", "Vence ≤ 7 días", "Canal ≠ Presencial"],
    origen: "regla",
    actualizado: "Hace 8 min",
    crecimiento: 12.4,
    mix: { whatsapp: 61, sms: 22, email: 17 },
  },
  {
    id: "s2",
    nombre: "PQRS cerradas sin encuesta",
    descripcion: "Ciudadanos con radicados cerrados en los últimos 30 días que no respondieron la encuesta de satisfacción.",
    total: 3960,
    filtros: ["Estado = Cerrado", "Cierre ≤ 30 días", "Encuesta = Sin respuesta"],
    origen: "regla",
    actualizado: "Hace 25 min",
    crecimiento: 4.1,
    mix: { whatsapp: 48, sms: 14, email: 38 },
  },
  {
    id: "s3",
    nombre: "Base ciudadana Antioquia",
    descripcion: "Registro completo de ciudadanos con datos de contacto verificados en el departamento.",
    total: 18320,
    filtros: ["Departamento = Antioquia", "Contacto verificado", "Opt-in vigente"],
    origen: "importacion",
    archivo: "base_ciudadana_antioquia.csv",
    actualizado: "Ayer, 18:40",
    crecimiento: 2.2,
    mix: { whatsapp: 54, sms: 19, email: 27 },
  },
  {
    id: "s4",
    nombre: "Cartera en mora 30-60",
    descripcion: "Titulares con obligaciones vencidas entre 30 y 60 días, habilitados para gestión de cobranza.",
    total: 742,
    filtros: ["Mora ≥ 30 días", "Mora ≤ 60 días", "Acuerdo = Ninguno"],
    origen: "integracion",
    actualizado: "Hace 2 h",
    crecimiento: -6.8,
    mix: { whatsapp: 70, sms: 25, email: 5 },
  },
  {
    id: "s5",
    nombre: "Reclamos de acueducto",
    descripcion: "Peticionarios con reclamos asignados a la Empresa de Acueducto durante el trimestre.",
    total: 517,
    filtros: ["Tipo = Reclamo", "Dependencia = Acueducto", "Trimestre actual"],
    origen: "pqrs",
    actualizado: "Hace 40 min",
    crecimiento: 9.3,
    mix: { whatsapp: 58, sms: 30, email: 12 },
  },
]

export const mockPlantillas: Plantilla[] = [
  {
    id: "p1",
    nombre: "Recordatorio de vencimiento",
    canal: "whatsapp",
    categoria: "Recordatorio",
    aprobacion: "Aprobada",
    encabezado: "Tu radicado está por vencer",
    cuerpo:
      "Hola {{nombre}} 👋\n\nTu radicado {{radicado}} vence el {{fecha}}. Nuestro equipo ya está trabajando en tu caso y te contactaremos antes de esa fecha.\n\nConsulta el estado en cualquier momento respondiendo a este mensaje.",
    pie: "Pqrslab · Atención al ciudadano",
    botones: [
      { tipo: "enlace", texto: "Ver mi radicado", url: "https://pqrslab.com/radicado" },
      { tipo: "respuesta", texto: "Hablar con un asesor" },
    ],
    variables: ["nombre", "radicado", "fecha"],
    usos: 12480,
    tasaLectura: 87.4,
  },
  {
    id: "p2",
    nombre: "Encuesta de satisfacción",
    canal: "whatsapp",
    categoria: "Encuesta",
    aprobacion: "Aprobada",
    cuerpo:
      "Hola {{nombre}}, cerramos tu radicado {{radicado}} ✅\n\n¿Qué tan satisfecho quedaste con la atención recibida? Responde con un número del 1 al 5.\n\nTu respuesta nos ayuda a mejorar.",
    pie: "Solo tomará 10 segundos",
    botones: [
      { tipo: "respuesta", texto: "Muy satisfecho" },
      { tipo: "respuesta", texto: "Puede mejorar" },
    ],
    variables: ["nombre", "radicado"],
    usos: 8215,
    tasaLectura: 79.1,
  },
  {
    id: "p3",
    nombre: "Confirmación de radicación",
    canal: "sms",
    categoria: "Notificación",
    aprobacion: "Aprobada",
    cuerpo:
      "{{nombre}}, recibimos tu solicitud. Radicado {{radicado}}. Respuesta máxima: {{fecha}}. Concept CRM.",
    variables: ["nombre", "radicado", "fecha"],
    usos: 22140,
    tasaLectura: 62.7,
  },
  {
    id: "p4",
    nombre: "Respuesta formal de fondo",
    canal: "email",
    categoria: "Cierre",
    aprobacion: "Aprobada",
    cuerpo:
      "Estimado(a) {{nombre}}:\n\nEn atención a su solicitud radicada bajo el número {{radicado}}, nos permitimos dar respuesta de fondo dentro de los términos establecidos por la Ley 1755 de 2015.\n\nAdjuntamos el oficio de respuesta y los soportes correspondientes.\n\nCordialmente,\nDependencia {{dependencia}}",
    variables: ["nombre", "radicado", "dependencia"],
    usos: 5390,
    tasaLectura: 54.3,
  },
  {
    id: "p5",
    nombre: "Alerta de suspensión de servicio",
    canal: "sms",
    categoria: "Alerta",
    aprobacion: "En revisión",
    cuerpo:
      "{{nombre}}: por mantenimiento programado, el servicio se suspende el {{fecha}} entre 8:00 y 14:00 en {{zona}}.",
    variables: ["nombre", "fecha", "zona"],
    usos: 0,
    tasaLectura: 0,
  },
  {
    id: "p6",
    nombre: "Invitación mesa de trabajo",
    canal: "email",
    categoria: "Notificación",
    aprobacion: "Rechazada",
    cuerpo:
      "Estimado(a) {{nombre}}, le invitamos a la mesa de trabajo ciudadana del {{fecha}} en {{lugar}}. Confirme su asistencia respondiendo este correo.",
    variables: ["nombre", "fecha", "lugar"],
    usos: 0,
    tasaLectura: 0,
  },
  {
    id: "p7",
    nombre: "Recordatorio de acuerdo de pago",
    canal: "whatsapp",
    categoria: "Recordatorio",
    aprobacion: "Aprobada",
    cuerpo:
      "Hola {{nombre}}, tu cuota del acuerdo vence el {{fecha}} por {{valor}}. Puedes pagar en línea o responder este mensaje para reprogramar.",
    variables: ["nombre", "fecha", "valor"],
    usos: 3105,
    tasaLectura: 82.8,
  },
  {
    id: "p8",
    nombre: "Novedad en su radicado",
    canal: "push",
    categoria: "Notificación",
    aprobacion: "Aprobada",
    cuerpo: "{{nombre}}, hay una novedad en tu radicado {{radicado}}. Toca para ver el detalle.",
    variables: ["nombre", "radicado"],
    usos: 1760,
    tasaLectura: 41.2,
  },
]

export const mockCampanas: Campana[] = [
  {
    id: "CMP-2026-0041",
    nombre: "Alerta de vencimiento — agosto",
    descripcion: "Recordatorio automático a peticionarios con radicados próximos a vencer.",
    canales: ["whatsapp", "sms"],
    estado: "Enviando",
    segmento: "Radicados por vencer",
    plantilla: "Recordatorio de vencimiento",
    autor: "Lic. Martínez, A.",
    fecha: "2026-08-13",
    hora: "09:00",
    total: 1284,
    enviados: 540,
    entregados: 512,
    leidos: 318,
    respondidos: 47,
    fallidos: 9,
  },
  {
    id: "CMP-2026-0040",
    nombre: "Encuesta de satisfacción — julio",
    descripcion: "Medición NPS sobre radicados cerrados durante el mes de julio.",
    canales: ["whatsapp", "email"],
    estado: "Completada",
    segmento: "PQRS cerradas sin encuesta",
    plantilla: "Encuesta de satisfacción",
    autor: "Dir. Castro, L.",
    fecha: "2026-08-05",
    hora: "10:30",
    total: 3960,
    enviados: 3960,
    entregados: 3814,
    leidos: 2701,
    respondidos: 1189,
    fallidos: 146,
  },
  {
    id: "CMP-2026-0039",
    nombre: "Suspensión programada — Zona Norte",
    descripcion: "Aviso masivo de mantenimiento del servicio de acueducto en la zona norte.",
    canales: ["sms", "push"],
    estado: "Programada",
    segmento: "Reclamos de acueducto",
    plantilla: "Alerta de suspensión de servicio",
    autor: "Téc. Vargas, C.",
    fecha: "2026-08-16",
    hora: "07:00",
    total: 517,
    enviados: 0,
    entregados: 0,
    leidos: 0,
    respondidos: 0,
    fallidos: 0,
  },
  {
    id: "CMP-2026-0038",
    nombre: "Gestión de cartera 30-60 días",
    descripcion: "Campaña de cobranza preventiva con opción de acuerdo de pago en línea.",
    canales: ["whatsapp"],
    estado: "Pausada",
    segmento: "Cartera en mora 30-60",
    plantilla: "Recordatorio de acuerdo de pago",
    autor: "Coord. Ruiz, M.",
    fecha: "2026-08-11",
    hora: "14:00",
    total: 742,
    enviados: 305,
    entregados: 291,
    leidos: 208,
    respondidos: 62,
    fallidos: 14,
  },
  {
    id: "CMP-2026-0037",
    nombre: "Respuesta de fondo — lote 14",
    descripcion: "Envío masivo de oficios de respuesta con soportes adjuntos.",
    canales: ["email"],
    estado: "Completada",
    segmento: "PQRS cerradas sin encuesta",
    plantilla: "Respuesta formal de fondo",
    autor: "Sistema PQRS",
    fecha: "2026-08-01",
    hora: "18:00",
    total: 1120,
    enviados: 1120,
    entregados: 1043,
    leidos: 566,
    respondidos: 74,
    fallidos: 77,
  },
  {
    id: "CMP-2026-0036",
    nombre: "Invitación mesa de trabajo ciudadana",
    descripcion: "Convocatoria a la mesa de participación del tercer trimestre.",
    canales: ["email"],
    estado: "Borrador",
    segmento: "Base ciudadana Antioquia",
    plantilla: "Invitación mesa de trabajo",
    autor: "Lic. Martínez, A.",
    fecha: "2026-08-20",
    hora: "—",
    total: 18320,
    enviados: 0,
    entregados: 0,
    leidos: 0,
    respondidos: 0,
    fallidos: 0,
  },
  {
    id: "CMP-2026-0035",
    nombre: "Confirmación de radicación — semanal",
    descripcion: "Acuse automático de recibo para radicados creados en el portal ciudadano.",
    canales: ["sms"],
    estado: "Fallida",
    segmento: "Base ciudadana Antioquia",
    plantilla: "Confirmación de radicación",
    autor: "Sistema PQRS",
    fecha: "2026-07-28",
    hora: "06:00",
    total: 890,
    enviados: 214,
    entregados: 96,
    leidos: 41,
    respondidos: 3,
    fallidos: 118,
  },
]
