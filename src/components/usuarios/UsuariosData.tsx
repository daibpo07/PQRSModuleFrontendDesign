import type { ModuloId } from "@/components/panel/PanelData"

/* ─────────────────────────────────────────────
   Trazabilidad 360 de las personas

   Cada módulo guarda su propio rastro —un radicado
   en PQRSDF, un chat en Individuales, un envío en
   Masivos, una ejecución en Flujos—. Aquí esos
   rastros se juntan bajo una sola persona y quedan
   ordenados en el tiempo, que es la única forma de
   responder "¿qué ha pasado con este ciudadano?"
   sin abrir cuatro módulos.
───────────────────────────────────────────── */

/** "sistema" cubre los eventos que no nacen en un módulo contratado: consentimientos, fusiones, portal. */
export type ModuloTraza = ModuloId | "sistema"

export type EstadoPersona = "Activo" | "Sin actividad" | "Bloqueado"

export interface EventoTraza {
  id: string
  modulo: ModuloTraza
  /** Verbo corto del evento: "Radicado", "Respondido", "Entregado"… */
  tipo: string
  titulo: string
  detalle?: string
  fecha: string
  hora: string
  /** Quién lo hizo. "Sistema" cuando fue automático. */
  actor: string
  actorRol?: string
  /** Identificador dentro del módulo de origen: radicado, campaña, ejecución. */
  referencia?: string
  canal?: string
  resultado?: string
  /** Marca los eventos que le llegaron a la persona (salientes). Alimenta la fatiga de contacto. */
  saliente?: boolean
  datos?: { label: string; valor: string }[]
}

export interface Consentimiento {
  canal: string
  estado: "Otorgado" | "Revocado"
  fecha: string
  fuente: string
}

export interface NotaPersona {
  autor: string
  rol: string
  fecha: string
  texto: string
}

export interface PersonaCRM {
  id: string
  nombre: string
  tipoDocumento: "CC" | "CE" | "NIT" | "TI"
  documento: string
  correo: string
  telefono: string
  telefonoAlterno?: string
  municipio: string
  departamento: string
  direccion?: string
  fechaNacimiento?: string
  ocupacion?: string
  tenant: string
  tipoPersona: "Ciudadano" | "Empresa" | "Funcionario"
  estado: EstadoPersona
  /** Por dónde entró a la plataforma la primera vez. */
  origen: string
  primerContacto: string
  ultimaInteraccion: string
  canalPreferido: string
  asesorPrincipal?: string
  etiquetas: string[]
  consentimientos: Consentimiento[]
  /** Promedio de las calificaciones que ha dejado, 1 a 5. */
  satisfaccion?: number
  notas: NotaPersona[]
  traza: EventoTraza[]
}

/* ─────────────────────────────────────────────
   Estilos
───────────────────────────────────────────── */

