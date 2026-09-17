import { useLayoutEffect, useMemo } from "react"
import { random, useCurrentFrame } from "remotion"
import * as THREE from "three"
import { entrada, mezclar, salida, tramo } from "../lib/movimiento"
import { texturaPunto } from "../lib/texturas"
import { LOGO_PATH, marca } from "../marca"

/* ─────────────────────────────────────────────
   Logo de partículas

   Miles de puntos dispersos giran en remolino
   hasta dibujar el icono de la barra lateral y,
   al final, estallan hacia la cámara.
───────────────────────────────────────────── */

const CANTIDAD = 3200
const LIENZO = 480

/** Toma puntos dentro del icono dibujándolo en un canvas y leyendo sus píxeles. */
function muestrearLogo(tamanoMundo: number) {
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = LIENZO
  const ctx = lienzo.getContext("2d")!
  ctx.scale(LIENZO / 20, LIENZO / 20)
  ctx.fill(new Path2D(LOGO_PATH), "evenodd")
  const pixeles = ctx.getImageData(0, 0, LIENZO, LIENZO).data

  const candidatos: [number, number][] = []
  for (let y = 0; y < LIENZO; y += 2) {
    for (let x = 0; x < LIENZO; x += 2) {
      if (pixeles[(y * LIENZO + x) * 4 + 3] > 140) candidatos.push([x, y])
    }
  }

  /* Barajado determinista para repartir los puntos por todo el icono */
  for (let i = candidatos.length - 1; i > 0; i--) {
    const j = Math.floor(random(`barajar-${i}`) * (i + 1))
    ;[candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]]
  }

  const factor = tamanoMundo / LIENZO
  const destinos = new Float32Array(CANTIDAD * 3)
  for (let i = 0; i < CANTIDAD; i++) {
    const [px, py] = candidatos[i % candidatos.length]
    destinos[i * 3] = (px - LIENZO / 2 + (random(`jx-${i}`) - 0.5) * 1.5) * factor
    destinos[i * 3 + 1] = -(py - LIENZO / 2 + (random(`jy-${i}`) - 0.5) * 1.5) * factor
    destinos[i * 3 + 2] = (random(`jz-${i}`) - 0.5) * 0.2
  }
  return destinos
}

interface Props {
  /** Cuadros en que las partículas viajan hasta el logo. */
  formacion: [number, number]
  /** Cuadros en que el logo estalla hacia la cámara. Sin valor, el logo se queda. */
  explosion?: [number, number]
  tamano?: number
  y?: number
}

/* interpolate exige rangos finitos y crecientes: un estallido que nunca llega */
const SIN_EXPLOSION: [number, number] = [1e6, 1e6 + 30]

export default function LogoParticulas({ formacion, explosion = SIN_EXPLOSION, tamano = 6.2, y = 0 }: Props) {
  const frame = useCurrentFrame()

  const { geometria, destinos, origenes } = useMemo(() => {
    const destinos = muestrearLogo(tamano)
    const origenes = new Float32Array(CANTIDAD * 3)
    const colores = new Float32Array(CANTIDAD * 3)
    const paleta = [marca.terciario, marca.terciarioLt, "#ffffff", marca.terciarioLt, marca.terciario, "#7aa2ff"].map(
      (c) => new THREE.Color(c),
    )

    for (let i = 0; i < CANTIDAD; i++) {
      /* Origen en una cáscara esférica amplia alrededor del logo */
      const radio = 12 + random(`radio-${i}`) * 18
      const theta = random(`theta-${i}`) * Math.PI * 2
      const phi = Math.acos(2 * random(`phi-${i}`) - 1)
      origenes[i * 3] = radio * Math.sin(phi) * Math.cos(theta)
      origenes[i * 3 + 1] = radio * Math.sin(phi) * Math.sin(theta) * 0.6
      origenes[i * 3 + 2] = radio * Math.cos(phi) - 6

      const color = paleta[Math.floor(random(`color-${i}`) * paleta.length)]
      colores.set([color.r, color.g, color.b], i * 3)
    }

    const geometria = new THREE.BufferGeometry()
    geometria.setAttribute("position", new THREE.BufferAttribute(new Float32Array(CANTIDAD * 3), 3))
    geometria.setAttribute("color", new THREE.BufferAttribute(colores, 3))
    return { geometria, destinos, origenes }
  }, [tamano])

  useLayoutEffect(() => {
    const posiciones = geometria.getAttribute("position") as THREE.BufferAttribute
    const arreglo = posiciones.array as Float32Array
    const [f0, f1] = formacion
    const [e0, e1] = explosion

    for (let i = 0; i < CANTIDAD; i++) {
      const retraso = random(`retraso-${i}`) * 24
      const p = tramo(frame, f0 + retraso, f1 + retraso, [0, 1], salida)

      /* Remolino: el origen gira sobre el eje vertical mientras se acerca */
      const giro = (1 - p) * 2.6
      const ox = origenes[i * 3]
      const oz = origenes[i * 3 + 2]
      const sx = ox * Math.cos(giro) - oz * Math.sin(giro)
      const sz = ox * Math.sin(giro) + oz * Math.cos(giro)

      const respira = Math.sin(frame * 0.07 + i * 0.37) * 0.025 * p
      let x = mezclar(sx, destinos[i * 3], p) + respira
      let yy = mezclar(origenes[i * 3 + 1], destinos[i * 3 + 1], p) + respira
      let z = mezclar(sz, destinos[i * 3 + 2], p)

      const q = tramo(frame, e0 + random(`estallido-${i}`) * 10, e1, [0, 1], entrada)
      x *= 1 + q * 5
      yy *= 1 + q * 5
      z += q * (22 + random(`empuje-${i}`) * 18)

      arreglo[i * 3] = x
      arreglo[i * 3 + 1] = yy
      arreglo[i * 3 + 2] = z
    }
    posiciones.needsUpdate = true
  }, [frame, geometria, destinos, origenes, formacion, explosion])

  const opacidad = tramo(frame, formacion[0], formacion[0] + 20) * (1 - tramo(frame, explosion[1] - 8, explosion[1]))

  return (
    <group position={[0, y, 0]}>
      {/* Núcleo nítido */}
      <points geometry={geometria}>
        <pointsMaterial
          map={texturaPunto()}
          vertexColors
          size={0.13}
          sizeAttenuation
          transparent
          opacity={opacidad}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </points>
      {/* Halo que imita un bloom sin posproceso */}
      <points geometry={geometria}>
        <pointsMaterial
          map={texturaPunto()}
          vertexColors
          size={0.55}
          sizeAttenuation
          transparent
          opacity={opacidad * 0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </points>
    </group>
  )
}
