import { useCurrentFrame } from "remotion"
import { salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Nombre de marca animado

   Cada letra cae en su sitio mientras el
   espaciado se cierra; la parte de acento lleva
   el color terciario.
───────────────────────────────────────────── */

interface Props {
  inicio: number
  tamano?: number
}

export default function NombreMarca({ inicio, tamano = 96 }: Props) {
  const frame = useCurrentFrame()
  const letras = marca.nombre.split("")
  const desdeAcento = marca.nombre.indexOf(marca.acento)

  return (
    <h1
      style={{
        fontSize: tamano,
        fontWeight: 800,
        lineHeight: 1.05,
        color: marca.texto,
        letterSpacing: `${tramo(frame, inicio, inicio + 48, [0.3, -0.03], salida)}em`,
        textShadow: `0 0 50px ${marca.terciario}99`,
        whiteSpace: "nowrap",
      }}
    >
      {letras.map((letra, i) => {
        const t = tramo(frame, inicio + i * 1.4, inicio + 26 + i * 1.4, [0, 1], salida)
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: t,
              transform: `translateY(${(1 - t) * -40}px)`,
              filter: t < 1 ? `blur(${(1 - t) * 16}px)` : undefined,
              color: i >= desdeAcento ? marca.terciarioLt : undefined,
            }}
          >
            {letra === " " ? " " : letra}
          </span>
        )
      })}
    </h1>
  )
}
