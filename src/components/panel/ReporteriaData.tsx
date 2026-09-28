import type { ModuloId, Reporte } from "./PanelData"

/* ─────────────────────────────────────────────
   Estimación previa y envíos programados

   Dos piezas que resuelven el mismo miedo: pedir
   un reporte enorme sin saberlo. La estimación
   dice cuánto pesa antes de descargarlo; la
   programación evita tener que descargarlo.
───────────────────────────────────────────── */

/* ═════════ Estimación de volumen ═════════ */

/** Filas que el navegador puede recibir en una descarga directa. */
export const LIMITE_DESCARGA_DIRECTA = 1_000_000

/** A partir de aquí contar exacto cuesta más que el reporte: se estima con el plan de consulta. */
export const UMBRAL_EXPLAIN = 5_000_000

/** Lo que tarda el estimador en responder. El compromiso con el usuario son 300 ms. */
export const MS_ESTIMACION = 300

export type VentanaId = "hoy" | "7d" | "30d" | "trimestre" | "anio" | "historico"

export interface Ventana {
  id: VentanaId
  label: string
  descripcion: string
  /** Multiplicador de volumen respecto a la línea base de 30 días. */
  factor: number
}

export const ventanas: Ventana[] = [
  { id: "hoy",       label: "Hoy",              descripcion: "Solo el día en curso",        factor: 0.012 },
  { id: "7d",        label: "Últimos 7 días",   descripcion: "Semana corrida",              factor: 0.23 },
  { id: "30d",       label: "Últimos 30 días",  descripcion: "Mes corrido",                 factor: 1 },
  { id: "trimestre", label: "Último trimestre", descripcion: "90 días",                     factor: 3.1 },
  { id: "anio",      label: "Último año",       descripcion: "365 días",                    factor: 12.6 },
  { id: "historico", label: "Todo el histórico", descripcion: "Desde marzo de 2026",        factor: 41 },
]

/** Volumen de referencia a 30 días por origen. */
const baseMensual: Record<ModuloId | "transversal", number> = {
  transversal: 128_400,
  pqrs: 15_420,
  masivos: 402_800,
  individuales: 38_900,
  flujos: 9_240,
}

export type MetodoEstimacion = "conteo" | "explain"

export interface Estimacion {
  total: number
  metodo: MetodoEstimacion
  /** Margen de error del plan de consulta; solo aplica al método EXPLAIN. */
  margen?: number
  desglose: { modulo: ModuloId | "transversal"; filas: number }[]
  /** Peso aproximado del archivo resultante. */
  bytes: number
  /** Segundos que tardaría la generación completa. */
  segundos: number
  superaDescarga: boolean
  /** Por qué no hay filas, cuando el total es cero. */
  motivoVacio?: string
}

/**
 * Estima cuántas filas devolvería el reporte.
 *
 * Por debajo del umbral se cuenta de verdad. Por encima, un COUNT exacto
 * bloquearía la tabla más tiempo del que dura el reporte, así que se lee
 * el estimado de filas del plan de consulta —el EXPLAIN— y se dice
 * claramente que es aproximado.
 */
export function estimar(reporte: Reporte, ventana: VentanaId, soloAbiertos: boolean): Estimacion {
  const v = ventanas.find(x => x.id === ventana) ?? ventanas[2]
  const bruto = Math.round(baseMensual[reporte.modulo] * v.factor)

  /* Un mensaje despachado nunca queda "en curso": pedir casos abiertos
     sobre Envíos Masivos es un filtro que no puede devolver nada. */
  const filtroImposible = soloAbiertos && reporte.modulo === "masivos"
  const total = filtroImposible ? 0 : soloAbiertos ? Math.round(bruto * 0.18) : bruto

  const metodo: MetodoEstimacion = total >= UMBRAL_EXPLAIN ? "explain" : "conteo"

  /* El desglose solo tiene sentido cuando el reporte cruza varios módulos */
  const desglose =
    reporte.modulo === "transversal"
      ? ([
          { modulo: "masivos" as const, filas: Math.round(total * 0.58) },
          { modulo: "individuales" as const, filas: Math.round(total * 0.21) },
          { modulo: "pqrs" as const, filas: Math.round(total * 0.14) },
          { modulo: "flujos" as const, filas: Math.round(total * 0.07) },
        ])
      : [{ modulo: reporte.modulo, filas: total }]

  const bytesPorFila = reporte.formato === "PDF" ? 420 : reporte.formato === "Excel" ? 180 : 96

  return {
    total,
    metodo,
    margen: metodo === "explain" ? 0.12 : undefined,
    desglose,
    bytes: total * bytesPorFila,
    segundos: Math.max(1, Math.round(total / 24_000)),
    superaDescarga: total > LIMITE_DESCARGA_DIRECTA,
    motivoVacio: filtroImposible
      ? "Envíos Masivos no tiene casos abiertos: un mensaje despachado se entrega o rebota, nunca queda en curso."
      : undefined,
  }
}

