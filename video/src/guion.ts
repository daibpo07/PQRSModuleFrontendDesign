import { modulos } from "@/components/panel/PanelData"
import tiempos from "./tiempos.json"

/* ─────────────────────────────────────────────
   Guion del video

   Duraciones en cuadros a 30 fps y todos los
   textos en pantalla. Para ajustar el copy basta
   con editar este archivo.

   Los segundos de cada escena viven en
   tiempos.json porque la banda sonora
   (scripts/banda-sonora.mjs) también los lee: si
   cambias una duración, vuelve a generar la
   música para que los golpes sigan en los cortes.
───────────────────────────────────────────── */

export const FPS = 30
export const ANCHO = 1920
export const ALTO = 1080

export const s = (segundos: number) => Math.round(segundos * FPS)

/** Duración de las escenas en cuadros: 80 s en total. */
export const duraciones = {
  intro: s(tiempos.intro.segundos),
  dashboard: s(tiempos.dashboard.segundos),
  pqrs: s(tiempos.pqrs.segundos),
  individuales: s(tiempos.individuales.segundos),
  masivos: s(tiempos.masivos.segundos),
  flujos: s(tiempos.flujos.segundos),
  cierre: s(tiempos.cierre.segundos),
}

export const capitulos = {
  dashboard: {
    numero: "01",
    titulo: "Dashboard",
    descripcion: "Métricas, metas y reportes de todos los módulos en un solo panel.",
  },
  pqrs: { numero: "02", titulo: "PQRSDF", descripcion: modulos.pqrs.descripcion },
  individuales: { numero: "03", titulo: "Envíos Individuales", descripcion: modulos.individuales.descripcion },
  masivos: { numero: "04", titulo: "Envíos Masivos", descripcion: modulos.masivos.descripcion },
  flujos: { numero: "05", titulo: "Flujos de Trabajo", descripcion: modulos.flujos.descripcion },
}

export const textos = {
  intro: {
    lema: "Todos tus canales de atención. Una sola plataforma.",
  },
  dashboard: {
    vista: {
      etiqueta: "Panel de control",
      titulo: "Toda la operación, en una sola vista",
      bajada: "Los indicadores de cada módulo se consolidan en un mismo panel.",
    },
    indicadores: {
      etiqueta: "Indicadores transversales",
      titulo: "Cada cifra, al día",
    },
    modulos: {
      etiqueta: "Módulos contratados",
      titulo: "Cuatro módulos que trabajan como uno",
    },
    cierre: {
      etiqueta: "Metas, SLA y reportes",
      titulo: "Decisiones con datos, no con suposiciones",
    },
  },
  pqrs: {
    radicacion: {
      etiqueta: "Radicación",
      titulo: "Cada solicitud con su SLA a la vista",
      bajada: "Portal web, correo, línea telefónica y atención presencial en una misma bandeja.",
    },
    seguimiento: {
      etiqueta: "Seguimiento",
      titulo: "Del radicado a la respuesta, sin perder el hilo",
    },
    reglas: {
      etiqueta: "Buzones y configuración",
      titulo: "Correos que llegan como radicados y SLA a tu medida",
    },
  },
  individuales: {
    conversaciones: {
      etiqueta: "Conversaciones",
      titulo: "Cada conversación, en un solo lugar",
      bajada: "WhatsApp, Instagram y SMS con el radicado y el historial de cada ciudadano.",
    },
    plantillas: {
      etiqueta: "Plantillas",
      titulo: "Mensajes listos, con los datos de cada caso",
    },
    transferencias: {
      etiqueta: "Transferencias",
      titulo: "Casos que cambian de asesor sin perder el SLA",
    },
  },
  masivos: {
    campanas: {
      etiqueta: "Campañas",
      titulo: "Miles de mensajes, una sola campaña",
      bajada: "WhatsApp, SMS, correo y notificaciones push para audiencias segmentadas.",
    },
    envio: {
      etiqueta: "Envío en vivo",
      titulo: "Sigue cada envío en tiempo real",
    },
    informe: {
      etiqueta: "Informe de campaña",
      titulo: "Entregas, lecturas y respuestas, medidas",
    },
  },
  flujos: {
    rutas: {
      etiqueta: "Rutas de trabajo",
      titulo: "Cada caso sigue su ruta, paso a paso",
      bajada: "Tareas humanas, automáticas, aprobaciones y esperas en un mismo flujo.",
    },
    ejecucion: {
      etiqueta: "Flujo en ejecución",
      titulo: "Cada paso con su responsable y su SLA",
    },
    equipo: {
      etiqueta: "Seguimiento y equipo",
      titulo: "Riesgos de SLA y cargas del equipo, a tiempo",
    },
  },
  cierre: {
    lema: "Cada organización, con los módulos que necesita.",
  },
}
