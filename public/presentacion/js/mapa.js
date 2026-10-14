import { ICONOS, MODULOS, POR_ID } from "./datos.js"

/* ─────────────────────────────────────────────
   Mapa del ecosistema

   Constelación: el núcleo al centro, los cinco
   módulos en producción en el anillo interior y
   los tres proyectados en la órbita exterior.
   Cada módulo es un orbe con su nombre al lado,
   puesto hacia afuera del círculo para que las
   pastillas nunca se pisen.

   La geometría se calcula en píxeles cada vez que
   cambia el tamaño: así los hilos del SVG y los
   nodos del DOM caen exactamente en el mismo sitio.
───────────────────────────────────────────── */

const SVG = "http://www.w3.org/2000/svg"
const RADIO_INTERIOR = 30
const RADIO_EXTERIOR = 42

const tono = (m) => (m.hito === 1 ? "var(--cian)" : "var(--verde)")
const tonoCrudo = (m) => (m.hito === 1 ? "#04B2D9" : "#4BA658")

/** Dónde va la pastilla según el ángulo: siempre hacia afuera del círculo. */
function ladoDelRotulo(grados) {
  const a = ((grados % 360) + 360) % 360
  if (a > 300 || a <= 60) return "derecha"
  if (a <= 120) return "abajo"
  if (a <= 240) return "izquierda"
  return "arriba"
}

