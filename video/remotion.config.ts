import path from "node:path"
import { Config } from "@remotion/cli/config"
import { enableTailwind } from "@remotion/tailwind-v4"

/* ─────────────────────────────────────────────
   Configuración de Remotion

   · Tailwind v4 compila las clases de la app real
   · El alias @ apunta a ../src para importar los
     componentes del CRM tal como están
   · ANGLE usa la GPU para las escenas de Three.js
───────────────────────────────────────────── */

Config.setVideoImageFormat("jpeg")
Config.setJpegQuality(95)
Config.setChromiumOpenGlRenderer("angle")

Config.overrideWebpackConfig((config) => {
  const conTailwind = enableTailwind(config)
  return {
    ...conTailwind,
    resolve: {
      ...conTailwind.resolve,
      alias: {
        ...(conTailwind.resolve?.alias ?? {}),
        "@": path.resolve(process.cwd(), "../src"),
      },
    },
  }
})
