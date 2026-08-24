import { useState } from "react"
import Login from "@/components/auth/Login"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import Panel from "@/components/panel/Panel"
import TableView from "@/components/pqrs/TableView"
import FormNew from "@/components/pqrs/FormNew"
import DetailView from "@/components/pqrs/DetailView"
import EnviosIndividuales from "@/components/individuales/EnviosIndividuales"
import EnviosMasivos from "@/components/masivos/EnviosMasivos"
import FlujosTrabajo from "@/components/flujos/FlujosTrabajo"

export type View =
  | "dashboard"
  | "table"
  | "new"
  | "detail"
  | "mensajes"
  | "masivos"
  | "flujos"

export interface Radicado {
  id: string
  tipo: "Petición" | "Queja" | "Reclamo" | "Sugerencia"
  asunto: string
  descripcion: string
  estado: "Recibido" | "En gestión" | "Resuelto" | "Cerrado" | "Rechazado"
  prioridad: "Alta" | "Media" | "Baja"
  fecha: string
  fechaRespuesta?: string
  peticionario: { nombre: string; cedula: string }
  dependencia: string
  canal: string
  seguimientos: { fecha: string; autor: string; nota: string }[]
}

const initialRadicados: Radicado[] = [
  {
    id: "PQR-2026-000012",
    tipo: "Petición",
    asunto: "Solicitud de información sobre predios en zona de expansión",
    descripcion:
      "Requiero información detallada sobre los predios disponibles en la zona de expansión norte del municipio para evaluar posibles inversiones.",
    estado: "En gestión",
    prioridad: "Media",
    fecha: "2026-07-15",
    peticionario: { nombre: "Andrés Betancur Flórez", cedula: "1035700880" },
    dependencia: "Planeación Municipal",
    canal: "Portal Web",
    seguimientos: [
      {
        fecha: "2026-07-10",
        autor: "Sistema PQRS",
        nota: "Radicado recibido y registrado en el sistema.",
      },
      {
        fecha: "2026-07-31",
        autor: "Lic. Martínez, A.",
        nota: "Asignado a la dependencia de Planeación Municipal para trámite.",
      },
    ],
  },
  {
    id: "PQR-2026-000011",
    tipo: "Queja",
    asunto: "Queja — 1035700880",
    descripcion:
      "Inconformidad con el servicio de atención al ciudadano en la sucursal norte.",
    estado: "Cerrado",
    prioridad: "Media",
    fecha: "2026-07-20",
    fechaRespuesta: "2026-07-31",
    peticionario: {
      nombre: "Dairon Andrés Betancur Flórez Betancur",
      cedula: "1035700880",
    },
    dependencia: "Servicios al Ciudadano",
    canal: "Portal Web",
    seguimientos: [
      {
        fecha: "2026-07-20",
        autor: "Sistema PQRS",
        nota: "Radicado recibido y registrado.",
      },
      {
        fecha: "2026-07-31",
        autor: "Dir. Castro, L.",
        nota: "Caso resuelto y cerrado tras verificación interna.",
      },
    ],
  },
  {
    id: "PQR-2026-000010",
    tipo: "Reclamo",
    asunto: "Reclamo — 1035700880",
    descripcion:
      "Reclamo por cobro indebido en la factura del servicio de acueducto correspondiente al mes de junio de 2026.",
    estado: "Recibido",
    prioridad: "Media",
    fecha: "2026-07-15",
    peticionario: {
      nombre: "Dairon Andrés Betancur Flórez Betancur",
      cedula: "1035700880",
    },
    dependencia: "Empresa de Acueducto",
    canal: "Portal Web",
    seguimientos: [
      {
        fecha: "2026-07-31",
        autor: "Sistema PQRS",
        nota: "Reclamo recibido. Se programó inspección técnica del medidor.",
      },
    ],
  },
  {
    id: "PQR-2026-000008",
    tipo: "Queja",
    asunto: "Ensayo de queja",
    descripcion:
      "Queja sobre el estado de la vía en el sector La Floresta, con baches que generan riesgo para los conductores.",
    estado: "Cerrado",
    prioridad: "Baja",
    fecha: "2026-07-12",
    fechaRespuesta: "2026-07-31",
    peticionario: {
      nombre: "Dairon Andrés Betancur Flórez Betancur",
      cedula: "1035700880",
    },
    dependencia: "Infraestructura Vial",
    canal: "Presencial",
    seguimientos: [
      {
        fecha: "2026-07-30",
        autor: "Sistema PQRS",
        nota: "Queja recibida y registrada.",
      },
      {
        fecha: "2026-07-31",
        autor: "Téc. Vargas, C.",
        nota: "Visita realizada. Intervención programada para la próxima semana.",
      },
    ],
  },
  {
    id: "PQR-2026-000007",
    tipo: "Petición",
    asunto: "Nuevo formulario PQRS — Petición",
    descripcion: "Petición de certificado de residencia para trámite notarial.",
    estado: "Recibido",
    prioridad: "Media",
    fecha: "2026-07-30",
    peticionario: {
      nombre: "Dairon Andrés Betancur Flórez Betancur",
      cedula: "1035700880",
    },
    dependencia: "Registro Civil",
    canal: "Portal Web",
    seguimientos: [
      {
        fecha: "2026-07-30",
        autor: "Sistema PQRS",
        nota: "Petición recibida y en cola de asignación.",
      },
    ],
  },
  {
    id: "PQR-2026-000006",
    tipo: "Petición",
    asunto: "Nuevo formulario PQRS — Petición",
    descripcion:
      "Solicitud de historia clínica en el centro de salud municipal.",
    estado: "Recibido",
    prioridad: "Media",
    fecha: "2026-07-30",
    peticionario: {
      nombre: "Dairon Andrés Betancur Flórez Betancur",
      cedula: "1035700880",
    },
    dependencia: "Secretaría de Salud",
    canal: "Portal Web",
    seguimientos: [
      {
        fecha: "2026-07-30",
        autor: "Sistema PQRS",
        nota: "Petición recibida.",
      },
    ],
  },
  {
    id: "PQR-2026-000005",
    tipo: "Queja",
    asunto: "Nuevo ensayo del caso",
    descripcion:
      "Queja por demora en la expedición de licencia de construcción para vivienda de interés social.",
    estado: "Recibido",
    prioridad: "Media",
    fecha: "2026-07-30",
    peticionario: { nombre: "Dairon Betancur", cedula: "1010010101" },
    dependencia: "Planeación Municipal",
    canal: "Correo Electrónico",
    seguimientos: [
      { fecha: "2026-07-30", autor: "Sistema PQRS", nota: "Queja recibida." },
    ],
  },
  {
    id: "PQR-2026-000004",
    tipo: "Queja",
    asunto: "Cobro no reconocido",
    descripcion:
      "Se reporta cobro en estado de cuenta que el ciudadano no reconoce como propio. Solicita revisión urgente.",
    estado: "Recibido",
    prioridad: "Alta",
    fecha: "2026-07-01",
    peticionario: { nombre: "Ana Sofia", cedula: "1020304050" },
    dependencia: "Hacienda Municipal",
    canal: "Línea 195",
    seguimientos: [
      {
        fecha: "2026-07-30",
        autor: "Sistema PQRS",
        nota: "Queja registrada como prioritaria.",
      },
    ],
  },
]

