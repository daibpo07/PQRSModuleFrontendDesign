import { AbsoluteFill } from "remotion"
import { marca } from "../marca"

/* Viñeta y fundidos que comparten todas las escenas */

export function Vineta() {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(1, 3, 10, 0.7) 100%)",
      }}
    />
  )
}

/** Cubre el cuadro con el color del espacio; 1 es negro total. */
export function Fundido({ opacidad }: { opacidad: number }) {
  if (opacidad <= 0) return null
  return <AbsoluteFill style={{ background: marca.fondo, opacity: opacidad, pointerEvents: "none" }} />
}
