import type { ReactNode } from "react"

/* ─────────────────────────────────────────────
   Recorte

   Muestra una región de una vista real de la app
   a tamaño legible, como un acercamiento de
   cámara. El contenido se renderiza completo y se
   recorta: nada se deforma.
───────────────────────────────────────────── */

interface Props {
  /** Tamaño de la ventana de recorte, antes de escalar. */
  ancho: number
  alto: number
  /** Esquina superior izquierda de la región dentro del contenido. */
  x: number
  y: number
  escala?: number
  children: ReactNode
}

export default function Recorte({ ancho, alto, x, y, escala = 1, children }: Props) {
  return (
    <div
      className="bg-[#F8FAFC]"
      style={{ width: ancho * escala, height: alto * escala, overflow: "hidden", position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `scale(${escala}) translate(${-x}px, ${-y}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