/**
 * Si el motor aguanta la consulta.
 *
 * Un histórico completo sobre un origen transversal es justo el caso que
 * satura al estimador en horas pico. El primer intento falla y el reintento
 * entra por la vía barata —EXPLAIN—, que es como se comporta de verdad.
 */
export function saturaElMotor(reporte: Reporte, ventana: VentanaId, intento: number) {
  return intento === 0 && ventana === "historico" && reporte.modulo === "transversal"
}

export function formatoBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`
  return `${(b / 1024 ** 3).toFixed(2)} GB`
}

export function formatoDuracion(s: number) {
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ${s % 60} s`
  return `${Math.floor(m / 60)} h ${m % 60} min`
}

/* ═════════ Envíos programados ═════════ */

export type FrecuenciaEnvio = "Diario" | "Semanal" | "Quincenal" | "Mensual"
export type EstadoEnvio = "Activo" | "Pausado" | "Con error"

/** Lecturas que el modelo puede agregar al correo. Cada una tiene un costo distinto. */
export interface AnalisisIA {
  id: string
  nombre: string
  descripcion: string
}

export const analisisDisponibles: AnalisisIA[] = [
  {
    id: "resumen",
    nombre: "Resumen ejecutivo",
    descripcion: "Tres párrafos con lo que cambió frente al periodo anterior y por qué.",
  },
  {
    id: "desvios",
    nombre: "Detección de desvíos",
    descripcion: "Señala los indicadores que se salieron de su meta y desde cuándo.",
  },
  {
    id: "causas",
    nombre: "Hipótesis de causa",
    descripcion: "Cruza los módulos para proponer a qué se debe cada desvío.",
  },
  {
    id: "acciones",
    nombre: "Acciones sugeridas",
    descripcion: "Propone qué hacer esta semana, ordenado por impacto esperado.",
  },
]

export const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export interface Programacion {
  id: string
  nombre: string
  reporteId: string
  reporteNombre: string
  modulo: ModuloId | "transversal"
  formato: Reporte["formato"]
  frecuencia: FrecuenciaEnvio
  /** Día de la semana (Semanal) o del mes (Quincenal y Mensual). */
  dia: string
  hora: string
  destinatarios: string[]
  asunto: string
  analisis: string[]
  estado: EstadoEnvio
  proximoEnvio: string
  ultimoEnvio?: string
  /** Aperturas del último envío, para saber si a alguien le sirve. */
  aperturas?: { abiertos: number; total: number }
  /** Cuando el estado es "Con error", qué pasó. */
  motivoError?: string
}

