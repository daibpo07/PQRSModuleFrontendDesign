import type { CanalChat, Message } from "./EnviosIndividualesData"

/* ─────────────────────────────────────────────
   Transferencia de conversaciones

   Una conversación no se "pasa" sin más: el asesor
   de origen la ofrece, el de destino la revisa y
   decide. Mientras nadie acepta, el ciudadano sigue
   esperando —por eso todo aquí gira en torno a dos
   relojes: cuánto lleva la transferencia sin
   respuesta y cuánto le queda a la ventana de 24 h
   de Meta.
───────────────────────────────────────────── */

export const ASESOR_ACTUAL = "Ana Martínez"

/** Minutos que puede esperar una transferencia antes de considerarse vencida. */
export const SLA_ACEPTACION_MIN = 15

/** La sesión de servicio de WhatsApp dura 24 h desde el último mensaje del ciudadano. */
export const VENTANA_META_MIN = 24 * 60

export type EstadoTransferencia = "pendiente" | "aceptada" | "rechazada"
export type PrioridadTransferencia = "Alta" | "Media" | "Baja"

export interface AgenteBreve {
  nombre: string
  cargo: string
  equipo: string
}

export interface AgenteDisponible extends AgenteBreve {
  estado: "Disponible" | "Ocupado" | "Ausente"
  /** Conversaciones abiertas ahora mismo */
  carga: number
  especialidad: string
}

export interface Transferencia {
  id: string
  contacto: string
  documento: string
  canal: CanalChat
  radicado?: string
  origen: AgenteBreve
  destino: AgenteBreve
  motivo: string
  /** Lo que el asesor de origen escribe para el de destino. Nunca lo ve el ciudadano. */
  notaInterna: string
  prioridad: PrioridadTransferencia
  /** Hora en que se ofreció la transferencia */
  solicitada: string
  /** Minutos que lleva la transferencia sin respuesta */
  esperaMin: number
  inicioConversacion: string
  /** Minutos desde el último mensaje del ciudadano: alimenta la ventana de 24 h */
  minutosUltimoMensaje: number
  etiquetas: string[]
  /** Resumen de una línea de lo que ya se hizo */
  avance: string
  mensajes: Message[]
  estado: EstadoTransferencia
  respuesta?: { hora: string; motivo?: string; nota?: string }
}

/* ── Catálogos ── */

export const motivosTransferencia = [
  "Escalamiento a nivel 2",
  "Cambio de área",
  "Caso fuera de mi especialidad",
  "Solicitud del ciudadano",
  "Fin de turno",
  "Sobrecarga de conversaciones",
]

export const motivosRechazo = [
  "No corresponde a mi área",
  "Sin capacidad en este momento",
  "Falta contexto en la nota interna",
  "El caso requiere un perfil distinto",
  "Ya lo estoy atendiendo por otro canal",
]

