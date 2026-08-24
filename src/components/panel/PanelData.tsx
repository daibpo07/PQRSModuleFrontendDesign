import type { View } from "@/App"

/* ─────────────────────────────────────────────
   Panel — módulo transversal de métricas y
   reportería sobre todos los módulos del CRM.

   La paleta categórica de módulos está validada
   con scripts/validate_palette.js: banda de
   luminosidad, piso de croma, separación CVD
   (ΔE 17.9 deutan) y contraste. El azul de marca
   #1E3A8A queda fuera de banda como color de
   dato, por eso las series usan #2d4fa8.
───────────────────────────────────────────── */

export type ModuloId = "pqrs" | "masivos" | "individuales" | "flujos"

export interface ModuloMeta {
  id: ModuloId
  nombre: string
  corto: string
  /** Slot categórico validado. El color sigue al módulo, nunca a su posición. */
  color: string
  bg: string
  vista: View
  unidad: string
  descripcion: string
}

export const modulos: Record<ModuloId, ModuloMeta> = {
  pqrs: {
    id: "pqrs",
    nombre: "PQRSDF",
    corto: "PQRSDF",
    color: "#2d4fa8",
    bg: "#eff3ff",
    vista: "table",
    unidad: "radicados",
    descripcion: "Peticiones, quejas, reclamos, sugerencias, denuncias y felicitaciones.",
  },
  masivos: {
    id: "masivos",
    nombre: "Envíos Masivos",
    corto: "Masivos",
    color: "#0EA5E9",
    bg: "#e0f2fe",
    vista: "masivos",
    unidad: "mensajes",
    descripcion: "Campañas de mensajería a audiencias segmentadas.",
  },
  individuales: {
    id: "individuales",
    nombre: "Envíos Individuales",
    corto: "Individuales",
    color: "#059669",
    bg: "#d1fae5",
    vista: "mensajes",
    unidad: "conversaciones",
    descripcion: "Atención uno a uno por WhatsApp, Instagram y SMS.",
  },
  flujos: {
    id: "flujos",
    nombre: "Flujos de Trabajo",
    corto: "Flujos",
    color: "#7c3aed",
    bg: "#ede9fe",
    vista: "flujos",
    unidad: "ejecuciones",
    descripcion: "Rutas de trabajo con pasos, responsables y SLA.",
  },
}

export const ordenModulos: ModuloId[] = ["pqrs", "masivos", "individuales", "flujos"]

/** Rampa ordinal de una sola tinta, validada con --ordinal. Para etapas de embudo. */
export const rampaOrdinal = ["#1e3a8a", "#2d4fa8", "#4f76d0", "#8aa9e8"]

/** Colores de estado. Reservados: nunca se usan como serie categórica. */
export const estadoMeta = {
  bien: { color: "#059669", bg: "#d1fae5", label: "En meta" },
  atencion: { color: "#d97706", bg: "#fef3c7", label: "En riesgo" },
  critico: { color: "#dc2626", bg: "#fee2e2", label: "Fuera de meta" },
} as const

export type EstadoMetaId = keyof typeof estadoMeta

/** Tinta de texto: los rótulos nunca llevan el color de la serie. */
export const tinta = { fuerte: "#1e293b", medio: "#64748b", suave: "#94a3b8", tenue: "#cbd5e1" }

export const nf = (n: number) => n.toLocaleString("es-CO")

/* ─────────────────────────────────────────────
   Identidad del tenant y plan contratado
───────────────────────────────────────────── */
export const tenant = {
  organizacion: "Pqrslab",
  plan: "Plan Profesional",
  desde: "Marzo 2026",
  modulosActivos: 4,
  modulosDisponibles: 7,
}

export interface ConsumoPlan {
  concepto: string
  usado: number
  incluido: number
  unidad: string
}

export const consumoPlan: ConsumoPlan[] = [
  { concepto: "Mensajes de mensajería", usado: 7902, incluido: 10000, unidad: "mensajes/mes" },
  { concepto: "Usuarios con sesión activa", usado: 18, incluido: 25, unidad: "usuarios" },
  { concepto: "Almacenamiento de adjuntos", usado: 34, incluido: 50, unidad: "GB" },
  { concepto: "Ejecuciones de flujo", usado: 2885, incluido: 5000, unidad: "ejecuciones/mes" },
]

export interface ModuloDisponible {
  nombre: string
  descripcion: string
  desde: string
}

