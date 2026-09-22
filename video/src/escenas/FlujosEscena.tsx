import { Easing, useCurrentFrame } from "remotion"
import Ejecuciones from "@/components/flujos/Ejecuciones"
import EquipoCargas from "@/components/flujos/EquipoCargas"
import { CadenaPasos, mockAgentes, mockDesvios, mockEjecuciones, mockFlujos, mockTareas } from "@/components/flujos/FlujosData"
import FlujosTrabajo from "@/components/flujos/FlujosTrabajo"
import MiTrabajo from "@/components/flujos/MiTrabajo"
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
import { claves, entrada, flotar, recorrido, salida, tramo } from "../lib/movimiento"
import { acentos } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Flujos de Trabajo (20 s)

   0–58     capítulo
   30–200   la vista de flujos
   150–300  la cadena de un flujo real: el caso recorre los siete pasos
   300–430  mi trabajo: las tareas del día con su lista de verificación
   430–600  seguimiento de ejecuciones y cargas del equipo abiertos en V
───────────────────────────────────────────── */

const nada = () => {}

const flujo = mockFlujos.find((f) => f.id === "FLW-002")!

/* Medidas de CadenaPasos: tarjeta de 168 px y conector de 34 px entre tarjetas */
const TARJETA = 168
const CONECTOR = 34
const ANCHO_CADENA = flujo.pasos.length * TARJETA + (flujo.pasos.length - 1) * CONECTOR
const MARGEN = 32

/** El caso entra al primer paso en este cuadro y avanza uno cada PASO cuadros. */
const INICIO_CASO = 200
const PASO = 12
const avanceSuave = Easing.bezier(0.45, 0, 0.2, 1)

function pasoEn(frame: number) {
  const bruto = (frame - INICIO_CASO) / PASO
  const k = Math.floor(bruto)
  /* La ficha del caso viaja durante los primeros 8 cuadros de cada paso y el paso se activa al llegar */
  const fraccion = Math.min(1, Math.max(0, (bruto - k) * (PASO / 8)))
  const posicion = Math.min(flujo.pasos.length - 1, Math.max(0, k - 1 + avanceSuave(fraccion)))
  const activo = Math.min(flujo.pasos.length, Math.max(-1, fraccion >= 1 ? k : k - 1))
  return { activo, posicion }
}