export const estadoEnvioEstilo: Record<EstadoEnvio, { bg: string; text: string; dot: string }> = {
  Activo:      { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Pausado:     { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  "Con error": { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
}

export const mockProgramaciones: Programacion[] = [
  {
    id: "p1",
    nombre: "Comité de dirección",
    reporteId: "r1",
    reporteNombre: "Informe ejecutivo consolidado",
    modulo: "transversal",
    formato: "PDF",
    frecuencia: "Mensual",
    dia: "1",
    hora: "06:00",
    destinatarios: ["direccion@pqrslab.com", "gerencia@pqrslab.com"],
    asunto: "Informe ejecutivo · {{mes}} · Pqrslab",
    analisis: ["resumen", "desvios", "acciones"],
    estado: "Activo",
    proximoEnvio: "1 oct 2026 · 06:00",
    ultimoEnvio: "1 sep 2026 · 06:00",
    aperturas: { abiertos: 2, total: 2 },
  },
  {
    id: "p2",
    nombre: "Control interno · términos de ley",
    reporteId: "r2",
    reporteNombre: "Cumplimiento de términos de ley",
    modulo: "pqrs",
    formato: "Excel",
    frecuencia: "Semanal",
    dia: "Lunes",
    hora: "07:00",
    destinatarios: ["controlinterno@pqrslab.com"],
    asunto: "Términos de ley · semana del {{fecha}}",
    analisis: ["desvios"],
    estado: "Activo",
    proximoEnvio: "29 sep 2026 · 07:00",
    ultimoEnvio: "22 sep 2026 · 07:00",
    aperturas: { abiertos: 1, total: 1 },
  },
  {
    id: "p3",
    nombre: "Operación de mensajería",
    reporteId: "r3",
    reporteNombre: "Rendimiento de campañas",
    modulo: "masivos",
    formato: "CSV",
    frecuencia: "Diario",
    dia: "—",
    hora: "08:30",
    destinatarios: ["operaciones@pqrslab.com", "mercadeo@pqrslab.com", "analitica@pqrslab.com"],
    asunto: "Campañas de ayer · entregas y lecturas",
    analisis: [],
    estado: "Pausado",
    proximoEnvio: "—",
    ultimoEnvio: "12 sep 2026 · 08:30",
    aperturas: { abiertos: 1, total: 3 },
  },
  {
    id: "p4",
    nombre: "Carga del equipo de flujos",
    reporteId: "r5",
    reporteNombre: "Carga por responsable",
    modulo: "flujos",
    formato: "PDF",
    frecuencia: "Semanal",
    dia: "Viernes",
    hora: "17:00",
    destinatarios: ["coordinacion@pqrslab.com"],
    asunto: "Carga del equipo · cierre de semana",
    analisis: ["resumen", "causas"],
    estado: "Con error",
    proximoEnvio: "2 oct 2026 · 17:00",
    ultimoEnvio: "19 sep 2026 · 17:00",
    motivoError: "El correo rebotó: coordinacion@pqrslab.com superó su cuota de almacenamiento.",
  },
]

/**
 * Texto de ejemplo del bloque de análisis.
 *
 * En producción lo escribe el modelo sobre las cifras del periodo; aquí
 * sirve para que quien configura el envío vea qué forma tiene lo que va
 * a recibir su director antes de activarlo.
 */
export const analisisDeMuestra: Record<string, { titulo: string; cuerpo: string }> = {
  resumen: {
    titulo: "Resumen ejecutivo",
    cuerpo:
      "El volumen gestionado creció 8,4 % frente al mes anterior y el cumplimiento de SLA se mantuvo en 94,1 %. El crecimiento viene casi todo de Envíos Masivos, que sumó dos campañas de servicio; PQRSDF se mantuvo estable en volumen pero mejoró dos días su tiempo medio de respuesta.",
  },
  desvios: {
    titulo: "Desvíos frente a la meta",
    cuerpo:
      "Dos indicadores están fuera de meta: el tiempo de primera respuesta en Envíos Individuales (4,2 min contra una meta de 3) desde el 9 de septiembre, y las reaperturas de PQRSDF (6,1 % contra 4 %) que llevan tres semanas subiendo.",
  },
  causas: {
    titulo: "Hipótesis de causa",
    cuerpo:
      "La primera respuesta se deterioró en los mismos días en que Masivos despachó las campañas de servicio, lo que sugiere que las respuestas entrantes a esas campañas cayeron sobre un equipo dimensionado para el volumen anterior. Las reaperturas se concentran en Acueducto, donde el paso de ajuste de facturación viene venciendo sin responsable asignado.",
  },
  acciones: {
    titulo: "Acciones sugeridas",
    cuerpo:
      "1) Asignar responsable fijo al paso «Aplicar ajuste» del flujo de facturación: explica la mayor parte de las reaperturas. 2) Reforzar el turno de la tarde los días en que haya campaña programada. 3) Revisar las cuatro plantillas con tasa de respuesta sobre el 30 %: están generando más entrada de la prevista.",
  },
}