export function crearMapa(raiz, { alElegir } = {}) {
  const gsap = window.gsap
  const lienzo = raiz.querySelector(".lienzo")
  const hilos = raiz.querySelector(".hilos")
  const lista = raiz.querySelector(".lista-modulos")
  const nucleo = raiz.querySelector(".nucleo")

  /* Posición de cada módulo en unidades del círculo (centro = 0,0) */
  const geometria = {}
  const enProduccion = MODULOS.filter((m) => m.hito === 1)
  const proyectados = MODULOS.filter((m) => m.hito === 2)

  const ubicar = (m, grados, radio) => {
    const rad = (grados * Math.PI) / 180
    geometria[m.id] = { dx: Math.cos(rad) * radio, dy: Math.sin(rad) * radio, lado: ladoDelRotulo(grados) }
  }
  enProduccion.forEach((m, i) => ubicar(m, -90 + i * (360 / enProduccion.length), RADIO_INTERIOR))
  /* Los proyectados caen en los huecos del anillo interior */
  proyectados.forEach((m, i) => ubicar(m, -90 + 36 + i * 144, RADIO_EXTERIOR))

  /* ── Hilos ── */
  const hiloNucleo = {}
  MODULOS.forEach((m) => {
    const trazo = document.createElementNS(SVG, "path")
    trazo.setAttribute("class", "hilo hilo-nucleo")
    trazo.setAttribute("stroke", tonoCrudo(m))
    if (m.hito === 2) trazo.setAttribute("stroke-dasharray", "7 7")
    hilos.appendChild(trazo)
    hiloNucleo[m.id] = trazo
  })

  const hiloPar = []
  const vistos = new Set()
  MODULOS.forEach((m) => {
    m.conecta.forEach((otro) => {
      const clave = [m.id, otro].sort().join("·")
      if (vistos.has(clave) || !geometria[otro]) return
      vistos.add(clave)
      const trazo = document.createElementNS(SVG, "path")
      trazo.setAttribute("class", "hilo hilo-par")
      hilos.appendChild(trazo)
      hiloPar.push({ trazo, a: m.id, b: otro })
    })
  })

  const pulso = document.createElementNS(SVG, "circle")
  pulso.setAttribute("class", "pulso")
  pulso.setAttribute("r", "5")
  pulso.setAttribute("opacity", "0")
  hilos.appendChild(pulso)
  let viaje = null

  /* ── Nodos y tarjetas ── */
  const nodos = {}
  const tarjetas = {}
  MODULOS.forEach((m, i) => {
    const g = geometria[m.id]
    const nodo = document.createElement("button")
    nodo.type = "button"
    nodo.className = `nodo ${m.hito === 1 ? "produccion" : "proyectado"} rotulo-${g.lado}`
    nodo.style.setProperty("--tono", tono(m))
    nodo.dataset.id = m.id
    nodo.setAttribute("aria-pressed", "false")
    nodo.innerHTML = `
      <span class="orbe"><span class="satelites"><i></i><i></i><i></i></span></span>
      <span class="etiqueta">
        <svg class="icono-nodo" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[m.id]}</svg>
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <span class="nom">${m.corto}</span>
      </span>`
    nodo.addEventListener("click", () => elegir(m.id))
    lienzo.appendChild(nodo)
    nodos[m.id] = nodo

    const tarjeta = document.createElement("button")
    tarjeta.type = "button"
    tarjeta.className = `tarjeta-modulo ${m.hito === 1 ? "produccion" : "proyectado"}`
    tarjeta.style.setProperty("--tono", tono(m))
    tarjeta.dataset.id = m.id
    tarjeta.setAttribute("aria-pressed", "false")
    tarjeta.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[m.id]}</svg>
      <span>
        <span class="estado-nodo">${m.hito === 1 ? "En producción" : "Proyectado"}</span>
        <span class="rotulo">${m.rotulo}</span>
      </span>`
    tarjeta.addEventListener("click", () => elegir(m.id))
    lista.appendChild(tarjeta)
    tarjetas[m.id] = tarjeta
  })

  /* ── Medidas: nodos e hilos comparten el mismo sistema de coordenadas ── */
  let medida = { ancho: 0, alto: 0, unidad: 0 }

  function curva(a, b, arco = 0.12) {
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    return `M ${a.x} ${a.y} Q ${mx - dy * arco} ${my + dx * arco} ${b.x} ${b.y}`
  }

  function punto(id) {
    const g = geometria[id]
    return { x: medida.ancho / 2 + g.dx * medida.unidad, y: medida.alto / 2 + g.dy * medida.unidad }
  }

  function medir() {
    const caja = lienzo.getBoundingClientRect()
    if (!caja.width || !caja.height) return
    /* La unidad deja aire arriba y abajo para las pastillas, y a los lados para los nombres largos */
    medida = { ancho: caja.width, alto: caja.height, unidad: Math.min(caja.height * 0.84, caja.width * 0.62) / 100 }

    hilos.setAttribute("viewBox", `0 0 ${medida.ancho} ${medida.alto}`)
    const centro = { x: medida.ancho / 2, y: medida.alto / 2 }

    MODULOS.forEach((m) => {
      const p = punto(m.id)
      nodos[m.id].style.left = `${p.x}px`
      nodos[m.id].style.top = `${p.y}px`
      hiloNucleo[m.id].setAttribute("d", curva(centro, p))
    })
    hiloPar.forEach(({ trazo, a, b }) => trazo.setAttribute("d", curva(punto(a), punto(b), 0.2)))
  }

  new ResizeObserver(() => medir()).observe(lienzo)
  medir()

  /* ── Pulso que recorre los hilos encendidos ── */
  function lanzarPulso(trazos, color) {
    viaje?.kill()
    if (!gsap || !trazos.length) return
    pulso.setAttribute("fill", color)
    const avance = { t: 0, i: 0 }
    viaje = gsap.to(avance, {
      t: 1,
      duration: 1.5,
      ease: "power1.inOut",
      repeat: -1,
      repeatDelay: 0.2,
      onRepeat: () => {
        avance.i = (avance.i + 1) % trazos.length
      },
      onUpdate: () => {
        const trazo = trazos[avance.i]
        if (!trazo.getTotalLength) return
        const p = trazo.getPointAtLength(trazo.getTotalLength() * avance.t)
        pulso.setAttribute("cx", p.x)
        pulso.setAttribute("cy", p.y)
        pulso.setAttribute("opacity", String(Math.sin(avance.t * Math.PI) * 0.95))
      },
    })
  }

  /* ── Selección ── */
  let seleccion = null
  let filtro = "todos"

  const visible = (m) => filtro === "todos" || (filtro === "produccion" ? m.hito === 1 : m.hito === 2)

  function pintar() {
    const activo = seleccion ? POR_ID[seleccion] : null
    const vinculados = new Set(activo ? activo.conecta : [])
    raiz.dataset.enfocado = activo ? "si" : "no"

    MODULOS.forEach((m) => {
      const fuera = !visible(m)
      const nodo = nodos[m.id]
      nodo.classList.toggle("apagado", fuera)
      nodo.classList.toggle("vinculado", vinculados.has(m.id))
      nodo.setAttribute("aria-pressed", String(m.id === seleccion))
      tarjetas[m.id].hidden = fuera
      tarjetas[m.id].setAttribute("aria-pressed", String(m.id === seleccion))

      const hilo = hiloNucleo[m.id]
      const opacidad = fuera ? 0.05 : activo && m.id !== seleccion && !vinculados.has(m.id) ? 0.12 : 0.85
      if (gsap) gsap.to(hilo, { opacity: opacidad, duration: 0.45, ease: "power2.out" })
      else hilo.style.opacity = opacidad
    })

    const encendidos = []
    hiloPar.forEach(({ trazo, a, b }) => {
      const encendido = Boolean(activo) && (a === seleccion || b === seleccion)
      if (encendido) encendidos.push(trazo)
      trazo.setAttribute("stroke", encendido ? tonoCrudo(activo) : "#82B0F0")
      const opacidad = encendido ? 0.9 : activo ? 0.05 : 0.16
      if (gsap) gsap.to(trazo, { opacity: opacidad, strokeWidth: encendido ? 2.2 : 1.1, duration: 0.45 })
      else {
        trazo.style.opacity = opacidad
        trazo.style.strokeWidth = encendido ? 2.2 : 1.1
      }
    })

    if (activo && encendidos.length) lanzarPulso(encendidos, tonoCrudo(activo))
    else {
      viaje?.kill()
      pulso.setAttribute("opacity", "0")
    }
  }

  function elegir(id) {
    seleccion = id === seleccion ? null : id
    pintar()
    if (seleccion && gsap) {
      gsap.fromTo(
        nodos[seleccion].querySelector(".orbe"),
        { scale: 0.75 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" },
      )
    }
    alElegir?.(seleccion ? POR_ID[seleccion] : null)
  }

  /* ── Entrada: el mapa se dibuja solo la primera vez que se ve ── */
  let presentado = false
  function entrar() {
    if (presentado) return
    presentado = true
    if (!gsap) return

    const linea = gsap.timeline()
    linea.fromTo(nucleo, { scale: 0.65, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" })

    /* Los hilos se dibujan recortando su propio trazo: no hace falta ningún plugin */
    const trazosEnteros = [...hilos.querySelectorAll(".hilo-nucleo")].filter((t) => !t.hasAttribute("stroke-dasharray"))
    trazosEnteros.forEach((trazo) => {
      const largo = trazo.getTotalLength()
      trazo.style.strokeDasharray = String(largo)
      trazo.style.strokeDashoffset = String(largo)
    })
    linea.to(trazosEnteros, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", stagger: 0.06 }, "-=0.45")

    linea.fromTo(
      Object.values(nodos),
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)", stagger: 0.07, clearProps: "opacity" },
      "-=0.6",
    )
  }

  nucleo.addEventListener("click", () => elegir(null))
  pintar()

  return {
    entrar,
    elegir,
    limpiar: () => elegir(null),
    get seleccion() {
      return seleccion
    },
    filtrar(nuevo) {
      filtro = nuevo
      if (seleccion && !visible(POR_ID[seleccion])) {
        seleccion = null
        alElegir?.(null)
      }
      pintar()
    },
  }
}
