import { useCurrentFrame } from "remotion"
import DevicePreview from "@/components/shared/DevicePreview"
import EnviosIndividuales from "@/components/individuales/EnviosIndividuales"
import { Bubble, initialChats, mockPlantillas } from "@/components/individuales/EnviosIndividualesData"
import TransferenciaModal from "@/components/individuales/TransferenciaModal"
import { mockTransferencias } from "@/components/individuales/TransferenciasData"
import Capitulo from "../componentes/Capitulo"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import MarcoApp from "../componentes/MarcoApp"
import ModalFlotante from "../componentes/ModalFlotante"
import Pantalla from "../componentes/Pantalla"
import Rotulo from "../componentes/Rotulo"
import { capitulos, duraciones, textos } from "../guion"
import { claves, entrada, flotar, recorrido, salida, tramo } from "../lib/movimiento"
import { acentos } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Envíos Individuales (13 s)

   0–58     capítulo
   30–170   la bandeja de conversaciones; los mensajes salen de la pantalla
   160–300  tres teléfonos con plantillas; el central se llena con datos reales
   285–390  una transferencia cuya espera cruza el SLA
───────────────────────────────────────────── */

const nada = () => {}

const conversacion = initialChats[0]
const mensajes = conversacion.messages.filter((m) => !m.sistema).slice(0, 4)

const plantilla = (id: string) => mockPlantillas.find((p) => p.id === id)!
const telefonos = [
  { plantilla: plantilla("p6"), lado: -1 },
  { plantilla: plantilla("p1"), lado: 0 },
  { plantilla: plantilla("p8"), lado: 1 },
]

const transferencia = mockTransferencias[0]

/** Cuadro en que la plantilla central pasa de variables a datos reales. */
const CON_DATOS = 228

export default function IndividualesEscena() {
  const frame = useCurrentFrame()
  const t = textos.individuales

  const bandeja = recorrido(frame, [
    [30, { x: 800, y: 140, z: -3400, rx: 24, ry: -44, escala: 0.62 }],
    [110, { x: 330, y: 30, z: -220, rx: 7, ry: -16 }, salida],
    [150, { x: 310, y: 20, z: -180, rx: 5, ry: -13 }],
    [205, { x: 760, y: 60, z: -1700, rx: 5, ry: -32 }],
  ])

  const modal = recorrido(frame, [
    [285, { x: 1300, y: 60, z: -1800, rx: 8, ry: -40, escala: 0.8 }],
    [335, { x: 270, y: 40, z: -150, rx: 4, ry: -12 }, salida],
    [390, { x: 250, y: 30, z: -60, rx: 3, ry: -9 }],
  ])

  /* La espera corre hasta superar los 15 minutos del SLA de aceptación */
  const espera = Math.round(claves(frame, [[300, 6], [382, 23]]))

  const onda = tramo(frame, CON_DATOS, CON_DATOS + 26, [0, 1], salida)

  return (
    <Escena
      duracion={duraciones.individuales}
      color={acentos.individuales}
      fondo={<Espacio camara={{ x: Math.sin(frame / 70) * 1.3, y: 0.5, z: 22 - frame * 0.01 }} />}
    >
      <Escenario3D>
        <Plano3D {...bandeja} opacidad={tramo(frame, 30, 44) * (1 - tramo(frame, 175, 205))}>
          <Pantalla brillo={tramo(frame, 60, 130)}>
            <MarcoApp vista="mensajes">
              <EnviosIndividuales />
            </MarcoApp>
          </Pantalla>
        </Plano3D>

        {/* Los mensajes de la conversación salen de la pantalla hacia la cámara */}
        {mensajes.map((m, i) => {
          const sale = tramo(frame, 84 + i * 12, 118 + i * 12, [0, 1], salida)
          const vuela = tramo(frame, 150 + i * 4, 176 + i * 4, [0, 1], entrada)
          return (
            <Plano3D
              key={m.id}
              x={bandeja.x + (m.mine ? 170 : 30) * sale}
              y={-230 + i * 118 + flotar(frame, i * 20, 6)}
              z={bandeja.z + (480 + i * 40) * sale + vuela * 900}
              ry={-10 * sale}
              escala={0.62 + 0.5 * sale}
              opacidad={tramo(frame, 84 + i * 12, 94 + i * 12) * (1 - vuela)}
            >
              <div style={{ width: 560, filter: "drop-shadow(0 20px 40px rgba(14,165,233,0.45))" }}>
                <Bubble msg={m} chatCanal={conversacion.canal} conAcciones={false} />
              </div>
            </Plano3D>
          )
        })}

        {/* Teléfonos con plantillas de cada canal */}
        {telefonos.map(({ plantilla: p, lado }, i) => {
          const llega = 160 + Math.abs(lado) * 10
          const pose = recorrido(frame, [
            [llega, { x: 470 * lado, y: 760, z: lado ? -800 : -600, rx: -30, ry: lado ? -20 * lado : -60, escala: lado ? 1.2 : 1.5 }],
            [llega + 52, { x: 480 * lado, y: lado ? 80 : 60, z: lado ? -260 : 0, rx: 0, ry: lado ? -24 * lado : 0 }, salida],
            [290, { x: 490 * lado, y: lado ? 70 : 50, z: lado ? -240 : 40, rx: 0, ry: lado ? -22 * lado : 6 }],
            [305, { x: 900 * lado, y: -700, z: -500, rx: 30 }, entrada],
          ])
          return (
            <Plano3D key={p.id} {...pose} y={pose.y + flotar(frame, i * 30, 8)} opacidad={tramo(frame, llega, llega + 14) * (1 - tramo(frame, 290, 305))}>
              <div style={{ filter: `drop-shadow(0 40px 60px ${acentos.individuales}55)` }}>
                <DevicePreview
                  canal={p.canal}
                  cuerpo={p.cuerpo}
                  encabezado={p.encabezado ?? ""}
                  pie={p.pie ?? ""}
                  botones={p.botones ?? []}
                  conDatos={lado === 0 && frame >= CON_DATOS}
                />
              </div>
            </Plano3D>
          )
        })}

        {/* Onda de luz cuando la plantilla central toma los datos del caso */}
        {onda > 0 && onda < 1 && (
          <Plano3D y={60} z={60} escala={0.6 + onda * 1.8} opacidad={(1 - onda) * 0.8}>
            <div
              style={{
                width: 520,
                height: 520,
                borderRadius: "50%",
                border: `3px solid ${acentos.individuales}`,
                boxShadow: `0 0 60px ${acentos.individuales}, inset 0 0 60px ${acentos.individuales}`,
              }}
            />
          </Plano3D>
        )}

        <Plano3D {...modal} opacidad={tramo(frame, 285, 300)}>
          <ModalFlotante ancho={1040} alto={780}>
            <TransferenciaModal
              transferencia={{ ...transferencia, esperaMin: espera }}
              onAceptar={nada}
              onRechazar={nada}
              onClose={nada}
            />
          </ModalFlotante>
        </Plano3D>
      </Escenario3D>

      <Capitulo {...capitulos.individuales} color={acentos.individuales} tamano={132} />

      <Rotulo inicio={60} fin={150} {...t.conversaciones} style={{ left: 110, top: 340 }} ancho={620} />
      <Rotulo
        inicio={176}
        fin={290}
        {...t.plantillas}
        centrado
        tamano={48}
        ancho={1500}
        style={{ left: 210, top: 36 }}
      />
      <Rotulo inicio={300} fin={400} {...t.transferencias} style={{ left: 100, top: 360 }} ancho={560} tamano={56} />
    </Escena>
  )
}
