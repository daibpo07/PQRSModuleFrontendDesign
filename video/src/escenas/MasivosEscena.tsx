import { useCurrentFrame } from "remotion"
import DevicePreview from "@/components/shared/DevicePreview"
import EnviosMasivos, { ConsolaEnVivo, type Evento } from "@/components/masivos/EnviosMasivos"
import { mockCampanas, mockPlantillas, seedNoise, type Campana } from "@/components/masivos/EnviosMasivosData"
import InformeCampana from "@/components/masivos/InformeCampana"
import Capitulo from "../componentes/Capitulo"
import ChorroParticulas from "../componentes/ChorroParticulas"
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
   Escena · Envíos Masivos (13 s)

   0–58     capítulo
   30–200   la vista de campañas con la consola en vivo
   150–300  la consola sola en el espacio: el envío avanza y los mensajes salen
   290–390  informe de la campaña y la plantilla en el teléfono
───────────────────────────────────────────── */

const nada = () => {}

const enCurso = mockCampanas.find((c) => c.id === "CMP-2026-0041")!
const completada = mockCampanas.find((c) => c.id === "CMP-2026-0040")!
const plantilla = mockPlantillas[0]

const eventosIniciales: Evento[] = [
  { id: 5, tipo: "ok", texto: "Lote #27 entregado a 42 destinatarios", hora: "09:41" },
  { id: 4, tipo: "leido", texto: "31 mensajes marcados como leídos", hora: "09:40" },
  { id: 3, tipo: "alerta", texto: "3 números sin WhatsApp — reenviados por SMS", hora: "09:40" },
  { id: 2, tipo: "respuesta", texto: "6 respuestas enrutadas a Envíos Individuales", hora: "09:39" },
  { id: 1, tipo: "info", texto: "Campaña iniciada · ritmo 300 msg/min", hora: "09:00" },
]

/** Los mismos guiones de eventos que la simulación de la app, pero atados al cuadro. */
function eventoNumero(k: number): Evento {
  const guiones: Omit<Evento, "id" | "hora">[] = [
    { tipo: "ok", texto: `Lote #${27 + k} entregado a ${34 + Math.round(seedNoise(k, 2) * 22)} destinatarios` },
    { tipo: "leido", texto: `${18 + Math.round(seedNoise(k, 6) * 24)} mensajes marcados como leídos` },
    { tipo: "respuesta", texto: `${2 + Math.round(seedNoise(k, 9) * 7)} respuestas enrutadas a Envíos Individuales` },
    { tipo: "alerta", texto: `${1 + Math.round(seedNoise(k, 4) * 4)} números sin WhatsApp — reenviados por SMS` },
    { tipo: "info", texto: `Ritmo ajustado a ${210 + Math.round(seedNoise(k, 11) * 170)} msg/min` },
  ]
  return { id: 100 + k, ...guiones[k % guiones.length], hora: `09:${42 + Math.floor(k / 2)}` }
}

function envioEn(frame: number) {
  const avance = tramo(frame, 170, 290)
  const enviados = Math.round(enCurso.enviados + (enCurso.total - enCurso.enviados) * avance * 0.93)
  const fallidos = Math.round(enviados * 0.017)
  const entregados = Math.round(enviados * 0.95)
  const campana: Campana = {
    ...enCurso,
    enviados,
    entregados,
    fallidos,
    leidos: Math.round(entregados * 0.62),
    respondidos: Math.round(entregados * 0.092),
  }

  const paso = Math.max(0, Math.floor((frame - 150) / 6))
  const tput = Array.from({ length: 30 }, (_, i) => 210 + Math.round(seedNoise(paso + i, 11) * 170))

  const nuevos = Math.max(0, Math.floor((frame - 176) / 16) + 1)
  const eventos = [...Array.from({ length: nuevos }, (_, k) => eventoNumero(nuevos - k)), ...eventosIniciales]

  return { campana, tput, eventos }
}

