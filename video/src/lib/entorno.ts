/* ─────────────────────────────────────────────
   Ajustes del navegador para el video

   Algunos componentes llaman a scrollIntoView con
   desplazamiento suave al montarse. Dentro del
   video eso movería el escenario 3D en tiempo
   real, así que ahí se ignora. Fuera de las
   escenas (la interfaz del Studio) no cambia nada.
───────────────────────────────────────────── */

const original = Element.prototype.scrollIntoView

Element.prototype.scrollIntoView = function (this: Element, ...args: Parameters<Element["scrollIntoView"]>) {
  if (this.closest("[data-escena]")) return
  return original.apply(this, args)
}
