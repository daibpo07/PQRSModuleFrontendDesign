import { useLayoutEffect, useMemo } from "react"
import { random, useCurrentFrame } from "remotion"
import * as THREE from "three"
import { tramo } from "../lib/movimiento"
import { texturaPunto } from "../lib/texturas"

/* ─────────────────────────────────────────────
   Chorro de partículas

   Mensajes que salen disparados desde el centro
   hacia la cámara, en un cono abierto. Cada
   partícula recorre su ciclo y se apaga al final.
───────────────────────────────────────────── */

const CICLO = 90

interface Props {
  inicio: number
  fin: number
  colores: string[]
  cantidad?: number
}

export default function ChorroParticulas({ inicio, fin, colores, cantidad = 1100 }: Props) {
  const frame = useCurrentFrame()
  /* La lista llega nueva en cada cuadro; la geometría solo depende de su contenido */
  const claveColores = colores.join(",")

  const { geometria, direcciones, velocidades, desfases, tonos } = useMemo(() => {
    const direcciones = new Float32Array(cantidad * 3)
    const velocidades = new Float32Array(cantidad)
    const desfases = new Float32Array(cantidad)
    const tonos = new Float32Array(cantidad * 3)
    const paleta = claveColores.split(",").map((c) => new THREE.Color(c))

    for (let i = 0; i < cantidad; i++) {
      const angulo = random(`chorro-a-${i}`) * Math.PI * 2
      const apertura = 0.2 + random(`chorro-r-${i}`) * 1.1
      const d = new THREE.Vector3(Math.cos(angulo) * apertura, Math.sin(angulo) * apertura * 0.65, 1).normalize()
      direcciones.set([d.x, d.y, d.z], i * 3)
      velocidades[i] = 0.2 + random(`chorro-v-${i}`) * 0.3
      desfases[i] = random(`chorro-d-${i}`) * CICLO
      const color = paleta[Math.floor(random(`chorro-c-${i}`) * paleta.length)]
      tonos.set([color.r, color.g, color.b], i * 3)
    }

    const geometria = new THREE.BufferGeometry()
    geometria.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cantidad * 3), 3))
    geometria.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cantidad * 3), 3))
    return { geometria, direcciones, velocidades, desfases, tonos }
  }, [cantidad, claveColores])

  useLayoutEffect(() => {
    const posiciones = geometria.getAttribute("position") as THREE.BufferAttribute
    const color = geometria.getAttribute("color") as THREE.BufferAttribute
    const pos = posiciones.array as Float32Array
    const col = color.array as Float32Array

    for (let i = 0; i < cantidad; i++) {
      const edad = (((frame - inicio + desfases[i]) % CICLO) + CICLO) % CICLO
      const distancia = edad * velocidades[i]
      pos[i * 3] = direcciones[i * 3] * distancia
      pos[i * 3 + 1] = direcciones[i * 3 + 1] * distancia
      pos[i * 3 + 2] = direcciones[i * 3 + 2] * distancia - 4
      /* Con mezcla aditiva, oscurecer el color equivale a desvanecer */
      const brillo = Math.min(1, edad / 10) * (1 - edad / CICLO)
      col[i * 3] = tonos[i * 3] * brillo
      col[i * 3 + 1] = tonos[i * 3 + 1] * brillo
      col[i * 3 + 2] = tonos[i * 3 + 2] * brillo
    }
    posiciones.needsUpdate = true
    color.needsUpdate = true
  }, [frame, geometria, direcciones, velocidades, desfases, tonos, cantidad, inicio])

  const opacidad = tramo(frame, inicio, inicio + 16) * (1 - tramo(frame, fin - 16, fin))
  if (opacidad <= 0) return null

  return (
    <points geometry={geometria}>
      <pointsMaterial
        map={texturaPunto()}
        vertexColors
        size={0.2}
        sizeAttenuation
        transparent
        opacity={opacidad}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  )
}
