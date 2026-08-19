/* ─────────────────────────────────────────────
   Flujos de Trabajo — tipos, catálogos, átomos
   y datos simulados de la fase manual.
───────────────────────────────────────────── */

/* ── Tipos ── */
export type TipoPaso = "humana" | "automatica" | "aprobacion" | "espera" | "condicion" | "notificacion"
export type EstadoFlujo = "Activo" | "Borrador" | "Pausado" | "Archivado"
export type EstadoEjecucion = "En curso" | "En riesgo" | "Vencida" | "Bloqueada" | "Completada"
export type Prioridad = "Alta" | "Media" | "Baja"

export interface PasoFlujo {
  id: string
  nombre: string
  tipo: TipoPaso
  responsable: string
  slaHoras: number
  descripcion: string
  checklist: string[]
  datosSensibles?: boolean
}

export interface Flujo {
  id: string
  nombre: string
  descripcion: string
  disparador: string
  modulo: string
  estado: EstadoFlujo
  version: string
  pasos: PasoFlujo[]
  ejecuciones: number
  cumplimiento: number
  duracionMedia: string
  autor: string
  actualizado: string
}

export interface EventoEjecucion {
  paso: string
  tipo: TipoPaso
  responsable: string
  inicio: string
  fin?: string
  duracion?: string
  slaHoras: number
  estado: "Completado" | "En curso" | "Pendiente" | "Vencido" | "Devuelto"
  nota?: string
}

export interface Ejecucion {
  id: string
  caso: string
  asunto: string
  flujo: string
  flujoId: string
  pasoActual: string
  pasoIdx: number
  totalPasos: number
  responsable: string
  inicio: string
  vence: string
  restanteHoras: number
  estado: EstadoEjecucion
  prioridad: Prioridad
  linea: EventoEjecucion[]
}

export interface ItemChecklist {
  id: string
  texto: string
  hecho: boolean
}

export interface Tarea {
  id: string
  titulo: string
  caso: string
  asunto: string
  flujo: string
  paso: string
  tipo: TipoPaso
  vence: string
  restanteHoras: number
  prioridad: Prioridad
  contexto: string
  anterior?: string
  siguiente?: string
  checklist: ItemChecklist[]
  adjuntos?: { nombre: string; peso: string }[]
  datosSensibles?: boolean
}

export interface Agente {
  id: string
  nombre: string
  rol: string
  capacidad: number
  activas: number
  vencidas: number
  completadasHoy: number
  tiempoMedio: string
  estado: "Disponible" | "Al límite" | "Sobrecargado" | "Ausente"
}

export interface Desvio {
  id: string
  tipo: "retraso" | "falla" | "sobrecarga" | "bloqueo"
  titulo: string
  detalle: string
  caso?: string
  hora: string
  acciones: string[]
}

