import { AbsoluteFill, useCurrentFrame } from "remotion"
import { FPS, inicioEscena } from "../guion"
import { tramo } from "../lib/movimiento"
import { marca } from "../marca"
import subtitulos from "../subtitulos.json"

/* ─────────────────────────────────────────────
   Subtítulos

   El mismo texto sirve de guion de locución. Las
   marcas de tiempo son relativas a cada escena,
   así que siguen cuadrando si cambia la duración
   de una escena anterior.
───────────────────────────────────────────── */

const lineas = subtitulos.map((l) => ({
  texto: l.texto,
  desde: inicioEscena[l.escena] + Math.round(l.desde * FPS),
  hasta: inicioEscena[l.escena] + Math.round(l.hasta * FPS),
}))

export default function Subtitulos() {
  const frame = useCurrentFrame()
  const linea = lineas.find((l) => frame >= l.desde && frame < l.hasta)
  if (!linea) return null

  const visible = tramo(frame, linea.desde, linea.desde + 6) * (1 - tramo(frame, linea.hasta - 6, linea.hasta))

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", pointerEvents: "none" }}>
      <p
        style={{
          maxWidth: 1450,
          marginBottom: 64,
          padding: "16px 30px",
          borderRadius: 14,
          background: "rgba(3, 8, 23, 0.74)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          color: marca.texto,
          fontSize: 36,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          opacity: visible,
          transform: `translateY(${(1 - visible) * 14}px)`,
        }}
      >
        {linea.texto}
      </p>
    </AbsoluteFill>
  )
}
