import { Audio, staticFile } from "remotion"
import VideoCompleto from "./VideoCompleto"

/* ─────────────────────────────────────────────
   Video con música

   El mismo video con la banda sonora encima. La
   pista la genera `npm run musica` a partir de
   src/tiempos.json; si falta el archivo, esta
   composición no carga pero la versión sin música
   sigue funcionando.
───────────────────────────────────────────── */

export const PISTA = "musica/banda-sonora.wav"

export default function VideoConMusica() {
  return (
    <>
      <VideoCompleto />
      <Audio src={staticFile(PISTA)} />
    </>
  )
}