export const modulosDisponibles: ModuloDisponible[] = [
  { nombre: "Cobranza", descripcion: "Gestión de cartera, acuerdos de pago y recuperación.", desde: "$ 1.200.000 / mes" },
  { nombre: "Fábrica de Créditos", descripcion: "Originación, estudio y desembolso de créditos.", desde: "$ 2.400.000 / mes" },
  { nombre: "Base de Conocimiento", descripcion: "Artículos, guiones y respuestas sugeridas al asesor.", desde: "$ 600.000 / mes" },
]

/* ─────────────────────────────────────────────
   Indicadores transversales del periodo
───────────────────────────────────────────── */
export interface KpiTransversal {
  label: string
  valor: string
  sufijo?: string
  delta: number
  /** true cuando bajar es bueno (tiempos, costos). */
  invertido?: boolean
  serie: number[]
  nota: string
}

export const kpisTransversales: KpiTransversal[] = [
  {
    label: "Casos gestionados",
    valor: "1.770",
    delta: 12.4,
    serie: [48, 52, 46, 58, 61, 55, 64, 59, 68, 66, 72, 70, 75, 78],
    nota: "Radicados cerrados más conversaciones resueltas",
  },
  {
    label: "Cumplimiento de SLA",
    valor: "94,2",
    sufijo: "%",
    delta: 1.8,
    serie: [91, 92, 90, 93, 92, 94, 93, 95, 94, 94, 95, 94, 95, 94],
    nota: "Promedio ponderado de los cuatro módulos",
  },
  {
    label: "Tiempo medio de resolución",
    valor: "5,2",
    sufijo: "h",
    delta: -8.1,
    invertido: true,
    serie: [71, 69, 70, 64, 62, 60, 59, 57, 58, 55, 54, 53, 52, 52],
    nota: "Desde la creación del caso hasta su cierre",
  },
  {
    label: "Costo de mensajería",
    valor: "412.500",
    delta: 4.2,
    invertido: true,
    serie: [22, 25, 19, 31, 28, 34, 30, 38, 35, 33, 40, 37, 42, 39],
    nota: "Pesos colombianos consumidos en el periodo",
  },
]

/* ─────────────────────────────────────────────
   Actividad diaria por módulo

   Unidad común: eventos procesados. Cada módulo
   registra un evento por unidad de trabajo, así
   las series son comparables en un mismo eje.
───────────────────────────────────────────── */
export interface DiaActividad {
  fecha: string
  finDeSemana: boolean
  pqrs: number
  masivos: number
  individuales: number
  flujos: number
}

export const actividadDiaria: DiaActividad[] = [
  { fecha: "31 Jul", finDeSemana: false, pqrs: 96, masivos: 412, individuales: 58, flujos: 181 },
  { fecha: "01 Ago", finDeSemana: true, pqrs: 21, masivos: 88, individuales: 14, flujos: 42 },
  { fecha: "02 Ago", finDeSemana: true, pqrs: 18, masivos: 64, individuales: 11, flujos: 36 },
  { fecha: "03 Ago", finDeSemana: false, pqrs: 112, masivos: 596, individuales: 71, flujos: 214 },
  { fecha: "04 Ago", finDeSemana: false, pqrs: 104, masivos: 348, individuales: 64, flujos: 196 },
  { fecha: "05 Ago", finDeSemana: false, pqrs: 128, masivos: 702, individuales: 82, flujos: 238 },
  { fecha: "06 Ago", finDeSemana: false, pqrs: 118, masivos: 431, individuales: 76, flujos: 221 },
  { fecha: "07 Ago", finDeSemana: false, pqrs: 109, masivos: 389, individuales: 69, flujos: 205 },
  { fecha: "08 Ago", finDeSemana: true, pqrs: 24, masivos: 96, individuales: 16, flujos: 48 },
  { fecha: "09 Ago", finDeSemana: true, pqrs: 19, masivos: 71, individuales: 12, flujos: 39 },
  { fecha: "10 Ago", finDeSemana: false, pqrs: 121, masivos: 518, individuales: 78, flujos: 227 },
  { fecha: "11 Ago", finDeSemana: false, pqrs: 134, masivos: 664, individuales: 88, flujos: 246 },
  { fecha: "12 Ago", finDeSemana: false, pqrs: 127, masivos: 471, individuales: 84, flujos: 233 },
  { fecha: "13 Ago", finDeSemana: false, pqrs: 116, masivos: 402, individuales: 79, flujos: 218 },
]

