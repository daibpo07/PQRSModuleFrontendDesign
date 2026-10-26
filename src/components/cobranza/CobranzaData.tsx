/* ─────────────────────────────────────────────
   Cobranza y Jurídica

   Tres relojes gobiernan este módulo y ninguno
   es decorativo:

   · Ley 2300 de 2023 — cuándo se puede llamar y
     cuántas veces. Incumplirla es una sanción,
     no un regaño.
   · Prescripción — cuándo la obligación deja de
     ser cobrable judicialmente.
   · Tasa de usura — el techo que ningún acuerdo
     puede pasar.
───────────────────────────────────────────── */

export const HOY = "2026-10-26"

/* ═════════ Marco normativo ═════════ */

/** Tasa de usura certificada por la Superintendencia Financiera, en efectivo anual. */
export const TASA_USURA = 24.85

/** El interés moratorio no puede exceder 1,5 veces el bancario corriente. */
export const FACTOR_MORATORIO = 1.5

/**
 * Franjas en que la Ley 2300 de 2023 permite contactar al deudor.
 * Domingos y festivos quedan fuera por completo.
 */
export const franjasLey2300: Record<number, { desde: string; hasta: string } | null> = {
  0: null,                                  // domingo
  1: { desde: "07:00", hasta: "19:00" },
  2: { desde: "07:00", hasta: "19:00" },
  3: { desde: "07:00", hasta: "19:00" },
  4: { desde: "07:00", hasta: "19:00" },
  5: { desde: "07:00", hasta: "19:00" },
  6: { desde: "08:00", hasta: "15:00" },    // sábado
}

/** Comunicaciones de cobro permitidas por semana y por deudor. */
export const TOPE_CONTACTOS_SEMANA = 1

/* ═════════ Tipos ═════════ */

export type EstadoObligacion =
  | "Al día"
  | "Mora temprana"
  | "Mora media"
  | "Mora tardía"
  | "Prejurídico"
  | "Jurídico"
  | "Acuerdo vigente"
  | "Pagada"

export type ColaGestion = "autogestion" | "asesor" | "juridica"
export type Riesgo = "A" | "B" | "C" | "D" | "E"

export interface Obligacion {
  id: string
  producto: string
  capital: number
  intereses: number
  moratorios: number
  honorarios: number
  diasMora: number
  cuotasVencidas: number
  tasaCorriente: number
  desembolso: string
  /** Fecha de la última cuota vencida: de aquí arranca la prescripción. */
  ultimoVencimiento: string
  estado: EstadoObligacion
}

export interface Gestion {
  id: string
  fecha: string
  hora: string
  canal: "Llamada" | "WhatsApp" | "SMS" | "Correo" | "Visita" | "Autogestión"
  asesor: string
  resultado:
    | "Promesa de pago"
    | "Acuerdo firmado"
    | "No contesta"
    | "Renuente"
    | "Número errado"
    | "Pago registrado"
    | "Sin respuesta"
  nota?: string
  grabacion?: { id: string; duracion: string }
}

export type EstadoAcuerdo = "Borrador" | "En aprobación" | "Enviado" | "Firmado" | "Incumplido" | "Cumplido"

export interface Acuerdo {
  id: string
  fecha: string
  saldoNegociado: number
  inicial: number
  cuotas: number
  valorCuota: number
  tasa: number
  estado: EstadoAcuerdo
  vence?: string
  aprobadoPor?: string
  /** El PDF sale cifrado con la cédula del deudor como clave. */
  pdfCifrado: boolean
  cuotasPagadas: number
}

export interface Pago {
  id: string
  fecha: string
  hora: string
  valor: number
  medio: "PSE" | "Botón de pago" | "Corresponsal" | "Caja" | "Transferencia"
  aplicadoA: string
  comision: number
  /** El pago en línea detiene la gestión en curso. */
  detuvoGestion: boolean
}

export interface Documento {
  id: string
  nombre: string
  tipo: "Pagaré" | "Acuerdo" | "Certificación" | "Cédula" | "Demanda" | "Notificación"
  fecha: string
  peso: string
}

export type EtapaProcesal =
  | "Preparación"
  | "Radicada"
  | "Mandamiento de pago"
  | "Notificación"
  | "Medidas cautelares"
  | "Sentencia"
  | "Terminado"

export interface Actuacion {
  fecha: string
  etapa: EtapaProcesal
  texto: string
  /** true cuando la leyó el robot en la Rama Judicial y no una persona. */
  porRpa: boolean
}

