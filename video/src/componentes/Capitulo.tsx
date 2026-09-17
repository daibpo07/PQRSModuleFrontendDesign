import { useCurrentFrame } from "remotion"
import { entrada, salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Título de capítulo

   Abre cada módulo: las letras llegan desde el
   fondo una tras otra, el número y la descripción
   aparecen debajo y todo sale atravesando la
   cámara justo cuando llega la interfaz.
───────────────────────────────────────────── */

interface Props {
  inicio?: number
  duracion?: number
  numero: string
  titulo: string
  descripcion: string
  color: string
  tamano?: number
}

export default function Capitulo({ inicio = 0, duracion = 58, numero, titulo, descripcion, color, tamano = 150 }: Props) {
  const frame = useCurrentFrame() - inicio
  if (frame < 0 || frame > duracion) return null

  const fuera = tramo(frame, duracion - 18, duracion, [0, 1], entrada)
  const tInfo = tramo(frame, 12, 30, [0, 1], salida)
  const letras = titulo.split("")

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        perspective: 900,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.3em",
          opacity: tInfo * (1 - fuera),
          transform: `translateY(${(1 - tInfo) * 16 - fuera * 60}px)`,
        }}
      >
        <span style={{ width: 60 * tInfo, height: 2, background: color }} />
        {numero}
        <span style={{ width: 60 * tInfo, height: 2, background: color }} />
      </div>

      <h1
        style={{
          margin: "18px 0 0",
          fontSize: tamano,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.045em",
          whiteSpace: "nowrap",
          color: marca.texto,
          transformStyle: "preserve-3d",
        }}
      >
        {letras.map((letra, i) => {
          const t = tramo(frame, i * 1.6, 22 + i * 1.6, [0, 1], salida)
          const z = -1500 * (1 - t) + fuera * (900 + i * 25)
          const visible = t * (1 - fuera)
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translateZ(${z}px)`,
                opacity: visible,
                filter: visible < 0.98 ? `blur(${(1 - visible) * 14}px)` : undefined,
                textShadow: `0 0 60px ${color}, 0 0 18px ${color}99`,
              }}
            >
              {letra === " " ? " " : letra}
            </span>
          )
        })}
      </h1>

      <p
        style={{
          marginTop: 26,
          maxWidth: 1100,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 500,
          color: marca.textoSuave,
          opacity: tramo(frame, 18, 36, [0, 1], salida) * (1 - fuera),
          transform: `translateY(${fuera * 40}px)`,
        }}
      >
        {descripcion}
      </p>
    </div>
  )
}
