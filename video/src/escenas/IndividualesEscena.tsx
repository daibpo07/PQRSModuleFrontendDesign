import { useCurrentFrame } from "remotion"
import DevicePreview from "@/components/shared/DevicePreview"
import EnviosIndividuales from "@/components/individuales/EnviosIndividuales"
import { Bubble, initialChats, mockHistorial, mockPlantillas } from "@/components/individuales/EnviosIndividualesData"
import Tipificaciones from "@/components/individuales/Tipificaciones"
import TransferenciaModal from "@/components/individuales/TransferenciaModal"
import Transferencias from "@/components/individuales/Transferencias"
import { mockTransferencias } from "@/components/individuales/TransferenciasData"
import Capitulo from "../componentes/Capitulo"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import Lamina from "../componentes/Lamina"
import MarcoApp from "../componentes/MarcoApp"
import ModalFlotante from "../componentes/ModalFlotante"
import Pantalla from "../componentes/Pantalla"
import Rotulo from "../componentes/Rotulo"
import { capitulos, duraciones, textos } from "../guion"
import { claves, entrada, flotar, recorrido, salida, tramo } from "../lib/movimiento"
import { acentos } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Envíos Individuales (20 s)

   0–58     capítulo
   30–170   la bandeja de conversaciones; los mensajes salen de la pantalla
   160–300  tres teléfonos con plantillas; el central se llena con datos reales
   300–430  cierres tipificados y la bandeja de transferencias
   430–600  una transferencia cuya espera cruza el SLA, con acercamiento
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

  /* Cierre y transferencias: dos vistas de la app abiertas en V */
  const cierre = (lado: 1 | -1) =>
    recorrido(frame, [
      [300, { x: 560 * lado, y: 780, z: -700, rx: -44, ry: -26 * lado, escala: 0.64 }],
      [356, { x: 440 * lado, y: 60, z: -220, rx: 0, ry: -22 * lado }, salida],
      [412, { x: 450 * lado, y: 50, z: -170, rx: 0, ry: -20 * lado }],
      [444, { x: 700 * lado, y: -700, z: -900, rx: 22 }, entrada],
    ])

  /* Al final la cámara se acerca a la transferencia: la nota y el SLA quedan legibles */
  const modal = recorrido(frame, [
    [430, { x: 1300, y: 60, z: -1800, rx: 8, ry: -40, escala: 0.8 }],
    [486, { x: 170, y: 40, z: 20, rx: 3, ry: -9, escala: 0.9 }, salida],
    [560, { x: 80, y: 20, z: 210, rx: 1, ry: -4, escala: 0.95 }, salida],
    [600, { x: 70, y: 15, z: 230 }],
  ])

  /* La espera corre hasta superar los 15 minutos del SLA de aceptación */
  const espera = Math.round(claves(frame, [[460, 6], [580, 23]]))

  const onda = tramo(frame, CON_DATOS, CON_DATOS + 26, [0, 1], salida)

  return (
    <Escena
      duracion={duraciones.individuales}
      color={acentos.individuales}
      fondo={<Espacio camara={{ x: Math.sin(frame / 70) * 1.3, y: 0.5, z: 22 - frame * 0.006 }} />}
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
            [308, { x: 900 * lado, y: -700, z: -500, rx: 30 }, entrada],
          ])
          return (
            <Plano3D key={p.id} {...pose} y={pose.y + flotar(frame, i * 30, 8)} opacidad={tramo(frame, llega, llega + 14) * (1 - tramo(frame, 292, 308))}>
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

        {/* Tipificaciones de las conversaciones cerradas y bandeja de transferencias */}
        <Plano3D {...cierre(-1)} opacidad={tramo(frame, 300, 314) * (1 - tramo(frame, 420, 444))}>
          <Lamina ancho={1020} alto={780} desplazamiento={claves(frame, [[360, 0], [415, 240]])}>
            <Tipificaciones historial={mockHistorial} destacado="h1" />
          </Lamina>
        </Plano3D>
        <Plano3D {...cierre(1)} opacidad={tramo(frame, 306, 320) * (1 - tramo(frame, 420, 444))}>
          <Lamina ancho={1020} alto={780} desplazamiento={claves(frame, [[360, 0], [415, 200]])}>
            <Transferencias transferencias={mockTransferencias} onAbrir={nada} />
          </Lamina>
        </Plano3D>

        <Plano3D {...modal} opacidad={tramo(frame, 430, 446)}>
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
      <Rotulo inicio={176} fin={290} {...t.plantillas} centrado tamano={48} ancho={1500} style={{ left: 210, top: 36 }} />
      <Rotulo inicio={322} fin={418} {...t.cierre} centrado tamano={50} ancho={1500} style={{ left: 210, top: 70 }} />
      <Rotulo inicio={452} fin={540} {...t.transferencias} style={{ left: 100, top: 360 }} ancho={520} tamano={56} />
    </Escena>
  )
}
