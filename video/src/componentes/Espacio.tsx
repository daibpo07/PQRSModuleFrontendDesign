import { useThree } from "@react-three/fiber"
import { ThreeCanvas } from "@remotion/three"
import { useLayoutEffect, useMemo, type ReactNode } from "react"
import { random, useCurrentFrame, useVideoConfig } from "remotion"
import * as THREE from "three"
import { texturaPunto, texturaResplandor } from "../lib/texturas"
import { marca } from "../marca"

/* ─────────────────────────────────────────────
   Espacio 3D de fondo

   Campo de estrellas, rejilla de piso que avanza
   y dos luces de marca. Cada escena lo usa como
   telón y puede meter sus propios objetos 3D.
───────────────────────────────────────────── */

export interface PosicionCamara {
  x: number
  y: number
  z: number
}

function Camara({ x, y, z }: PosicionCamara) {
  const camara = useThree((estado) => estado.camera)
  useLayoutEffect(() => {
    camara.position.set(x, y, z)
    camara.lookAt(0, 0, 0)
  }, [camara, x, y, z])
  return null
}

function Estrellas() {
  const frame = useCurrentFrame()
  const geometria = useMemo(() => {
    const cantidad = 1800
    const posiciones = new Float32Array(cantidad * 3)
    for (let i = 0; i < cantidad; i++) {
      posiciones[i * 3] = (random(`estrella-x-${i}`) - 0.5) * 160
      posiciones[i * 3 + 1] = (random(`estrella-y-${i}`) - 0.5) * 90
      posiciones[i * 3 + 2] = -random(`estrella-z-${i}`) * 140 + 12
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(posiciones, 3))
    return g
  }, [])

  return (
    <points geometry={geometria} position={[0, 0, frame * 0.035]}>
      <pointsMaterial
        map={texturaPunto()}
        color="#9cc2ff"
        size={0.32}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Rejilla() {
  const frame = useCurrentFrame()
  const celda = 3
  /* Desplazar una celda completa y volver da la ilusión de un piso infinito */
  const avance = ((frame * 0.06) % celda) - 30
  return (
    <gridHelper
      args={[300, 100, marca.primarioLt, "#0c1d4d"]}
      position={[0, -8, avance]}
    />
  )
}

function Resplandores() {
  const frame = useCurrentFrame()
  const deriva = Math.sin(frame / 80)
  return (
    <>
      <sprite position={[-22 + deriva * 2, 9, -45]} scale={[70, 70, 1]}>
        <spriteMaterial
          map={texturaResplandor()}
          color={marca.terciario}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[26 - deriva * 2, -6, -40]} scale={[80, 80, 1]}>
        <spriteMaterial
          map={texturaResplandor()}
          color={marca.primarioLt}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </>
  )
}

interface Props {
  camara: PosicionCamara
  children?: ReactNode
}

export default function Espacio({ camara, children }: Props) {
  const { width, height } = useVideoConfig()
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 40, near: 0.1, far: 500, position: [0, 0, 22] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[marca.fondo]} />
      <fog attach="fog" args={[marca.fondo, 20, 110]} />
      <Camara {...camara} />
      <Resplandores />
      <Rejilla />
      <Estrellas />
      {children}
    </ThreeCanvas>
  )
}
