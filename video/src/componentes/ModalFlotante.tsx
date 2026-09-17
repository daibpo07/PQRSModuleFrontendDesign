import { useRef, type ReactNode } from "react"
import { useDesplazamiento } from "../lib/desplazar"

/* ─────────────────────────────────────────────
   Modal flotante

   Los modales de la app usan `fixed inset-0`.
   Dentro de un elemento transformado, fixed se
   ubica respecto a ese elemento, así que basta con
   darle un tamaño. El velo oscuro se quita en
   estilos.css para que la tarjeta flote sola.
───────────────────────────────────────────── */

interface Props {
  ancho: number
  alto: number
  children: ReactNode
  /** Scroll del área del modal que más desborda. */
  desplazamiento?: number
}

export default function ModalFlotante({ ancho, alto, children, desplazamiento = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useDesplazamiento(ref, desplazamiento)

  return (
    <div ref={ref} className="modal-flotante" style={{ position: "relative", width: ancho, height: alto }}>
      {children}
    </div>
  )
}
