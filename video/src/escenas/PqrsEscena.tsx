import { useCurrentFrame } from "remotion"
import { initialRadicados, type Radicado } from "@/App"
import BuzonCorreos from "@/components/pqrs/BuzonCorreos"
import Configuracion from "@/components/pqrs/Configuracion"
import DetailView from "@/components/pqrs/DetailView"
import FormNew from "@/components/pqrs/FormNew"
import GestionFormularios from "@/components/pqrs/GestionFormularios"
import TableView from "@/components/pqrs/TableView"
import Capitulo from "../componentes/Capitulo"
import Chip3D from "../componentes/Chip3D"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import Lamina from "../componentes/Lamina"
import MarcoApp from "../componentes/MarcoApp"
import Pantalla from "../componentes/Pantalla"
import Rotulo from "../componentes/Rotulo"
import { capitulos, duraciones, textos } from "../guion"
import { claves, entrada, flotar, mezclar, recorrido, salida, tramo } from "../lib/movimiento"
import { acentos } from "../marca"

/* ─────────────────────────────────────────────
   Escena · PQRSDF (20 s)

   0–58     capítulo
   30–150   la bandeja de radicados llega; los canales vuelan hacia ella
   150–300  un radicado avanza de Recibido a Resuelto, con acercamiento
   300–430  formularios de radicación: gestión y formulario público
   430–600  buzones de correo y configuración abiertos en V
───────────────────────────────────────────── */

const nada = () => {}

const canales = [
  { texto: "Portal Web", color: "#38bdf8", desde: { x: -560, y: -330, z: 360 } },
  { texto: "Correo Electrónico", color: "#a78bfa", desde: { x: 520, y: -300, z: 320 } },
  { texto: "Línea 195", color: "#34d399", desde: { x: -540, y: 330, z: 340 } },
  { texto: "Presencial", color: "#fbbf24", desde: { x: 540, y: 340, z: 380 } },
]

const estadoColor: Record<string, string> = {
  Recibido: "#0EA5E9",
  "En gestión": "#f59e0b",
  Resuelto: "#10b981",
}

/* El caso que se sigue: los datos base son los de la app */
const base = initialRadicados.find((r) => r.id === "PQR-2026-000012")!
const respuesta = {
  fecha: "2026-08-02",
  autor: "Planeación Municipal",
  nota: "Respuesta de fondo enviada al ciudadano con el inventario de predios disponibles.",
}

function radicadoEn(frame: number): Radicado {
  if (frame < 186) return { ...base, estado: "Recibido", seguimientos: base.seguimientos.slice(0, 1) }
  if (frame < 226) return { ...base, estado: "En gestión" }
  return { ...base, estado: "Resuelto", fechaRespuesta: respuesta.fecha, seguimientos: [...base.seguimientos, respuesta] }
}

/** Rebote breve cada vez que el estado cambia. */
const rebote = (frame: number, cambio: number) =>
  frame < cambio ? 0 : 1 - tramo(frame, cambio, cambio + 14, [0, 1], salida)

