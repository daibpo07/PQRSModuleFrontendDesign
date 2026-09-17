import { useCurrentFrame } from "remotion"
import { initialRadicados, type Radicado } from "@/App"
import BuzonCorreos from "@/components/pqrs/BuzonCorreos"
import Configuracion from "@/components/pqrs/Configuracion"
import DetailView from "@/components/pqrs/DetailView"
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
   Escena · PQRSDF (13 s)

   0–58     capítulo
   30–150   la bandeja de radicados llega; los canales vuelan hacia ella
   150–300  un radicado avanza de Recibido a Resuelto
   270–390  buzones de correo y configuración abiertos en V
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

  const detalle = recorrido(frame, [
    [150, { x: 1250, y: 80, z: -1800, rx: 10, ry: -40, escala: 0.88 }],
    [200, { x: 300, y: 20, z: -100, rx: 4, ry: -10 }, salida],
    [270, { x: 280, y: 10, z: 0, rx: 3, ry: -6 }],
    [305, { x: 240, y: -760, z: -420, rx: -30, ry: 0 }, entrada],
  ])

  const libro = (lado: 1 | -1) =>
    recorrido(frame, [
      [270, { x: 520 * lado, y: 820, z: -600, rx: -50, ry: -28 * lado, escala: 0.68 }],
      [322, { x: 420 * lado, y: 90, z: -250, rx: 0, ry: -23 * lado }, salida],
      [390, { x: 435 * lado, y: 80, z: -150, rx: 0, ry: -21 * lado }],
    ])

  const camara = { z: claves(frame, [[270, 0], [390, 110]]) }
  const insignia = 1 + 0.3 * Math.max(rebote(frame, 186), rebote(frame, 226))

  return (
    <Escena
      duracion={duraciones.pqrs}
      color={acentos.pqrs}
      fondo={<Espacio camara={{ x: Math.sin(frame / 80) * 1.2, y: 0.6, z: 22 - frame * 0.01 }} />}
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

        <Plano3D {...detalle} opacidad={tramo(frame, 150, 164) * (1 - tramo(frame, 290, 305))}>
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

        {([-1, 1] as const).map((lado) => (
          <Plano3D key={lado} {...libro(lado)} opacidad={tramo(frame, 270, 284)}>
            <Lamina
              ancho={1100}
              alto={760}
              desplazamiento={claves(frame, [[322, 0], [385, lado === -1 ? 260 : 200]])}
            >
              {lado === -1 ? <BuzonCorreos /> : <Configuracion />}
            </Lamina>
          </Plano3D>
        ))}
      </Escenario3D>

      <Capitulo {...capitulos.pqrs} color={acentos.pqrs} />

      <Rotulo inicio={60} fin={150} {...t.radicacion} style={{ right: 110, top: 340 }} ancho={620} />
      <Rotulo inicio={172} fin={272} {...t.seguimiento} style={{ left: 110, top: 400 }} ancho={560} tamano={58} />
      <Rotulo
        inicio={292}
        fin={400}
        {...t.reglas}
        centrado
        tamano={52}
        ancho={1500}
        style={{ left: 210, top: 70 }}
      />
    </Escena>
  )
}
