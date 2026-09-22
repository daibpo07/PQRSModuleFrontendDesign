import Subtitulos from "./componentes/Subtitulos"
import VideoCompleto from "./VideoCompleto"

/* El video con los subtítulos incrustados, para verlo sin sonido */

export default function VideoConSubtitulos() {
  return (
    <>
      <VideoCompleto />
      <Subtitulos />
    </>
  )
}