export const estadoPersonaEstilo: Record<EstadoPersona, { bg: string; text: string; dot: string }> = {
  Activo:          { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Sin actividad": { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  Bloqueado:       { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

export const modulosTraza: Record<ModuloTraza, { nombre: string; corto: string; color: string; bg: string }> = {
  pqrs:         { nombre: "PQRSDF",             corto: "PQRSDF",       color: "#2d4fa8", bg: "#eff3ff" },
  masivos:      { nombre: "Envíos Masivos",     corto: "Masivos",      color: "#0EA5E9", bg: "#e0f2fe" },
  individuales: { nombre: "Envíos Individuales", corto: "Individuales", color: "#059669", bg: "#d1fae5" },
  flujos:       { nombre: "Flujos de Trabajo",  corto: "Flujos",       color: "#7c3aed", bg: "#ede9fe" },
  sistema:      { nombre: "Plataforma",         corto: "Plataforma",   color: "#64748b", bg: "#f1f5f9" },
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

export function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase()
}

const paletaAvatar = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2", "#be185d"]

export function colorAvatar(semilla: string) {
  let n = 0
  for (let i = 0; i < semilla.length; i++) n = (n + semilla.charCodeAt(i)) % paletaAvatar.length
  return paletaAvatar[n]
}

/** Conteo de eventos por módulo: alimenta las píldoras de la tabla y los KPI del detalle. */
export function actividadPorModulo(p: PersonaCRM) {
  const base: Record<ModuloTraza, number> = { pqrs: 0, masivos: 0, individuales: 0, flujos: 0, sistema: 0 }
  for (const e of p.traza) base[e.modulo] += 1
  return base
}

/** Radicados, campañas y ejecuciones distintas: cuenta casos, no eventos. */
export function referenciasDe(p: PersonaCRM, modulo: ModuloTraza) {
  return [...new Set(p.traza.filter(e => e.modulo === modulo && e.referencia).map(e => e.referencia!))]
}

/** Personas distintas que han tocado el caso, con cuántas veces cada una. */
export function asesoresDe(p: PersonaCRM) {
  const mapa = new Map<string, { nombre: string; rol: string; veces: number; ultimo: string }>()
  for (const e of p.traza) {
    if (e.actor === "Sistema") continue
    const previo = mapa.get(e.actor)
    if (previo) {
      previo.veces += 1
      if (e.fecha > previo.ultimo) previo.ultimo = e.fecha
    } else {
      mapa.set(e.actor, { nombre: e.actor, rol: e.actorRol ?? "Asesor", veces: 1, ultimo: e.fecha })
    }
  }
  return [...mapa.values()].sort((a, b) => b.veces - a.veces)
}

/**
 * Fatiga de contacto.
 *
 * Cuántos mensajes salientes recibió la persona en los últimos 30 días,
 * sumando campañas masivas y mensajes uno a uno. Es el dato que falta
 * antes de incluir a alguien en otra campaña: la Ley 1581 de 2012 protege
 * su derecho a no ser contactado en exceso, y una queja por spam empieza
 * siempre con un número alto aquí.
 */
export const UMBRAL_FATIGA = 6
export const VENTANA_FATIGA_DIAS = 30

export function fatigaDeContacto(p: PersonaCRM, hoy = HOY) {
  /* Se compara por días completos y no restando objetos Date:
     mezclar componentes locales y UTC corre la ventana un día. */
  const recientes = p.traza.filter(e => e.saliente && diasDesde(e.fecha, hoy) <= VENTANA_FATIGA_DIAS)
  const total = recientes.length
  const porModulo: Record<string, number> = {}
  for (const e of recientes) porModulo[e.modulo] = (porModulo[e.modulo] ?? 0) + 1

  const nivel = total > UMBRAL_FATIGA ? "alta" : total >= UMBRAL_FATIGA - 2 ? "media" : "baja"
  const estilo = {
    alta:  { color: "#dc2626", bg: "#fef2f2", borde: "#fecaca" },
    media: { color: "#b45309", bg: "#fffbeb", borde: "#fde68a" },
    baja:  { color: "#047857", bg: "#ecfdf5", borde: "#a7f3d0" },
  }[nivel]

  return { total, porModulo, nivel, ...estilo }
}

/** Días transcurridos desde una fecha ISO, contra la fecha de referencia del prototipo. */
export const HOY = "2026-09-22"

export function diasDesde(fecha: string, hoy = HOY) {
  return Math.round((new Date(hoy).getTime() - new Date(fecha).getTime()) / 86400000)
}

export function haceCuanto(fecha: string) {
  const d = diasDesde(fecha)
  if (d <= 0) return "hoy"
  if (d === 1) return "ayer"
  if (d < 30) return `hace ${d} días`
  const m = Math.floor(d / 30)
  if (m < 12) return `hace ${m} ${m === 1 ? "mes" : "meses"}`
  const a = Math.floor(m / 12)
  return `hace ${a} ${a === 1 ? "año" : "años"}`
}

export function fechaLarga(fecha: string) {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  const d = new Date(fecha)
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
}

/* ─────────────────────────────────────────────
   Catálogos para los filtros
───────────────────────────────────────────── */

export const municipios = [
  "Medellín",
  "Bello",
  "Envigado",
  "Itagüí",
  "Rionegro",
  "Sabaneta",
  "Copacabana",
]

export const rangosActividad: { id: string; label: string; dias: number | null }[] = [
  { id: "todos", label: "Cualquier fecha", dias: null },
  { id: "7", label: "Últimos 7 días", dias: 7 },
  { id: "30", label: "Últimos 30 días", dias: 30 },
  { id: "90", label: "Últimos 90 días", dias: 90 },
  { id: "inactivos", label: "Sin actividad hace 90+ días", dias: -90 },
]

/* ─────────────────────────────────────────────
   Datos de ejemplo
───────────────────────────────────────────── */

export const mockPersonas: PersonaCRM[] = [
  {
    id: "u1",
    nombre: "Dairon Andrés Betancur Flórez",
    tipoDocumento: "CC",
    documento: "1035700880",
    correo: "dairon.betancur@gmail.com",
    telefono: "+57 310 482 5517",
    telefonoAlterno: "+57 604 322 1190",
    municipio: "Medellín",
    departamento: "Antioquia",
    direccion: "Cra. 43A # 18-95, El Poblado",
    fechaNacimiento: "1994-03-12",
    ocupacion: "Ingeniero de sistemas",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "Portal web · formulario PQRSDF",
    primerContacto: "2026-07-12",
    ultimaInteraccion: "2026-09-20",
    canalPreferido: "WhatsApp",
    asesorPrincipal: "Diego Monsalve",
    etiquetas: ["Reiterante", "Alto contacto", "Canal digital"],
    satisfaccion: 4.2,
    consentimientos: [
      { canal: "WhatsApp", estado: "Otorgado", fecha: "2026-07-12", fuente: "Formulario PQRSDF" },
      { canal: "Correo electrónico", estado: "Otorgado", fecha: "2026-07-12", fuente: "Formulario PQRSDF" },
      { canal: "SMS", estado: "Otorgado", fecha: "2026-07-20", fuente: "Doble confirmación" },
      { canal: "Llamada comercial", estado: "Revocado", fecha: "2026-08-30", fuente: "Solicitud del titular" },
    ],
    notas: [
      {
        autor: "Diego Monsalve",
        rol: "Asesor nivel 2",
        fecha: "2026-08-14",
        texto:
          "Conoce sus derechos y cita los términos de la Ley 1755. Prefiere respuestas escritas con el soporte adjunto; no le sirve que le digan 'ya quedó gestionado' sin el documento.",
      },
      {
        autor: "Laura Gómez",
        rol: "Coordinadora",
        fecha: "2026-09-01",
        texto: "Revocó el consentimiento para llamadas comerciales. Contactar solo por WhatsApp o correo.",
      },
    ],
    traza: [
      {
        id: "u1-e1",
        modulo: "sistema",
        tipo: "Registro",
        titulo: "Persona creada en la plataforma",
        detalle: "Se registró al diligenciar el formulario público de PQRSDF del portal.",
        fecha: "2026-07-12",
        hora: "08:41",
        actor: "Sistema",
        canal: "Portal Web",
      },
      {
        id: "u1-e2",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una petición por información de predios",
        detalle:
          "Solicitud de información detallada sobre los predios disponibles en la zona de expansión norte del municipio.",
        fecha: "2026-07-15",
        hora: "09:02",
        actor: "Sistema",
        referencia: "PQR-2026-000012",
        canal: "Portal Web",
        resultado: "Recibido",
        datos: [
          { label: "Tipo", valor: "Petición" },
          { label: "Dependencia", valor: "Planeación Municipal" },
          { label: "Término de ley", valor: "15 días hábiles" },
        ],
      },
      {
        id: "u1-e3",
        modulo: "pqrs",
        tipo: "Asignación",
        titulo: "Diego Monsalve tomó el radicado",
        detalle: "Asignado a Planeación Municipal tras verificar competencia.",
        fecha: "2026-07-15",
        hora: "11:20",
        actor: "Diego Monsalve",
        actorRol: "Asesor nivel 2",
        referencia: "PQR-2026-000012",
      },
      {
        id: "u1-e4",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Confirmación de radicado»",
        detalle: "Plantilla transaccional con el número de radicado y el término de respuesta.",
        fecha: "2026-07-15",
        hora: "11:25",
        actor: "Sistema",
        referencia: "CAM-2026-031",
        canal: "WhatsApp",
        resultado: "Leído",
        saliente: true,
        datos: [
          { label: "Audiencia", valor: "Radicados del día" },
          { label: "Plantilla", valor: "confirmacion_radicado_v3" },
          { label: "Estado", valor: "Entregado y leído" },
        ],
      },
      {
        id: "u1-e5",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Escribió por WhatsApp preguntando por el avance",
        detalle: "«Buenos días, necesito saber el estado de mi radicado PQR-2026-000012».",
        fecha: "2026-07-24",
        hora: "09:02",
        actor: "Diego Monsalve",
        actorRol: "Asesor nivel 2",
        referencia: "CHAT-1841",
        canal: "WhatsApp",
        resultado: "Resuelto en 13 min",
        datos: [
          { label: "Mensajes", valor: "7" },
          { label: "Tipificación", valor: "Consulta de estado" },
        ],
      },
      {
        id: "u1-e6",
        modulo: "flujos",
        tipo: "Ejecución",
        titulo: "Su caso entró al flujo «Respuesta PQRSDF con término de ley»",
        detalle: "Ruta de 5 pasos con revisión jurídica y firma del director de dependencia.",
        fecha: "2026-07-25",
        hora: "08:00",
        actor: "Sistema",
        referencia: "EJE-2026-0188",
        resultado: "En curso",
        datos: [
          { label: "Pasos", valor: "5" },
          { label: "SLA", valor: "15 días hábiles" },
        ],
      },
      {
        id: "u1-e7",
        modulo: "flujos",
        tipo: "Paso",
        titulo: "Revisión jurídica aprobada",
        detalle: "Natalia Suárez validó que la respuesta cumple con lo pedido y con el término de ley.",
        fecha: "2026-07-29",
        hora: "15:42",
        actor: "Natalia Suárez",
        actorRol: "Asesora jurídica",
        referencia: "EJE-2026-0188",
        resultado: "Aprobado",
      },
      {
        id: "u1-e8",
        modulo: "pqrs",
        tipo: "Seguimiento",
        titulo: "Diego Monsalve registró seguimiento",
        detalle:
          "«Se consolidó el listado de predios con Planeación. Falta el visto bueno del director para enviar la respuesta formal».",
        fecha: "2026-07-31",
        hora: "10:05",
        actor: "Diego Monsalve",
        actorRol: "Asesor nivel 2",
        referencia: "PQR-2026-000012",
      },
      {
        id: "u1-e9",
        modulo: "pqrs",
        tipo: "Respuesta",
        titulo: "Respuesta formal enviada",
        detalle:
          "Oficio con el listado de predios de la zona de expansión norte y los requisitos para consulta presencial. Enviado 4 días antes del vencimiento.",
        fecha: "2026-08-03",
        hora: "16:18",
        actor: "Diego Monsalve",
        actorRol: "Asesor nivel 2",
        referencia: "PQR-2026-000012",
        canal: "Correo electrónico",
        resultado: "Respondido dentro del término",
        saliente: true,
        datos: [
          { label: "Días usados", valor: "11 de 15" },
          { label: "Adjuntos", valor: "2 documentos" },
        ],
      },
      {
        id: "u1-e10",
        modulo: "individuales",
        tipo: "Encuesta",
        titulo: "Calificó la atención con 4 de 5",
        detalle: "«Buena respuesta, aunque me hubiera gustado recibirla antes».",
        fecha: "2026-08-04",
        hora: "09:12",
        actor: "Sistema",
        referencia: "CHAT-1841",
        canal: "WhatsApp",
        resultado: "CSAT 4/5",
      },
      {
        id: "u1-e11",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una queja por atención en la sucursal norte",
        detalle: "Inconformidad con el servicio de atención al ciudadano en la sucursal norte.",
        fecha: "2026-08-20",
        hora: "14:30",
        actor: "Sistema",
        referencia: "PQR-2026-000011",
        canal: "Portal Web",
        resultado: "Recibido",
        datos: [
          { label: "Tipo", valor: "Queja" },
          { label: "Dependencia", valor: "Servicios al Ciudadano" },
        ],
      },
      {
        id: "u1-e12",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Camilo Restrepo lo contactó para ampliar la queja",
        detalle: "Se le pidió fecha, hora y nombre del funcionario para poder verificar el caso.",
        fecha: "2026-08-22",
        hora: "10:14",
        actor: "Camilo Restrepo",
        actorRol: "Asesor nivel 2",
        referencia: "CHAT-1902",
        canal: "WhatsApp",
        resultado: "Información ampliada",
        saliente: true,
      },
      {
        id: "u1-e13",
        modulo: "sistema",
        tipo: "Consentimiento",
        titulo: "Revocó el consentimiento para llamadas comerciales",
        detalle: "Solicitud del titular al amparo de la Ley 1581 de 2012. Se excluyó de las audiencias de voz.",
        fecha: "2026-08-30",
        hora: "17:03",
        actor: "Laura Gómez",
        actorRol: "Coordinadora",
        resultado: "Revocado",
      },
      {
        id: "u1-e14",
        modulo: "pqrs",
        tipo: "Cierre",
        titulo: "Queja cerrada tras verificación interna",
        detalle: "Se confirmó la falla en la atención, se hizo retroalimentación al equipo y se le ofreció disculpas.",
        fecha: "2026-08-31",
        hora: "11:40",
        actor: "Diego Monsalve",
        actorRol: "Asesor nivel 2",
        referencia: "PQR-2026-000011",
        resultado: "Cerrado",
        saliente: true,
      },
      {
        id: "u1-e14b",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Horarios de atención en septiembre»",
        fecha: "2026-09-02",
        hora: "08:00",
        actor: "Sistema",
        referencia: "CAM-2026-042",
        canal: "SMS",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u1-e15",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Encuesta de satisfacción trimestral»",
        fecha: "2026-09-08",
        hora: "10:00",
        actor: "Sistema",
        referencia: "CAM-2026-044",
        canal: "Correo electrónico",
        resultado: "Abierto, sin respuesta",
        saliente: true,
        datos: [
          { label: "Audiencia", valor: "Ciudadanos con PQRSDF cerrada" },
          { label: "Estado", valor: "Abierto" },
        ],
      },
      {
        id: "u1-e16",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Nuevos canales de atención»",
        fecha: "2026-09-15",
        hora: "09:30",
        actor: "Sistema",
        referencia: "CAM-2026-047",
        canal: "WhatsApp",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u1-e16a",
        modulo: "masivos",
        tipo: "Recordatorio",
        titulo: "Reenvío de la encuesta de satisfacción",
        detalle: "Segundo intento automático sobre quienes abrieron pero no respondieron.",
        fecha: "2026-09-10",
        hora: "10:00",
        actor: "Sistema",
        referencia: "CAM-2026-044",
        canal: "Correo electrónico",
        resultado: "Abierto, sin respuesta",
        saliente: true,
      },
      {
        id: "u1-e16b",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Jornada de atención en el barrio»",
        fecha: "2026-09-18",
        hora: "08:30",
        actor: "Sistema",
        referencia: "CAM-2026-049",
        canal: "SMS",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u1-e16c",
        modulo: "flujos",
        tipo: "Notificación",
        titulo: "El flujo le avisó que su caso cambió de etapa",
        detalle: "Notificación automática del paso «Archivo y cierre» de la ejecución EJE-2026-0188.",
        fecha: "2026-09-19",
        hora: "07:15",
        actor: "Sistema",
        referencia: "EJE-2026-0188",
        canal: "WhatsApp",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u1-e17",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Preguntó por el certificado de estratificación",
        detalle: "Consulta breve resuelta en la misma sesión, sin necesidad de radicar.",
        fecha: "2026-09-20",
        hora: "11:48",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-2044",
        canal: "WhatsApp",
        resultado: "Resuelto sin radicado",
        datos: [{ label: "Duración", valor: "9 min" }],
      },
    ],
  },

  {
    id: "u2",
    nombre: "Diana Quintero Salazar",
    tipoDocumento: "CC",
    documento: "43567891",
    correo: "diana.quintero@outlook.com",
    telefono: "+57 312 770 4488",
    municipio: "Bello",
    departamento: "Antioquia",
    direccion: "Cl. 50 # 52-18, Niquía",
    fechaNacimiento: "1981-11-04",
    ocupacion: "Comerciante",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "WhatsApp · línea de atención",
    primerContacto: "2026-06-28",
    ultimaInteraccion: "2026-09-22",
    canalPreferido: "WhatsApp",
    asesorPrincipal: "Camilo Restrepo",
    etiquetas: ["Reiterante", "Ajuste de factura", "Riesgo de escalamiento"],
    satisfaccion: 2.5,
    consentimientos: [
      { canal: "WhatsApp", estado: "Otorgado", fecha: "2026-06-28", fuente: "Opt-in por mensaje" },
      { canal: "SMS", estado: "Otorgado", fecha: "2026-06-28", fuente: "Opt-in por mensaje" },
      { canal: "Correo electrónico", estado: "Revocado", fecha: "2026-08-19", fuente: "Enlace de baja" },
    ],
    notas: [
      {
        autor: "Camilo Restrepo",
        rol: "Asesor nivel 2",
        fecha: "2026-09-22",
        texto:
          "Tercer reclamo por el mismo cobro. La revisión técnica salió a su favor el 8 de agosto y el ajuste nunca se aplicó. No repetirle el guion: necesita el ajuste hecho.",
      },
    ],
    traza: [
      {
        id: "u2-e1",
        modulo: "sistema",
        tipo: "Registro",
        titulo: "Persona creada desde el canal de WhatsApp",
        fecha: "2026-06-28",
        hora: "15:22",
        actor: "Sistema",
        canal: "WhatsApp",
      },
      {
        id: "u2-e2",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó un reclamo por cobro no reconocido",
        detalle: "Cobro en la factura de julio que la ciudadana no reconoce como propio.",
        fecha: "2026-07-05",
        hora: "10:11",
        actor: "Sistema",
        referencia: "PQR-2026-000018",
        canal: "WhatsApp",
        resultado: "Recibido",
        datos: [
          { label: "Tipo", valor: "Reclamo" },
          { label: "Dependencia", valor: "Empresa de Acueducto" },
        ],
      },
      {
        id: "u2-e3",
        modulo: "flujos",
        tipo: "Ejecución",
        titulo: "Se activó el flujo «Revisión técnica de medidor»",
        fecha: "2026-07-28",
        hora: "07:30",
        actor: "Sistema",
        referencia: "EJE-2026-0211",
        resultado: "En curso",
      },
      {
        id: "u2-e4",
        modulo: "flujos",
        tipo: "Paso",
        titulo: "Inspección realizada: el consumo no corresponde",
        detalle: "El técnico confirmó que la lectura reportada no corresponde al medidor instalado.",
        fecha: "2026-08-08",
        hora: "09:50",
        actor: "Julián Ospina",
        actorRol: "Técnico de campo",
        referencia: "EJE-2026-0211",
        resultado: "A favor de la ciudadana",
      },
      {
        id: "u2-e5",
        modulo: "flujos",
        tipo: "Paso",
        titulo: "Ajuste en facturación quedó sin ejecutar",
        detalle:
          "El paso de aplicar el ajuste no tuvo responsable asignado y venció sin acción. Aquí empieza el reclamo reiterado.",
        fecha: "2026-08-14",
        hora: "23:59",
        actor: "Sistema",
        referencia: "EJE-2026-0211",
        resultado: "Vencido sin acción",
      },
      {
        id: "u2-e6",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Factura de agosto disponible»",
        detalle: "La campaña salió con el valor sin ajustar, lo que detonó el segundo reclamo.",
        fecha: "2026-08-18",
        hora: "08:00",
        actor: "Sistema",
        referencia: "CAM-2026-039",
        canal: "SMS",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u2-e7",
        modulo: "sistema",
        tipo: "Consentimiento",
        titulo: "Se dio de baja del correo electrónico",
        fecha: "2026-08-19",
        hora: "20:14",
        actor: "Sistema",
        resultado: "Revocado",
      },
      {
        id: "u2-e8",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Segundo reclamo por el mismo cobro",
        fecha: "2026-08-19",
        hora: "20:31",
        actor: "Andrés Peña",
        actorRol: "Asesor",
        referencia: "CHAT-1955",
        canal: "WhatsApp",
        resultado: "Escalado",
      },
      {
        id: "u2-e9",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Tercer reclamo: «Nadie me responde»",
        detalle:
          "Camilo Restrepo verificó el histórico, confirmó el error interno y ofreció disculpas a nombre del equipo.",
        fecha: "2026-09-22",
        hora: "09:41",
        actor: "Camilo Restrepo",
        actorRol: "Asesor nivel 2",
        referencia: "CHAT-2088",
        canal: "WhatsApp",
        resultado: "En gestión",
        datos: [{ label: "Mensajes", valor: "7" }],
      },
      {
        id: "u2-e10",
        modulo: "individuales",
        tipo: "Transferencia",
        titulo: "Transferida a Ana Martínez para aplicar el ajuste",
        detalle: "Escalamiento a nivel 2 con nota interna: requiere perfil con permiso de ajustes en facturación.",
        fecha: "2026-09-22",
        hora: "10:24",
        actor: "Camilo Restrepo",
        actorRol: "Asesor nivel 2",
        referencia: "CHAT-2088",
        resultado: "Pendiente de aceptación",
      },
    ],
  },

  {
    id: "u3",
    nombre: "Carlos Morales Ríos",
    tipoDocumento: "CC",
    documento: "1020304050",
    correo: "carlos.morales@empresa.com.co",
    telefono: "+57 300 155 9021",
    municipio: "Envigado",
    departamento: "Antioquia",
    direccion: "Cl. 37 Sur # 43-12",
    fechaNacimiento: "1988-06-21",
    ocupacion: "Contador público",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "Portal web · formulario PQRSDF",
    primerContacto: "2026-08-13",
    ultimaInteraccion: "2026-09-18",
    canalPreferido: "WhatsApp",
    asesorPrincipal: "Ana Martínez",
    etiquetas: ["Resuelto a la primera", "Promotor"],
    satisfaccion: 5,
    consentimientos: [
      { canal: "WhatsApp", estado: "Otorgado", fecha: "2026-08-13", fuente: "Formulario PQRSDF" },
      { canal: "Correo electrónico", estado: "Otorgado", fecha: "2026-08-13", fuente: "Formulario PQRSDF" },
    ],
    notas: [
      {
        autor: "Ana Martínez",
        rol: "Asesora",
        fecha: "2026-08-13",
        texto: "Muy claro al explicar lo que necesita. Responde rápido y agradece. Caso fácil de cerrar.",
      },
    ],
    traza: [
      {
        id: "u3-e1",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una petición de certificado",
        fecha: "2026-08-13",
        hora: "08:50",
        actor: "Sistema",
        referencia: "PQR-2026-000012",
        canal: "Portal Web",
        resultado: "Recibido",
      },
      {
        id: "u3-e2",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Consultó el estado por WhatsApp",
        detalle: "Ana Martínez confirmó el estado «En gestión» y el compromiso de respuesta para el viernes.",
        fecha: "2026-08-13",
        hora: "09:02",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-1877",
        canal: "WhatsApp",
        resultado: "Resuelto en 39 min",
        datos: [{ label: "Mensajes", valor: "7" }],
      },
      {
        id: "u3-e3",
        modulo: "pqrs",
        tipo: "Respuesta",
        titulo: "Certificado expedido y enviado",
        fecha: "2026-08-16",
        hora: "12:04",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "PQR-2026-000012",
        canal: "Correo electrónico",
        resultado: "Respondido dentro del término",
        saliente: true,
        datos: [{ label: "Días usados", valor: "3 de 15" }],
      },
      {
        id: "u3-e4",
        modulo: "individuales",
        tipo: "Encuesta",
        titulo: "Calificó la atención con 5 de 5",
        fecha: "2026-08-17",
        hora: "08:20",
        actor: "Sistema",
        referencia: "CHAT-1877",
        resultado: "CSAT 5/5",
      },
      {
        id: "u3-e5",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Nuevos canales de atención»",
        fecha: "2026-09-15",
        hora: "09:30",
        actor: "Sistema",
        referencia: "CAM-2026-047",
        canal: "WhatsApp",
        resultado: "Leído",
        saliente: true,
      },
      {
        id: "u3-e6",
        modulo: "masivos",
        tipo: "Respuesta",
        titulo: "Respondió la campaña pidiendo el horario de la sede sur",
        detalle: "La respuesta abrió una conversación uno a uno que se resolvió el mismo día.",
        fecha: "2026-09-18",
        hora: "10:12",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CAM-2026-047",
        canal: "WhatsApp",
        resultado: "Resuelto",
      },
    ],
  },

  {
    id: "u4",
    nombre: "María López Cadavid",
    tipoDocumento: "CC",
    documento: "1017245512",
    correo: "maria.lopez@gmail.com",
    telefono: "+57 314 208 7733",
    municipio: "Itagüí",
    departamento: "Antioquia",
    fechaNacimiento: "1996-01-30",
    ocupacion: "Estudiante",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "Línea 195",
    primerContacto: "2026-07-20",
    ultimaInteraccion: "2026-09-21",
    canalPreferido: "WhatsApp",
    asesorPrincipal: "Ana Martínez",
    etiquetas: ["Esperando documento"],
    satisfaccion: 3.5,
    consentimientos: [
      { canal: "WhatsApp", estado: "Otorgado", fecha: "2026-07-20", fuente: "Opt-in por mensaje" },
      { canal: "SMS", estado: "Otorgado", fecha: "2026-07-20", fuente: "Opt-in por mensaje" },
    ],
    notas: [],
    traza: [
      {
        id: "u4-e1",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una petición de certificado laboral",
        fecha: "2026-07-20",
        hora: "15:30",
        actor: "Sistema",
        referencia: "PQR-2026-000011",
        canal: "Línea 195",
        resultado: "Recibido",
      },
      {
        id: "u4-e2",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Preguntó por el certificado pendiente",
        fecha: "2026-09-20",
        hora: "15:30",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-2051",
        canal: "WhatsApp",
        resultado: "En gestión",
      },
      {
        id: "u4-e3",
        modulo: "individuales",
        tipo: "Mensaje",
        titulo: "Se le informó que el certificado está en firma",
        fecha: "2026-09-21",
        hora: "15:45",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-2051",
        canal: "WhatsApp",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u4-e4",
        modulo: "flujos",
        tipo: "Ejecución",
        titulo: "Su certificado está en el flujo «Expedición de certificados»",
        fecha: "2026-09-21",
        hora: "16:00",
        actor: "Sistema",
        referencia: "EJE-2026-0302",
        resultado: "En curso · paso 3 de 4",
      },
    ],
  },

  {
    id: "u5",
    nombre: "Pedro Ramírez Ocampo",
    tipoDocumento: "CC",
    documento: "71234567",
    correo: "pedro.ramirez@yahoo.es",
    telefono: "+57 301 664 2210",
    municipio: "Rionegro",
    departamento: "Antioquia",
    fechaNacimiento: "1968-09-17",
    ocupacion: "Pensionado",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "Presencial · punto de atención",
    primerContacto: "2026-08-10",
    ultimaInteraccion: "2026-09-22",
    canalPreferido: "SMS",
    asesorPrincipal: "Natalia Suárez",
    etiquetas: ["Término de ley", "Riesgo de tutela", "Adulto mayor"],
    satisfaccion: 2,
    consentimientos: [
      { canal: "SMS", estado: "Otorgado", fecha: "2026-08-10", fuente: "Formulario presencial" },
      { canal: "WhatsApp", estado: "Revocado", fecha: "2026-09-02", fuente: "Solicitud del titular" },
    ],
    notas: [
      {
        autor: "Natalia Suárez",
        rol: "Asesora jurídica",
        fecha: "2026-09-22",
        texto:
          "Su queja lleva más de 15 días hábiles sin respuesta formal y ya anunció tutela. Tiene razón en los tiempos: priorizar antes de que venza el término.",
      },
    ],
    traza: [
      {
        id: "u5-e1",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una queja por el estado de la vía",
        fecha: "2026-08-10",
        hora: "10:00",
        actor: "Sistema",
        referencia: "PQR-2026-000010",
        canal: "Presencial",
        resultado: "Recibido",
      },
      {
        id: "u5-e2",
        modulo: "individuales",
        tipo: "Mensaje",
        titulo: "Se le confirmó la recepción por SMS",
        fecha: "2026-08-10",
        hora: "10:00",
        actor: "Sistema",
        referencia: "CHAT-1888",
        canal: "SMS",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u5-e3",
        modulo: "sistema",
        tipo: "Consentimiento",
        titulo: "Revocó el consentimiento para WhatsApp",
        detalle: "Pidió que solo lo contacten por SMS o de forma presencial.",
        fecha: "2026-09-02",
        hora: "09:15",
        actor: "Andrés Peña",
        actorRol: "Asesor",
        resultado: "Revocado",
      },
      {
        id: "u5-e4",
        modulo: "pqrs",
        tipo: "Alerta",
        titulo: "El término de ley venció sin respuesta formal",
        detalle: "Ley 1755 de 2015: 15 días hábiles para quejas. El radicado los superó sin respuesta de fondo.",
        fecha: "2026-09-15",
        hora: "00:00",
        actor: "Sistema",
        referencia: "PQR-2026-000010",
        resultado: "Vencido",
      },
      {
        id: "u5-e5",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Anunció que va a interponer una tutela",
        detalle: "«Ya van más de 15 días hábiles y nadie me ha dicho nada».",
        fecha: "2026-09-22",
        hora: "08:10",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-2090",
        canal: "SMS",
        resultado: "Escalado a jurídica",
      },
      {
        id: "u5-e6",
        modulo: "individuales",
        tipo: "Transferencia",
        titulo: "Transferido a Natalia Suárez para revisión jurídica",
        fecha: "2026-09-22",
        hora: "08:15",
        actor: "Ana Martínez",
        actorRol: "Asesora",
        referencia: "CHAT-2090",
        resultado: "Pendiente de aceptación",
      },
    ],
  },

  {
    id: "u6",
    nombre: "Hernán Villa Zapata",
    tipoDocumento: "CC",
    documento: "8123456",
    correo: "hernan.villa@hotmail.com",
    telefono: "+57 313 901 5560",
    municipio: "Copacabana",
    departamento: "Antioquia",
    fechaNacimiento: "1954-02-08",
    ocupacion: "Pensionado",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "WhatsApp · línea de atención",
    primerContacto: "2026-09-10",
    ultimaInteraccion: "2026-09-21",
    canalPreferido: "WhatsApp",
    etiquetas: ["Adulto mayor", "Primera vez"],
    consentimientos: [{ canal: "WhatsApp", estado: "Otorgado", fecha: "2026-09-10", fuente: "Opt-in por mensaje" }],
    notas: [
      {
        autor: "Julián Ospina",
        rol: "Asesor",
        fecha: "2026-09-21",
        texto: "Le cuesta el chat. Si se puede, ofrecerle atención por llamada o presencial.",
      },
    ],
    traza: [
      {
        id: "u6-e1",
        modulo: "sistema",
        tipo: "Registro",
        titulo: "Persona creada desde el canal de WhatsApp",
        fecha: "2026-09-10",
        hora: "11:02",
        actor: "Sistema",
        canal: "WhatsApp",
      },
      {
        id: "u6-e2",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Consultó por una licencia de construcción",
        detalle: "En realidad necesitaba un certificado de estratificación: el trámite se reencauzó.",
        fecha: "2026-09-21",
        hora: "08:30",
        actor: "Julián Ospina",
        actorRol: "Asesor",
        referencia: "CHAT-2061",
        canal: "WhatsApp",
        resultado: "Reencauzado",
      },
      {
        id: "u6-e3",
        modulo: "individuales",
        tipo: "Transferencia",
        titulo: "Transferido a Servicios al Ciudadano",
        detalle: "Cambio de área con la matrícula inmobiliaria ya recogida para no hacerlo repetir.",
        fecha: "2026-09-21",
        hora: "09:12",
        actor: "Julián Ospina",
        actorRol: "Asesor",
        referencia: "CHAT-2061",
        resultado: "Pendiente de aceptación",
      },
    ],
  },

  {
    id: "u7",
    nombre: "Sandra Ruiz Mejía",
    tipoDocumento: "CC",
    documento: "1098765432",
    correo: "sandra.ruiz@gmail.com",
    telefono: "+57 318 442 0077",
    municipio: "Sabaneta",
    departamento: "Antioquia",
    fechaNacimiento: "1990-12-02",
    ocupacion: "Diseñadora",
    tenant: "Pqrslab",
    tipoPersona: "Ciudadano",
    estado: "Activo",
    origen: "SMS · campaña de servicio",
    primerContacto: "2026-09-12",
    ultimaInteraccion: "2026-09-21",
    canalPreferido: "SMS",
    asesorPrincipal: "Andrés Peña",
    etiquetas: ["Cierre rápido"],
    consentimientos: [{ canal: "SMS", estado: "Otorgado", fecha: "2026-09-12", fuente: "Opt-in por mensaje" }],
    notas: [],
    traza: [
      {
        id: "u7-e1",
        modulo: "masivos",
        tipo: "Entregado",
        titulo: "Recibió la campaña «Certificados en línea»",
        fecha: "2026-09-12",
        hora: "09:00",
        actor: "Sistema",
        referencia: "CAM-2026-045",
        canal: "SMS",
        resultado: "Entregado",
        saliente: true,
      },
      {
        id: "u7-e2",
        modulo: "individuales",
        tipo: "Conversación",
        titulo: "Pidió el certificado de residencia",
        fecha: "2026-09-21",
        hora: "16:20",
        actor: "Andrés Peña",
        actorRol: "Asesor",
        referencia: "CHAT-2070",
        canal: "SMS",
        resultado: "En gestión",
      },
      {
        id: "u7-e3",
        modulo: "individuales",
        tipo: "Transferencia",
        titulo: "Transferida por fin de turno",
        detalle: "El certificado ya está listo; falta indicar punto y horario de entrega.",
        fecha: "2026-09-21",
        hora: "17:58",
        actor: "Andrés Peña",
        actorRol: "Asesor",
        referencia: "CHAT-2070",
        resultado: "Pendiente de aceptación",
      },
    ],
  },

  {
    id: "u8",
    nombre: "Constructora Aurora S.A.S.",
    tipoDocumento: "NIT",
    documento: "901445780-2",
    correo: "contacto@constructoraaurora.co",
    telefono: "+57 604 448 9900",
    telefonoAlterno: "+57 320 118 4402",
    municipio: "Medellín",
    departamento: "Antioquia",
    direccion: "Cra. 48 # 12 Sur-70, Oficina 804",
    ocupacion: "Construcción y urbanismo",
    tenant: "Pqrslab",
    tipoPersona: "Empresa",
    estado: "Sin actividad",
    origen: "Correo electrónico",
    primerContacto: "2026-05-14",
    ultimaInteraccion: "2026-06-11",
    canalPreferido: "Correo electrónico",
    etiquetas: ["Persona jurídica", "Licencias"],
    consentimientos: [
      { canal: "Correo electrónico", estado: "Otorgado", fecha: "2026-05-14", fuente: "Contrato marco" },
    ],
    notas: [
      {
        autor: "Laura Gómez",
        rol: "Coordinadora",
        fecha: "2026-06-11",
        texto: "Sin movimiento desde junio. Si vuelven a escribir, verificar quién es el representante autorizado.",
      },
    ],
    traza: [
      {
        id: "u8-e1",
        modulo: "pqrs",
        tipo: "Radicado",
        titulo: "Radicó una petición por licencias de urbanismo",
        fecha: "2026-05-14",
        hora: "09:20",
        actor: "Sistema",
        referencia: "PQR-2026-000005",
        canal: "Correo Electrónico",
        resultado: "Recibido",
      },
      {
        id: "u8-e2",
        modulo: "pqrs",
        tipo: "Respuesta",
        titulo: "Respuesta formal con los requisitos de urbanismo",
        fecha: "2026-06-11",
        hora: "14:05",
        actor: "Julián Ospina",
        actorRol: "Asesor",
        referencia: "PQR-2026-000005",
        canal: "Correo electrónico",
        resultado: "Respondido dentro del término",
        saliente: true,
      },
    ],
  },
]
