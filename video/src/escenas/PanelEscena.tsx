import { useCurrentFrame } from "remotion"
import MetasSla from "@/components/panel/MetasSla"
import Panel, { TarjetaModulo } from "@/components/panel/Panel"
import { TarjetaKpi } from "@/components/panel/PanelCharts"
import { kpisTransversales, modulos, ordenModulos } from "@/components/panel/PanelData"
import Reportes from "@/components/panel/Reportes"
import Capitulo from "../componentes/Capitulo"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import Lamina from "../componentes/Lamina"
import MarcoApp from "../componentes/MarcoApp"
import Pantalla from "../componentes/Pantalla"
import Rotulo from "../componentes/Rotulo"
import { capitulos, duraciones, textos } from "../guion"
import { claves, contar, entrada, recorrido, salida, tramo } from "../lib/movimiento"
import { acentos } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Dashboard (19 s)

   Los tiempos de abajo van después del capítulo
   (DESFASE cuadros):
   0–110    la app llega desde el fondo y recorre el panel
   110–230  la pantalla se acuesta y de ella se levantan los KPI
   230–350  los cuatro módulos se abren en arco
   350–420  la pantalla vuelve al frente y la cámara se acerca
   440–540  metas por indicador y reportes programados
───────────────────────────────────────────── */

const DESFASE = 30
const nada = () => {}