/* ─────────────────────────────────────────────
   Resumen por módulo para las tarjetas
───────────────────────────────────────────── */
export interface ResumenModulo {
  id: ModuloId
  volumen: number
  volumenLabel: string
  delta: number
  serie: number[]
  secundarios: { label: string; valor: string }[]
  alertas: number
  sla: number
}

export const resumenModulos: ResumenModulo[] = [
  {
    id: "pqrs",
    volumen: 1284,
    volumenLabel: "radicados en el periodo",
    delta: 9.2,
    serie: [96, 21, 18, 112, 104, 128, 118, 109, 24, 19, 121, 134, 127, 116],
    secundarios: [
      { label: "Abiertos hoy", valor: "8" },
      { label: "Próximos a vencer", valor: "3" },
      { label: "Tiempo medio", valor: "6,1 d" },
    ],
    alertas: 3,
    sla: 94.2,
  },
  {
    id: "masivos",
    volumen: 7902,
    volumenLabel: "mensajes despachados",
    delta: 18.2,
    serie: [412, 88, 64, 596, 348, 702, 431, 389, 96, 71, 518, 664, 471, 402],
    secundarios: [
      { label: "Campañas activas", valor: "3" },
      { label: "Tasa de entrega", valor: "94,1%" },
      { label: "Tasa de lectura", valor: "66,2%" },
    ],
    alertas: 1,
    sla: 96.1,
  },
  {
    id: "individuales",
    volumen: 486,
    volumenLabel: "conversaciones atendidas",
    delta: 6.7,
    serie: [58, 14, 11, 71, 64, 82, 76, 69, 16, 12, 78, 88, 84, 79],
    secundarios: [
      { label: "Abiertas ahora", valor: "6" },
      { label: "Primera respuesta", valor: "4,2 min" },
      { label: "Satisfacción", valor: "4,2 / 5" },
    ],
    alertas: 2,
    sla: 91.4,
  },
  {
    id: "flujos",
    volumen: 2885,
    volumenLabel: "ejecuciones completadas",
    delta: 14.1,
    serie: [181, 42, 36, 214, 196, 238, 221, 205, 48, 39, 227, 246, 233, 218],
    secundarios: [
      { label: "Flujos activos", valor: "3" },
      { label: "Casos en curso", valor: "6" },
      { label: "Vencidos", valor: "1" },
    ],
    alertas: 4,
    sla: 89.7,
  },
]

/* ─────────────────────────────────────────────
   Alertas transversales
───────────────────────────────────────────── */
export interface AlertaPanel {
  id: string
  modulo: ModuloId
  severidad: EstadoMetaId
  titulo: string
  detalle: string
  hora: string
}

export const alertasPanel: AlertaPanel[] = [
  {
    id: "al1",
    modulo: "flujos",
    severidad: "critico",
    titulo: "Ejecución vencida hace 18 horas",
    detalle:
      "PQR-2026-000004 sigue detenido en “Verificación en cartera” por falta de acceso al core financiero.",
    hora: "Hace 12 min",
  },
  {
    id: "al2",
    modulo: "pqrs",
    severidad: "critico",
    titulo: "3 radicados vencen en menos de 48 horas",
    detalle: "Dos de Planeación Municipal y uno de la Empresa de Acueducto, sin respuesta proyectada.",
    hora: "Hace 40 min",
  },
  {
    id: "al3",
    modulo: "masivos",
    severidad: "atencion",
    titulo: "Rebotes por encima del umbral",
    detalle:
      "La campaña “Confirmación de radicación — semanal” cerró con 13,3% de rebotes contra un 5% esperado.",
    hora: "Hace 2 h",
  },
  {
    id: "al4",
    modulo: "individuales",
    severidad: "atencion",
    titulo: "Conversaciones sin primera respuesta",
    detalle: "Dos chats de WhatsApp llevan más de 30 minutos sin que un asesor los tome.",
    hora: "Hace 3 h",
  },
  {
    id: "al5",
    modulo: "flujos",
    severidad: "atencion",
    titulo: "Persona por encima de su capacidad",
    detalle: "Carlos Vargas tiene 9 tareas activas sobre una capacidad de 8, con 3 vencidas.",
    hora: "Hace 4 h",
  },
]

