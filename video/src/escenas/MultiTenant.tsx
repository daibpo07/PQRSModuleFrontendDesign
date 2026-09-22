import { useCurrentFrame } from "remotion"
import Panel from "@/components/panel/Panel"
import { tenant } from "@/components/panel/PanelData"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import Pantalla from "../componentes/Pantalla"
import Recorte from "../componentes/Recorte"
import Rotulo from "../componentes/Rotulo"
import TarjetaOrganizacion, { type Organizacion } from "../componentes/TarjetaOrganizacion"
import { duraciones, textos } from "../guion"
import { claves, entrada, flotar, recorrido, salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Multi-tenant (10 s)

   0–176    tres organizaciones llegan en abanico,
            cada una con los módulos que contrató
   170–286  acercamiento a la franja real del panel:
            plan y módulos contratados del inquilino
───────────────────────────────────────────── */

const nada = () => {}

/* La primera es la organización de la app; las otras dos son ejemplos de otros sectores */
const organizaciones: Organizacion[] = [
  {
    nombre: tenant.organizacion,
    plan: tenant.plan,
    inicial: "P",
    color: marca.primario,
    contratados: ["pqrs", "masivos", "individuales", "flujos"],
    nota: "1.770 casos gestionados este mes",
  },
  {
    nombre: "Empresa de Servicios Públicos",
    plan: "Plan Esencial",
    inicial: "E",
    color: marca.terciario,
    contratados: ["pqrs", "individuales"],
    nota: "486 conversaciones atendidas",
  },
  {
    nombre: "Caja de Compensación",
    plan: "Plan Avanzado",
    inicial: "C",
    color: "#7c3aed",
    contratados: ["pqrs", "masivos", "flujos"],
    nota: "7.902 mensajes despachados",
  },
]

export default function MultiTenant() {
  const frame = useCurrentFrame()
  const t = textos.multitenant

  /*
   * El acercamiento entra cuando las tarjetas ya salieron, para que no se crucen.
   * A escala 1 el recorte se ve al tamaño real de la interfaz, y se puede leer.
   */
  const acercamiento = recorrido(frame, [
    [170, { y: 300, z: -700, rx: 16, escala: 1 }],
    [210, { y: 20, z: 0, rx: 4, escala: 1 }, salida],
    [286, { y: 10, z: 120, rx: 3, escala: 1 }],
  ])

  return (
    <Escena
      duracion={duraciones.multitenant}
      color={marca.terciario}
      fondo={<Espacio camara={{ x: Math.sin(frame / 60) * 1.4, y: 0.6, z: 22 - frame * 0.012 }} />}
    >
      <Escenario3D camara={{ ry: claves(frame, [[20, -5], [150, 5], [190, 0]]) }}>
        {organizaciones.map((o, i) => {
          const llega = 22 + i * 10
          const entrar = tramo(frame, llega, llega + 48, [0, 1], salida)
          const irse = tramo(frame, 140 + i * 4, 168 + i * 4, [0, 1], entrada)
          /*
           * Abanico con el centro al frente: las de los lados quedan más atrás y
           * giradas hacia la cámara, con aire suficiente para que no se tapen.
           */
          const grados = (i - 1) * 22
          const angulo = (grados * Math.PI) / 180
          const radio = 1750
          return (
            <Plano3D
              key={o.nombre}
              x={Math.sin(angulo) * radio}
              y={(1 - entrar) * 640 + 40 + flotar(frame, i * 27, 9) - irse * 320}
              z={140 - (1 - Math.cos(angulo)) * radio - (1 - entrar) * 500 - irse * 1100}
              rx={-28 * (1 - entrar)}
              ry={grados}
              escala={1.32}
              opacidad={tramo(frame, llega, llega + 14) * (1 - irse)}
            >
              <div
                style={{
                  borderRadius: 16,
                  boxShadow: `0 40px 90px -25px ${o.color}, 0 0 0 1px rgba(255,255,255,0.5)`,
                }}
              >
                <TarjetaOrganizacion organizacion={o} />
              </div>
            </Plano3D>
          )
        })}

        {/* Acercamiento a la franja del panel: organización, plan y módulos contratados */}
        <Plano3D {...acercamiento} opacidad={tramo(frame, 170, 186)}>
          <Pantalla brillo={tramo(frame, 216, 280)} radio={16}>
            <Recorte ancho={1340} alto={132} x={20} y={66} escala={1.3}>
              <div className="flex flex-col" style={{ width: 1380, height: 1000 }}>
                <Panel setView={nada} />
              </div>
            </Recorte>
          </Pantalla>
        </Plano3D>
      </Escenario3D>

      <Rotulo
        inicio={16}
        fin={146}
        {...t.organizaciones}
        centrado
        tamano={54}
        ancho={1500}
        style={{ left: 210, top: 70 }}
      />
      <Rotulo inicio={198} fin={286} {...t.plan} centrado tamano={52} ancho={1400} style={{ left: 260, top: 700 }} />
    </Escena>
  )
}