export default function PanelEscena() {
  const frame = useCurrentFrame()
  const f = frame - DESFASE
  const t = textos.dashboard

  /* ── Pantalla con la app real ── */
  const pantalla = {
    x: claves(f, [[0, 760], [80, 330, salida], [110, 310], [190, 0], [350, 0], [375, -300], [415, -270]]),
    y: claves(f, [[0, 140], [80, 30, salida], [110, 20], [190, 250], [340, 300], [375, 10]]),
    z: claves(f, [[0, -3400], [80, -220, salida], [110, -180], [190, -650], [340, -1500], [375, -120], [415, 60], [442, -900]]),
    rx: claves(f, [[0, 24], [80, 7, salida], [110, 5], [190, 66], [340, 72], [375, 5], [442, 20]]),
    ry: claves(f, [[0, -44], [80, -16, salida], [110, -13], [190, 0], [340, 0], [375, 15], [415, 12]]),
    escala: claves(f, [[110, 0.62], [190, 0.95], [340, 0.95], [375, 0.62]]),
  }
  const opacidadPantalla =
    tramo(f, 0, 14) * claves(f, [[290, 1], [340, 0.3], [365, 1], [422, 1], [442, 0]])
  const desplazamiento = claves(f, [[0, 0], [55, 0], [108, 560], [190, 0], [375, 0], [422, 640]])
  const brillo = f < 200 ? tramo(f, 24, 96) : tramo(f, 362, 420)

  /* ── Cámara: órbita suave mientras los módulos están en arco ── */
  /* La cámara entra sobre los indicadores para que las cifras se lean, y vuelve */
  const camara = {
    ry: claves(f, [[220, -6], [345, 6], [405, 0]]),
    z: claves(f, [[170, 0], [205, 320, salida], [236, 320], [262, 0], [375, 0], [415, 140, entrada], [442, 0], [540, 90]]),
  }

  /* Metas y reportes: las dos subvistas que cierran el panel */
  const informes = (lado: 1 | -1) =>
    recorrido(f, [
      [440, { x: 520 * lado, y: 800, z: -600, rx: -48, ry: -26 * lado, escala: 0.64 }],
      [496, { x: 420 * lado, y: 80, z: -240, rx: 0, ry: -22 * lado }, salida],
      [570, { x: 435 * lado, y: 70, z: -160, rx: 0, ry: -20 * lado }],
    ])

  return (
    <Escena
      duracion={duraciones.dashboard}
      color={acentos.dashboard}
      fondo={<Espacio camara={{ x: -camara.ry * 0.25 + Math.sin(frame / 90) * 0.6, y: 0.8, z: 22 - frame * 0.008 }} />}
    >
      <Escenario3D camara={camara}>
        <Plano3D {...pantalla} opacidad={opacidadPantalla}>
          <Pantalla brillo={brillo}>
            <MarcoApp vista="dashboard" desplazamiento={desplazamiento}>
              <Panel setView={nada} />
            </MarcoApp>
          </Pantalla>
        </Plano3D>

        {/* ── Indicadores que se levantan de la pantalla ── */}
        {kpisTransversales.map((kpi, i) => {
          const llega = 132 + i * 7
          const se = 226 + i * 4
          const subir = tramo(f, llega, llega + 42, [0, 1], salida)
          const irse = tramo(f, se, se + 24, [0, 1], entrada)
          const flota = Math.sin((f + i * 23) / 17) * 7 * subir
          return (
            <Plano3D
              key={kpi.label}
              x={(i - 1.5) * 400}
              y={claves(f, [[llega, 260], [llega + 42, -30, salida]]) + flota - irse * 480}
              z={claves(f, [[llega, -650], [llega + 42, 60, salida]]) + irse * 520}
              rx={66 * (1 - subir) - irse * 25}
              escala={1.15}
              opacidad={tramo(f, llega, llega + 12) * (1 - irse)}
            >
              <div
                style={{
                  width: 320,
                  borderRadius: 12,
                  boxShadow: "0 30px 80px -20px rgba(14,165,233,0.7), 0 0 0 1px rgba(255,255,255,0.5)",
                }}
              >
                <TarjetaKpi {...kpi} valor={contar(kpi.valor, tramo(f, llega + 4, llega + 54, [0, 1], salida))} />
              </div>
            </Plano3D>
          )
        })}

        {/* ── Módulos en arco frente a la cámara ── */}
        {ordenModulos.map((id, i) => {
          const llega = 238 + i * 6
          const se = 346 + i * 3
          const entrar = tramo(f, llega, llega + 46, [0, 1], salida)
          const irse = tramo(f, se, se + 30, [0, 1], entrada)
          const angulo = (i - 1.5) * 16
          const radio = 1500
          const rad = (angulo * Math.PI) / 180
          const flota = Math.sin((f + i * 31) / 19) * 9 * entrar
          return (
            <Plano3D
              key={id}
              x={Math.sin(rad) * radio * (1 - irse * 0.7)}
              y={(1 - entrar) * 720 + 40 + flota}
              z={(1 - Math.cos(rad)) * radio + 60 - (1 - entrar) * 400 - irse * 900}
              rx={-34 * (1 - entrar)}
              ry={-angulo * (1 - irse)}
              escala={1.28 - irse * 0.4}
              opacidad={tramo(f, llega, llega + 14) * (1 - irse)}
            >
              <div
                style={{
                  width: 290,
                  borderRadius: 16,
                  boxShadow: `0 40px 90px -25px ${modulos[id].color}, 0 0 0 1px rgba(255,255,255,0.5)`,
                }}
              >
                <TarjetaModulo id={id} onAbrir={nada} onDetalle={nada} />
              </div>
            </Plano3D>
          )
        })}
        {([-1, 1] as const).map((lado) => (
          <Plano3D key={lado} {...informes(lado)} opacidad={tramo(f, 440, 456)}>
            <Lamina ancho={1160} alto={780} desplazamiento={claves(f, [[500, 0], [560, 210]])}>
              {lado === -1 ? <MetasSla /> : <Reportes />}
            </Lamina>
          </Plano3D>
        ))}
      </Escenario3D>

      <Capitulo {...capitulos.dashboard} color={acentos.dashboard} />

      <Rotulo inicio={DESFASE + 30} fin={DESFASE + 112} {...t.vista} style={{ left: 120, top: 350 }} ancho={640} />
      <Rotulo
        inicio={DESFASE + 142}
        fin={DESFASE + 228}
        {...t.indicadores}
        centrado
        tamano={58}
        ancho={1400}
        style={{ left: 260, top: 120 }}
      />
      <Rotulo
        inicio={DESFASE + 252}
        fin={DESFASE + 344}
        {...t.modulos}
        centrado
        tamano={58}
        ancho={1400}
        style={{ left: 260, top: 110 }}
      />
      <Rotulo
        inicio={DESFASE + 368}
        fin={DESFASE + 430}
        {...t.cierre}
        style={{ right: 110, top: 370 }}
        ancho={600}
        tamano={60}
      />
      <Rotulo
        inicio={DESFASE + 462}
        fin={DESFASE + 556}
        {...t.metas}
        centrado
        tamano={50}
        ancho={1500}
        style={{ left: 210, top: 60 }}
      />
    </Escena>
  )
}