/* ── Catálogos de estilo ── */
export const tipoPasoMeta: Record<TipoPaso, { label: string; corto: string; color: string; bg: string; border: string }> = {
  humana:       { label: "Tarea humana",   corto: "Humana",     color: "#1E3A8A", bg: "#eff3ff", border: "#c7d7fe" },
  automatica:   { label: "Automática",     corto: "Automática", color: "#0EA5E9", bg: "#e0f2fe", border: "#bae6fd" },
  aprobacion:   { label: "Aprobación",     corto: "Aprobación", color: "#059669", bg: "#d1fae5", border: "#a7f3d0" },
  espera:       { label: "Espera",         corto: "Espera",     color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  condicion:    { label: "Condición",      corto: "Condición",  color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  notificacion: { label: "Notificación",   corto: "Aviso",      color: "#be185d", bg: "#fce7f3", border: "#fbcfe8" },
}

export const estadoFlujoMeta: Record<EstadoFlujo, { bg: string; text: string; dot: string }> = {
  Activo:    { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Borrador:  { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  Pausado:   { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Archivado: { bg: "#f1f5f9", text: "#94a3b8", dot: "#cbd5e1" },
}

export const estadoEjecucionMeta: Record<EstadoEjecucion, { bg: string; text: string; dot: string }> = {
  "En curso":  { bg: "#e0f2fe", text: "#0369a1", dot: "#0EA5E9" },
  "En riesgo": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Vencida:     { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Bloqueada:   { bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  Completada:  { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
}

export const prioridadMeta: Record<Prioridad, { icon: string; color: string }> = {
  Alta:  { icon: "▲", color: "#dc2626" },
  Media: { icon: "●", color: "#d97706" },
  Baja:  { icon: "▼", color: "#059669" },
}

export const estadoAgenteMeta: Record<Agente["estado"], { bg: string; text: string; dot: string }> = {
  Disponible:   { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Al límite":  { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Sobrecargado: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Ausente:      { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
}

export const desvioMeta: Record<Desvio["tipo"], { label: string; color: string; bg: string }> = {
  retraso:    { label: "Retraso",    color: "#d97706", bg: "#fef3c7" },
  falla:      { label: "Falla",      color: "#dc2626", bg: "#fee2e2" },
  sobrecarga: { label: "Sobrecarga", color: "#6d28d9", bg: "#ede9fe" },
  bloqueo:    { label: "Bloqueo",    color: "#0369a1", bg: "#e0f2fe" },
}

/* ── Helpers ── */
export const nf = (n: number) => n.toLocaleString("es-CO")

export function formatoSla(horas: number) {
  const abs = Math.abs(horas)
  const txt = abs < 1 ? `${Math.round(abs * 60)} min` : abs < 24 ? `${Math.round(abs)} h` : `${Math.floor(abs / 24)} d ${Math.round(abs % 24)} h`
  return horas < 0 ? `Vencida ${txt}` : txt
}

export function colorSla(horas: number) {
  if (horas < 0) return "#dc2626"
  if (horas <= 4) return "#ea580c"
  if (horas <= 12) return "#d97706"
  return "#059669"
}

export function slaTotal(pasos: PasoFlujo[]) {
  return pasos.reduce((a, p) => a + p.slaHoras, 0)
}

/* ── Iconografía de paso ── */
export function IconoPaso({ tipo, className = "w-4 h-4" }: { tipo: TipoPaso; className?: string }) {
  const paths: Record<TipoPaso, React.ReactNode> = {
    humana: <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />,
    automatica: <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />,
    aprobacion: <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
    espera: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />,
    condicion: <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />,
    notificacion: <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />,
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      {paths[tipo]}
    </svg>
  )
}

export function EstadoFlujoPill({ estado }: { estado: EstadoFlujo }) {
  const m = estadoFlujoMeta[estado]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 shrink-0"
      style={{ background: m.bg, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
      {estado}
    </span>
  )
}

export function EstadoEjecucionPill({ estado }: { estado: EstadoEjecucion }) {
  const m = estadoEjecucionMeta[estado]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 shrink-0"
      style={{ background: m.bg, color: m.text }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${estado === "En curso" ? "animate-pulse" : ""}`} style={{ background: m.dot }} />
      {estado}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Cadena de pasos — la representación visual
   del flujo, reutilizada en todo el módulo.
───────────────────────────────────────────── */
export function CadenaPasos({
  pasos,
  activo = -1,
  compacta = false,
  conteos,
  onPaso,
}: {
  pasos: PasoFlujo[]
  /** Índice del paso en curso; los anteriores se marcan como completados. */
  activo?: number
  compacta?: boolean
  /** Casos activos detenidos en cada paso, para ver dónde se acumula el trabajo. */
  conteos?: number[]
  onPaso?: (i: number) => void
}) {
  return (
    <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
      {pasos.map((p, i) => {
        const m = tipoPasoMeta[p.tipo]
        const hecho = activo >= 0 && i < activo
        const esActivo = activo === i
        return (
          <div key={p.id} className="flex items-stretch shrink-0">
            {i > 0 && (
              <div className="flex items-center px-1.5 shrink-0">
                <div className="w-4 h-px" style={{ background: hecho || esActivo ? "#1E3A8A" : "#cbd5e1" }} />
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 -ml-1" style={{ color: hecho || esActivo ? "#1E3A8A" : "#cbd5e1" }}>
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {compacta ? (
              <button
                onClick={() => onPaso?.(i)}
                title={`${i + 1}. ${p.nombre} · ${m.label}`}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all"
                style={{
                  background: hecho ? "#1E3A8A" : m.bg,
                  color: hecho ? "#fff" : m.color,
                  borderColor: esActivo ? m.color : "transparent",
                  cursor: onPaso ? "pointer" : "default",
                }}
              >
                {hecho ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <IconoPaso tipo={p.tipo} className="w-3.5 h-3.5" />
                )}
                {conteos && conteos[i] > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white"
                    style={{ background: "#1E3A8A" }}
                  >
                    {conteos[i]}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => onPaso?.(i)}
                className="rounded-xl border-2 bg-white px-3 py-2.5 text-left transition-all shrink-0"
                style={{
                  width: 168,
                  borderColor: esActivo ? m.color : hecho ? "#c7d7fe" : "#e2e8f0",
                  background: esActivo ? m.bg : "#fff",
                  cursor: onPaso ? "pointer" : "default",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: hecho ? "#1E3A8A" : m.bg, color: hecho ? "#fff" : m.color }}
                  >
                    {hecho ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <IconoPaso tipo={p.tipo} className="w-3 h-3" />
                    )}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-300">{String(i + 1).padStart(2, "0")}</span>
                  {p.datosSensibles && (
                    <span title="Maneja datos sensibles" className="ml-auto text-slate-300">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-snug line-clamp-2">{p.nombre}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-slate-400 truncate">{p.responsable}</span>
                  <span className="text-[9px] font-mono font-semibold shrink-0" style={{ color: m.color }}>
                    {p.slaHoras}h
                  </span>
                </div>
                {conteos && (
                  <div
                    className="flex items-center gap-1 mt-2 pt-1.5 border-t"
                    style={{ borderColor: "#f1f5f9" }}
                  >
                    <span
                      className="text-[9px] font-mono font-bold rounded px-1.5 py-0.5"
                      style={
                        conteos[i] > 0
                          ? { background: "#eff3ff", color: "#1E3A8A" }
                          : { background: "#f8fafc", color: "#cbd5e1" }
                      }
                    >
                      {conteos[i]}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {conteos[i] === 1 ? "caso aquí" : "casos aquí"}
                    </span>
                  </div>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Flujos definidos
───────────────────────────────────────────── */
export const mockFlujos: Flujo[] = [
  {
    id: "FLW-001",
    nombre: "Gestión de PQRS estándar",
    descripcion:
      "Ruta base para peticiones, quejas y sugerencias que ingresan por el portal ciudadano o el buzón de correos.",
    disparador: "Radicado creado · Tipo ∈ {Petición, Queja, Sugerencia}",
    modulo: "PQRS",
    estado: "Activo",
    version: "v2.4",
    ejecuciones: 1284,
    cumplimiento: 94.2,
    duracionMedia: "6 d 4 h",
    autor: "Dir. Castro, L.",
    actualizado: "2026-08-09",
    pasos: [
      {
        id: "s1",
        nombre: "Recepción y validación",
        tipo: "automatica",
        responsable: "Sistema PQRS",
        slaHoras: 0.5,
        descripcion: "Se valida que el radicado tenga los campos mínimos y se genera el número consecutivo.",
        checklist: ["Verificar datos del peticionario", "Asignar número de radicado", "Enviar acuse de recibo"],
      },
      {
        id: "s2",
        nombre: "Clasificación del caso",
        tipo: "humana",
        responsable: "Mesa de entrada",
        slaHoras: 4,
        descripcion: "Un analista revisa el contenido y confirma el tipo, la prioridad y la dependencia competente.",
        checklist: ["Leer la solicitud completa", "Confirmar tipo de PQRS", "Definir prioridad", "Seleccionar dependencia"],
        datosSensibles: true,
      },
      {
        id: "s3",
        nombre: "Asignación al responsable",
        tipo: "automatica",
        responsable: "Sistema PQRS",
        slaHoras: 0.25,
        descripcion: "Se reparte el caso al analista de la dependencia con menor carga activa.",
        checklist: ["Consultar carga del equipo", "Asignar analista", "Notificar asignación"],
      },
      {
        id: "s4",
        nombre: "Análisis y proyección de respuesta",
        tipo: "humana",
        responsable: "Analista de dependencia",
        slaHoras: 72,
        descripcion: "El analista estudia el caso, reúne los soportes y redacta el proyecto de respuesta.",
        checklist: [
          "Revisar antecedentes del peticionario",
          "Consultar el área técnica si aplica",
          "Redactar el proyecto de respuesta",
          "Adjuntar los soportes",
        ],
        datosSensibles: true,
      },
      {
        id: "s5",
        nombre: "Revisión y firma",
        tipo: "aprobacion",
        responsable: "Jefe de dependencia",
        slaHoras: 24,
        descripcion: "El jefe valida el contenido jurídico y firma digitalmente la respuesta.",
        checklist: ["Verificar sustento normativo", "Revisar redacción", "Firmar digitalmente"],
      },
      {
        id: "s6",
        nombre: "Notificación al ciudadano",
        tipo: "notificacion",
        responsable: "Sistema PQRS",
        slaHoras: 1,
        descripcion: "Se envía la respuesta por el canal preferido del ciudadano y se cierra el radicado.",
        checklist: ["Enviar respuesta al canal registrado", "Registrar constancia de envío", "Cerrar radicado"],
      },
    ],
  },
  {
    id: "FLW-002",
    nombre: "Reclamo de facturación",
    descripcion:
      "Ruta con verificación contable para reclamos por cobros no reconocidos, con posible generación de nota crédito.",
    disparador: "Radicado creado · Tipo = Reclamo · Dependencia = Facturación",
    modulo: "PQRS",
    estado: "Activo",
    version: "v1.8",
    ejecuciones: 517,
    cumplimiento: 88.6,
    duracionMedia: "8 d 2 h",
    autor: "Coord. Ruiz, M.",
    actualizado: "2026-08-11",
    pasos: [
      {
        id: "s1",
        nombre: "Recepción del reclamo",
        tipo: "automatica",
        responsable: "Sistema PQRS",
        slaHoras: 0.5,
        descripcion: "Ingreso del reclamo y verificación de identidad del titular.",
        checklist: ["Validar identidad", "Generar radicado"],
      },
      {
        id: "s2",
        nombre: "Verificación en cartera",
        tipo: "humana",
        responsable: "Analista de cartera",
        slaHoras: 24,
        descripcion: "Se compara el cobro reclamado contra el estado de cuenta y los movimientos del periodo.",
        checklist: ["Descargar estado de cuenta", "Ubicar el movimiento reclamado", "Determinar el origen del cobro"],
        datosSensibles: true,
      },
      {
        id: "s3",
        nombre: "¿El cobro procede?",
        tipo: "condicion",
        responsable: "Sistema PQRS",
        slaHoras: 0.25,
        descripcion: "Bifurca hacia la nota crédito o hacia la explicación al ciudadano.",
        checklist: ["Evaluar resultado de la verificación"],
      },
      {
        id: "s4",
        nombre: "Elaboración de nota crédito",
        tipo: "humana",
        responsable: "Tesorería",
        slaHoras: 48,
        descripcion: "Se genera el ajuste contable y el soporte para el ciudadano.",
        checklist: ["Registrar el ajuste", "Generar el soporte en PDF", "Actualizar el estado de cuenta"],
        datosSensibles: true,
      },
      {
        id: "s5",
        nombre: "Aprobación de Tesorería",
        tipo: "aprobacion",
        responsable: "Jefe de Tesorería",
        slaHoras: 12,
        descripcion: "Autorización del ajuste antes de comunicarlo.",
        checklist: ["Validar el monto", "Autorizar el ajuste"],
      },
      {
        id: "s6",
        nombre: "Espera de confirmación bancaria",
        tipo: "espera",
        responsable: "Sistema PQRS",
        slaHoras: 24,
        descripcion: "Ventana para que el ajuste se refleje en el core financiero.",
        checklist: ["Confirmar reflejo del ajuste"],
      },
      {
        id: "s7",
        nombre: "Respuesta y cierre",
        tipo: "notificacion",
        responsable: "Sistema PQRS",
        slaHoras: 1,
        descripcion: "Se comunica el resultado con el soporte adjunto y se cierra el reclamo.",
        checklist: ["Adjuntar soporte", "Enviar respuesta", "Cerrar radicado"],
      },
    ],
  },
  {
    id: "FLW-003",
    nombre: "Respuesta de fondo con firma",
    descripcion: "Ruta corta para derechos de petición que exigen respuesta jurídica firmada dentro del término legal.",
    disparador: "Radicado creado · Tipo = Petición · Marca = Derecho de petición",
    modulo: "PQRS",
    estado: "Activo",
    version: "v3.1",
    ejecuciones: 342,
    cumplimiento: 97.1,
    duracionMedia: "4 d 6 h",
    autor: "Dir. Castro, L.",
    actualizado: "2026-08-06",
    pasos: [
      {
        id: "s1",
        nombre: "Radicación y control de términos",
        tipo: "automatica",
        responsable: "Sistema PQRS",
        slaHoras: 0.5,
        descripcion: "Se calcula la fecha límite de ley y se activa la alerta de vencimiento.",
        checklist: ["Calcular término legal", "Activar alerta de vencimiento"],
      },
      {
        id: "s2",
        nombre: "Proyección jurídica",
        tipo: "humana",
        responsable: "Abogado de la dependencia",
        slaHoras: 48,
        descripcion: "Redacción del oficio con sustento normativo.",
        checklist: ["Identificar normativa aplicable", "Redactar el oficio", "Citar los antecedentes"],
        datosSensibles: true,
      },
      {
        id: "s3",
        nombre: "Revisión de la Oficina Jurídica",
        tipo: "aprobacion",
        responsable: "Oficina Jurídica",
        slaHoras: 24,
        descripcion: "Control de legalidad antes de la firma del ordenador.",
        checklist: ["Verificar sustento", "Aprobar o devolver con observaciones"],
      },
      {
        id: "s4",
        nombre: "Firma del ordenador",
        tipo: "aprobacion",
        responsable: "Secretario de despacho",
        slaHoras: 12,
        descripcion: "Firma digital del oficio definitivo.",
        checklist: ["Firmar digitalmente", "Registrar en el consecutivo"],
      },
      {
        id: "s5",
        nombre: "Notificación formal",
        tipo: "notificacion",
        responsable: "Sistema PQRS",
        slaHoras: 2,
        descripcion: "Envío con constancia de notificación y archivo del expediente.",
        checklist: ["Enviar con acuse", "Archivar expediente", "Cerrar radicado"],
      },
    ],
  },
  {
    id: "FLW-004",
    nombre: "Cobranza preventiva 30-60",
    descripcion: "Gestión escalonada de cartera vencida entre 30 y 60 días, con oferta de acuerdo de pago.",
    disparador: "Cartera · Mora ≥ 30 días · Sin acuerdo vigente",
    modulo: "Cobranza",
    estado: "Pausado",
    version: "v1.2",
    ejecuciones: 742,
    cumplimiento: 76.4,
    duracionMedia: "11 d",
    autor: "Coord. Ruiz, M.",
    actualizado: "2026-08-11",
    pasos: [
      {
        id: "s1",
        nombre: "Segmentación de la cartera",
        tipo: "automatica",
        responsable: "Sistema Cobranza",
        slaHoras: 1,
        descripcion: "Se identifican los titulares elegibles y se descartan los que tienen acuerdo vigente.",
        checklist: ["Aplicar filtros de mora", "Excluir acuerdos vigentes"],
        datosSensibles: true,
      },
      {
        id: "s2",
        nombre: "Primer contacto por WhatsApp",
        tipo: "notificacion",
        responsable: "Sistema Envíos",
        slaHoras: 2,
        descripcion: "Recordatorio automático con opción de acuerdo en línea.",
        checklist: ["Enviar plantilla aprobada", "Registrar entrega"],
      },
      {
        id: "s3",
        nombre: "Espera de respuesta",
        tipo: "espera",
        responsable: "Sistema Cobranza",
        slaHoras: 72,
        descripcion: "Ventana de tres días antes de escalar a gestión telefónica.",
        checklist: ["Monitorear respuesta del titular"],
      },
      {
        id: "s4",
        nombre: "Gestión telefónica",
        tipo: "humana",
        responsable: "Asesor de cobranza",
        slaHoras: 24,
        descripcion: "Llamada al titular para negociar el acuerdo de pago.",
        checklist: ["Llamar al titular", "Registrar el resultado", "Ofrecer acuerdo de pago"],
        datosSensibles: true,
      },
      {
        id: "s5",
        nombre: "Formalización del acuerdo",
        tipo: "aprobacion",
        responsable: "Coordinador de cartera",
        slaHoras: 24,
        descripcion: "Aprobación de las condiciones del acuerdo negociado.",
        checklist: ["Validar condiciones", "Aprobar acuerdo", "Enviar soporte al titular"],
      },
    ],
  },
  {
    id: "FLW-005",
    nombre: "Encuesta de satisfacción post-cierre",
    descripcion: "Medición de la percepción del ciudadano dos días después del cierre del radicado.",
    disparador: "Radicado cerrado · Han pasado 48 horas",
    modulo: "Envíos",
    estado: "Borrador",
    version: "v0.3",
    ejecuciones: 0,
    cumplimiento: 0,
    duracionMedia: "—",
    autor: "Lic. Martínez, A.",
    actualizado: "2026-08-12",
    pasos: [
      {
        id: "s1",
        nombre: "Espera de 48 horas",
        tipo: "espera",
        responsable: "Sistema Envíos",
        slaHoras: 48,
        descripcion: "Se deja pasar el tiempo prudente antes de preguntar.",
        checklist: ["Verificar que el radicado siga cerrado"],
      },
      {
        id: "s2",
        nombre: "Envío de la encuesta",
        tipo: "notificacion",
        responsable: "Sistema Envíos",
        slaHoras: 1,
        descripcion: "Se envía la plantilla de encuesta por el canal preferido.",
        checklist: ["Seleccionar canal", "Enviar plantilla"],
      },
      {
        id: "s3",
        nombre: "Recolección de respuestas",
        tipo: "espera",
        responsable: "Sistema Envíos",
        slaHoras: 72,
        descripcion: "Ventana de tres días para que el ciudadano califique.",
        checklist: ["Registrar la calificación"],
      },
      {
        id: "s4",
        nombre: "Revisión de calificaciones bajas",
        tipo: "humana",
        responsable: "Supervisor de calidad",
        slaHoras: 24,
        descripcion: "Las calificaciones de 1 y 2 se revisan una a una para detectar causas.",
        checklist: ["Leer la conversación", "Identificar la causa", "Registrar la acción de mejora"],
      },
    ],
  },
]

/* ─────────────────────────────────────────────
   Ejecuciones en curso
───────────────────────────────────────────── */
export const mockEjecuciones: Ejecucion[] = [
  {
    id: "EJC-4821",
    caso: "PQR-2026-000012",
    asunto: "Solicitud de información sobre predios en zona de expansión",
    flujo: "Gestión de PQRS estándar",
    flujoId: "FLW-001",
    pasoActual: "Análisis y proyección de respuesta",
    pasoIdx: 3,
    totalPasos: 6,
    responsable: "Lic. Martínez, A.",
    inicio: "2026-08-11 09:14",
    vence: "2026-08-14 09:14",
    restanteHoras: 26,
    estado: "En curso",
    prioridad: "Media",
    linea: [
      { paso: "Recepción y validación", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-11 09:14", fin: "2026-08-11 09:16", duracion: "2 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Clasificación del caso", tipo: "humana", responsable: "Mesa de entrada", inicio: "2026-08-11 09:16", fin: "2026-08-11 11:40", duracion: "2 h 24 min", slaHoras: 4, estado: "Completado", nota: "Clasificada como Petición de información, prioridad Media, dependencia Planeación." },
      { paso: "Asignación al responsable", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-11 11:40", fin: "2026-08-11 11:41", duracion: "1 min", slaHoras: 0.25, estado: "Completado", nota: "Asignada a Lic. Martínez, A. por menor carga activa (4 de 8)." },
      { paso: "Análisis y proyección de respuesta", tipo: "humana", responsable: "Lic. Martínez, A.", inicio: "2026-08-11 11:41", slaHoras: 72, estado: "En curso" },
      { paso: "Revisión y firma", tipo: "aprobacion", responsable: "Jefe de dependencia", inicio: "—", slaHoras: 24, estado: "Pendiente" },
      { paso: "Notificación al ciudadano", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 1, estado: "Pendiente" },
    ],
  },
  {
    id: "EJC-4818",
    caso: "PQR-2026-000010",
    asunto: "Reclamo por cobro indebido en factura de acueducto",
    flujo: "Reclamo de facturación",
    flujoId: "FLW-002",
    pasoActual: "Aprobación de Tesorería",
    pasoIdx: 4,
    totalPasos: 7,
    responsable: "Jefe de Tesorería",
    inicio: "2026-08-08 08:20",
    vence: "2026-08-13 08:20",
    restanteHoras: 3,
    estado: "En riesgo",
    prioridad: "Alta",
    linea: [
      { paso: "Recepción del reclamo", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-08 08:20", fin: "2026-08-08 08:21", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Verificación en cartera", tipo: "humana", responsable: "Analista de cartera", inicio: "2026-08-08 08:21", fin: "2026-08-09 10:05", duracion: "1 d 1 h", slaHoras: 24, estado: "Completado", nota: "El cobro corresponde a un ajuste del periodo anterior aplicado a la cuenta equivocada." },
      { paso: "¿El cobro procede?", tipo: "condicion", responsable: "Sistema PQRS", inicio: "2026-08-09 10:05", fin: "2026-08-09 10:05", duracion: "instantáneo", slaHoras: 0.25, estado: "Completado", nota: "Resultado: no procede → ruta de nota crédito." },
      { paso: "Elaboración de nota crédito", tipo: "humana", responsable: "Tesorería", inicio: "2026-08-09 10:05", fin: "2026-08-11 14:30", duracion: "2 d 4 h", slaHoras: 48, estado: "Completado", nota: "Nota crédito NC-4482 por $148.500." },
      { paso: "Aprobación de Tesorería", tipo: "aprobacion", responsable: "Jefe de Tesorería", inicio: "2026-08-11 14:30", slaHoras: 12, estado: "En curso", nota: "Pendiente de autorización desde hace 42 horas." },
      { paso: "Espera de confirmación bancaria", tipo: "espera", responsable: "Sistema PQRS", inicio: "—", slaHoras: 24, estado: "Pendiente" },
      { paso: "Respuesta y cierre", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 1, estado: "Pendiente" },
    ],
  },
  {
    id: "EJC-4805",
    caso: "PQR-2026-000004",
    asunto: "Cobro no reconocido en estado de cuenta",
    flujo: "Reclamo de facturación",
    flujoId: "FLW-002",
    pasoActual: "Verificación en cartera",
    pasoIdx: 1,
    totalPasos: 7,
    responsable: "Analista de cartera",
    inicio: "2026-08-05 07:40",
    vence: "2026-08-12 07:40",
    restanteHoras: -18,
    estado: "Vencida",
    prioridad: "Alta",
    linea: [
      { paso: "Recepción del reclamo", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-05 07:40", fin: "2026-08-05 07:41", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Verificación en cartera", tipo: "humana", responsable: "Analista de cartera", inicio: "2026-08-05 07:41", slaHoras: 24, estado: "Vencido", nota: "Sin movimiento desde el 8 de agosto. El analista reporta falta de acceso al core financiero." },
      { paso: "¿El cobro procede?", tipo: "condicion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 0.25, estado: "Pendiente" },
      { paso: "Elaboración de nota crédito", tipo: "humana", responsable: "Tesorería", inicio: "—", slaHoras: 48, estado: "Pendiente" },
      { paso: "Aprobación de Tesorería", tipo: "aprobacion", responsable: "Jefe de Tesorería", inicio: "—", slaHoras: 12, estado: "Pendiente" },
      { paso: "Espera de confirmación bancaria", tipo: "espera", responsable: "Sistema PQRS", inicio: "—", slaHoras: 24, estado: "Pendiente" },
      { paso: "Respuesta y cierre", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 1, estado: "Pendiente" },
    ],
  },
  {
    id: "EJC-4830",
    caso: "PQR-2026-000015",
    asunto: "Derecho de petición sobre licencias de construcción",
    flujo: "Respuesta de fondo con firma",
    flujoId: "FLW-003",
    pasoActual: "Revisión de la Oficina Jurídica",
    pasoIdx: 2,
    totalPasos: 5,
    responsable: "Oficina Jurídica",
    inicio: "2026-08-12 10:00",
    vence: "2026-08-16 10:00",
    restanteHoras: 62,
    estado: "En curso",
    prioridad: "Alta",
    linea: [
      { paso: "Radicación y control de términos", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-12 10:00", fin: "2026-08-12 10:01", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Proyección jurídica", tipo: "humana", responsable: "Abogado de la dependencia", inicio: "2026-08-12 10:01", fin: "2026-08-13 08:20", duracion: "22 h 19 min", slaHoras: 48, estado: "Completado" },
      { paso: "Revisión de la Oficina Jurídica", tipo: "aprobacion", responsable: "Oficina Jurídica", inicio: "2026-08-13 08:20", slaHoras: 24, estado: "En curso" },
      { paso: "Firma del ordenador", tipo: "aprobacion", responsable: "Secretario de despacho", inicio: "—", slaHoras: 12, estado: "Pendiente" },
      { paso: "Notificación formal", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 2, estado: "Pendiente" },
    ],
  },
  {
    id: "EJC-4827",
    caso: "PQR-2026-000014",
    asunto: "Queja por atención en la sucursal norte",
    flujo: "Gestión de PQRS estándar",
    flujoId: "FLW-001",
    pasoActual: "Revisión y firma",
    pasoIdx: 4,
    totalPasos: 6,
    responsable: "Jefe de dependencia",
    inicio: "2026-08-10 14:05",
    vence: "2026-08-15 14:05",
    restanteHoras: 48,
    estado: "Bloqueada",
    prioridad: "Media",
    linea: [
      { paso: "Recepción y validación", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-10 14:05", fin: "2026-08-10 14:06", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Clasificación del caso", tipo: "humana", responsable: "Mesa de entrada", inicio: "2026-08-10 14:06", fin: "2026-08-10 15:50", duracion: "1 h 44 min", slaHoras: 4, estado: "Completado" },
      { paso: "Asignación al responsable", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-10 15:50", fin: "2026-08-10 15:51", duracion: "1 min", slaHoras: 0.25, estado: "Completado" },
      { paso: "Análisis y proyección de respuesta", tipo: "humana", responsable: "Téc. Vargas, C.", inicio: "2026-08-10 15:51", fin: "2026-08-12 09:30", duracion: "1 d 17 h", slaHoras: 72, estado: "Completado" },
      { paso: "Revisión y firma", tipo: "aprobacion", responsable: "Jefe de dependencia", inicio: "2026-08-12 09:30", slaHoras: 24, estado: "Devuelto", nota: "Devuelto al analista: falta el soporte de la visita a la sucursal." },
      { paso: "Notificación al ciudadano", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 1, estado: "Pendiente" },
    ],
  },
  {
    id: "EJC-4790",
    caso: "PQR-2026-000008",
    asunto: "Queja sobre el estado de la vía en el sector La Floresta",
    flujo: "Gestión de PQRS estándar",
    flujoId: "FLW-001",
    pasoActual: "Notificación al ciudadano",
    pasoIdx: 5,
    totalPasos: 6,
    responsable: "Sistema PQRS",
    inicio: "2026-08-01 08:00",
    vence: "2026-08-08 08:00",
    restanteHoras: 0,
    estado: "Completada",
    prioridad: "Baja",
    linea: [
      { paso: "Recepción y validación", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-01 08:00", fin: "2026-08-01 08:01", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Clasificación del caso", tipo: "humana", responsable: "Mesa de entrada", inicio: "2026-08-01 08:01", fin: "2026-08-01 09:12", duracion: "1 h 11 min", slaHoras: 4, estado: "Completado" },
      { paso: "Asignación al responsable", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-01 09:12", fin: "2026-08-01 09:13", duracion: "1 min", slaHoras: 0.25, estado: "Completado" },
      { paso: "Análisis y proyección de respuesta", tipo: "humana", responsable: "Téc. Vargas, C.", inicio: "2026-08-01 09:13", fin: "2026-08-04 16:40", duracion: "3 d 7 h", slaHoras: 72, estado: "Completado" },
      { paso: "Revisión y firma", tipo: "aprobacion", responsable: "Jefe de dependencia", inicio: "2026-08-04 16:40", fin: "2026-08-05 10:15", duracion: "17 h 35 min", slaHoras: 24, estado: "Completado" },
      { paso: "Notificación al ciudadano", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "2026-08-05 10:15", fin: "2026-08-05 10:17", duracion: "2 min", slaHoras: 1, estado: "Completado" },
    ],
  },
  {
    id: "EJC-4833",
    caso: "PQR-2026-000016",
    asunto: "Solicitud de certificado de residencia",
    flujo: "Gestión de PQRS estándar",
    flujoId: "FLW-001",
    pasoActual: "Clasificación del caso",
    pasoIdx: 1,
    totalPasos: 6,
    responsable: "Mesa de entrada",
    inicio: "2026-08-13 07:30",
    vence: "2026-08-18 07:30",
    restanteHoras: 110,
    estado: "En curso",
    prioridad: "Baja",
    linea: [
      { paso: "Recepción y validación", tipo: "automatica", responsable: "Sistema PQRS", inicio: "2026-08-13 07:30", fin: "2026-08-13 07:31", duracion: "1 min", slaHoras: 0.5, estado: "Completado" },
      { paso: "Clasificación del caso", tipo: "humana", responsable: "Mesa de entrada", inicio: "2026-08-13 07:31", slaHoras: 4, estado: "En curso" },
      { paso: "Asignación al responsable", tipo: "automatica", responsable: "Sistema PQRS", inicio: "—", slaHoras: 0.25, estado: "Pendiente" },
      { paso: "Análisis y proyección de respuesta", tipo: "humana", responsable: "Analista de dependencia", inicio: "—", slaHoras: 72, estado: "Pendiente" },
      { paso: "Revisión y firma", tipo: "aprobacion", responsable: "Jefe de dependencia", inicio: "—", slaHoras: 24, estado: "Pendiente" },
      { paso: "Notificación al ciudadano", tipo: "notificacion", responsable: "Sistema PQRS", inicio: "—", slaHoras: 1, estado: "Pendiente" },
    ],
  },
]

/* ─────────────────────────────────────────────
   Bandeja de tareas del usuario
───────────────────────────────────────────── */
export const mockTareas: Tarea[] = [
  {
    id: "T-9012",
    titulo: "Analizar y proyectar respuesta",
    caso: "PQR-2026-000012",
    asunto: "Solicitud de información sobre predios en zona de expansión",
    flujo: "Gestión de PQRS estándar",
    paso: "Análisis y proyección de respuesta",
    tipo: "humana",
    vence: "2026-08-14 09:14",
    restanteHoras: 26,
    prioridad: "Media",
    contexto:
      "El ciudadano requiere información detallada sobre los predios disponibles en la zona de expansión norte para evaluar posibles inversiones.",
    anterior: "Asignación al responsable · Sistema PQRS",
    siguiente: "Revisión y firma · Jefe de dependencia",
    datosSensibles: true,
    checklist: [
      { id: "c1", texto: "Revisar antecedentes del peticionario", hecho: true },
      { id: "c2", texto: "Consultar el área técnica si aplica", hecho: true },
      { id: "c3", texto: "Redactar el proyecto de respuesta", hecho: false },
      { id: "c4", texto: "Adjuntar los soportes", hecho: false },
    ],
    adjuntos: [{ nombre: "solicitud_original.pdf", peso: "284 KB" }],
  },
  {
    id: "T-9008",
    titulo: "Verificar el cobro en cartera",
    caso: "PQR-2026-000004",
    asunto: "Cobro no reconocido en estado de cuenta",
    flujo: "Reclamo de facturación",
    paso: "Verificación en cartera",
    tipo: "humana",
    vence: "2026-08-12 07:41",
    restanteHoras: -18,
    prioridad: "Alta",
    contexto:
      "La ciudadana reporta un cargo de $312.400 que no reconoce. Requiere revisión del movimiento contra el core financiero.",
    anterior: "Recepción del reclamo · Sistema PQRS",
    siguiente: "¿El cobro procede? · Sistema PQRS",
    datosSensibles: true,
    checklist: [
      { id: "c1", texto: "Descargar estado de cuenta", hecho: true },
      { id: "c2", texto: "Ubicar el movimiento reclamado", hecho: false },
      { id: "c3", texto: "Determinar el origen del cobro", hecho: false },
    ],
  },
  {
    id: "T-9015",
    titulo: "Clasificar el caso entrante",
    caso: "PQR-2026-000016",
    asunto: "Solicitud de certificado de residencia",
    flujo: "Gestión de PQRS estándar",
    paso: "Clasificación del caso",
    tipo: "humana",
    vence: "2026-08-13 11:31",
    restanteHoras: 2,
    prioridad: "Baja",
    contexto: "Radicado nuevo que ingresó por el portal ciudadano y espera clasificación para poder asignarse.",
    anterior: "Recepción y validación · Sistema PQRS",
    siguiente: "Asignación al responsable · Sistema PQRS",
    checklist: [
      { id: "c1", texto: "Leer la solicitud completa", hecho: false },
      { id: "c2", texto: "Confirmar tipo de PQRS", hecho: false },
      { id: "c3", texto: "Definir prioridad", hecho: false },
      { id: "c4", texto: "Seleccionar dependencia", hecho: false },
    ],
  },
  {
    id: "T-9010",
    titulo: "Revisar y firmar la respuesta",
    caso: "PQR-2026-000014",
    asunto: "Queja por atención en la sucursal norte",
    flujo: "Gestión de PQRS estándar",
    paso: "Revisión y firma",
    tipo: "aprobacion",
    vence: "2026-08-14 09:30",
    restanteHoras: 22,
    prioridad: "Media",
    contexto:
      "El proyecto de respuesta fue devuelto al analista por falta del soporte de la visita. Queda pendiente de revisión cuando lo reenvíe.",
    anterior: "Análisis y proyección de respuesta · Téc. Vargas, C.",
    siguiente: "Notificación al ciudadano · Sistema PQRS",
    checklist: [
      { id: "c1", texto: "Verificar sustento normativo", hecho: false },
      { id: "c2", texto: "Revisar redacción", hecho: false },
      { id: "c3", texto: "Firmar digitalmente", hecho: false },
    ],
    adjuntos: [
      { nombre: "proyecto_respuesta_v2.docx", peso: "96 KB" },
      { nombre: "acta_visita_sucursal.pdf", peso: "1,4 MB" },
    ],
  },
  {
    id: "T-9020",
    titulo: "Revisar calificaciones bajas de la semana",
    caso: "CAL-2026-0033",
    asunto: "Encuestas con calificación 1 y 2",
    flujo: "Encuesta de satisfacción post-cierre",
    paso: "Revisión de calificaciones bajas",
    tipo: "humana",
    vence: "2026-08-16 18:00",
    restanteHoras: 80,
    prioridad: "Baja",
    contexto: "Nueve encuestas quedaron por debajo de 3 puntos. Hay que leer cada conversación e identificar la causa.",
    anterior: "Recolección de respuestas · Sistema Envíos",
    checklist: [
      { id: "c1", texto: "Leer la conversación", hecho: false },
      { id: "c2", texto: "Identificar la causa", hecho: false },
      { id: "c3", texto: "Registrar la acción de mejora", hecho: false },
    ],
  },
]

/* ─────────────────────────────────────────────
   Equipo y cargas
───────────────────────────────────────────── */
export const mockAgentes: Agente[] = [
  { id: "a1", nombre: "Ana Martínez", rol: "Analista de dependencia", capacidad: 8, activas: 6, vencidas: 1, completadasHoy: 4, tiempoMedio: "5 h 20 min", estado: "Al límite" },
  { id: "a2", nombre: "Carlos Vargas", rol: "Técnico de infraestructura", capacidad: 8, activas: 9, vencidas: 3, completadasHoy: 2, tiempoMedio: "9 h 05 min", estado: "Sobrecargado" },
  { id: "a3", nombre: "Laura Castro", rol: "Jefe de dependencia", capacidad: 12, activas: 5, vencidas: 0, completadasHoy: 7, tiempoMedio: "2 h 40 min", estado: "Disponible" },
  { id: "a4", nombre: "Mónica Ruiz", rol: "Coordinadora de cartera", capacidad: 10, activas: 4, vencidas: 0, completadasHoy: 5, tiempoMedio: "4 h 10 min", estado: "Disponible" },
  { id: "a5", nombre: "Jorge Peláez", rol: "Analista de cartera", capacidad: 8, activas: 7, vencidas: 2, completadasHoy: 3, tiempoMedio: "11 h 30 min", estado: "Al límite" },
  { id: "a6", nombre: "Sofía Herrera", rol: "Mesa de entrada", capacidad: 15, activas: 0, vencidas: 0, completadasHoy: 0, tiempoMedio: "—", estado: "Ausente" },
]

export const mockDesvios: Desvio[] = [
  {
    id: "d1",
    tipo: "retraso",
    titulo: "Aprobación detenida 42 horas",
    detalle:
      "El paso “Aprobación de Tesorería” del caso PQR-2026-000010 lleva 42 horas sin movimiento y el SLA vence en 3 horas.",
    caso: "PQR-2026-000010",
    hora: "Hace 12 min",
    acciones: ["Recordar al aprobador", "Reasignar a suplente", "Ampliar SLA 12 h"],
  },
  {
    id: "d2",
    tipo: "falla",
    titulo: "Sin acceso al core financiero",
    detalle:
      "El analista reporta que no puede consultar el estado de cuenta desde el 8 de agosto. Hay una ejecución vencida por esta causa.",
    caso: "PQR-2026-000004",
    hora: "Hace 1 h",
    acciones: ["Abrir ticket a Sistemas", "Pausar el flujo", "Reasignar a Cartera"],
  },
  {
    id: "d3",
    tipo: "sobrecarga",
    titulo: "Carlos Vargas por encima de su capacidad",
    detalle: "Tiene 9 tareas activas sobre una capacidad de 8, y 3 de ellas ya están vencidas.",
    hora: "Hace 2 h",
    acciones: ["Redistribuir 2 tareas", "Ver detalle de carga"],
  },
  {
    id: "d4",
    tipo: "bloqueo",
    titulo: "Devolución sin respuesta",
    detalle:
      "El caso PQR-2026-000014 fue devuelto al analista hace 26 horas por falta de soporte y sigue sin reenviarse.",
    caso: "PQR-2026-000014",
    hora: "Hace 3 h",
    acciones: ["Notificar al analista", "Escalar al jefe"],
  },
]