export const prioridadEstilo: Record<PrioridadTransferencia, { bg: string; text: string; dot: string }> = {
  Alta:  { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Media: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Baja:  { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
}

export const estadoTransferenciaEstilo: Record<
  EstadoTransferencia,
  { label: string; bg: string; text: string; dot: string }
> = {
  pendiente:  { label: "Pendiente",  bg: "#eff3ff", text: "#1E3A8A", dot: "#1E3A8A" },
  aceptada:   { label: "Aceptada",   bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  rechazada:  { label: "Rechazada",  bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

/* ── Helpers ── */

export function formatoDuracion(min: number) {
  if (min < 1) return "menos de 1 min"
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h < 24) return m ? `${h} h ${m} min` : `${h} h`
  const d = Math.floor(h / 24)
  return `${d} d ${h % 24} h`
}

/** Estado del reloj de aceptación: verde mientras esté dentro del SLA. */
export function estadoEspera(esperaMin: number) {
  if (esperaMin > SLA_ACEPTACION_MIN) {
    return { id: "vencida" as const, color: "#dc2626", bg: "#fef2f2", borde: "#fecaca", texto: "Fuera de SLA" }
  }
  if (esperaMin > SLA_ACEPTACION_MIN * 0.6) {
    return { id: "porVencer" as const, color: "#b45309", bg: "#fffbeb", borde: "#fde68a", texto: "Por vencer" }
  }
  return { id: "aTiempo" as const, color: "#047857", bg: "#ecfdf5", borde: "#a7f3d0", texto: "Dentro del SLA" }
}

/**
 * Ventana de servicio de Meta.
 *
 * En WhatsApp solo se puede responder en texto libre durante las 24 h
 * siguientes al último mensaje del ciudadano. Pasado ese punto hay que
 * usar una plantilla aprobada. Quien recibe la transferencia necesita
 * saberlo ANTES de aceptar, porque cambia por completo cómo va a
 * contestar. En SMS, correo e interno la regla no aplica.
 */
export function ventanaMeta(t: Transferencia) {
  if (t.canal !== "whatsapp") return { aplica: false as const }
  const restante = Math.max(0, VENTANA_META_MIN - t.minutosUltimoMensaje)
  const porcentaje = Math.round((restante / VENTANA_META_MIN) * 100)
  const abierta = restante > 0
  const critica = abierta && restante <= 120
  return {
    aplica: true as const,
    restante,
    porcentaje,
    abierta,
    critica,
    color: !abierta ? "#dc2626" : critica ? "#f59e0b" : "#059669",
    bg: !abierta ? "#fef2f2" : critica ? "#fffbeb" : "#ecfdf5",
    borde: !abierta ? "#fecaca" : critica ? "#fde68a" : "#a7f3d0",
  }
}

/* ── Equipo al que se puede transferir ── */

export const agentesDisponibles: AgenteDisponible[] = [
  {
    nombre: "Camilo Restrepo",
    cargo: "Asesor nivel 2",
    equipo: "Soporte técnico",
    estado: "Disponible",
    carga: 3,
    especialidad: "Facturación y medidores",
  },
  {
    nombre: "Laura Gómez",
    cargo: "Coordinadora",
    equipo: "Servicios al ciudadano",
    estado: "Disponible",
    carga: 5,
    especialidad: "Escalamientos y quejas reiteradas",
  },
  {
    nombre: "Julián Ospina",
    cargo: "Asesor",
    equipo: "Planeación",
    estado: "Ocupado",
    carga: 9,
    especialidad: "Licencias y predios",
  },
  {
    nombre: "Natalia Suárez",
    cargo: "Asesora jurídica",
    equipo: "Jurídica",
    estado: "Disponible",
    carga: 2,
    especialidad: "Términos de ley y tutelas",
  },
  {
    nombre: "Andrés Peña",
    cargo: "Asesor",
    equipo: "Servicios al ciudadano",
    estado: "Ausente",
    carga: 0,
    especialidad: "Turno de la tarde",
  },
]

/* ─────────────────────────────────────────────
   Datos de ejemplo
───────────────────────────────────────────── */

export const mockTransferencias: Transferencia[] = [
  {
    id: "tr1",
    contacto: "Diana Quintero",
    documento: "43567891",
    canal: "whatsapp",
    radicado: "PQR-2026-000018",
    origen: { nombre: "Camilo Restrepo", cargo: "Asesor nivel 2", equipo: "Soporte técnico" },
    destino: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    motivo: "Escalamiento a nivel 2",
    notaInterna:
      "Diana ya reclamó dos veces por el mismo cobro y en la primera le prometieron una respuesta en 5 días hábiles que nunca llegó. Verifiqué en el sistema: la revisión técnica del medidor sí se hizo el 8 de agosto y salió a favor de ella, pero nadie le aplicó el ajuste a la factura. Necesita que alguien con permiso de ajustes lo cierre hoy — está molesta y con razón. Ya le pedí disculpas a nombre del equipo, no hay que repetirle el guion de siempre.",
    prioridad: "Alta",
    solicitada: "10:24",
    esperaMin: 22,
    inicioConversacion: "2026-08-24 09:41",
    minutosUltimoMensaje: 26,
    etiquetas: ["Reiterada", "Ajuste de factura", "Ley 1755"],
    avance: "Se validó la revisión técnica y quedó pendiente aplicar el ajuste en facturación.",
    mensajes: [
      {
        id: "tr1-s1",
        text: "Conversación iniciada por WhatsApp",
        time: "09:41",
        mine: false,
        sistema: true,
      },
      {
        id: "tr1-m1",
        text: "Buenos días. Es la tercera vez que escribo por el mismo cobro de la factura de julio. Nadie me responde.",
        time: "09:41",
        mine: false,
      },
      {
        id: "tr1-m2",
        text: "Buenos días Diana, lamento mucho la espera. Soy Camilo del equipo de soporte. Déjame revisar el histórico de tu caso en este momento.",
        time: "09:44",
        mine: true,
        status: "read",
      },
      {
        id: "tr1-m3",
        text: "Ya me dijeron eso dos veces. La última vez me prometieron respuesta en 5 días hábiles y van casi tres semanas.",
        time: "09:46",
        mine: false,
      },
      {
        id: "tr1-m4",
        text: "Tienes toda la razón y te ofrezco disculpas a nombre del equipo. Confirmo que la inspección del medidor se realizó el 8 de agosto y el resultado te favorece: el consumo reportado no corresponde.",
        time: "09:52",
        mine: true,
        status: "read",
      },
      {
        id: "tr1-m5",
        text: "¿Entonces por qué me siguen cobrando?",
        time: "09:54",
        mine: false,
      },
      {
        id: "tr1-m6",
        text: "Porque el ajuste no se aplicó en facturación. Es un error nuestro. Voy a pasar tu caso a una asesora con permiso para hacer el ajuste directamente para que no tengas que volver a explicar nada.",
        time: "09:58",
        mine: true,
        status: "read",
      },
      {
        id: "tr1-m7",
        text: "Le agradezco, pero por favor que esta vez sí me den una respuesta.",
        time: "10:22",
        mine: false,
      },
    ],
    estado: "pendiente",
  },
  {
    id: "tr2",
    contacto: "Hernán Villa",
    documento: "8123456",
    canal: "whatsapp",
    radicado: "PQR-2026-000021",
    origen: { nombre: "Julián Ospina", cargo: "Asesor", equipo: "Planeación" },
    destino: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    motivo: "Cambio de área",
    notaInterna:
      "Entró preguntando por una licencia de construcción, pero al final lo que necesita es el certificado de estratificación de su predio — eso lo maneja tu área, no la mía. Ya tiene el número de matrícula inmobiliaria a la mano, se lo pedí para adelantarte camino. Ojo: es adulto mayor y le cuesta el chat, si puedes ofrécele la opción de llamada.",
    prioridad: "Media",
    solicitada: "09:12",
    esperaMin: 8,
    inicioConversacion: "2026-08-24 08:30",
    minutosUltimoMensaje: 1310,
    etiquetas: ["Certificado", "Adulto mayor"],
    avance: "Se identificó el trámite correcto y el ciudadano ya tiene la matrícula inmobiliaria.",
    mensajes: [
      { id: "tr2-s1", text: "Conversación iniciada por WhatsApp", time: "08:30", mine: false, sistema: true },
      {
        id: "tr2-m1",
        text: "Buen día, necesito saber qué requisitos piden para la licencia de construcción.",
        time: "08:30",
        mine: false,
      },
      {
        id: "tr2-m2",
        text: "Buen día don Hernán. Con gusto. ¿La construcción es obra nueva o una ampliación de la vivienda que ya tiene?",
        time: "08:34",
        mine: true,
        status: "read",
      },
      {
        id: "tr2-m3",
        text: "No es para construir. Es que en el banco me piden un papel que diga en qué estrato queda mi casa.",
        time: "08:41",
        mine: false,
      },
      {
        id: "tr2-m4",
        text: "Ah, entonces lo que necesita es el certificado de estratificación, que es un trámite distinto. ¿Tiene a la mano la matrícula inmobiliaria del predio?",
        time: "08:45",
        mine: true,
        status: "read",
      },
      { id: "tr2-m5", text: "Sí señor, aquí la tengo: 001-234567", time: "08:52", mine: false },
      {
        id: "tr2-m6",
        text: "Perfecto. Ese trámite lo atiende el equipo de servicios al ciudadano. Le paso con una compañera que le va a ayudar directamente, no tiene que volver a explicar nada.",
        time: "08:55",
        mine: true,
        status: "read",
      },
    ],
    estado: "pendiente",
  },
  {
    id: "tr3",
    contacto: "Sandra Ruiz",
    documento: "1098765432",
    canal: "sms",
    origen: { nombre: "Andrés Peña", cargo: "Asesor", equipo: "Servicios al ciudadano" },
    destino: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    motivo: "Fin de turno",
    notaInterna:
      "Se me acaba el turno y no alcanzo a cerrarlo. Sandra pidió el certificado de residencia y ya le confirmé que está listo; solo falta decirle a qué punto de atención puede ir a recogerlo y en qué horario. Es un cierre de dos mensajes, nada complicado.",
    prioridad: "Baja",
    solicitada: "Ayer 17:58",
    esperaMin: 890,
    inicioConversacion: "2026-08-23 16:20",
    minutosUltimoMensaje: 980,
    etiquetas: ["Certificado", "Cierre rápido"],
    avance: "El certificado ya está listo; falta indicar punto y horario de entrega.",
    mensajes: [
      { id: "tr3-s1", text: "Conversación iniciada por SMS", time: "16:20", mine: false, sistema: true },
      {
        id: "tr3-m1",
        text: "Buenas tardes, quisiera saber si ya salió mi certificado de residencia.",
        time: "16:20",
        mine: false,
      },
      {
        id: "tr3-m2",
        text: "Buenas tardes Sandra. Reviso y le confirmo en unos minutos.",
        time: "16:31",
        mine: true,
        status: "delivered",
      },
      {
        id: "tr3-m3",
        text: "Confirmado: su certificado ya está expedido y firmado. Le indico el punto de entrega en el siguiente mensaje.",
        time: "17:44",
        mine: true,
        status: "delivered",
      },
      { id: "tr3-m4", text: "Perfecto, quedo atenta. Muchas gracias.", time: "17:52", mine: false },
    ],
    estado: "pendiente",
  },
  {
    id: "tr4",
    contacto: "Óscar Betancourt",
    documento: "70123456",
    canal: "whatsapp",
    radicado: "PQR-2026-000016",
    origen: { nombre: "Laura Gómez", cargo: "Coordinadora", equipo: "Servicios al ciudadano" },
    destino: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    motivo: "Sobrecarga de conversaciones",
    notaInterna:
      "Caso sencillo, solo necesito manos. Pregunta por el estado de su radicado y ya le confirmé que está en gestión. Falta darle la fecha estimada de respuesta.",
    prioridad: "Baja",
    solicitada: "Ayer 11:05",
    esperaMin: 6,
    inicioConversacion: "2026-08-23 10:40",
    minutosUltimoMensaje: 1180,
    etiquetas: ["Consulta de estado"],
    avance: "Confirmado el estado del radicado; falta la fecha estimada de respuesta.",
    mensajes: [
      { id: "tr4-s1", text: "Conversación iniciada por WhatsApp", time: "10:40", mine: false, sistema: true },
      { id: "tr4-m1", text: "Buenos días, ¿en qué va mi radicado PQR-2026-000016?", time: "10:40", mine: false },
      {
        id: "tr4-m2",
        text: "Buenos días Óscar. Tu radicado está en estado 'En gestión' con la dependencia de Hacienda.",
        time: "10:52",
        mine: true,
        status: "read",
      },
      { id: "tr4-m3", text: "¿Y para cuándo tendría respuesta?", time: "11:02", mine: false },
    ],
    estado: "aceptada",
    respuesta: { hora: "Ayer 11:11", nota: "Aceptada y cerrada el mismo día." },
  },
  {
    id: "tr5",
    contacto: "Gloria Mesa",
    documento: "32456789",
    canal: "whatsapp",
    radicado: "PQR-2026-000014",
    origen: { nombre: "Julián Ospina", cargo: "Asesor", equipo: "Planeación" },
    destino: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    motivo: "Caso fuera de mi especialidad",
    notaInterna: "Consulta sobre una tutela. Creo que es para ustedes.",
    prioridad: "Alta",
    solicitada: "22 ago 14:30",
    esperaMin: 12,
    inicioConversacion: "2026-08-22 14:02",
    minutosUltimoMensaje: 2900,
    etiquetas: ["Tutela"],
    avance: "Sin gestión previa registrada.",
    mensajes: [
      { id: "tr5-s1", text: "Conversación iniciada por WhatsApp", time: "14:02", mine: false, sistema: true },
      {
        id: "tr5-m1",
        text: "Buenas tardes, me notificaron una tutela y no sé qué debo hacer.",
        time: "14:02",
        mine: false,
      },
      { id: "tr5-m2", text: "Buenas tardes, permítame un momento.", time: "14:20", mine: true, status: "read" },
    ],
    estado: "rechazada",
    respuesta: {
      hora: "22 ago 14:42",
      motivo: "El caso requiere un perfil distinto",
      nota: "Las tutelas las atiende el equipo jurídico, no servicios al ciudadano. Se la reasigné a Natalia Suárez.",
    },
  },
  {
    id: "tr6",
    contacto: "Pedro Ramírez",
    documento: "71234567",
    canal: "sms",
    radicado: "PQR-2026-000010",
    origen: { nombre: ASESOR_ACTUAL, cargo: "Asesora", equipo: "Servicios al ciudadano" },
    destino: { nombre: "Natalia Suárez", cargo: "Asesora jurídica", equipo: "Jurídica" },
    motivo: "Escalamiento a nivel 2",
    notaInterna:
      "El señor Ramírez insiste en que su queja lleva más de 15 días hábiles sin respuesta y ya mencionó que va a poner una tutela. Revisé y tiene razón en los tiempos. Necesita revisión jurídica antes de que se nos venza el término de ley.",
    prioridad: "Alta",
    solicitada: "Hoy 08:15",
    esperaMin: 4,
    inicioConversacion: "2026-08-10 10:00",
    minutosUltimoMensaje: 320,
    etiquetas: ["Término de ley", "Riesgo de tutela"],
    avance: "Validados los tiempos de respuesta; pendiente concepto jurídico.",
    mensajes: [
      { id: "tr6-s1", text: "Conversación iniciada por SMS", time: "10:00", mine: false, sistema: true },
      {
        id: "tr6-m1",
        text: "Señor Ramírez, le informamos que su queja ha sido recibida y asignada al área de atención.",
        time: "10:00",
        mine: true,
        status: "read",
      },
      { id: "tr6-m2", text: "De acuerdo, espero su respuesta.", time: "10:30", mine: false },
      {
        id: "tr6-m3",
        text: "Ya van más de 15 días hábiles y nadie me ha dicho nada. Voy a tener que poner una tutela.",
        time: "08:10",
        mine: false,
      },
    ],
    estado: "pendiente",
  },
]
