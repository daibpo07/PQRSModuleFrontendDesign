import { useLayoutEffect, useRef, type ReactNode } from "react"
import { AbsoluteFill, useCurrentFrame } from "remotion"
import { entrada, salida, tramo } from "../lib/movimiento"
import { marca } from "../marca"
import { Fundido, Vineta } from "./Atmosfera"

/* ─────────────────────────────────────────────
   Escena

   Marco común de todas las escenas:
   · fondo 3D que corta limpio entre escenas
   · primer plano que llega desde lejos y sale
     atravesando la cámara, con desenfoque
   · destello del color de la escena en el corte
   · el nombre de la app se reemplaza por el del
     video en todo el texto renderizado
───────────────────────────────────────────── */

const PASO = 14

interface Props {
  duracion: number
  fondo: ReactNode
  children: ReactNode
  color?: string
  abreDesdeNegro?: boolean
  cierraANegro?: boolean
}

/**
 * Cambia el nombre de la app en los nodos de texto. React no vuelve a escribir
 * un texto que no cambió, así que el reemplazo se mantiene entre cuadros.
 */
function useRenombrar(ref: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    if (!ref.current) return
    const recorrido = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT)
    for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
      const texto = nodo.nodeValue ?? ""
      if (texto.includes(marca.nombreEnApp)) {
        nodo.nodeValue = texto.replaceAll(marca.nombreEnApp, marca.nombre)
      } else if (texto.trim() === marca.inicialesEnApp) {
        /* Solo nodos que son exactamente las iniciales: los avatares de marca */
        nodo.nodeValue = texto.replace(marca.inicialesEnApp, marca.iniciales)
      }
    }
  })
}

export default function Escena({
  duracion,
  fondo,
  children,
  color = marca.terciario,
  abreDesdeNegro = false,
  cierraANegro = false,
}: Props) {
  const frame = useCurrentFrame()
  const ref = useRef<HTMLDivElement>(null)
  useRenombrar(ref)

  const llegada = abreDesdeNegro ? 1 : tramo(frame, 0, PASO, [0, 1], salida)
  const partida = cierraANegro ? 0 : tramo(frame, duracion - PASO, duracion, [0, 1], entrada)

  const escala = (0.8 + 0.2 * llegada) * (1 + 0.45 * partida)
  const desenfoque = (1 - llegada) * 14 + partida * 18
  const destello = Math.max(1 - llegada, partida) ** 2

  return (
    <AbsoluteFill style={{ background: marca.fondo }}>
      {fondo}

      <AbsoluteFill
        ref={ref}
        data-escena
        style={{
          opacity: llegada * (1 - partida),
          transform: escala !== 1 ? `scale(${escala})` : undefined,
          filter: desenfoque > 0.05 ? `blur(${desenfoque}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>

      <Vineta />

      {destello > 0.01 && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            mixBlendMode: "screen",
            opacity: destello * 0.55,
            background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${color} 0%, ${color}55 40%, transparent 75%)`,
          }}
        />
      )}

      <Fundido
        opacidad={
          (abreDesdeNegro ? 1 - tramo(frame, 0, 12) : 0) + (cierraANegro ? tramo(frame, duracion - 20, duracion) : 0)
        }
      />
    </AbsoluteFill>
  )
}
