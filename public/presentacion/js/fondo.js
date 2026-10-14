import * as THREE from "three"

/* ─────────────────────────────────────────────
   Fondo 3D

   Campo de estrellas, rejilla de piso y dos luces
   de marca, con un núcleo de partículas que respira
   en la portada. La cámara tiene una posición por
   sección y sigue suavemente el mouse.

   Si el equipo pidió menos movimiento
   (prefers-reduced-motion), la escena se dibuja
   una vez y se queda quieta.
───────────────────────────────────────────── */

const COLORES = {
  fondo: 0x00030d,
  rejilla: 0x0460d9,
  rejillaTenue: 0x011640,
  estrella: 0x9cc2ff,
  cian: 0x04b2d9,
  azul: 0x0476d9,
  verde: 0x4ba658,
}

/** Posición de la cámara y del núcleo en cada sección. */
const ENCUADRES = {
  portada: { camara: [0, 0.6, 20], nucleo: 1 },
  ecosistema: { camara: [0, 1.4, 27], nucleo: 0.12 },
  hitos: { camara: [2.6, 0.2, 24], nucleo: 0.2 },
  cierre: { camara: [0, 0.8, 17], nucleo: 0.9 },
}

function texturaPunto() {
  const lienzo = document.createElement("canvas")
  lienzo.width = lienzo.height = 64
  const ctx = lienzo.getContext("2d")
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.25, "rgba(255,255,255,0.85)")
  g.addColorStop(0.55, "rgba(255,255,255,0.22)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const textura = new THREE.CanvasTexture(lienzo)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

export function crearFondo(lienzo) {
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const renderizador = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: false })
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const escena = new THREE.Scene()
  escena.background = new THREE.Color(COLORES.fondo)
  escena.fog = new THREE.Fog(COLORES.fondo, 22, 115)

  const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 400)
  camara.position.set(0, 0.6, 20)

  const punto = texturaPunto()

  /* ── Estrellas ── */
  const totalEstrellas = 1500
  const posEstrellas = new Float32Array(totalEstrellas * 3)
  for (let i = 0; i < totalEstrellas; i++) {
    posEstrellas[i * 3] = (Math.random() - 0.5) * 170
    posEstrellas[i * 3 + 1] = (Math.random() - 0.5) * 95
    posEstrellas[i * 3 + 2] = -Math.random() * 140 + 10
  }
  const geoEstrellas = new THREE.BufferGeometry()
  geoEstrellas.setAttribute("position", new THREE.BufferAttribute(posEstrellas, 3))
  const estrellas = new THREE.Points(
    geoEstrellas,
    new THREE.PointsMaterial({
      map: punto,
      color: COLORES.estrella,
      size: 0.34,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  escena.add(estrellas)

  /* ── Rejilla de piso ── */
  const rejilla = new THREE.GridHelper(320, 110, COLORES.rejilla, COLORES.rejillaTenue)
  rejilla.position.set(0, -9, -24)
  rejilla.material.transparent = true
  rejilla.material.opacity = 0.5
  escena.add(rejilla)

  /* ── Luces de marca ── */
  const halo = (color, x, y, z, tamano, opacidad) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: punto,
        color,
        transparent: true,
        opacity: opacidad,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    )
    sprite.position.set(x, y, z)
    sprite.scale.set(tamano, tamano, 1)
    escena.add(sprite)
    return sprite
  }
  const haloCian = halo(COLORES.cian, -24, 10, -48, 78, 0.2)
  const haloAzul = halo(COLORES.azul, 28, -6, -42, 86, 0.3)
  halo(COLORES.verde, 6, -16, -60, 70, 0.12)

  /* ── Núcleo de partículas: una esfera que respira ── */
  const totalNucleo = 2600
  const base = new Float32Array(totalNucleo * 3)
  const tonos = new Float32Array(totalNucleo * 3)
  const paleta = [new THREE.Color(COLORES.cian), new THREE.Color(COLORES.azul), new THREE.Color(0xffffff)]
  for (let i = 0; i < totalNucleo; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radio = 3.4 + Math.random() * 0.5
    base[i * 3] = radio * Math.sin(phi) * Math.cos(theta)
    base[i * 3 + 1] = radio * Math.sin(phi) * Math.sin(theta)
    base[i * 3 + 2] = radio * Math.cos(phi)
    const color = paleta[Math.floor(Math.random() * paleta.length)]
    tonos.set([color.r, color.g, color.b], i * 3)
  }
  const geoNucleo = new THREE.BufferGeometry()
  geoNucleo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3))
  geoNucleo.setAttribute("color", new THREE.BufferAttribute(tonos, 3))
  const materialNucleo = new THREE.PointsMaterial({
    map: punto,
    vertexColors: true,
    size: 0.13,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
  const nucleo = new THREE.Points(geoNucleo, materialNucleo)
  escena.add(nucleo)

  /* ── Estado animable: GSAP escribe aquí ── */
  const estado = { x: 0, y: 0.6, z: 20, nucleo: 1, giro: 0 }
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }

  function redimensionar() {
    const ancho = lienzo.clientWidth || window.innerWidth
    const alto = lienzo.clientHeight || window.innerHeight
    renderizador.setSize(ancho, alto, false)
    camara.aspect = ancho / alto
    camara.updateProjectionMatrix()
  }

  const posiciones = geoNucleo.getAttribute("position")
  let reloj = 0

  function dibujar(delta) {
    reloj += delta

    /* El núcleo respira y gira sobre sí mismo */
    const arreglo = posiciones.array
    const respiracion = 1 + Math.sin(reloj * 0.7) * 0.035
    for (let i = 0; i < totalNucleo; i++) {
      const onda = 1 + Math.sin(reloj * 1.6 + i * 0.35) * 0.02
      arreglo[i * 3] = base[i * 3] * respiracion * onda
      arreglo[i * 3 + 1] = base[i * 3 + 1] * respiracion * onda
      arreglo[i * 3 + 2] = base[i * 3 + 2] * respiracion * onda
    }
    posiciones.needsUpdate = true
    nucleo.rotation.y += delta * 0.12
    nucleo.rotation.x = Math.sin(reloj * 0.2) * 0.1
    materialNucleo.opacity = estado.nucleo
    nucleo.visible = estado.nucleo > 0.02
    nucleo.scale.setScalar(0.85 + estado.nucleo * 0.25)

    estrellas.position.z = (reloj * 0.5) % 40
    estrellas.rotation.y = reloj * 0.004
    rejilla.position.z = -24 + ((reloj * 0.9) % 2.91)
    haloCian.position.x = -24 + Math.sin(reloj * 0.18) * 3
    haloAzul.position.x = 28 - Math.sin(reloj * 0.15) * 3

    /* Parallax del mouse, con amortiguación */
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, delta * 2.4)
    mouse.sy += (mouse.y - mouse.sy) * Math.min(1, delta * 2.4)

    camara.position.set(estado.x + mouse.sx * 2.1, estado.y - mouse.sy * 1.3, estado.z)
    camara.lookAt(0, estado.y * 0.2, 0)
    camara.rotation.z = estado.giro

    renderizador.render(escena, camara)
  }

  let anterior = performance.now()
  let corriendo = true
  function bucle(ahora) {
    if (!corriendo) return
    const delta = Math.min(0.05, (ahora - anterior) / 1000)
    anterior = ahora
    dibujar(delta)
    requestAnimationFrame(bucle)
  }

  redimensionar()
  window.addEventListener("resize", redimensionar)
  document.addEventListener("visibilitychange", () => {
    corriendo = !document.hidden && !quieto
    if (corriendo) {
      anterior = performance.now()
      requestAnimationFrame(bucle)
    }
  })

  if (quieto) {
    dibujar(0)
    corriendo = false
  } else {
    requestAnimationFrame(bucle)
  }

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1
  })

  return {
    estado,
    /** Lleva la cámara al encuadre de una sección. */
    encuadrar(seccion) {
      const destino = ENCUADRES[seccion] ?? ENCUADRES.portada
      const [x, y, z] = destino.camara
      if (quieto || !window.gsap) {
        Object.assign(estado, { x, y, z, nucleo: destino.nucleo })
        if (quieto) dibujar(0)
        return
      }
      window.gsap.to(estado, { x, y, z, duration: 1.5, ease: "power3.inOut", overwrite: true })
      window.gsap.to(estado, { nucleo: destino.nucleo, duration: 1.1, ease: "power2.out", overwrite: "auto" })
    },
    /** Golpe de luz: se usa al abrir un módulo. */
    destello(color = COLORES.cian) {
      if (quieto || !window.gsap) return
      haloCian.material.color.set(color)
      window.gsap.fromTo(
        haloCian.material,
        { opacity: 0.55 },
        { opacity: 0.2, duration: 1.2, ease: "power2.out", overwrite: true },
      )
    },
  }
}
