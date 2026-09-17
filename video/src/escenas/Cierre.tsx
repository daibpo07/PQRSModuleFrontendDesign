import { AbsoluteFill, useCurrentFrame } from "remotion"
import Chip3D from "../componentes/Chip3D"
import { Escenario3D, Plano3D } from "../componentes/Escenario3D"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import LogoParticulas from "../componentes/LogoParticulas"
import NombreMarca from "../componentes/NombreMarca"
import { capitulos, duraciones, textos } from "../guion"
import { claves, salida, tramo } from "../lib/movimiento"
import { acentos, marca } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Cierre (6 s)

   0–70     el logo se vuelve a formar
   20–70    los cinco módulos entran en órbita
   50–100   aparece el nombre
   96–140   entra el lema
   160–180  fundido a negro
───────────────────────────────────────────── */

const orbita = (Object.keys(capitulos) as (keyof typeof capitulos)[]).map((id) => ({
  id,
  texto: capitulos[id].titulo,
  color: acentos[id],
}))

/** Centro del logo en pantalla, en píxeles desde el centro del cuadro. */
const CENTRO_Y = -120
const RADIO = 700

export default function Cierre() {
  const frame = useCurrentFrame()
  const giro = frame * 0.9 - 30

  return (
    <Escena
      duracion={duraciones.cierre}
      color={marca.terciario}
      cierraANegro
      fondo={
        <Espacio camara={{ x: Math.sin(frame / 50) * 1.2, y: 0.4, z: claves(frame, [[0, 25], [180, 20]]) }}>
          <LogoParticulas formacion={[0, 64]} y={1.6} />
        </Espacio>
      }
    >
      <Escenario3D camara={{ rx: -8 }}>
        {orbita.map((m, i) => {
          const angulo = ((i * 360) / orbita.length + giro) * (Math.PI / 180)
          const profundidad = Math.cos(angulo)
          const entra = tramo(frame, 20 + i * 6, 60 + i * 6, [0, 1], salida)
          return (
            <Plano3D
              key={m.id}
              x={Math.sin(angulo) * RADIO * (0.4 + 0.6 * entra)}
              y={CENTRO_Y + profundidad * 70}
              z={profundidad * RADIO * 0.6 * entra}
              escala={0.8 + 0.25 * entra}
              opacidad={entra * (0.45 + 0.55 * Math.max(0, profundidad))}
            >
              <Chip3D texto={m.texto} color={m.color} tamano={26} />
            </Plano3D>
          )
        })}
      </Escenario3D>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginTop: 400 }}>
          <NombreMarca inicio={50} tamano={92} />
        </div>
        <p
          style={{
            marginTop: 18,
            fontSize: 32,
            fontWeight: 500,
            color: marca.textoSuave,
            opacity: tramo(frame, 96, 120, [0, 1], salida),
            transform: `translateY(${(1 - tramo(frame, 96, 120, [0, 1], salida)) * 18}px)`,
          }}
        >
          {textos.cierre.lema}
        </p>
      </AbsoluteFill>
    </Escena>
  )
}
