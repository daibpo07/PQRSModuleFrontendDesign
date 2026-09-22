/* ─────────────────────────────────────────────
   Archivo de subtítulos

   Convierte src/subtitulos.json en un .srt con
   tiempos absolutos, usando las duraciones de
   src/tiempos.json. Sirve para las plataformas
   que muestran subtítulos aparte y como guion de
   locución cuando se grabe la voz en off.

   Uso: npm run subtitulos
───────────────────────────────────────────── */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ARCHIVO = path.join(RAIZ, "out/herramienta-multi-tenant.srt")

const tiempos = JSON.parse(readFileSync(path.join(RAIZ, "src/tiempos.json"), "utf8"))
const lineas = JSON.parse(readFileSync(path.join(RAIZ, "src/subtitulos.json"), "utf8"))

let acumulado = 0
const inicio = {}
for (const [id, escena] of Object.entries(tiempos)) {
  inicio[id] = acumulado
  acumulado += escena.segundos
}

const reloj = (segundos) => {
  const ms = Math.round(segundos * 1000)
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0")
  const m = String(Math.floor(ms / 60000) % 60).padStart(2, "0")
  const s = String(Math.floor(ms / 1000) % 60).padStart(2, "0")
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`
}

const bloques = lineas.map((l, i) => {
  const desde = inicio[l.escena] + l.desde
  const hasta = inicio[l.escena] + l.hasta
  if (hasta > acumulado) throw new Error(`El subtítulo ${i + 1} termina después del video`)
  return `${i + 1}\n${reloj(desde)} --> ${reloj(hasta)}\n${l.texto}\n`
})

mkdirSync(path.dirname(ARCHIVO), { recursive: true })
writeFileSync(ARCHIVO, bloques.join("\n"), "utf8")

const palabras = lineas.reduce((n, l) => n + l.texto.split(" ").length, 0)
console.log(`Listo: ${path.relative(RAIZ, ARCHIVO)} · ${lineas.length} subtítulos · ${palabras} palabras`)
console.log(`Duración del video: ${acumulado} s`)
