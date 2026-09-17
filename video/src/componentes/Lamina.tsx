import { useRef, type ReactNode } from "react"
import { useDesplazamiento } from "../lib/desplazar"
import Pantalla from "./Pantalla"

/* ─────────────────────────────────────────────
   Lámina

   Una subvista de la app suelta en el espacio,
   sin barra lateral: un vidrio de tamaño fijo con
   la vista real adentro. Las vistas de la app
   usan flex-1, por eso el contenedor es flex.
───────────────────────────────────────────── */

interface Props {
  ancho: number
  alto: number
  children: ReactNode
  desplazamiento?: number
  brillo?: number
}

export default function Lamina({ ancho, alto, children, desplazamiento = 0, brillo }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useDesplazamiento(ref, desplazamiento)

  return (
    <Pantalla brillo={brillo}>
      <div ref={ref} className="flex flex-col overflow-auto bg-[#F8FAFC]" style={{ width: ancho, height: alto }}>
        {children}
      </div>
    </Pantalla>
  )
}
