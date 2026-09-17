import * as THREE from "three"

/* Texturas radiales dibujadas en canvas: sin archivos externos y siempre iguales */

function radial(tamano: number, paradas: [number, number][]) {
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = tamano
  const ctx = lienzo.getContext("2d")!
  const r = tamano / 2
  const gradiente = ctx.createRadialGradient(r, r, 0, r, r, r)
  for (const [pos, alfa] of paradas) gradiente.addColorStop(pos, `rgba(255,255,255,${alfa})`)
  ctx.fillStyle = gradiente
  ctx.fillRect(0, 0, tamano, tamano)
  const textura = new THREE.CanvasTexture(lienzo)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

let punto: THREE.Texture | null = null
let resplandor: THREE.Texture | null = null

/** Partícula: núcleo brillante con borde difuso. */
export function texturaPunto() {
  punto ??= radial(64, [
    [0, 1],
    [0.22, 0.9],
    [0.5, 0.25],
    [1, 0],
  ])
  return punto
}

/** Halo amplio para las luces de fondo. */
export function texturaResplandor() {
  resplandor ??= radial(256, [
    [0, 1],
    [0.3, 0.45],
    [0.65, 0.1],
    [1, 0],
  ])
  return resplandor
}
