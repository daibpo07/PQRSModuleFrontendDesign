/* ─────────────────────────────────────────────
   Navegación de la presentación

   Cuatro secciones que se recorren con las flechas,
   la rueda, los puntos laterales o el toque. Cada
   cambio mueve la cámara del fondo 3D y lanza la
   animación de entrada de esa sección.
───────────────────────────────────────────── */

export function crearPresentacion({ fondo, alEntrar }) {
  const gsap = window.gsap
  const secciones = [...document.querySelectorAll(".seccion")]
  const puntos = [...document.querySelectorAll(".punto-nav")]
  const indicador = document.querySelector(".indicador")
  const escenario = document.getElementById("escenario")
  const vistas = new Set()
  let actual = 0

  function animarEntrada(seccion) {
    if (!gsap) return
    const piezas = seccion.querySelectorAll("[data-entra]")
    gsap.fromTo(
      piezas,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.08, overwrite: true },
    )
  }

  function marcar(indice) {
    if (indice === actual && vistas.has(indice)) return
    actual = indice
    const seccion = secciones[indice]
    puntos.forEach((p, i) => p.setAttribute("aria-current", String(i === indice)))
    if (indicador) {
      indicador.textContent = `${String(indice + 1).padStart(2, "0")} · ${seccion.dataset.titulo}`
    }
    document.body.dataset.seccion = seccion.id
    fondo?.encuadrar(seccion.id)
    animarEntrada(seccion)
    if (!vistas.has(indice)) {
      vistas.add(indice)
      alEntrar?.(seccion.id)
    } else {
      alEntrar?.(seccion.id)
    }
  }

  function ir(indice) {
    const destino = Math.max(0, Math.min(secciones.length - 1, indice))
    secciones[destino].scrollIntoView({ behavior: "smooth", block: "start" })
    marcar(destino)
  }

  /* La sección visible manda: así la rueda, el teclado y el toque coinciden */
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting && entrada.intersectionRatio > 0.55) {
          marcar(secciones.indexOf(entrada.target))
        }
      })
    },
    { root: escenario, threshold: [0.55] },
  )
  secciones.forEach((s) => observador.observe(s))

  puntos.forEach((punto, i) => punto.addEventListener("click", () => ir(i)))
  document.querySelectorAll("[data-ir-seccion]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const destino = secciones.findIndex((s) => s.id === boton.dataset.irSeccion)
      if (destino >= 0) ir(destino)
    })
  })

  document.addEventListener("keydown", (evento) => {
    if (evento.target.closest("input, textarea")) return
    const teclas = {
      ArrowRight: () => ir(actual + 1),
      ArrowDown: () => ir(actual + 1),
      PageDown: () => ir(actual + 1),
      ArrowLeft: () => ir(actual - 1),
      ArrowUp: () => ir(actual - 1),
      PageUp: () => ir(actual - 1),
      Home: () => ir(0),
      End: () => ir(secciones.length - 1),
      " ": () => ir(actual + 1),
      f: () => alternarPantallaCompleta(),
      F: () => alternarPantallaCompleta(),
    }
    const accion = teclas[evento.key]
    if (accion) {
      evento.preventDefault()
      accion()
    }
  })

  function alternarPantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  document.querySelector(".boton-pantalla")?.addEventListener("click", alternarPantallaCompleta)

  marcar(0)

  return { ir, alternarPantallaCompleta, irA: (id) => ir(secciones.findIndex((s) => s.id === id)) }
}
