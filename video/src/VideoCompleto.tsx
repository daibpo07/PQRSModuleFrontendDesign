import { Series } from "remotion"
import Cierre from "./escenas/Cierre"
import FlujosEscena from "./escenas/FlujosEscena"
import IndividualesEscena from "./escenas/IndividualesEscena"
import Intro from "./escenas/Intro"
import MasivosEscena from "./escenas/MasivosEscena"
import PanelEscena from "./escenas/PanelEscena"
import PqrsEscena from "./escenas/PqrsEscena"
import { duraciones } from "./guion"

/* ─────────────────────────────────────────────
   Orden de las escenas

   Cada escena resuelve su propia transición: la
   saliente atraviesa la cámara y la entrante
   llega desde lejos, con un destello en el corte.
───────────────────────────────────────────── */

export const escenas = [
  { id: "Intro", componente: Intro, duracion: duraciones.intro },
  { id: "Dashboard", componente: PanelEscena, duracion: duraciones.dashboard },
  { id: "PQRSDF", componente: PqrsEscena, duracion: duraciones.pqrs },
  { id: "EnviosIndividuales", componente: IndividualesEscena, duracion: duraciones.individuales },
  { id: "EnviosMasivos", componente: MasivosEscena, duracion: duraciones.masivos },
  { id: "FlujosDeTrabajo", componente: FlujosEscena, duracion: duraciones.flujos },
  { id: "Cierre", componente: Cierre, duracion: duraciones.cierre },
]

export const duracionTotal = escenas.reduce((total, e) => total + e.duracion, 0)

export default function VideoCompleto() {
  return (
    <Series>
      {escenas.map(({ id, componente: Componente, duracion }) => (
        <Series.Sequence key={id} durationInFrames={duracion}>
          <Componente />
        </Series.Sequence>
      ))}
    </Series>
  )
}