/* ─────────────────────────────────────────────
   Detalle por módulo — misma forma para los
   cuatro, así la subvista no necesita código
   especial por módulo.
───────────────────────────────────────────── */
export interface DetalleModulo {
  kpis: { label: string; valor: string; sufijo?: string; delta: number; invertido?: boolean; nota: string }[]
  tendenciaTitulo: string
  tendenciaSubtitulo: string
  tendencia: { label: string; valor: number }[]
  desgloseTitulo: string
  desgloseSubtitulo: string
  desglose: { label: string; valor: number }[]
  embudoTitulo?: string
  embudo?: { label: string; valor: number }[]
  tablaTitulo: string
  tabla: { columnas: string[]; filas: string[][] }
}

const semanas = ["Sem 24", "Sem 25", "Sem 26", "Sem 27", "Sem 28", "Sem 29", "Sem 30", "Sem 31", "Sem 32", "Sem 33"]

export const detalleModulos: Record<ModuloId, DetalleModulo> = {
  pqrs: {
    kpis: [
      { label: "Radicados recibidos", valor: "1.284", delta: 9.2, nota: "Todos los canales de ingreso" },
      { label: "Cerrados en término", valor: "94,2", sufijo: "%", delta: 1.8, nota: "Dentro del plazo de ley" },
      { label: "Tiempo medio de respuesta", valor: "6,1", sufijo: "d", delta: -11.4, invertido: true, nota: "De la radicación al cierre" },
      { label: "Reaperturas", valor: "2,4", sufijo: "%", delta: -0.6, invertido: true, nota: "Casos reabiertos tras el cierre" },
    ],
    tendenciaTitulo: "Radicados recibidos por semana",
    tendenciaSubtitulo: "Últimas diez semanas",
    tendencia: semanas.map((label, i) => ({ label, valor: [96, 104, 112, 108, 121, 118, 132, 127, 141, 138][i] })),
    desgloseTitulo: "Radicados por dependencia",
    desgloseSubtitulo: "Dependencias con mayor volumen en el periodo",
    desglose: [
      { label: "Planeación Municipal", valor: 312 },
      { label: "Empresa de Acueducto", valor: 268 },
      { label: "Servicios al Ciudadano", valor: 214 },
      { label: "Hacienda Municipal", valor: 178 },
      { label: "Secretaría de Salud", valor: 141 },
      { label: "Otras dependencias", valor: 171 },
    ],
    embudoTitulo: "Recorrido del radicado",
    embudo: [
      { label: "Recibidos", valor: 1284 },
      { label: "Clasificados", valor: 1251 },
      { label: "Con respuesta proyectada", valor: 1174 },
      { label: "Cerrados en término", valor: 1104 },
    ],
    tablaTitulo: "Tipos de solicitud",
    tabla: {
      columnas: ["Tipo", "Volumen", "En término", "Tiempo medio"],
      filas: [
        ["Petición", "542", "96,1%", "5,4 d"],
        ["Queja", "381", "92,8%", "6,8 d"],
        ["Reclamo", "246", "91,5%", "7,2 d"],
        ["Sugerencia", "78", "98,7%", "3,1 d"],
        ["Denuncia", "24", "95,8%", "8,9 d"],
        ["Felicitación", "13", "100%", "1,2 d"],
      ],
    },
  },
  masivos: {
    kpis: [
      { label: "Mensajes despachados", valor: "7.902", delta: 18.2, nota: "Suma de todas las campañas" },
      { label: "Tasa de entrega", valor: "94,1", sufijo: "%", delta: 1.4, nota: "Llegaron al dispositivo destino" },
      { label: "Tasa de lectura", valor: "66,2", sufijo: "%", delta: 6.7, nota: "Sobre los mensajes entregados" },
      { label: "Costo por respuesta", valor: "1.842", delta: -9.3, invertido: true, nota: "Pesos por respuesta obtenida" },
    ],
    tendenciaTitulo: "Mensajes despachados por semana",
    tendenciaSubtitulo: "Últimas diez semanas",
    tendencia: semanas.map((label, i) => ({ label, valor: [980, 1120, 1340, 1210, 1480, 1390, 1720, 1610, 1890, 1802][i] })),
    desgloseTitulo: "Mensajes por plantilla",
    desgloseSubtitulo: "Plantillas más utilizadas en el periodo",
    desglose: [
      { label: "Recordatorio de vencimiento", valor: 2418 },
      { label: "Encuesta de satisfacción", valor: 1962 },
      { label: "Confirmación de radicación", valor: 1544 },
      { label: "Respuesta formal de fondo", valor: 1108 },
      { label: "Acuerdo de pago", valor: 870 },
    ],
    embudoTitulo: "Embudo de la mensajería",
    embudo: [
      { label: "Despachados", valor: 7902 },
      { label: "Entregados", valor: 7434 },
      { label: "Leídos", valor: 4921 },
      { label: "Respondidos", valor: 1372 },
    ],
    tablaTitulo: "Desempeño por canal",
    tabla: {
      columnas: ["Canal", "Despachados", "Entrega", "Lectura", "Costo unitario"],
      filas: [
        ["WhatsApp", "4.612", "96,2%", "71,4%", "$ 38"],
        ["SMS", "2.108", "93,5%", "58,1%", "$ 52"],
        ["Email", "982", "91,8%", "42,6%", "$ 4"],
        ["Push", "200", "88,4%", "38,9%", "$ 1"],
      ],
    },
  },
  individuales: {
    kpis: [
      { label: "Conversaciones atendidas", valor: "486", delta: 6.7, nota: "Abiertas y cerradas en el periodo" },
      { label: "Primera respuesta", valor: "4,2", sufijo: "min", delta: -14.2, invertido: true, nota: "Desde que escribe el ciudadano" },
      { label: "Resueltas en primer contacto", valor: "68,4", sufijo: "%", delta: 3.1, nota: "Sin necesidad de escalar" },
      { label: "Satisfacción media", valor: "4,2", sufijo: "/5", delta: 2.4, nota: "Encuesta al cerrar la conversación" },
    ],
    tendenciaTitulo: "Conversaciones por semana",
    tendenciaSubtitulo: "Últimas diez semanas",
    tendencia: semanas.map((label, i) => ({ label, valor: [38, 42, 47, 44, 52, 49, 58, 54, 61, 59][i] })),
    desgloseTitulo: "Motivos de contacto más frecuentes",
    desgloseSubtitulo: "Según la tipificación registrada al cerrar",
    desglose: [
      { label: "Consulta de avance", valor: 148 },
      { label: "Solicitud de certificado", valor: 96 },
      { label: "Cobro no reconocido", valor: 74 },
      { label: "Demora en la atención", valor: 61 },
      { label: "Soporte del portal", valor: 52 },
      { label: "Otros motivos", valor: 55 },
    ],
    tablaTitulo: "Tipificaciones y resultado",
    tabla: {
      columnas: ["Categoría", "Casos", "Resueltas", "Duración media"],
      filas: [
        ["Consulta de estado", "182", "94,5%", "38 min"],
        ["Radicación", "121", "91,7%", "52 min"],
        ["Reclamo", "88", "78,4%", "2 h 14 min"],
        ["Queja", "56", "71,4%", "3 h 06 min"],
        ["Soporte del canal", "39", "89,7%", "24 min"],
      ],
    },
  },
  flujos: {
    kpis: [
      { label: "Ejecuciones completadas", valor: "2.885", delta: 14.1, nota: "Casos que recorrieron un flujo entero" },
      { label: "Cumplimiento de SLA", valor: "89,7", sufijo: "%", delta: -2.3, nota: "Terminaron dentro del plazo" },
      { label: "Duración media", valor: "6,4", sufijo: "d", delta: -5.8, invertido: true, nota: "Del disparador al último paso" },
      { label: "Pasos devueltos", valor: "4,1", sufijo: "%", delta: 0.9, invertido: true, nota: "Regresaron al responsable anterior" },
    ],
    tendenciaTitulo: "Ejecuciones completadas por semana",
    tendenciaSubtitulo: "Últimas diez semanas",
    tendencia: semanas.map((label, i) => ({ label, valor: [214, 238, 252, 241, 276, 264, 302, 291, 318, 309][i] })),
    desgloseTitulo: "Ejecuciones por flujo",
    desgloseSubtitulo: "Volumen procesado por cada ruta definida",
    desglose: [
      { label: "Gestión de PQRS estándar", valor: 1284 },
      { label: "Cobranza preventiva 30-60", valor: 742 },
      { label: "Reclamo de facturación", valor: 517 },
      { label: "Respuesta de fondo con firma", valor: 342 },
    ],
    tablaTitulo: "Dónde se acumula el trabajo",
    tabla: {
      columnas: ["Paso", "Flujo", "Casos detenidos", "Espera media"],
      filas: [
        ["Aprobación de Tesorería", "Reclamo de facturación", "1", "42 h"],
        ["Verificación en cartera", "Reclamo de facturación", "1", "8 d"],
        ["Revisión y firma", "Gestión de PQRS estándar", "1", "26 h"],
        ["Análisis y proyección", "Gestión de PQRS estándar", "1", "19 h"],
        ["Revisión Oficina Jurídica", "Respuesta de fondo", "1", "11 h"],
      ],
    },
  },
}

