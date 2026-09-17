import type { ReactNode } from "react"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Pantalla flotante

   Envuelve la app en un vidrio con borde de luz,
   halo de marca y un barrido de brillo opcional.
───────────────────────────────────────────── */

interface Props {
  children: ReactNode
  /** Posición del barrido de brillo, de 0 a 1. Fuera de ese rango no se ve. */
  brillo?: number
  radio?: number
}

export default function Pantalla({ children, brillo = -1, radio = 20 }: Props) {
  const visible = brillo > 0 && brillo < 1
  return (
    <div
      style={{
        position: "relative",
        borderRadius: radio,
        overflow: "hidden",
        boxShadow: [
          "0 0 0 1px rgba(148, 163, 184, 0.35)",
          `0 50px 140px -30px ${marca.terciario}88`,
          `0 0 120px -10px ${marca.primario}cc`,
        ].join(", "),
      }}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(105deg, transparent ${brillo * 140 - 30}%, rgba(255,255,255,0.35) ${brillo * 140 - 20}%, transparent ${brillo * 140 - 10}%)`,
          }}
        />
      )}
    </div>
  )
}