export default function App() {
  const [view, setView] = useState<View>("dashboard")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [radicados, setRadicados] = useState<Radicado[]>(initialRadicados)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [autenticado, setAutenticado] = useState(false)

  const selected = radicados.find((r) => r.id === selectedId) ?? null

  const openDetail = (id: string) => {
    setSelectedId(id)
    setView("detail")
  }

  const addRadicado = (r: Radicado) => {
    setRadicados((prev) => [r, ...prev])
    setSelectedId(r.id)
    setView("detail")
  }

  /* Al cerrar sesion se vuelve al acceso y el panel queda como vista de entrada */
  const cerrarSesion = () => {
    setAutenticado(false)
    setView("dashboard")
    setSelectedId(null)
  }

  if (!autenticado) return <Login onIngresar={() => setAutenticado(true)} />

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#F8FAFC] entra"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Sidebar view={view} setView={setView} collapsed={sidebarCollapsed} onCerrarSesion={cerrarSesion} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          view={view}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          {view === "dashboard" && <Panel setView={setView} />}
          {(view === "table" || view === "new") && (
            <TableView
              radicados={radicados}
              openDetail={openDetail}
              showForm={view === "new"}
              setView={setView}
              onSubmit={addRadicado}
            />
          )}
          {view === "detail" && selected && (
            <DetailView radicado={selected} onBack={() => setView("table")} />
          )}
          {view === "mensajes" && <EnviosIndividuales />}
          {view === "masivos" && <EnviosMasivos />}
          {view === "flujos" && <FlujosTrabajo />}
        </main>
      </div>
    </div>
  )
}
