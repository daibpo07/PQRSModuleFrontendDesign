import type { CSSProperties, ReactNode } from "react"

/* ─────────────────────────────────────────────
   Escenario 3D en CSS

   Las pantallas y tarjetas de la app son DOM real
   con transformaciones 3D: el texto queda nítido y
   los componentes se ven idénticos a la app.

   El origen del mundo es el centro del cuadro;
   x crece a la derecha, y hacia abajo y z hacia
   la cámara, todo en píxeles.
───────────────────────────────────────────── */

export interface Transformacion {
  x?: number
  y?: number
  z?: number
  rx?: number
  ry?: number
  rz?: number
  escala?: number
}

const transformar = ({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, escala = 1 }: Transformacion) =>
  `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${escala})`

interface EscenarioProps {
  /** Movimiento de cámara: se aplica al mundo completo. */
  camara?: Transformacion
  perspectiva?: number
  children: ReactNode
}

export function Escenario3D({ camara = {}, perspectiva = 1800, children }: EscenarioProps) {
  return (
    <div style={{ position: "absolute", inset: 0, perspective: perspectiva, perspectiveOrigin: "50% 50%" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: transformar(camara),
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface PlanoProps extends Transformacion {
  opacidad?: number
  style?: CSSProperties
  children: ReactNode
}

/** Elemento centrado en su posición del mundo. */
export function Plano3D({ opacidad = 1, style, children, ...t }: PlanoProps) {
  if (opacidad <= 0.001) return null
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transformOrigin: "0 0",
        transform: `${transformar(t)} translate(-50%, -50%)`,
        opacity: opacidad,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