/* ─────────────────────────────────────────────
   Metas e indicadores
───────────────────────────────────────────── */
export interface MetaIndicador {
  id: string
  /** Indicador del catálogo del que salió esta meta. */
  indicadorId?: string
  modulo: ModuloId
  nombre: string
  detalle: string
  actual: number
  objetivo: number
  unidad: string
  /** "mayor" = superar el objetivo es bueno; "menor" = quedar por debajo es bueno. */
  direccion: "mayor" | "menor"
  periodo: string
}

export const metas: MetaIndicador[] = [
  { id: "m1", indicadorId: "i-pqrs-1", modulo: "pqrs", nombre: "Cierre en término de ley", detalle: "Radicados respondidos dentro del plazo legal", actual: 94.2, objetivo: 95, unidad: "%", direccion: "mayor", periodo: "Mes en curso" },
  { id: "m2", indicadorId: "i-pqrs-2", modulo: "pqrs", nombre: "Tiempo medio de respuesta", detalle: "Días hábiles desde la radicación", actual: 6.1, objetivo: 7, unidad: "d", direccion: "menor", periodo: "Mes en curso" },
  { id: "m3", indicadorId: "i-mas-1", modulo: "masivos", nombre: "Tasa de entrega", detalle: "Mensajes que llegaron al destino", actual: 94.1, objetivo: 93, unidad: "%", direccion: "mayor", periodo: "Mes en curso" },
  { id: "m4", indicadorId: "i-mas-2", modulo: "masivos", nombre: "Rebotes", detalle: "Mensajes que no llegaron a destino", actual: 5.9, objetivo: 5, unidad: "%", direccion: "menor", periodo: "Mes en curso" },
  { id: "m5", indicadorId: "i-ind-1", modulo: "individuales", nombre: "Primera respuesta", detalle: "Minutos hasta que un asesor toma el chat", actual: 4.2, objetivo: 5, unidad: "min", direccion: "menor", periodo: "Mes en curso" },
  { id: "m6", indicadorId: "i-ind-2", modulo: "individuales", nombre: "Satisfacción del ciudadano", detalle: "Encuesta al cerrar la conversación", actual: 4.2, objetivo: 4.5, unidad: "/5", direccion: "mayor", periodo: "Mes en curso" },
  { id: "m7", indicadorId: "i-flu-1", modulo: "flujos", nombre: "Cumplimiento de SLA", detalle: "Ejecuciones terminadas dentro del plazo", actual: 89.7, objetivo: 92, unidad: "%", direccion: "mayor", periodo: "Mes en curso" },
  { id: "m8", indicadorId: "i-flu-2", modulo: "flujos", nombre: "Ejecuciones vencidas", detalle: "Casos que superaron su plazo total", actual: 3.1, objetivo: 3, unidad: "%", direccion: "menor", periodo: "Mes en curso" },
]

