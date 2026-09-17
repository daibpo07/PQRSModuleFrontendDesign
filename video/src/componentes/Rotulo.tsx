import type { CSSProperties } from "react"
import { useCurrentFrame } from "remotion"
import { salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Rótulo de escena

   Etiqueta con línea de acento, titular que
   entra palabra por palabra desenfocándose y
   bajada opcional. Sale todo junto hacia arriba.
───────────────────────────────────────────── */

interface Props {
  inicio: number
  fin: number
  etiqueta?: string
  titulo: string
  bajada?: string
  centrado?: boolean
  tamano?: number
  ancho?: number
  style?: CSSProperties
}

export default function Rotulo({
  inicio,
  fin,
  etiqueta,
  titulo,
  bajada,
  centrado = false,
  tamano = 64,
  ancho = 680,
  style,
}: Props) {
  const frame = useCurrentFrame()
  if (frame < inicio || frame > fin) return null

  const fuera = tramo(frame, fin - 14, fin)
  const tEtiqueta = tramo(frame, inicio, inicio + 22, [0, 1], salida)
  const palabras = titulo.split(" ")
  const inicioBajada = inicio + 14 + palabras.length * 2.5
  const tBajada = tramo(frame, inicioBajada, inicioBajada + 22, [0, 1], salida)

  return (
    <div
      style={{
        position: "absolute",
        width: ancho,
        textAlign: centrado ? "center" : "left",
        opacity: 1 - fuera,
        transform: `translateY(${-28 * fuera}px)`,
        filter: fuera > 0 ? `blur(${10 * fuera}px)` : undefined,
        ...style,
      }}
    >
      {etiqueta && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: centrado ? "center" : "flex-start",
            gap: 14,
            opacity: tEtiqueta,
            color: marca.terciarioLt,
            fontSize: Math.max(15, tamano * 0.27),
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: `${0.42 - 0.2 * tEtiqueta}em`,
          }}
        >
          <span style={{ width: 44 * tEtiqueta, height: 2, background: marca.terciario, borderRadius: 2 }} />
          {etiqueta}
        </div>
      )}

      <h2
        style={{
          marginTop: etiqueta ? 18 : 0,
          fontSize: tamano,
          lineHeight: 1.06,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          color: marca.texto,
          textShadow: `0 0 40px ${marca.terciario}55`,
        }}
      >
        {palabras.map((palabra, i) => {
          const t = tramo(frame, inicio + 6 + i * 2.5, inicio + 28 + i * 2.5, [0, 1], salida)
          return (
            <span key={i}>
              <span
                style={{
                  display: "inline-block",
                  opacity: t,
                  transform: `translateY(${(1 - t) * 50}px)`,
                  filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined,
                }}
              >
                {palabra}
              </span>
              {i < palabras.length - 1 && " "}
            </span>
          )
        })}
      </h2>

      {bajada && (
        <p
          style={{
            marginTop: 22,
            fontSize: tamano * 0.36,
            lineHeight: 1.5,
            color: marca.textoSuave,
            opacity: tBajada,
            transform: `translateY(${(1 - tBajada) * 20}px)`,
          }}
        >
          {bajada}
        </p>
      )}
    </div>
  )
}
