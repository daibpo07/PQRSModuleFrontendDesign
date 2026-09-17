import { useLayoutEffect, type RefObject } from "react"

/**
 * Simula el scroll de una vista de la app.
 *
 * Chrome no refleja scrollTop en la captura cuando la vista vive en un
 * contexto 3D, así que se mueven con transform los hijos del contenedor que
 * más desborda, sin pasar de su final.
 */
export function useDesplazamiento(ref: RefObject<HTMLElement | null>, desplazamiento: number) {
  useLayoutEffect(() => {
    const raiz = ref.current
    if (!raiz) return
    const candidatos = [raiz, ...raiz.querySelectorAll<HTMLElement>(".overflow-auto, .overflow-y-auto")]
    const desborde = (el: HTMLElement) => el.scrollHeight - el.clientHeight
    const contenedor = candidatos.reduce((a, b) => (desborde(b) > desborde(a) ? b : a))
    const recorrido = Math.max(0, Math.min(desplazamiento, desborde(contenedor)))
    for (const hijo of contenedor.children) {
      ;(hijo as HTMLElement).style.transform = recorrido > 0 ? `translateY(${-recorrido}px)` : ""
    }
  }, [ref, desplazamiento])
}