/* ── Catálogo de indicadores sobre los que se puede fijar una meta ──
   Cada entrada trae su valor actual, su unidad y hacia dónde es bueno
   moverse, así el editor no tiene que preguntarlo. */
export interface IndicadorDisponible {
  id: string
  modulo: ModuloId
  nombre: string
  detalle: string
  actual: number
  unidad: string
  direccion: "mayor" | "menor"
  /** Promedio de los últimos tres meses, como sugerencia al fijar el objetivo. */
  referencia: number
  /** Tope de la escala del medidor cuando el 1,4× automático no aplica. */
  escala?: number
}

export const indicadoresDisponibles: IndicadorDisponible[] = [
  /* PQRSDF */
  { id: "i-pqrs-1", modulo: "pqrs", nombre: "Cierre en término de ley", detalle: "Radicados respondidos dentro del plazo legal", actual: 94.2, unidad: "%", direccion: "mayor", referencia: 92.8 },
  { id: "i-pqrs-2", modulo: "pqrs", nombre: "Tiempo medio de respuesta", detalle: "Días hábiles desde la radicación", actual: 6.1, unidad: "d", direccion: "menor", referencia: 6.9 },
  { id: "i-pqrs-3", modulo: "pqrs", nombre: "Reaperturas", detalle: "Casos reabiertos después del cierre", actual: 2.4, unidad: "%", direccion: "menor", referencia: 3.1 },
  { id: "i-pqrs-4", modulo: "pqrs", nombre: "Radicados sin clasificar a 24 h", detalle: "Entradas que pasan un día sin tipificar", actual: 1.8, unidad: "%", direccion: "menor", referencia: 2.5 },
  { id: "i-pqrs-5", modulo: "pqrs", nombre: "Satisfacción con la respuesta", detalle: "Calificación del ciudadano al cerrar el radicado", actual: 4.1, unidad: "/5", direccion: "mayor", referencia: 4, escala: 5 },

  /* Envíos Masivos */
  { id: "i-mas-1", modulo: "masivos", nombre: "Tasa de entrega", detalle: "Mensajes que llegaron al destino", actual: 94.1, unidad: "%", direccion: "mayor", referencia: 93.2 },
  { id: "i-mas-2", modulo: "masivos", nombre: "Rebotes", detalle: "Mensajes que no llegaron a destino", actual: 5.9, unidad: "%", direccion: "menor", referencia: 6.8 },
  { id: "i-mas-3", modulo: "masivos", nombre: "Tasa de lectura", detalle: "Sobre los mensajes efectivamente entregados", actual: 66.2, unidad: "%", direccion: "mayor", referencia: 61.4 },
  { id: "i-mas-4", modulo: "masivos", nombre: "Costo por respuesta", detalle: "Pesos invertidos por cada respuesta obtenida", actual: 1842, unidad: " COP", direccion: "menor", referencia: 2030, escala: 3000 },
  { id: "i-mas-5", modulo: "masivos", nombre: "Campañas entregadas a tiempo", detalle: "Terminaron dentro de su ventana programada", actual: 96.1, unidad: "%", direccion: "mayor", referencia: 95 },

  /* Envíos Individuales */
  { id: "i-ind-1", modulo: "individuales", nombre: "Primera respuesta", detalle: "Minutos hasta que un asesor toma el chat", actual: 4.2, unidad: "min", direccion: "menor", referencia: 5.1 },
  { id: "i-ind-2", modulo: "individuales", nombre: "Satisfacción del ciudadano", detalle: "Encuesta al cerrar la conversación", actual: 4.2, unidad: "/5", direccion: "mayor", referencia: 4.1, escala: 5 },
  { id: "i-ind-3", modulo: "individuales", nombre: "Resueltas en primer contacto", detalle: "Sin necesidad de escalar a otra área", actual: 68.4, unidad: "%", direccion: "mayor", referencia: 65.2 },
  { id: "i-ind-4", modulo: "individuales", nombre: "Conversaciones sin tipificar", detalle: "Cerradas sin registrar el motivo", actual: 0, unidad: "%", direccion: "menor", referencia: 1.4, escala: 10 },
  { id: "i-ind-5", modulo: "individuales", nombre: "Duración de la conversación", detalle: "Minutos entre el primer y el último mensaje", actual: 46, unidad: "min", direccion: "menor", referencia: 52 },

  /* Flujos de Trabajo */
  { id: "i-flu-1", modulo: "flujos", nombre: "Cumplimiento de SLA", detalle: "Ejecuciones terminadas dentro del plazo", actual: 89.7, unidad: "%", direccion: "mayor", referencia: 91.2 },
  { id: "i-flu-2", modulo: "flujos", nombre: "Ejecuciones vencidas", detalle: "Casos que superaron su plazo total", actual: 3.1, unidad: "%", direccion: "menor", referencia: 2.8 },
  { id: "i-flu-3", modulo: "flujos", nombre: "Duración media", detalle: "Días desde el disparador hasta el último paso", actual: 6.4, unidad: "d", direccion: "menor", referencia: 6.8 },
  { id: "i-flu-4", modulo: "flujos", nombre: "Pasos devueltos", detalle: "Regresaron al responsable anterior", actual: 4.1, unidad: "%", direccion: "menor", referencia: 3.6 },
  { id: "i-flu-5", modulo: "flujos", nombre: "Ocupación del equipo", detalle: "Tareas activas sobre la capacidad declarada", actual: 78, unidad: "%", direccion: "menor", referencia: 82 },
]

