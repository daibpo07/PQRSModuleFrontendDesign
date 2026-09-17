import { Easing, interpolate } from "remotion"

/* ─────────────────────────────────────────────
   Utilidades de movimiento

   Todo se deriva del cuadro actual: nada de
   estado ni temporizadores, así cada cuadro se
   renderiza igual en la vista previa y en el MP4.
───────────────────────────────────────────── */

type Curva = (t: number) => number

export const suave: Curva = Easing.bezier(0.45, 0, 0.2, 1)
export const salida: Curva = Easing.bezier(0.16, 1, 0.3, 1)
export const entrada: Curva = Easing.bezier(0.7, 0, 0.84, 0)

/** Interpola entre dos cuadros con el valor sujeto a los extremos. */
export function tramo(
  frame: number,
  desde: number,
  hasta: number,
  valores: [number, number] = [0, 1],
  easing: Curva = suave,
) {
  return interpolate(frame, [desde, hasta], valores, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
}

/**
 * Recorre claves [cuadro, valor, curva?]. La curva de una clave gobierna el
 * tramo que llega a ella; sin curva se usa `suave`. Fuera del rango se
 * mantiene el valor del extremo.
 */
export function claves(frame: number, puntos: [number, number, Curva?][]) {
  if (frame <= puntos[0][0]) return puntos[0][1]
  for (let i = 1; i < puntos.length; i++) {
    const [f0, v0] = puntos[i - 1]
    const [f1, v1, curva] = puntos[i]
    if (frame <= f1) return tramo(frame, f0, f1, [v0, v1], curva ?? suave)
  }
  return puntos[puntos.length - 1][1]
}

export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Cuenta desde cero hasta un valor escrito en formato colombiano
 * ("1.770", "94,2") y conserva los decimales del original.
 */
export function contar(valor: string, progreso: number) {
  const decimales = valor.includes(",") ? valor.split(",")[1].length : 0
  const numero = Number(valor.replace(/\./g, "").replace(",", "."))
  return (numero * progreso).toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export interface Pose {
  x?: number
  y?: number
  z?: number
  rx?: number
  ry?: number
  rz?: number
  escala?: number
  opacidad?: number
}

const CAMPOS_POSE = ["x", "y", "z", "rx", "ry", "rz", "escala", "opacidad"] as const
const BASE_POSE: Required<Pose> = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, escala: 1, opacidad: 1 }

/**
 * Como `claves`, pero con poses completas. Cada campo se interpola por
 * separado; si una pose no lo define, conserva el valor de la pose anterior.
 */
export function recorrido(frame: number, puntos: [number, Pose, Curva?][]): Required<Pose> {
  const pose = { ...BASE_POSE }
  for (const campo of CAMPOS_POSE) {
    let previo = BASE_POSE[campo]
    pose[campo] = claves(
      frame,
      puntos.map(([f, p, curva]): [number, number, Curva?] => {
        previo = p[campo] ?? previo
        return [f, previo, curva]
      }),
    )
  }
  return pose
}

/** Oscilación suave para que lo que está quieto no se vea congelado. */
export const flotar = (frame: number, fase: number, amplitud = 8, periodo = 18) =>
  Math.sin((frame + fase) / periodo) * amplitud
