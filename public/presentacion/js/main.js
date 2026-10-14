import { MODULOS, POR_ID } from "./datos.js"
import { crearFondo } from "./fondo.js"
import { crearMapa } from "./mapa.js"
import { crearPanel } from "./panel.js"
import { crearPresentacion } from "./presentacion.js"

/* Arranque: conecta el fondo 3D, el mapa, la ficha y la navegación */

const fondo = crearFondo(document.getElementById("fondo-3d"))
const raizMapa = document.getElementById("mapa")
const panel = crearPanel(document.getElementById("ficha"), {
  alPedirModulo: (id) => mapa.elegir(id),
})

const mapa = crearMapa(raizMapa, {
  alElegir: (modulo) => {
    panel.mostrar(modulo)
    if (modulo) fondo.destello(modulo.hito === 1 ? 0x04b2d9 : 0x4ba658)
  },
})

panel.mostrar(null)

const presentacion = crearPresentacion({
  fondo,
  alEntrar: (seccion) => {
    if (seccion === "ecosistema") mapa.entrar()
  },
})

/* Filtros del mapa */
document.querySelectorAll(".filtro").forEach((boton) => {
  boton.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((otro) => otro.setAttribute("aria-pressed", String(otro === boton)))
    mapa.filtrar(boton.dataset.filtro)
  })
})

/* Atajos para presentar: 1–8 abre un módulo, Esc vuelve al ecosistema */
document.addEventListener("keydown", (evento) => {
  if (evento.target.closest("input, textarea")) return
  if (evento.key === "Escape" && mapa.seleccion) {
    mapa.limpiar()
    return
  }
  const numero = Number(evento.key)
  if (Number.isInteger(numero) && numero >= 1 && numero <= MODULOS.length) {
    presentacion.irA("ecosistema")
    mapa.entrar()
    const modulo = MODULOS[numero - 1]
    if (mapa.seleccion !== modulo.id) mapa.elegir(modulo.id)
  }
})

/* Las tarjetas de la línea de tiempo también abren su módulo */
document.querySelectorAll("[data-abre]").forEach((tarjeta) => {
  tarjeta.addEventListener("click", () => {
    const id = tarjeta.dataset.abre
    if (!POR_ID[id]) return
    presentacion.irA("ecosistema")
    mapa.entrar()
    mapa.elegir(id)
  })
})
