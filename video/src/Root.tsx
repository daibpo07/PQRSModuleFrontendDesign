import { loadFont } from "@remotion/google-fonts/Inter"
import { Composition, Folder } from "remotion"
import "./estilos.css"
import { ALTO, ANCHO, FPS } from "./guion"
import VideoCompleto, { duracionTotal, escenas } from "./VideoCompleto"
import VideoConMusica from "./VideoConMusica"

loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
})

const formato = { fps: FPS, width: ANCHO, height: ALTO }

export default function Root() {
  return (
    <>
      <Composition id="VideoCompleto" component={VideoCompleto} durationInFrames={duracionTotal} {...formato} />
      <Composition id="VideoConMusica" component={VideoConMusica} durationInFrames={duracionTotal} {...formato} />
      <Folder name="Escenas">
        {escenas.map(({ id, componente, duracion }) => (
          <Composition key={id} id={id} component={componente} durationInFrames={duracion} {...formato} />
        ))}
      </Folder>
    </>
  )
}