export default function FlujosEscena() {
  const frame = useCurrentFrame()
  const t = textos.flujos
  const { activo, posicion } = pasoEn(frame)

  const vista = recorrido(frame, [
    [30, { x: 800, y: 140, z: -3400, rx: 24, ry: -44, escala: 0.62 }],
    [110, { x: 330, y: 30, z: -220, rx: 7, ry: -16 }, salida],
    [150, { x: 310, y: 20, z: -180, rx: 5, ry: -13 }],
    [205, { x: 800, y: 60, z: -1700, rx: 5, ry: -32 }],
  ])

  /* En la segunda mitad la cámara entra a la cadena y sigue a la ficha del caso */
  const cadena = recorrido(frame, [
    [150, { x: 700, y: 640, z: -1400, rx: 34, ry: -34, escala: 1.12 }],
    [205, { x: 120, y: 60, z: -60, rx: 16, ry: -16 }, salida],
    [238, { x: -100, y: 50, z: -20, rx: 10, ry: -9, escala: 1.2 }],
    [270, { y: 30, z: 120, rx: 4, ry: -4, escala: 1.75 }, salida],
    [292, { y: 20, z: 140 }],
    [308, { x: -700, y: -620, z: -600, rx: -10, ry: 0 }, entrada],
  ])

  /* Mi trabajo: la lista del día de una persona del equipo */
  const trabajo = recorrido(frame, [
    [300, { y: 780, z: -900, rx: -38, escala: 0.84 }],
    [356, { y: 40, z: -40, rx: 5 }, salida],
    [412, { y: 30, z: 30, rx: 3 }],
    [444, { y: -760, z: -700, rx: 24 }, entrada],
  ])

  const libro = (lado: 1 | -1) =>
    recorrido(frame, [
      [430, { x: 520 * lado, y: 820, z: -600, rx: -50, ry: -28 * lado, escala: 0.62 }],
      [486, { x: 420 * lado, y: 90, z: -250, rx: 0, ry: -23 * lado }, salida],
      [600, { x: 435 * lado, y: 80, z: -150, rx: 0, ry: -21 * lado }],
    ])

  const fichaX = MARGEN + posicion * (TARJETA + CONECTOR) + TARJETA / 2
  const anchoTotal = ANCHO_CADENA + MARGEN * 2
  /*
   * Mientras la cámara está cerca, la cadena se desplaza para seguir a la ficha,
   * pero nunca tanto como para dejar el cuadro medio vacío.
   */
  const tope = Math.max(0, (anchoTotal * cadena.escala - 1780) / 2)
  const deseado =
    (fichaX - anchoTotal / 2) *
    cadena.escala *
    tramo(frame, 238, 272, [0, 1], salida) *
    (1 - tramo(frame, 292, 304))
  const seguimiento = Math.max(-tope, Math.min(tope, deseado))

  return (
    <Escena
      duracion={duraciones.flujos}
      color={acentos.flujos}
      fondo={<Espacio camara={{ x: Math.sin(frame / 85) * 1.2, y: 0.6, z: 22 - frame * 0.006 }} />}
    >
      <Escenario3D camara={{ z: claves(frame, [[430, 0], [600, 110]]) }}>
        <Plano3D {...vista} opacidad={tramo(frame, 30, 44) * (1 - tramo(frame, 172, 205))}>
          <Pantalla brillo={tramo(frame, 60, 130)}>
            <MarcoApp vista="flujos" desplazamiento={claves(frame, [[70, 0], [140, 300]])}>
              <FlujosTrabajo />
            </MarcoApp>
          </Pantalla>
        </Plano3D>

        {/* La cadena real del flujo, con la ficha del caso recorriéndola */}
        <Plano3D
          {...cadena}
          x={cadena.x - seguimiento}
          y={cadena.y + flotar(frame, 0, 6, 26)}
          opacidad={tramo(frame, 150, 165) * (1 - tramo(frame, 292, 308))}
        >
          <Pantalla>
            <div className="bg-white" style={{ width: ANCHO_CADENA + MARGEN * 2, padding: `26px ${MARGEN}px 30px`, position: "relative" }}>
              <div className="flex items-center gap-3 mb-12">
                <span className="text-[11px] font-mono font-bold text-slate-400">{flujo.id}</span>
                <span className="text-lg font-bold text-slate-800">{flujo.nombre}</span>
                <span className="text-xs text-slate-400">{flujo.disparador}</span>
              </div>
              <CadenaPasos pasos={flujo.pasos} activo={activo} />

              {activo >= 0 && activo < flujo.pasos.length && (
                <div style={{ position: "absolute", left: fichaX, top: 62, transform: "translateX(-50%)" }}>
                  <Chip3D texto="PQR-2026-000010" color={acentos.flujos} tamano={16} />
                </div>
              )}
            </div>
          </Pantalla>
        </Plano3D>

        {/* Mi trabajo */}
        <Plano3D {...trabajo} opacidad={tramo(frame, 300, 316) * (1 - tramo(frame, 420, 444))}>
          <Lamina ancho={1480} alto={820}>
            <MiTrabajo tareas={mockTareas} onToggleItem={nada} onCompletar={nada} onDevolver={nada} />
          </Lamina>
        </Plano3D>

        {([-1, 1] as const).map((lado) => (
          <Plano3D key={lado} {...libro(lado)} opacidad={tramo(frame, 430, 444)}>
            <Lamina ancho={1200} alto={800} desplazamiento={claves(frame, [[486, 0], [580, 200]])}>
              {lado === -1 ? (
                <Ejecuciones ejecuciones={mockEjecuciones} desvios={mockDesvios} onResolverDesvio={nada} />
              ) : (
                <EquipoCargas agentes={mockAgentes} onReasignar={nada} />
              )}
            </Lamina>
          </Plano3D>
        ))}
      </Escenario3D>

      <Capitulo {...capitulos.flujos} color={acentos.flujos} tamano={140} />

      <Rotulo inicio={60} fin={150} {...t.rutas} style={{ left: 110, top: 340 }} ancho={620} />
      <Rotulo inicio={176} fin={290} {...t.ejecucion} centrado tamano={52} ancho={1500} style={{ left: 210, top: 90 }} />
      <Rotulo inicio={322} fin={418} {...t.trabajo} centrado tamano={50} ancho={1500} style={{ left: 210, top: 44 }} />
      <Rotulo inicio={452} fin={588} {...t.equipo} centrado tamano={50} ancho={1500} style={{ left: 210, top: 60 }} />
    </Escena>
  )
}