export const periodosMeta = ["Mes en curso", "Trimestre", "Semestre", "Año"]

export const responsablesMeta = [
  "Dir. Castro, L.",
  "Coord. Ruiz, M.",
  "Lic. Martínez, A.",
  "Téc. Vargas, C.",
  "Sin responsable asignado",
]

/** Tope de la escala del medidor para un indicador y su objetivo. */
export function escalaDe(unidad: string, actual: number, objetivo: number, escala?: number) {
  if (escala) return escala
  if (unidad === "%") return 100
  if (unidad === "/5") return 5
  return Math.max(actual, objetivo) * 1.4 || 1
}

/** Un indicador está en meta, en riesgo (a menos de 5% de distancia) o fuera. */
export function estadoDeMeta(m: MetaIndicador): EstadoMetaId {
  const cumple = m.direccion === "mayor" ? m.actual >= m.objetivo : m.actual <= m.objetivo
  if (cumple) return "bien"
  const brecha = Math.abs(m.actual - m.objetivo) / (m.objetivo || 1)
  return brecha <= 0.05 ? "atencion" : "critico"
}

/* ─────────────────────────────────────────────
   Reportería
───────────────────────────────────────────── */
export interface Reporte {
  id: string
  nombre: string
  modulo: ModuloId | "transversal"
  descripcion: string
  formato: "PDF" | "Excel" | "CSV"
  frecuencia: "Manual" | "Diario" | "Semanal" | "Mensual"
  ultimaGeneracion: string
  destinatarios: string[]
  activo: boolean
}

