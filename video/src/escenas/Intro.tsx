import { AbsoluteFill, useCurrentFrame } from "remotion"
import Escena from "../componentes/Escena"
import Espacio from "../componentes/Espacio"
import LogoParticulas from "../componentes/LogoParticulas"
import NombreMarca from "../componentes/NombreMarca"
import { duraciones, textos } from "../guion"
import { claves, entrada, salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Escena · Intro (6 s)

   0–85     las partículas forman el logo
   70–110   aparece el nombre
   100–150  entra el lema
   146–180  el logo estalla hacia la cámara
───────────────────────────────────────────── */

export default function Intro() {
  const frame = useCurrentFrame()

  const camaraZ = claves(frame, [
    [0, 26],
    [150, 19],
    [180, 5, entrada],
  ])

  /* Onda de luz cuando el logo termina de formarse */
  const onda = tramo(frame, 84, 118, [0, 1], salida)
  const salidaTexto = tramo(frame, 140, 158)

  return (
    <Escena
      duracion={duraciones.intro}
      abreDesdeNegro
      fondo={
        <Espacio camara={{ x: Math.sin(frame / 60) * 1.1, y: 0.4, z: camaraZ }}>
          <LogoParticulas formacion={[6, 80]} explosion={[146, 178]} y={1.5} />
        </Espacio>
      }
    >
      {onda > 0 && onda < 1 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              width: 420,
              height: 420,
              marginTop: -230,
              borderRadius: "50%",
              border: `2px solid ${marca.terciarioLt}`,
              boxShadow: `0 0 60px ${marca.terciario}, inset 0 0 60px ${marca.terciario}`,
              transform: `scale(${0.6 + onda * 2.2})`,
              opacity: (1 - onda) * 0.55,
            }}
          />
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - salidaTexto,
          filter: salidaTexto > 0 ? `blur(${salidaTexto * 14}px)` : undefined,
          transform: `scale(${1 + salidaTexto * 0.15})`,
        }}
      >
        <div style={{ marginTop: 330 }}>
          <NombreMarca inicio={72} />
        </div>

        <p
          style={{
            marginTop: 16,
            fontSize: 34,
            fontWeight: 500,
            color: marca.textoSuave,
            letterSpacing: "-0.01em",
          }}
        >
          {textos.intro.lema.split(" ").map((palabra, i) => {
            const t = tramo(frame, 104 + i * 3, 126 + i * 3, [0, 1], salida)
            return (
              <span key={i}>
                <span
                  style={{
                    display: "inline-block",
                    opacity: t,
                    transform: `translateY(${(1 - t) * 18}px)`,
                  }}
                >
                  {palabra}
                </span>{" "}
              </span>
            )
          })}
        </p>
      </AbsoluteFill>
    </Escena>
  )
}