export default function PqrsEscena() {
  const frame = useCurrentFrame()
  const t = textos.pqrs
  const radicado = radicadoEn(frame)

  const tabla = recorrido(frame, [
    [30, { x: -800, y: 140, z: -3400, rx: 24, ry: 44, escala: 0.62 }],
    [110, { x: -330, y: 30, z: -220, rx: 7, ry: 16 }, salida],
    [150, { x: -310, y: 20, z: -180, rx: 5, ry: 13 }],
    [215, { x: -900, y: 40, z: -1700, rx: 4, ry: 36 }],
    [300, { x: -1000, y: 260, z: -2600, rx: 20, ry: 40 }],
  ])
  const opacidadTabla = tramo(frame, 30, 44) * claves(frame, [[150, 1], [215, 0.25], [280, 0.25], [300, 0]])

  /* Al cambiar a Resuelto la cámara se acerca: el estado del proceso queda legible */
  const detalle = recorrido(frame, [
    [150, { x: 1250, y: 80, z: -1800, rx: 10, ry: -40, escala: 0.88 }],
    [200, { x: 300, y: 20, z: -100, rx: 4, ry: -10 }, salida],
    [228, { x: 280, y: 10, z: 0, rx: 3, ry: -6 }],
    [262, { x: 150, y: 210, z: 240, rx: 1, ry: -3, escala: 1 }, salida],
    [292, { x: 140, y: 220, z: 260 }],
    [312, { x: 140, y: -800, z: -420, rx: -30, ry: 0 }, entrada],
  ])

  /* Formularios: la gestión a la izquierda y el formulario que ve el ciudadano a la derecha */
  const formularios = (lado: 1 | -1) =>
    recorrido(frame, [
      [300, { x: 560 * lado, y: 780, z: -700, rx: -44, ry: -26 * lado, escala: 0.66 }],
      [356, { x: 450 * lado, y: 60, z: -220, rx: 0, ry: -22 * lado }, salida],
      [412, { x: 460 * lado, y: 50, z: -170, rx: 0, ry: -20 * lado }],
      [444, { x: 700 * lado, y: -700, z: -900, rx: 22 }, entrada],
    ])

  const libro = (lado: 1 | -1) =>
    recorrido(frame, [
      [430, { x: 520 * lado, y: 820, z: -600, rx: -50, ry: -28 * lado, escala: 0.68 }],
      [486, { x: 420 * lado, y: 90, z: -250, rx: 0, ry: -23 * lado }, salida],
      [600, { x: 435 * lado, y: 80, z: -150, rx: 0, ry: -21 * lado }],
    ])

  const camara = { z: claves(frame, [[430, 0], [600, 110]]) }
  const insignia = 1 + 0.3 * Math.max(rebote(frame, 186), rebote(frame, 226))

  return (
    <Escena
      duracion={duraciones.pqrs}
      color={acentos.pqrs}
      fondo={<Espacio camara={{ x: Math.sin(frame / 80) * 1.2, y: 0.6, z: 22 - frame * 0.006 }} />}
    >
      <Escenario3D camara={camara}>
        <Plano3D {...tabla} opacidad={opacidadTabla}>
          <Pantalla brillo={tramo(frame, 60, 130)}>
            <MarcoApp vista="table">
              <TableView radicados={initialRadicados} openDetail={nada} showForm={false} setView={nada} onSubmit={nada} />
            </MarcoApp>
          </Pantalla>
        </Plano3D>

        {/* Los canales de entrada viajan hasta la bandeja */}
        {canales.map((c, i) => {
          const avance = tramo(frame, 62 + i * 9, 122 + i * 9, [0, 1], entrada)
          return (
            <Plano3D
              key={c.texto}
              x={mezclar(c.desde.x, tabla.x, avance)}
              y={mezclar(c.desde.y, tabla.y, avance)}
              z={mezclar(c.desde.z, tabla.z, avance)}
              escala={mezclar(1.05, 0.35, avance)}
              opacidad={tramo(frame, 62 + i * 9, 74 + i * 9) * (1 - tramo(avance, 0.75, 1))}
            >
              <Chip3D texto={c.texto} color={c.color} />
            </Plano3D>
          )
        })}

        <Plano3D {...detalle} opacidad={tramo(frame, 150, 164) * (1 - tramo(frame, 296, 312))}>
          <Lamina ancho={820} alto={900} desplazamiento={claves(frame, [[228, 0], [264, 330]])}>
            <DetailView radicado={radicado} onBack={nada} />
          </Lamina>
        </Plano3D>

        {/* Insignia de estado que salta en cada cambio */}
        <Plano3D
          x={detalle.x - 610}
          y={-300 + flotar(frame, 0, 10)}
          z={detalle.z + 220}
          ry={detalle.ry}
          escala={insignia}
          opacidad={tramo(frame, 176, 190) * (1 - tramo(frame, 285, 300))}
        >
          <Chip3D texto={radicado.estado} color={estadoColor[radicado.estado]} detalle={radicado.id} tamano={28} />
        </Plano3D>

        {/* Formularios de radicación */}
        <Plano3D {...formularios(-1)} opacidad={tramo(frame, 300, 314) * (1 - tramo(frame, 420, 444))}>
          <Lamina ancho={980} alto={780} desplazamiento={claves(frame, [[360, 0], [415, 190]])}>
            <GestionFormularios />
          </Lamina>
        </Plano3D>
        <Plano3D {...formularios(1)} opacidad={tramo(frame, 306, 320) * (1 - tramo(frame, 420, 444))}>
          <Lamina ancho={860} alto={780}>
            <div className="p-6">
              <FormNew onSubmit={nada} onCancel={nada} />
            </div>
          </Lamina>
        </Plano3D>

        {([-1, 1] as const).map((lado) => (
          <Plano3D key={lado} {...libro(lado)} opacidad={tramo(frame, 430, 444)}>
            <Lamina
              ancho={1100}
              alto={760}
              desplazamiento={claves(frame, [[486, 0], [580, lado === -1 ? 280 : 210]])}
            >
              {lado === -1 ? <BuzonCorreos /> : <Configuracion />}
            </Lamina>
          </Plano3D>
        ))}
      </Escenario3D>

      <Capitulo {...capitulos.pqrs} color={acentos.pqrs} />

      <Rotulo inicio={60} fin={150} {...t.radicacion} style={{ right: 110, top: 340 }} ancho={620} />
      <Rotulo inicio={172} fin={272} {...t.seguimiento} style={{ left: 110, top: 400 }} ancho={560} tamano={58} />
      <Rotulo inicio={322} fin={418} {...t.formularios} centrado tamano={52} ancho={1500} style={{ left: 210, top: 70 }} />
      <Rotulo inicio={452} fin={588} {...t.reglas} centrado tamano={52} ancho={1500} style={{ left: 210, top: 70 }} />
    </Escena>
  )
}