export const reportes: Reporte[] = [
  {
    id: "r1",
    nombre: "Informe ejecutivo consolidado",
    modulo: "transversal",
    descripcion: "Resumen de los cuatro módulos con indicadores, metas y desvíos del periodo.",
    formato: "PDF",
    frecuencia: "Mensual",
    ultimaGeneracion: "2026-08-01 06:00",
    destinatarios: ["direccion@pqrslab.com", "gerencia@pqrslab.com"],
    activo: true,
  },
  {
    id: "r2",
    nombre: "Cumplimiento de términos de ley",
    modulo: "pqrs",
    descripcion: "Radicados por dependencia con su estado frente al plazo legal. Requerido por control interno.",
    formato: "Excel",
    frecuencia: "Semanal",
    ultimaGeneracion: "2026-08-10 07:00",
    destinatarios: ["controlinterno@pqrslab.com"],
    activo: true,
  },
  {
    id: "r3",
    nombre: "Rendimiento de campañas",
    modulo: "masivos",
    descripcion: "Entrega, lectura, respuesta y costo por campaña, con desglose por canal y plantilla.",
    formato: "PDF",
    frecuencia: "Semanal",
    ultimaGeneracion: "2026-08-12 08:00",
    destinatarios: ["mercadeo@pqrslab.com"],
    activo: true,
  },
  {
    id: "r4",
    nombre: "Tipificaciones y satisfacción",
    modulo: "individuales",
    descripcion: "Conversaciones cerradas agrupadas por motivo, con resultado y calificación del ciudadano.",
    formato: "Excel",
    frecuencia: "Mensual",
    ultimaGeneracion: "2026-08-01 06:30",
    destinatarios: ["calidad@pqrslab.com"],
    activo: true,
  },
  {
    id: "r5",
    nombre: "Cuellos de botella por flujo",
    modulo: "flujos",
    descripcion: "Pasos con mayor acumulación de casos y tiempo de espera, por flujo y responsable.",
    formato: "PDF",
    frecuencia: "Diario",
    ultimaGeneracion: "2026-08-13 06:00",
    destinatarios: ["operaciones@pqrslab.com"],
    activo: true,
  },
  {
    id: "r6",
    nombre: "Carga de trabajo del equipo",
    modulo: "flujos",
    descripcion: "Tareas activas, vencidas y tiempo medio por persona.",
    formato: "CSV",
    frecuencia: "Manual",
    ultimaGeneracion: "2026-07-28 15:12",
    destinatarios: [],
    activo: false,
  },
  {
    id: "r7",
    nombre: "Consumo del plan contratado",
    modulo: "transversal",
    descripcion: "Mensajes, usuarios, almacenamiento y ejecuciones frente a lo incluido en el plan.",
    formato: "PDF",
    frecuencia: "Mensual",
    ultimaGeneracion: "2026-08-01 06:00",
    destinatarios: ["administracion@pqrslab.com"],
    activo: true,
  },
]

export const formatoMeta: Record<Reporte["formato"], { color: string; bg: string }> = {
  PDF: { color: "#dc2626", bg: "#fee2e2" },
  Excel: { color: "#059669", bg: "#d1fae5" },
  CSV: { color: "#64748b", bg: "#f1f5f9" },
}
