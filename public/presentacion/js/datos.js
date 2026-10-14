/* ─────────────────────────────────────────────
   Los ocho módulos de ConceptOS

   Hito 1 es lo que está en producción; Hito 2 es
   alcance proyectado. Los textos de esta lista
   son los que se ven en pantalla: para cambiar el
   discurso de la presentación, se edita aquí.
───────────────────────────────────────────── */

export const MARCA = {
  nombre: "ConceptOS",
  lema: "Ocho módulos que operan como un solo organismo",
  entrada:
    "Lo que entra por un canal queda disponible en todos los demás: una respuesta a una campaña abre una conversación, un crédito desembolsado dispara una encuesta, una mora detectada lanza un preventivo de pago.",
}

export const HITOS = {
  1: { nombre: "Hito 1", estado: "En producción", color: "var(--cian)" },
  2: { nombre: "Hito 2", estado: "Proyectado", color: "var(--verde)" },
}

export const MODULOS = [
  {
    id: "pqrsf",
    corto: "PQRSDF",
    hito: 1,
    orden: "Módulo 01",
    rotulo: "PQRSDF",
    titulo: "Gestión Integral de PQRSF",
    subtitulo: "Peticiones, quejas, reclamos, sugerencias, denuncias y felicitaciones",
    resumen:
      "Acompaña al ciudadano desde el primer contacto hasta la respuesta de fondo, con el término legal siempre a la vista.",
    capacidades: [
      ["Radicación multicanal", "Portal web, correo, línea telefónica y atención presencial llegan a una misma bandeja."],
      ["Formularios propios", "Se diseñan y publican desde el módulo, con campos condicionales y encuestas de satisfacción."],
      ["Buzones conectados", "Cuentas de Microsoft y Google con reglas de clasificación que convierten el correo en radicado."],
      ["SLA por categoría", "Cada tipo de solicitud con su tiempo propio y la bandeja priorizada por vencimiento."],
      ["Estados a la medida", "El flujo de estados del radicado se configura por organización."],
      ["Trazabilidad completa", "Historial de seguimiento, responsable, dependencia y respuesta enviada."],
    ],
    conexion:
      "Se integra nativamente con Flujos de Trabajo: cuando ingresa una petición, la plataforma ya sabe qué hacer y la asigna al asesor indicado. El trabajo llega priorizado, nadie tiene que buscar qué gestionar.",
    conecta: ["flujos", "individuales", "dashboard"],
  },
  {
    id: "individuales",
    corto: "Envíos Individuales",
    hito: 1,
    orden: "Módulo 02",
    rotulo: "Envíos Individuales",
    titulo: "Bandeja Omnicanal",
    subtitulo: "Atención uno a uno por WhatsApp, Instagram y SMS",
    resumen: "Convierte todas las voces del cliente en una sola conversación continua, sin importar por dónde escribió.",
    capacidades: [
      ["Una sola bandeja", "WhatsApp, Instagram, SMS y canales web con el historial completo del ciudadano."],
      ["Contexto a la vista", "Radicado asociado, productos, campañas y conversaciones anteriores en la misma pantalla."],
      ["Plantillas de Meta", "Mensajes aprobados que se llenan solos con los datos del caso."],
      ["Transferencias con SLA", "El caso cambia de asesor con nota interna y tiempo máximo de aceptación."],
      ["Cierre tipificado", "Categoría, motivo, resultado y calificación quedan registrados en cada conversación."],
      ["Canal autorizado", "Se respeta el medio por el que el cliente aceptó ser contactado (Ley 2300)."],
    ],
    conexion:
      "Cuando alguien responde una campaña masiva, la plataforma transfiere la conversación a este canal individual con todo el historial previo: ventas, quejas y cobros en una sola pantalla.",
    conecta: ["masivos", "pqrsf", "cobranza"],
  },
  {
    id: "masivos",
    corto: "Envíos Masivos",
    hito: 1,
    orden: "Módulo 03",
    rotulo: "Envíos Masivos",
    titulo: "Envíos Masivos y Campañas",
    subtitulo: "Mensajería a audiencias segmentadas",
    resumen: "Conecta con miles de clientes internos y externos al instante, con el cumplimiento normativo resuelto.",
    capacidades: [
      ["Cuatro canales", "WhatsApp, SMS, correo y notificaciones push desde una misma campaña."],
      ["Audiencias segmentadas", "Segmentos por reglas, importación de bases con mapeo de columnas y control de duplicados."],
      ["Plantillas por canal", "Se arman paso a paso y se ven tal como las recibe el ciudadano."],
      ["Consola en vivo", "Avance del envío, ritmo por minuto, bitácora y alertas mientras la campaña corre."],
      ["Informe de resultados", "Embudo, curva horaria, desglose por canal y motivos de falla con su acción sugerida."],
      ["Reglas de contacto", "Franjas horarias y frecuencia controladas automáticamente (Ley 2300)."],
    ],
    conexion:
      "Se alimenta de los demás módulos. Si Gestión Comercial detecta un prospecto que abandonó el proceso, queda la trazabilidad y el motivo; meses después esa base sale perfilada para una campaña de remarketing. Si Cobranza detecta mora, lanza preventivos de pago blindados legalmente.",
    conecta: ["individuales", "cobranza", "comercial"],
  },
  {
    id: "flujos",
    corto: "Flujos de Trabajo",
    hito: 1,
    orden: "Módulo 04",
    rotulo: "Flujos de Trabajo",
    titulo: "IA Orquestadora de Flujos de Trabajo",
    subtitulo: "El motor invisible que mueve la operación",
    resumen: "Distribuye la carga del equipo, elimina cuellos de botella y asegura que cada paso se cumpla a tiempo.",
    capacidades: [
      ["Rutas configurables", "Pasos humanos, automáticos, aprobaciones, esperas, condiciones y notificaciones."],
      ["SLA por paso", "Cada etapa con su responsable y su tiempo máximo, y el total del flujo calculado."],
      ["Seguimiento de casos", "En curso, en riesgo, vencidos y bloqueados, con desvíos y acciones sugeridas."],
      ["Mi trabajo", "Cada persona ve sus tareas del día con lista de verificación y adjuntos."],
      ["Cargas del equipo", "Ocupación por asesor, alertas de sobrecarga y reasignación en un clic."],
      ["Metas por usuario", "Objetivos comerciales y operativos con medición de rendimiento."],
    ],
    conexion:
      "Es el puente entre procesos. Si se aprueba un crédito en Gestión Comercial y se desembolsa, este flujo dispara la encuesta de satisfacción sin que nadie intervenga.",
    conecta: ["pqrsf", "comercial", "dashboard"],
  },
  {
    id: "dashboard",
    corto: "Dashboard 360°",
    hito: 1,
    orden: "Módulo 05",
    rotulo: "Dashboard & Panel 360°",
    titulo: "Dashboard y Panel 360°",
    subtitulo: "El pulso del negocio y la radiografía del cliente",
    resumen: "Reúne los indicadores de todos los módulos y muestra el ciclo de vida completo de cada persona.",
    capacidades: [
      ["Indicadores transversales", "Casos gestionados, cumplimiento de SLA, tiempos de respuesta y costo de mensajería."],
      ["Detalle por módulo", "Cada módulo aporta sus cifras al mismo tablero, con alertas consolidadas."],
      ["Metas y semáforo", "Una meta por indicador, con responsable y estado de cumplimiento."],
      ["Reportes programados", "Se arman, se exportan y se envían solos en la frecuencia definida."],
      ["Panel 360° del cliente", "Por qué canal entró, quién lo atendió, qué productos tiene y qué ha radicado."],
      ["Consumo del plan", "Mensajes, usuarios, almacenamiento y ejecuciones de cada organización."],
    ],
    conexion:
      "Es el punto donde convergen el usuario y los ocho módulos: absorbe la data de ventas, cobros, PQRSF, conversaciones y campañas, y entrega métricas que solo tienen sentido cuando todo está conectado.",
    conecta: ["pqrsf", "individuales", "masivos", "flujos", "comercial", "cobranza", "conocimiento"],
  },
  {
    id: "comercial",
    corto: "Gestión Comercial",
    hito: 2,
    orden: "Módulo 06",
    rotulo: "Gestión Comercial",
    titulo: "Motor de Originación y Conversión Inteligente",
    subtitulo: "Alcance proyectado · pendiente de diseño",
    resumen: "Cubre de punta a punta el viaje del prospecto, desde la captura hasta la firma del contrato.",
    capacidades: [
      ["Captura en cualquier canal", "El prospecto entra por donde esté y queda perfilado desde el primer contacto."],
      ["Evaluación de riesgo", "Una licuadora de datos que cruza IA, centrales de riesgo y el core del negocio."],
      ["Simulación de producto", "Condiciones y escenarios antes de formalizar."],
      ["Firma electrónica", "Contratación en línea con su trazabilidad."],
      ["Rastro del desistimiento", "Quién abandonó, en qué paso y por qué, para retomarlo después."],
    ],
    conexion:
      "Los casos exitosos detonan flujos de desembolso y encuestas de PQRSF. Los prospectos fríos quedan registrados con su contexto para alimentar Envíos Masivos y hacer remarketing más adelante.",
    conecta: ["flujos", "masivos", "pqrsf", "dashboard"],
  },
  {
    id: "cobranza",
    corto: "Cobranza y Jurídica",
    hito: 2,
    orden: "Módulo 07",
    rotulo: "Cobranza y Jurídica",
    titulo: "Gestión Inteligente de Cobranza y Jurídica",
    subtitulo: "Alcance proyectado",
    resumen: "Protege la salud financiera de la cartera, del cobro preventivo al expediente jurídico.",
    capacidades: [
      ["Cobro preventivo", "Contacto antes del vencimiento, con segmentación dinámica de mora."],
      ["Acuerdos de pago", "Negociación uno a uno y seguimiento de lo pactado."],
      ["Expedientes digitales", "Gestión pre-jurídica, litigios y su documentación."],
      ["Provisiones contables", "El impacto de la cartera reflejado en los libros."],
    ],
    conexion:
      "Se sincroniza con Envíos Masivos para las estrategias de contacto a gran escala respetando la Ley 2300, y usa la Bandeja Omnicanal para llegar a acuerdos uno a uno. Cada paso queda registrado en el Panel 360°.",
    conecta: ["masivos", "individuales", "dashboard"],
  },
  {
    id: "conocimiento",
    corto: "Base de Conocimiento",
    hito: 2,
    orden: "Módulo 08",
    rotulo: "Base de Conocimiento",
    titulo: "Base de Conocimiento",
    subtitulo: "Alcance proyectado · el cerebro de la plataforma",
    resumen: "Un repositorio único con buscador semántico que pone la misma respuesta en manos de toda la empresa.",
    capacidades: [
      ["Repositorio unificado", "Manuales, políticas, guías operativas y respuestas frecuentes en un solo lugar."],
      ["Buscador semántico", "Encuentra por significado, no por palabra exacta."],
      ["Respuestas sugeridas", "El asesor recibe la respuesta correcta mientras atiende."],
      ["Una sola versión de la verdad", "Todas las áreas hablan el mismo idioma."],
    ],
    conexion:
      "Alimenta a toda la empresa: nutre las respuestas automáticas del chatbot, asiste al asesor comercial durante la originación y apoya a los agentes de PQRSF en sus resoluciones.",
    conecta: ["pqrsf", "individuales", "comercial", "dashboard"],
  },
]

