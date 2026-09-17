/* ─────────────────────────────────────────────
   Identidad de marca para el video

   Los colores salen de src/index.css y el logo es
   el mismo icono de la barra lateral de la app.
───────────────────────────────────────────── */

export const marca = {
  nombre: "Herramienta Multi-Tenant",
  /** Parte del nombre que va resaltada con el color de acento. */
  acento: "Multi-Tenant",
  /** Nombre que traen los componentes de la app y que el video reemplaza. */
  nombreEnApp: "Concept CRM",
  /** Iniciales de la marca en los avatares de los teléfonos, y su reemplazo. */
  inicialesEnApp: "CC",
  iniciales: "HM",
  primario: "#1E3A8A",
  primarioLt: "#2d4fa8",
  terciario: "#0EA5E9",
  terciarioLt: "#38bdf8",
  /** Fondo del espacio 3D: el azul de marca llevado casi a negro. */
  fondo: "#030817",
  texto: "#f8fafc",
  textoSuave: "#94a3b8",
}

/**
 * Color de cada capítulo sobre el fondo oscuro. Parten del color del módulo
 * en PanelData, aclarados para que brillen en el espacio.
 */
export const acentos = {
  dashboard: "#38bdf8",
  pqrs: "#7c9cf0",
  individuales: "#34d399",
  masivos: "#22d3ee",
  flujos: "#a78bfa",
}

/** Icono de la barra lateral (viewBox 0 0 20 20, relleno evenodd). */
export const LOGO_PATH =
  "M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.254.716a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.512.878l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z"
