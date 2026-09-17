import { useRef, type ReactNode } from "react"
import type { View } from "@/App"
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import { useDesplazamiento } from "../lib/desplazar"

/* ─────────────────────────────────────────────
   Marco de la app

   Monta la barra lateral y el encabezado reales
   alrededor de un módulo, dentro de una ventana
   de tamaño fijo. El desplazamiento se aplica por
   cuadro para simular que alguien recorre la vista.
───────────────────────────────────────────── */

const nada = () => {}

interface Props {
  vista: View
  children: ReactNode
  /** Píxeles de scroll del contenido principal. */
  desplazamiento?: number
  ancho?: number
  alto?: number
}

export default function MarcoApp({ vista, children, desplazamiento = 0, ancho = 1600, alto = 1000 }: Props) {
  const main = useRef<HTMLElement>(null)
  useDesplazamiento(main, desplazamiento)

  return (
    <div className="marco-app flex flex-col overflow-hidden bg-[#F8FAFC]" style={{ width: ancho, height: alto }}>
      {/* Barra de ventana */}
      <div className="h-9 shrink-0 flex items-center gap-2 px-4 bg-white border-b border-slate-200">
        <span className="w-3 h-3 rounded-full bg-[#fb7185]" />
        <span className="w-3 h-3 rounded-full bg-[#fbbf24]" />
        <span className="w-3 h-3 rounded-full bg-[#34d399]" />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar view={vista} setView={nada} collapsed={false} onCerrarSesion={nada} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header view={vista} sidebarCollapsed={false} setSidebarCollapsed={nada} />
          <main ref={main} className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