export const POR_ID = Object.fromEntries(MODULOS.map((m) => [m.id, m]))

/* Iconos de línea, 24×24, heredan el color del módulo */
export const ICONOS = {
  pqrsf: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>',
  individuales: '<path d="M3 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-5 4V6Z"/><path d="M16 9h3a2 2 0 0 1 2 2v5l-3-2h-3"/>',
  masivos: '<path d="M4 9v6h4l6 4V5L8 9H4Z"/><path d="M18 8a5 5 0 0 1 0 8"/><path d="M21 5a9 9 0 0 1 0 14"/>',
  flujos:
    '<circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="12" cy="18" r="2.6"/><path d="M8.6 6h6.8"/><path d="M6 8.6v3.9a2 2 0 0 0 2 2h2"/><path d="M18 8.6v3.9a2 2 0 0 1-2 2h-2"/>',
  dashboard: '<path d="M4 19a9 9 0 1 1 16 0"/><path d="m12 15 4-5"/><circle cx="12" cy="19" r="1.4"/>',
  comercial: '<path d="M3 17 9 11l4 3 8-8"/><path d="M15 6h6v6"/><path d="M3 21h18"/>',
  cobranza:
    '<path d="M12 3v18"/><path d="M5 7h14"/><path d="m5 7-2.5 6a3 3 0 0 0 5 0L5 7Z"/><path d="m19 7-2.5 6a3 3 0 0 0 5 0L19 7Z"/><path d="M8 21h8"/>',
  conocimiento:
    '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z"/><path d="M9 8h6"/><path d="M9 11.5h4"/>',
}