export default function MasivosEscena() {
  const frame = useCurrentFrame()
  const t = textos.masivos
  const envio = envioEn(frame)

  const vista = recorrido(frame, [
    [30, { x: -800, y: 140, z: -3400, rx: 24, ry: 44, escala: 0.62 }],
    [110, { x: -330, y: 30, z: -220, rx: 7, ry: 16 }, salida],
    [150, { x: -310, y: 20, z: -180, rx: 5, ry: 13 }],
    [205, { x: -800, y: 60, z: -1700, rx: 5, ry: 32 }],
  ])

  const consola = recorrido(frame, [
    [150, { y: 760, z: -900, rx: -40, escala: 1.15 }],
    [205, { y: 60, z: 0, rx: 12 }, salida],
    [285, { y: 50, z: 60, rx: 8 }],
    [302, { y: -760, z: -400, rx: 30 }, entrada],
  ])

  const informe = recorrido(frame, [
    [290, { x: 1300, y: 60, z: -1800, rx: 8, ry: -40, escala: 0.66 }],
    [340, { x: 250, y: 60, z: -120, rx: 4, ry: -12 }, salida],
    [390, { x: 235, y: 50, z: -40, rx: 3, ry: -9 }],
  ])

  const telefono = recorrido(frame, [
    [300, { x: -1150, y: 120, z: 200, ry: 40, escala: 1.25 }],
    [350, { x: -600, y: 70, z: 150, ry: 20 }, salida],
    [390, { x: -610, y: 60, z: 170, ry: 17 }],
  ])

  return (
    <Escena
      duracion={duraciones.masivos}
      color={acentos.masivos}
      fondo={
        <Espacio camara={{ x: Math.sin(frame / 75) * 1.2, y: 0.5, z: 22 - frame * 0.01 }}>
          <ChorroParticulas inicio={180} fin={300} colores={["#25D366", acentos.masivos, "#ffffff", "#7aa2ff"]} />
        </Espacio>
      }
    >
      <Escenario3D>
        <Plano3D {...vista} opacidad={tramo(frame, 30, 44) * (1 - tramo(frame, 172, 205))}>
          <Pantalla brillo={tramo(frame, 60, 130)}>
            <MarcoApp vista="masivos" desplazamiento={claves(frame, [[70, 0], [140, 330]])}>
              <EnviosMasivos simularEnvio={false} />
            </MarcoApp>
          </Pantalla>
        </Plano3D>

        <Plano3D {...consola} y={consola.y + flotar(frame, 0, 6, 24)} opacidad={tramo(frame, 150, 165) * (1 - tramo(frame, 287, 302))}>
          <div
            style={{
              width: 1180,
              borderRadius: 16,
              boxShadow: `0 60px 140px -30px ${acentos.masivos}aa, 0 0 0 1px rgba(255,255,255,0.25)`,
            }}
          >
            <ConsolaEnVivo {...envio} enVivo onToggle={nada} onInforme={nada} />
          </div>
        </Plano3D>

        <Plano3D {...informe} opacidad={tramo(frame, 290, 305)}>
          <ModalFlotante ancho={1024} alto={1000} desplazamiento={claves(frame, [[345, 0], [390, 180]])}>
            <InformeCampana campana={completada} onClose={nada} />
          </ModalFlotante>
        </Plano3D>

        <Plano3D {...telefono} y={telefono.y + flotar(frame, 40, 8)} opacidad={tramo(frame, 300, 315)}>
          <div style={{ filter: `drop-shadow(0 40px 60px ${acentos.masivos}66)` }}>
            <DevicePreview
              canal={plantilla.canal}
              cuerpo={plantilla.cuerpo}
              encabezado={plantilla.encabezado ?? ""}
              pie={plantilla.pie ?? ""}
              botones={plantilla.botones ?? []}
              conDatos
            />
          </div>
        </Plano3D>
      </Escenario3D>

      <Capitulo {...capitulos.masivos} color={acentos.masivos} tamano={140} />

      <Rotulo inicio={60} fin={150} {...t.campanas} style={{ right: 110, top: 340 }} ancho={620} />
      <Rotulo inicio={176} fin={290} {...t.envio} centrado tamano={52} ancho={1500} style={{ left: 210, top: 90 }} />
      <Rotulo inicio={306} fin={400} {...t.informe} centrado tamano={48} ancho={1500} style={{ left: 210, top: 36 }} />
    </Escena>
  )
}