export interface Expediente {
  radicado: string
  juzgado: string
  ciudad: string
  tipoProceso: string
  etapa: EtapaProcesal
  apoderado: string
  cuantia: number
  radicacion: string
  medidas: string[]
  actuaciones: Actuacion[]
  rpa: { ultimaSync: string; estado: "Sincronizado" | "Desactualizado" | "Sin respuesta" }
  /** Días sin actuación: un proceso quieto es un proceso que se cae. */
  diasSinActuacion: number
}

export interface Deudor {
  id: string
  nombre: string
  tipoDocumento: "CC" | "NIT" | "CE"
  documento: string
  correo: string
  telefono: string
  telefonoAlterno?: string
  municipio: string
  departamento: string
  direccion?: string
  ocupacion?: string
  riesgo: Riesgo
  /** Propensión de pago estimada, 0 a 100. Define la cola del triage. */
  score: number
  cola: ColaGestion
  asesor?: string
  etiquetas: string[]
  obligaciones: Obligacion[]
  gestiones: Gestion[]
  acuerdos: Acuerdo[]
  pagos: Pago[]
  documentos: Documento[]
  expediente?: Expediente
  /* Ley 2300 */
  contactosSemana: number
  canalPreferido: string
  diaPreferido?: string
  noContactar?: boolean
}

/* ═════════ Estilos ═════════ */

