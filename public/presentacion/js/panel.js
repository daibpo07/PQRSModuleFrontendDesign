import { ICONOS, MARCA, MODULOS, POR_ID } from "./datos.js"

/* ─────────────────────────────────────────────
   Ficha del módulo

   Sin módulo elegido muestra el resumen del
   ecosistema; al elegir uno, su alcance, sus
   capacidades y los módulos con los que conversa.
───────────────────────────────────────────── */

const tono = (m) => (m.hito === 1 ? "var(--cian)" : "var(--verde)")

export function crearPanel(raiz, { alPedirModulo } = {}) {
  const gsap = window.gsap

  function cablear() {
    raiz.querySelectorAll("[data-ir]").forEach((boton) => {
      boton.addEventListener("click", () => alPedirModulo?.(boton.dataset.ir))
    })
    raiz.querySelector(".cerrar-ficha")?.addEventListener("click", () => alPedirModulo?.(null))
  }

  function animar() {
    if (!gsap) return
    const piezas = raiz.querySelectorAll("[data-anima]")
    gsap.fromTo(
      piezas,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.045, overwrite: true },
    )
  }

  function resumenEcosistema() {
    raiz.style.setProperty("--tono", "var(--azul-claro)")
    raiz.innerHTML = `
      <span class="insignia ecosistema" data-anima><span class="chispa"></span>Ecosistema</span>
      <h2 data-anima>${MARCA.lema}</h2>
      <p class="pie-ficha" data-anima>Cada módulo se contrata por separado y todos comparten la misma información del cliente.</p>
      <p class="resumen-ficha" data-anima>${MARCA.entrada}</p>
      <div class="hitos-resumen">
        <div class="hito-resumen produccion" data-anima>
          <h3>Hito 1 · En producción</h3>
          <p>PQRSDF, Envíos Individuales, Envíos Masivos, Flujos de Trabajo y Dashboard &amp; Panel 360°.</p>
        </div>
        <div class="hito-resumen proyectado" data-anima>
          <h3>Hito 2 · Proyectado</h3>
          <p>Gestión Comercial, Cobranza y Jurídica, y Base de Conocimiento.</p>
        </div>
      </div>
      <p class="rotulo-bloque" data-anima>Abre un módulo</p>
      <div class="enlaces" data-anima>
        ${MODULOS.map(
          (m) =>
            `<button class="enlace" type="button" data-ir="${m.id}"><span class="chispa" style="background:${tono(m)}"></span>${m.rotulo}</button>`,
        ).join("")}
      </div>`
    cablear()
    animar()
  }

  function ficha(m) {
    raiz.style.setProperty("--tono", tono(m))
    const clase = m.hito === 1 ? "produccion" : "proyectado"
    const etiqueta = m.hito === 1 ? "En producción · Hito 1" : "Proyectado · Hito 2"
    raiz.innerHTML = `
      <button class="cerrar-ficha" type="button" aria-label="Volver al ecosistema">&times;</button>
      <span class="insignia ${clase}" data-anima><span class="chispa"></span>${etiqueta}</span>
      <div class="encabezado-ficha" data-anima>
        <span class="icono-ficha"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[m.id]}</svg></span>
        <div>
          <h2>${m.titulo}</h2>
          <p class="pie-ficha">${m.orden} · ${m.subtitulo}</p>
        </div>
      </div>
      <p class="resumen-ficha" data-anima>${m.resumen}</p>
      <p class="rotulo-bloque" data-anima>${m.hito === 1 ? "Qué permite hacer" : "Alcance previsto"}</p>
      <ul class="capacidades">
        ${m.capacidades.map(([titulo, detalle]) => `<li data-anima><b>${titulo}.</b> ${detalle}</li>`).join("")}
      </ul>
      <p class="rotulo-bloque" data-anima>El poder de la conexión</p>
      <p class="conexion" data-anima>${m.conexion}</p>
      <div class="enlaces" data-anima>
        ${m.conecta
          .map(
            (id) =>
              `<button class="enlace" type="button" data-ir="${id}"><span class="chispa" style="background:${tono(POR_ID[id])}"></span>${POR_ID[id].rotulo}</button>`,
          )
          .join("")}
      </div>`
    cablear()
    animar()
  }

  return {
    mostrar(modulo) {
      if (modulo) ficha(modulo)
      else resumenEcosistema()
    },
  }
}