export const estadoObligacionEstilo: Record<EstadoObligacion, { bg: string; text: string; dot: string }> = {
  "Al día":          { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Mora temprana":   { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  "Mora media":      { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "Mora tardía":     { bg: "#ffedd5", text: "#9a3412", dot: "#ea580c" },
  Prejurídico:       { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Jurídico:          { bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  "Acuerdo vigente": { bg: "#e0f2fe", text: "#075985", dot: "#0EA5E9" },
  Pagada:            { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
}

export const riesgoEstilo: Record<Riesgo, { color: string; bg: string; label: string }> = {
  A: { color: "#059669", bg: "#d1fae5", label: "Normal" },
  B: { color: "#d97706", bg: "#fef3c7", label: "Aceptable" },
  C: { color: "#ea580c", bg: "#ffedd5", label: "Apreciable" },
  D: { color: "#dc2626", bg: "#fee2e2", label: "Significativo" },
  E: { color: "#7f1d1d", bg: "#fecaca", label: "Incobrable" },
}

export const estadoAcuerdoEstilo: Record<EstadoAcuerdo, { bg: string; text: string; dot: string }> = {
  Borrador:        { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  "En aprobación": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Enviado:         { bg: "#e0f2fe", text: "#075985", dot: "#0EA5E9" },
  Firmado:         { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Incumplido:      { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Cumplido:        { bg: "#ecfdf5", text: "#047857", dot: "#34d399" },
}

export const colaEstilo: Record<ColaGestion, { label: string; color: string; bg: string; descripcion: string }> = {
  autogestion: {
    label: "Autogestión",
    color: "#0EA5E9",
    bg: "#e0f2fe",
    descripcion: "Score alto y mora corta: se recupera solo con un enlace de pago.",
  },
  asesor: {
    label: "Asesor",
    color: "#1E3A8A",
    bg: "#eff3ff",
    descripcion: "Necesita negociación humana para construir un acuerdo.",
  },
  juridica: {
    label: "Jurídica",
    color: "#7c3aed",
    bg: "#ede9fe",
    descripcion: "Mora profunda sin respuesta: pasa a cobro judicial.",
  },
}

/* ═════════ Helpers ═════════ */

export const cop = (n: number) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })

export const copCorto = (n: number) => {
  if (Math.abs(n) >= 1_000_000_000) return `$ ${(n / 1_000_000_000).toFixed(1)} mil M`
  if (Math.abs(n) >= 1_000_000) return `$ ${(n / 1_000_000).toFixed(1)} M`
  if (Math.abs(n) >= 1_000) return `$ ${(n / 1_000).toFixed(0)} mil`
  return `$ ${n}`
}

export const nf = (n: number) => n.toLocaleString("es-CO")

export function iniciales(nombre: string) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase()
}

const paleta = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669", "#d97706", "#0891b2", "#be185d"]
export function colorAvatar(s: string) {
  let n = 0
  for (let i = 0; i < s.length; i++) n = (n + s.charCodeAt(i)) % paleta.length
  return paleta[n]
}

export function saldoObligacion(o: Obligacion) {
  return o.capital + o.intereses + o.moratorios + o.honorarios
}

export function saldoDeudor(d: Deudor) {
  return d.obligaciones.reduce((a, o) => a + saldoObligacion(o), 0)
}

export function moraMaxima(d: Deudor) {
  return d.obligaciones.reduce((a, o) => Math.max(a, o.diasMora), 0)
}

export function diasEntre(desde: string, hasta: string) {
  return Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000)
}

/**
 * Prescripción de la acción cambiaria.
 *
 * El pagaré prescribe a los tres años del vencimiento. Pasada esa fecha
 * la obligación sigue existiendo pero ya no se puede cobrar por la vía
 * ejecutiva, así que el reloj decide cuándo hay que demandar.
 */
export const ANIOS_PRESCRIPCION = 3

export function prescripcion(o: Obligacion, hoy = HOY) {
  const vence = new Date(o.ultimoVencimiento)
  vence.setFullYear(vence.getFullYear() + ANIOS_PRESCRIPCION)
  const fecha = vence.toISOString().slice(0, 10)
  const dias = diasEntre(hoy, fecha)
  const nivel = dias <= 0 ? "prescrita" : dias <= 180 ? "critica" : dias <= 365 ? "atencion" : "holgada"
  const estilo = {
    prescrita: { color: "#7f1d1d", bg: "#fecaca", borde: "#fca5a5" },
    critica:   { color: "#dc2626", bg: "#fef2f2", borde: "#fecaca" },
    atencion:  { color: "#b45309", bg: "#fffbeb", borde: "#fde68a" },
    holgada:   { color: "#047857", bg: "#ecfdf5", borde: "#a7f3d0" },
  }[nivel]
  return { fecha, dias, nivel, ...estilo }
}

/**
 * Semáforo de la Ley 2300.
 *
 * Responde lo único que el asesor necesita saber antes de marcar:
 * ¿puedo llamar a esta persona ahora mismo? Mezcla la franja horaria,
 * el tope semanal y la voluntad del titular de no ser contactado.
 */
export function ley2300(d: Deudor, ahora = new Date("2026-10-26T10:30:00")) {
  const dia = ahora.getDay()
  const franja = franjasLey2300[dia]
  const hhmm = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`

  const restantes = Math.max(0, TOPE_CONTACTOS_SEMANA - d.contactosSemana)

  const siguienteFranja = () => {
    for (let i = 1; i <= 7; i++) {
      const f = franjasLey2300[(dia + i) % 7]
      if (f) {
        const nombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        return `${nombres[(dia + i) % 7]} desde las ${f.desde}`
      }
    }
    return "—"
  }

  if (d.noContactar) {
    return {
      puede: false,
      nivel: "bloqueado" as const,
      motivo: "El titular pidió no ser contactado para gestión de cobro",
      detalle: "Solo se le puede escribir si él inicia el contacto o por un canal que haya autorizado después.",
      restantes: 0,
      color: "#7f1d1d",
      bg: "#fecaca",
      borde: "#fca5a5",
    }
  }

  if (restantes === 0) {
    return {
      puede: false,
      nivel: "tope" as const,
      motivo: "Ya se le contactó esta semana",
      detalle: `La ley permite ${TOPE_CONTACTOS_SEMANA} comunicación de cobro por semana. La siguiente se habilita el lunes.`,
      restantes: 0,
      color: "#dc2626",
      bg: "#fef2f2",
      borde: "#fecaca",
    }
  }

  if (!franja) {
    return {
      puede: false,
      nivel: "fuera" as const,
      motivo: "Hoy no se puede contactar",
      detalle: `Domingos y festivos están fuera de la franja. Próxima ventana: ${siguienteFranja()}.`,
      restantes,
      color: "#b45309",
      bg: "#fffbeb",
      borde: "#fde68a",
    }
  }

  if (hhmm < franja.desde || hhmm > franja.hasta) {
    return {
      puede: false,
      nivel: "fuera" as const,
      motivo: "Fuera de la franja horaria",
      detalle: `Hoy se puede contactar entre ${franja.desde} y ${franja.hasta}.`,
      restantes,
      color: "#b45309",
      bg: "#fffbeb",
      borde: "#fde68a",
    }
  }

  return {
    puede: true,
    nivel: "libre" as const,
    motivo: "Se puede contactar ahora",
    detalle: `Dentro de la franja (${franja.desde}–${franja.hasta}) y queda ${restantes} comunicación esta semana.`,
    restantes,
    color: "#047857",
    bg: "#ecfdf5",
    borde: "#a7f3d0",
  }
}

/* ═════════ Simulador de acuerdos ═════════ */

export interface ReglasNegociacion {
  /** Porcentaje mínimo del saldo que debe abonarse de entrada. */
  inicialMinima: number
  maxCuotas: number
  /** Descuento máximo que el asesor puede dar sin aprobación. */
  descuentoSinAprobacion: number
  descuentoMaximo: number
  cuotaMinima: number
}

export const reglasPorDefecto: ReglasNegociacion = {
  inicialMinima: 10,
  maxCuotas: 24,
  descuentoSinAprobacion: 15,
  descuentoMaximo: 40,
  cuotaMinima: 80_000,
}

export interface Simulacion {
  saldoBase: number
  descuento: number
  saldoNegociado: number
  inicial: number
  financiado: number
  cuotas: number
  tasaEA: number
  valorCuota: number
  totalPagar: number
  alertas: { tipo: "bloqueo" | "aprobacion"; texto: string }[]
}

/**
 * Arma una propuesta de pago y la contrasta con las reglas.
 *
 * Las alertas se separan en dos: lo que bloquea —pasarse de la usura o
 * de los topes de la entidad— y lo que solo necesita que alguien con
 * atribución lo apruebe.
 */
export function simular(
  saldoBase: number,
  descuentoPct: number,
  inicialPct: number,
  cuotas: number,
  tasaEA: number,
  reglas: ReglasNegociacion = reglasPorDefecto,
): Simulacion {
  const descuento = Math.round(saldoBase * (descuentoPct / 100))
  const saldoNegociado = saldoBase - descuento
  const inicial = Math.round(saldoNegociado * (inicialPct / 100))
  const financiado = saldoNegociado - inicial

  /* Cuota fija sobre saldo, con la tasa mensual equivalente de la EA */
  const im = Math.pow(1 + tasaEA / 100, 1 / 12) - 1
  const valorCuota =
    cuotas === 0 || financiado <= 0
      ? 0
      : im === 0
        ? Math.round(financiado / cuotas)
        : Math.round((financiado * im) / (1 - Math.pow(1 + im, -cuotas)))

  const alertas: Simulacion["alertas"] = []

  if (tasaEA > TASA_USURA) {
    alertas.push({
      tipo: "bloqueo",
      texto: `La tasa supera la usura certificada (${TASA_USURA} % EA). El acuerdo sería nulo y expone a sanción penal.`,
    })
  }
  if (inicialPct < reglas.inicialMinima) {
    alertas.push({
      tipo: "bloqueo",
      texto: `La cuota inicial está por debajo del mínimo de la entidad (${reglas.inicialMinima} % del saldo).`,
    })
  }
  if (cuotas > reglas.maxCuotas) {
    alertas.push({ tipo: "bloqueo", texto: `El plazo máximo autorizado es de ${reglas.maxCuotas} cuotas.` })
  }
  if (valorCuota > 0 && valorCuota < reglas.cuotaMinima) {
    alertas.push({
      tipo: "bloqueo",
      texto: `La cuota queda en ${cop(valorCuota)}, por debajo del mínimo operativo de ${cop(reglas.cuotaMinima)}.`,
    })
  }
  if (descuentoPct > reglas.descuentoMaximo) {
    alertas.push({ tipo: "bloqueo", texto: `El descuento máximo permitido es del ${reglas.descuentoMaximo} %.` })
  } else if (descuentoPct > reglas.descuentoSinAprobacion) {
    alertas.push({
      tipo: "aprobacion",
      texto: `Un descuento del ${descuentoPct} % requiere visto bueno del coordinador de cartera.`,
    })
  }

  return {
    saldoBase,
    descuento,
    saldoNegociado,
    inicial,
    financiado,
    cuotas,
    tasaEA,
    valorCuota,
    totalPagar: inicial + valorCuota * cuotas,
    alertas,
  }
}

/* ═════════ Datos de ejemplo ═════════ */

export const mockDeudores: Deudor[] = [
  {
    id: "d1",
    nombre: "Diana Quintero Salazar",
    tipoDocumento: "CC",
    documento: "43567891",
    correo: "diana.quintero@outlook.com",
    telefono: "+57 312 770 4488",
    municipio: "Bello",
    departamento: "Antioquia",
    direccion: "Cl. 50 # 52-18, Niquía",
    ocupacion: "Comerciante",
    riesgo: "B",
    score: 74,
    cola: "asesor",
    asesor: "Camilo Restrepo",
    etiquetas: ["Promesa incumplida", "Buen histórico"],
    contactosSemana: 0,
    canalPreferido: "WhatsApp",
    diaPreferido: "Martes",
    obligaciones: [
      {
        id: "OBL-20481",
        producto: "Crédito de consumo",
        capital: 4_820_000,
        intereses: 318_400,
        moratorios: 96_200,
        honorarios: 0,
        diasMora: 68,
        cuotasVencidas: 2,
        tasaCorriente: 21.4,
        desembolso: "2024-11-15",
        ultimoVencimiento: "2026-08-19",
        estado: "Mora media",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-10-21",
        hora: "10:12",
        canal: "Llamada",
        asesor: "Camilo Restrepo",
        resultado: "Promesa de pago",
        nota: "Se compromete a abonar $1.200.000 el 30 de octubre, cuando le paguen el contrato de la alcaldía.",
        grabacion: { id: "GRB-8841", duracion: "6:42" },
      },
      {
        id: "g2",
        fecha: "2026-10-08",
        hora: "15:40",
        canal: "WhatsApp",
        asesor: "Camilo Restrepo",
        resultado: "Sin respuesta",
      },
      {
        id: "g3",
        fecha: "2026-09-29",
        hora: "09:05",
        canal: "Llamada",
        asesor: "Andrés Peña",
        resultado: "No contesta",
        grabacion: { id: "GRB-8602", duracion: "0:38" },
      },
    ],
    acuerdos: [
      {
        id: "ACU-3312",
        fecha: "2026-08-02",
        saldoNegociado: 5_100_000,
        inicial: 510_000,
        cuotas: 6,
        valorCuota: 812_000,
        tasa: 19.5,
        estado: "Incumplido",
        vence: "2027-02-02",
        aprobadoPor: "Laura Gómez",
        pdfCifrado: true,
        cuotasPagadas: 1,
      },
    ],
    pagos: [
      {
        id: "pg1",
        fecha: "2026-08-20",
        hora: "14:22",
        valor: 812_000,
        medio: "PSE",
        aplicadoA: "ACU-3312 · cuota 1",
        comision: 24_360,
        detuvoGestion: true,
      },
    ],
    documentos: [
      { id: "doc1", nombre: "Pagaré 20481.pdf", tipo: "Pagaré", fecha: "2024-11-15", peso: "412 KB" },
      { id: "doc2", nombre: "Acuerdo ACU-3312 (cifrado).pdf", tipo: "Acuerdo", fecha: "2026-08-02", peso: "198 KB" },
    ],
  },

  {
    id: "d2",
    nombre: "Hernán Villa Zapata",
    tipoDocumento: "CC",
    documento: "8123456",
    correo: "hernan.villa@hotmail.com",
    telefono: "+57 313 901 5560",
    municipio: "Copacabana",
    departamento: "Antioquia",
    ocupacion: "Pensionado",
    riesgo: "A",
    score: 88,
    cola: "autogestion",
    etiquetas: ["Mora corta", "Primer atraso"],
    contactosSemana: 1,
    canalPreferido: "SMS",
    obligaciones: [
      {
        id: "OBL-20902",
        producto: "Tarjeta de crédito",
        capital: 1_240_000,
        intereses: 48_300,
        moratorios: 9_100,
        honorarios: 0,
        diasMora: 18,
        cuotasVencidas: 1,
        tasaCorriente: 23.9,
        desembolso: "2025-06-01",
        ultimoVencimiento: "2026-10-08",
        estado: "Mora temprana",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-10-22",
        hora: "08:00",
        canal: "Autogestión",
        asesor: "Sistema",
        resultado: "Sin respuesta",
        nota: "Se despachó enlace de pago por SMS. Abrió el enlace pero no completó la transacción.",
      },
    ],
    acuerdos: [],
    pagos: [],
    documentos: [{ id: "doc1", nombre: "Pagaré 20902.pdf", tipo: "Pagaré", fecha: "2025-06-01", peso: "388 KB" }],
  },

  {
    id: "d3",
    nombre: "Pedro Ramírez Ocampo",
    tipoDocumento: "CC",
    documento: "71234567",
    correo: "pedro.ramirez@yahoo.es",
    telefono: "+57 301 664 2210",
    municipio: "Rionegro",
    departamento: "Antioquia",
    ocupacion: "Pensionado",
    riesgo: "D",
    score: 22,
    cola: "juridica",
    asesor: "Natalia Suárez",
    etiquetas: ["Prescripción cercana", "Renuente"],
    contactosSemana: 1,
    canalPreferido: "Correo",
    obligaciones: [
      {
        id: "OBL-18220",
        producto: "Crédito de libre inversión",
        capital: 18_400_000,
        intereses: 2_912_000,
        moratorios: 1_486_000,
        honorarios: 2_208_000,
        diasMora: 412,
        cuotasVencidas: 14,
        tasaCorriente: 22.8,
        desembolso: "2023-02-10",
        ultimoVencimiento: "2024-02-20",
        estado: "Jurídico",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-10-20",
        hora: "11:30",
        canal: "Correo",
        asesor: "Natalia Suárez",
        resultado: "Renuente",
        nota: "Responde que no reconoce los honorarios y que se defenderá en el proceso.",
      },
    ],
    acuerdos: [],
    pagos: [],
    documentos: [
      { id: "doc1", nombre: "Pagaré 18220.pdf", tipo: "Pagaré", fecha: "2023-02-10", peso: "455 KB" },
      { id: "doc2", nombre: "Demanda ejecutiva.pdf", tipo: "Demanda", fecha: "2026-05-14", peso: "1,2 MB" },
      { id: "doc3", nombre: "Notificación personal.pdf", tipo: "Notificación", fecha: "2026-07-02", peso: "240 KB" },
    ],
    expediente: {
      radicado: "05001310300520260034100",
      juzgado: "Juzgado 5 Civil del Circuito",
      ciudad: "Medellín",
      tipoProceso: "Ejecutivo singular de mínima cuantía",
      etapa: "Medidas cautelares",
      apoderado: "Natalia Suárez",
      cuantia: 25_006_000,
      radicacion: "2026-05-14",
      medidas: ["Embargo de cuenta de ahorros", "Inscripción de demanda sobre inmueble"],
      diasSinActuacion: 34,
      rpa: { ultimaSync: "2026-10-26 06:00", estado: "Sincronizado" },
      actuaciones: [
        {
          fecha: "2026-09-22",
          etapa: "Medidas cautelares",
          texto: "Se decreta embargo y retención de sumas de dinero depositadas en cuentas del ejecutado.",
          porRpa: true,
        },
        {
          fecha: "2026-07-02",
          etapa: "Notificación",
          texto: "Notificación personal surtida al ejecutado conforme al artículo 291 del CGP.",
          porRpa: true,
        },
        {
          fecha: "2026-06-03",
          etapa: "Mandamiento de pago",
          texto: "Líbrese mandamiento ejecutivo de pago por capital, intereses y costas.",
          porRpa: true,
        },
        { fecha: "2026-05-14", etapa: "Radicada", texto: "Demanda radicada y repartida.", porRpa: false },
      ],
    },
  },

  {
    id: "d4",
    nombre: "Constructora Aurora S.A.S.",
    tipoDocumento: "NIT",
    documento: "901445780-2",
    correo: "contacto@constructoraaurora.co",
    telefono: "+57 604 448 9900",
    municipio: "Medellín",
    departamento: "Antioquia",
    direccion: "Cra. 48 # 12 Sur-70, Oficina 804",
    ocupacion: "Construcción y urbanismo",
    riesgo: "C",
    score: 51,
    cola: "asesor",
    asesor: "Laura Gómez",
    etiquetas: ["Persona jurídica", "Cartera alta"],
    contactosSemana: 0,
    canalPreferido: "Correo",
    obligaciones: [
      {
        id: "OBL-19740",
        producto: "Crédito rotativo empresarial",
        capital: 62_500_000,
        intereses: 7_812_000,
        moratorios: 3_120_000,
        honorarios: 0,
        diasMora: 154,
        cuotasVencidas: 5,
        tasaCorriente: 19.2,
        desembolso: "2025-01-20",
        ultimoVencimiento: "2026-05-25",
        estado: "Mora tardía",
      },
      {
        id: "OBL-19741",
        producto: "Leasing de maquinaria",
        capital: 28_900_000,
        intereses: 2_312_000,
        moratorios: 578_000,
        honorarios: 0,
        diasMora: 61,
        cuotasVencidas: 2,
        tasaCorriente: 18.6,
        desembolso: "2025-03-11",
        ultimoVencimiento: "2026-08-26",
        estado: "Mora media",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-10-23",
        hora: "09:15",
        canal: "Llamada",
        asesor: "Laura Gómez",
        resultado: "Promesa de pago",
        nota: "El gerente financiero pide propuesta de reestructuración a 18 meses sobre las dos obligaciones.",
        grabacion: { id: "GRB-9120", duracion: "14:08" },
      },
    ],
    acuerdos: [
      {
        id: "ACU-3480",
        fecha: "2026-10-24",
        saldoNegociado: 96_000_000,
        inicial: 14_400_000,
        cuotas: 18,
        valorCuota: 5_210_000,
        tasa: 18.0,
        estado: "En aprobación",
        pdfCifrado: true,
        cuotasPagadas: 0,
      },
    ],
    pagos: [],
    documentos: [
      { id: "doc1", nombre: "Pagaré 19740.pdf", tipo: "Pagaré", fecha: "2025-01-20", peso: "520 KB" },
      { id: "doc2", nombre: "Certificación de existencia.pdf", tipo: "Certificación", fecha: "2026-09-02", peso: "310 KB" },
    ],
  },

  {
    id: "d5",
    nombre: "Sandra Ruiz Mejía",
    tipoDocumento: "CC",
    documento: "1098765432",
    correo: "sandra.ruiz@gmail.com",
    telefono: "+57 318 442 0077",
    municipio: "Sabaneta",
    departamento: "Antioquia",
    ocupacion: "Diseñadora",
    riesgo: "A",
    score: 91,
    cola: "autogestion",
    etiquetas: ["Acuerdo al día"],
    contactosSemana: 0,
    canalPreferido: "WhatsApp",
    obligaciones: [
      {
        id: "OBL-21004",
        producto: "Crédito educativo",
        capital: 3_100_000,
        intereses: 186_000,
        moratorios: 0,
        honorarios: 0,
        diasMora: 0,
        cuotasVencidas: 0,
        tasaCorriente: 16.4,
        desembolso: "2025-08-01",
        ultimoVencimiento: "2026-10-15",
        estado: "Acuerdo vigente",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-10-15",
        hora: "09:02",
        canal: "Autogestión",
        asesor: "Sistema",
        resultado: "Pago registrado",
        nota: "Pagó la cuota 3 por botón de pago sin intervención de asesor.",
      },
    ],
    acuerdos: [
      {
        id: "ACU-3401",
        fecha: "2026-08-14",
        saldoNegociado: 3_600_000,
        inicial: 540_000,
        cuotas: 8,
        valorCuota: 412_000,
        tasa: 16.4,
        estado: "Firmado",
        vence: "2027-04-14",
        aprobadoPor: "Camilo Restrepo",
        pdfCifrado: true,
        cuotasPagadas: 3,
      },
    ],
    pagos: [
      {
        id: "pg1",
        fecha: "2026-10-15",
        hora: "09:02",
        valor: 412_000,
        medio: "Botón de pago",
        aplicadoA: "ACU-3401 · cuota 3",
        comision: 12_360,
        detuvoGestion: true,
      },
      {
        id: "pg2",
        fecha: "2026-09-14",
        hora: "18:41",
        valor: 412_000,
        medio: "PSE",
        aplicadoA: "ACU-3401 · cuota 2",
        comision: 12_360,
        detuvoGestion: false,
      },
    ],
    documentos: [
      { id: "doc1", nombre: "Acuerdo ACU-3401 (cifrado).pdf", tipo: "Acuerdo", fecha: "2026-08-14", peso: "186 KB" },
    ],
  },

  {
    id: "d6",
    nombre: "Óscar Betancourt Ruiz",
    tipoDocumento: "CC",
    documento: "70123456",
    correo: "oscar.betancourt@gmail.com",
    telefono: "+57 300 221 8890",
    municipio: "Itagüí",
    departamento: "Antioquia",
    ocupacion: "Conductor",
    riesgo: "E",
    score: 9,
    cola: "juridica",
    asesor: "Natalia Suárez",
    etiquetas: ["No contactar", "Castigada"],
    contactosSemana: 0,
    canalPreferido: "Correo",
    noContactar: true,
    obligaciones: [
      {
        id: "OBL-16002",
        producto: "Crédito de vehículo",
        capital: 34_200_000,
        intereses: 6_156_000,
        moratorios: 4_104_000,
        honorarios: 4_104_000,
        diasMora: 688,
        cuotasVencidas: 23,
        tasaCorriente: 20.1,
        desembolso: "2022-04-18",
        ultimoVencimiento: "2024-12-07",
        estado: "Prejurídico",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-09-30",
        hora: "16:10",
        canal: "Correo",
        asesor: "Natalia Suárez",
        resultado: "Renuente",
        nota: "Radicó solicitud formal de no ser contactado para gestión de cobro. Queda registrado en el expediente.",
      },
    ],
    acuerdos: [],
    pagos: [],
    documentos: [{ id: "doc1", nombre: "Pagaré 16002.pdf", tipo: "Pagaré", fecha: "2022-04-18", peso: "498 KB" }],
    expediente: {
      radicado: "05360310300120260011200",
      juzgado: "Juzgado 1 Civil Municipal",
      ciudad: "Itagüí",
      tipoProceso: "Ejecutivo singular de menor cuantía",
      etapa: "Notificación",
      apoderado: "Natalia Suárez",
      cuantia: 48_564_000,
      radicacion: "2026-08-30",
      medidas: [],
      diasSinActuacion: 71,
      rpa: { ultimaSync: "2026-10-26 06:00", estado: "Desactualizado" },
      actuaciones: [
        {
          fecha: "2026-08-16",
          etapa: "Mandamiento de pago",
          texto: "Mandamiento de pago librado. Pendiente notificación al ejecutado.",
          porRpa: true,
        },
        { fecha: "2026-08-30", etapa: "Radicada", texto: "Demanda radicada y repartida.", porRpa: false },
      ],
    },
  },
  /* El expediente olvidado: la mora es vieja, nadie demandó y el reloj
     de prescripción ya está en rojo. Es el caso que el módulo existe
     para que no vuelva a pasar. */
  {
    id: "d7",
    nombre: "Gloria Mesa Arango",
    tipoDocumento: "CC",
    documento: "32456789",
    correo: "gloria.mesa@gmail.com",
    telefono: "+57 311 505 2240",
    municipio: "Envigado",
    departamento: "Antioquia",
    direccion: "Cl. 38 Sur # 42-11",
    ocupacion: "Independiente",
    riesgo: "D",
    score: 17,
    cola: "juridica",
    asesor: "Natalia Suárez",
    etiquetas: ["Sin gestión efectiva", "Prescripción en rojo"],
    contactosSemana: 0,
    canalPreferido: "Llamada",
    obligaciones: [
      {
        id: "OBL-17310",
        producto: "Crédito de consumo",
        capital: 9_740_000,
        intereses: 1_948_000,
        moratorios: 1_168_000,
        honorarios: 1_461_000,
        diasMora: 956,
        cuotasVencidas: 31,
        tasaCorriente: 21.9,
        desembolso: "2022-09-05",
        ultimoVencimiento: "2024-03-15",
        estado: "Prejurídico",
      },
    ],
    gestiones: [
      {
        id: "g1",
        fecha: "2026-06-11",
        hora: "14:02",
        canal: "Llamada",
        asesor: "Andrés Peña",
        resultado: "No contesta",
        nota: "Cuarto intento sin contacto efectivo. No hay teléfono alterno ni dirección verificada.",
      },
    ],
    acuerdos: [],
    pagos: [],
    documentos: [{ id: "doc1", nombre: "Pagaré 17310.pdf", tipo: "Pagaré", fecha: "2022-09-05", peso: "431 KB" }],
  },
]

/* ═════════ Resultado del triage del día ═════════ */

export interface ReglaTriage {
  id: string
  nombre: string
  condicion: string
  destino: ColaGestion
  obligaciones: number
  saldo: number
  activa: boolean
}

export const reglasTriage: ReglaTriage[] = [
  {
    id: "rt1",
    nombre: "Recordatorio temprano",
    condicion: "Mora menor a 30 días y score mayor a 70",
    destino: "autogestion",
    obligaciones: 1_284,
    saldo: 1_842_000_000,
    activa: true,
  },
  {
    id: "rt2",
    nombre: "Negociación asistida",
    condicion: "Mora entre 30 y 180 días, o saldo mayor a $20 M",
    destino: "asesor",
    obligaciones: 612,
    saldo: 4_206_000_000,
    activa: true,
  },
  {
    id: "rt3",
    nombre: "Acuerdo incumplido",
    condicion: "Acuerdo firmado con dos cuotas vencidas",
    destino: "asesor",
    obligaciones: 88,
    saldo: 721_000_000,
    activa: true,
  },
  {
    id: "rt4",
    nombre: "Escalamiento jurídico",
    condicion: "Mora mayor a 360 días sin gestión efectiva en 90 días",
    destino: "juridica",
    obligaciones: 143,
    saldo: 3_918_000_000,
    activa: true,
  },
  {
    id: "rt5",
    nombre: "Prescripción cercana",
    condicion: "Menos de 180 días para prescribir",
    destino: "juridica",
    obligaciones: 21,
    saldo: 612_000_000,
    activa: true,
  },
  {
    id: "rt6",
    nombre: "Exclusión por Ley 2300",
    condicion: "Titular con solicitud de no contacto vigente",
    destino: "juridica",
    obligaciones: 34,
    saldo: 489_000_000,
    activa: true,
  },
]

export const asesoresCartera = [
  { nombre: "Camilo Restrepo", cuentas: 142, recaudo: 184_200_000, meta: 220_000_000, efectividad: 31 },
  { nombre: "Laura Gómez", cuentas: 98, recaudo: 302_800_000, meta: 280_000_000, efectividad: 38 },
  { nombre: "Andrés Peña", cuentas: 167, recaudo: 121_400_000, meta: 200_000_000, efectividad: 22 },
  { nombre: "Natalia Suárez", cuentas: 54, recaudo: 96_100_000, meta: 90_000_000, efectividad: 44 },
]
