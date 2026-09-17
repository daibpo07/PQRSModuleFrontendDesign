/* ─────────────────────────────────────────────
   Banda sonora del video

   Música original sintetizada por código, sin
   muestras ni dependencias, sincronizada con las
   escenas que describe src/tiempos.json:
   · 120 BPM: cada segundo entero cae en un pulso,
     así todos los cortes caen a tiempo
   · intro sin percusión, con campanas y una subida
     hasta el estallido del logo
   · desde el Dashboard entra el ritmo; desde PQRSDF
     se suman palmas y hi-hats en semicorcheas
   · subida antes de cada corte y golpe en el corte
   · barridos en los cambios internos de cada escena
     y campanas en los momentos clave
   · el cierre resuelve en Do mayor y se apaga con
     el fundido a negro

   Es determinista: la misma semilla da el mismo
   audio. Uso: npm run musica
───────────────────────────────────────────── */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ARCHIVO = path.join(RAIZ, "public/musica/banda-sonora.wav")
const tiempos = JSON.parse(readFileSync(path.join(RAIZ, "src/tiempos.json"), "utf8"))

const SR = 48000
const PULSO = 0.5 // 120 BPM
const COMPAS = PULSO * 4
const SEMICORCHEA = PULSO / 4

/* ── Escenas en el orden de tiempos.json, que es el orden del video ── */
let acumulado = 0
const escenas = Object.entries(tiempos).map(([id, e]) => {
  const inicio = acumulado
  acumulado += e.segundos
  return { id, inicio, fin: acumulado, ...e }
})
const DURACION = acumulado
const porId = Object.fromEntries(escenas.map((e) => [e.id, e]))
const cortes = escenas.slice(1).map((e) => e.inicio)
const INICIO_RITMO = porId.dashboard.inicio
const INICIO_MODULOS = porId.pqrs.inicio
const INICIO_CIERRE = porId.cierre.inicio

const N = Math.ceil(DURACION * SR)
const L = new Float32Array(N)
const R = new Float32Array(N)
const revL = new Float32Array(N)
const revR = new Float32Array(N)
const ecoL = new Float32Array(N)
const ecoR = new Float32Array(N)
const compresion = new Float32Array(N).fill(1)

/* ── Utilidades ── */

function semilla(n) {
  return () => {
    n = (n + 0x6d2b79f5) | 0
    let t = Math.imul(n ^ (n >>> 15), 1 | n)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const azar = semilla(1755)
const ruido = () => azar() * 2 - 1
const mtof = (nota) => 440 * 2 ** ((nota - 69) / 12)
const muestra = (t) => Math.round(t * SR)
const paneo = (p) => {
  const a = ((p + 1) * Math.PI) / 4
  return [Math.cos(a), Math.sin(a)]
}

class Biquad {
  constructor(tipo, f, q) {
    this.tipo = tipo
    this.x1 = this.x2 = this.y1 = this.y2 = 0
    this.ajustar(f, q)
  }
  ajustar(f, q) {
    const w = (2 * Math.PI * Math.min(Math.max(f, 10), SR * 0.45)) / SR
    const c = Math.cos(w)
    const a = Math.sin(w) / (2 * q)
    let b0, b1, b2
    if (this.tipo === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    else if (this.tipo === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    else [b0, b1, b2] = [a, 0, -a]
    const a0 = 1 + a
    this.b0 = b0 / a0
    this.b1 = b1 / a0
    this.b2 = b2 / a0
    this.a1 = (-2 * c) / a0
    this.a2 = (1 - a) / a0
  }
  proc(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2
    this.x2 = this.x1
    this.x1 = x
    this.y2 = this.y1
    this.y1 = y
    return y
  }
}

/** Sierra con PolyBLEP: sin el aliasing áspero de una sierra ingenua. */
class Sierra {
  constructor(fase = 0) {
    this.fase = fase
  }
  valor(f) {
    const dt = f / SR
    let t = this.fase
    let blep = 0
    if (t < dt) {
      t /= dt
      blep = t + t - t * t - 1
    } else if (t > 1 - dt) {
      t = (t - 1) / dt
      blep = t * t + t + t + 1
    }
    const v = 2 * this.fase - 1 - blep
    this.fase += dt
    if (this.fase >= 1) this.fase -= 1
    return v
  }
}

function sumar(n, vl, vr, rev = 0, eco = 0) {
  if (n < 0 || n >= N) return
  L[n] += vl
  R[n] += vr
  if (rev) {
    revL[n] += vl * rev
    revR[n] += vr * rev
  }
  if (eco) {
    ecoL[n] += vl * eco
    ecoR[n] += vr * eco
  }
}

/* ── Armonía ── */

const PROGRESION = [
  { bajo: 45, notas: [57, 60, 64, 67] }, // Am7
  { bajo: 41, notas: [53, 57, 60, 64] }, // Fmaj7
  { bajo: 48, notas: [55, 60, 64, 67] }, // C
  { bajo: 43, notas: [55, 59, 62, 69] }, // G(add9)
]
const DOMINANTE = PROGRESION[3]
const FINAL = { bajo: 36, notas: [55, 60, 64, 67, 74] } // Cadd9

/** El ciclo arranca desplazado un compás para que el ritmo entre sobre Am. */
function acordeEn(t) {
  if (t >= INICIO_CIERRE) return FINAL
  if (t >= INICIO_CIERRE - COMPAS) return DOMINANTE
  return PROGRESION[(Math.floor(t / COMPAS) + 1) % 4]
}

const escenaEn = (t) => escenas.find((e) => t >= e.inicio && t < e.fin) ?? escenas.at(-1)
const esCorte = (t) => cortes.some((c) => Math.abs(c - t) < 1e-6)
/** Última corchea antes de un corte: el ritmo calla para que el golpe pegue más fuerte. */
const esRespiro = (t) => cortes.some((c) => t >= c - PULSO / 2 - 1e-6 && t < c - 1e-6)
const pulsoGlobal = (t) => Math.round(t / PULSO)

/* ── Instrumentos ── */

function bombo(t) {
  const n0 = muestra(t)
  const largo = muestra(0.5)
  let fase = 0
  for (let k = 0; k < largo; k++) {
    const tt = k / SR
    const f = 42 + 120 * Math.exp(-tt * 30)
    fase += (2 * Math.PI * f) / SR
    let v = Math.sin(fase) * Math.exp(-tt * 6.5) + ruido() * Math.exp(-tt * 400) * 0.25
    v = Math.tanh(v * 1.6) * 0.62
    sumar(n0 + k, v, v)
  }
  /* El colchón y el bajo se apartan cuando golpea el bombo */
  const caida = muestra(0.32)
  for (let k = 0; k < caida; k++) {
    const n = n0 + k
    if (n >= N) break
    compresion[n] = Math.min(compresion[n], 1 - 0.55 * Math.exp(-(k / SR) / 0.09))
  }
}

function palmas(t) {
  const n0 = muestra(t)
  const largo = muestra(0.35)
  const bp = new Biquad("bp", 1400, 0.9)
  for (let k = 0; k < largo; k++) {
    const tt = k / SR
    let env = 0.55 * Math.exp(-tt * 15)
    for (const d of [0, 0.011, 0.022]) if (tt >= d) env = Math.max(env, Math.exp(-(tt - d) * 110))
    const v = bp.proc(ruido()) * env * 0.5
    sumar(n0 + k, v, v, 0.35)
  }
}

function hat(t, intensidad, abierto, pan) {
  const n0 = muestra(t)
  const largo = muestra(abierto ? 0.3 : 0.07)
  const hp = new Biquad("hp", 7500, 0.7)
  const [gl, gr] = paneo(pan)
  for (let k = 0; k < largo; k++) {
    const tt = k / SR
    const v = hp.proc(ruido()) * Math.exp(-tt * (abierto ? 10 : 60)) * 0.1 * intensidad
    sumar(n0 + k, v * gl, v * gr, 0.05)
  }
}

function bajo(t, nota, intensidad, largo) {
  const n0 = muestra(t)
  const total = muestra(largo)
  const sierra = new Sierra()
  const lp = new Biquad("lp", 400, 1.1)
  const f = mtof(nota)
  let faseSub = 0
  for (let k = 0; k < total; k++) {
    const tt = k / SR
    if (k % 32 === 0) lp.ajustar(260 + 900 * Math.exp(-tt * 16), 1.1)
    faseSub += (2 * Math.PI * f) / SR
    const ataque = Math.min(1, tt / 0.004)
    const suelta = Math.min(1, (largo - tt) / 0.03)
    const v = (lp.proc(sierra.valor(f)) * 0.55 + Math.sin(faseSub) * 0.6) * Math.exp(-tt * 3) * ataque * suelta
    const n = n0 + k
    if (n >= N) break
    const s = v * 0.3 * intensidad * compresion[n]
    sumar(n, s, s)
  }
}

function pulsacion(t, nota, intensidad, apertura, pan) {
  const n0 = muestra(t)
  const largo = muestra(0.28)
  const a = new Sierra(azar())
  const b = new Sierra(azar())
  const lp = new Biquad("lp", 2000, 2)
  const f = mtof(nota)
  const [gl, gr] = paneo(pan)
  for (let k = 0; k < largo; k++) {
    const tt = k / SR
    if (k % 32 === 0) lp.ajustar(500 + (1800 + 2600 * apertura) * Math.exp(-tt * 14), 2)
    const v =
      lp.proc(a.valor(f * 1.0035) + b.valor(f * 0.9965)) * Math.exp(-tt * 10) * Math.min(1, tt / 0.002) * 0.045 * intensidad
    sumar(n0 + k, v * gl, v * gr, 0.2, 0.3)
  }
}

function campana(t, nota, intensidad, pan, largo = 1.4) {
  const n0 = muestra(t)
  const total = muestra(largo)
  const f = mtof(nota)
  const [gl, gr] = paneo(pan)
  for (let k = 0; k < total; k++) {
    const tt = k / SR
    const w = 2 * Math.PI * tt
    const v =
      (Math.sin(w * f) + 0.35 * Math.sin(w * f * 2.76) * Math.exp(-tt * 12)) *
      Math.exp(-tt * (5.5 / largo)) *
      Math.min(1, tt / 0.003) *
      0.05 *
      intensidad
    sumar(n0 + k, v * gl, v * gr, 0.55, 0.5)
  }
}

/** Colchón de acordes: tres sierras desafinadas por nota, filtradas y abiertas en estéreo. */
function colchon(inicio, fin, acorde, ganancia, ataque, suelta) {
  const n0 = muestra(inicio)
  const total = muestra(fin - inicio + suelta)
  const sostenido = fin - inicio
  const vocesL = []
  const vocesR = []
  for (const nota of acorde.notas) {
    const f = mtof(nota)
    for (const [desafino, pan] of [[-0.0046, -0.7], [0, 0], [0.0046, 0.7]]) {
      const [gl, gr] = paneo(pan)
      vocesL.push({ s: new Sierra(azar()), f: f * (1 + desafino), g: gl })
      vocesR.push({ g: gr })
    }
  }
  const lpL = new Biquad("lp", 1200, 0.8)
  const lpR = new Biquad("lp", 1200, 0.8)
  const escala = ganancia / vocesL.length
  for (let k = 0; k < total; k++) {
    const tt = k / SR
    const n = n0 + k
    if (n >= N) break
    if (k % 64 === 0) {
      const t = inicio + tt
      const corte = 900 + 700 * Math.min(1, Math.max(0, (t - 2) / 20)) + 260 * Math.sin((2 * Math.PI * t) / 8)
      lpL.ajustar(corte, 0.8)
      lpR.ajustar(corte * 1.04, 0.8)
    }
    let sl = 0
    let sr = 0
    for (let v = 0; v < vocesL.length; v++) {
      const x = vocesL[v].s.valor(vocesL[v].f)
      sl += x * vocesL[v].g
      sr += x * vocesR[v].g
    }
    const env = Math.min(1, tt / ataque) * (tt > sostenido ? Math.max(0, 1 - (tt - sostenido) / suelta) : 1)
    const duck = inicio >= INICIO_RITMO && inicio < INICIO_CIERRE ? compresion[n] : 1
    const g = escala * env * duck
    sumar(n, lpL.proc(sl) * g, lpR.proc(sr) * g, 0.45)
  }
}

/** Subida de ruido filtrado que termina justo en un corte. */
function subida(fin, duracion, ganancia) {
  const n0 = muestra(fin - duracion)
  const total = muestra(duracion)
  const bpL = new Biquad("bp", 250, 3)
  const bpR = new Biquad("bp", 260, 3)
  let fase = 0
  for (let k = 0; k < total; k++) {
    const u = k / total
    if (k % 32 === 0) {
      const f = 250 * (9000 / 250) ** u
      bpL.ajustar(f, 3)
      bpR.ajustar(f * 1.05, 3)
    }
    const fTono = 180 * 5 ** u
    fase += (2 * Math.PI * fTono) / SR
    const env = u ** 2.2 * Math.min(1, (total - k) / (SR * 0.01))
    const tono = Math.sin(fase) * 0.2 * u ** 3
    const vl = (bpL.proc(ruido()) * 1.6 + tono) * env * ganancia
    const vr = (bpR.proc(ruido()) * 1.6 + tono) * env * ganancia
    sumar(n0 + k, vl, vr, 0.25)
  }
}

/** Barrido corto que acompaña un cambio de plano dentro de una escena. */
function barrido(momento, ganancia = 0.22) {
  const duracion = 0.7
  const n0 = muestra(momento + 0.05 - duracion)
  const total = muestra(duracion)
  const bp = new Biquad("bp", 350, 1.5)
  for (let k = 0; k < total; k++) {
    const u = k / total
    if (k % 32 === 0) bp.ajustar(350 * (6000 / 350) ** u, 1.5)
    const env = u ** 1.5 * (1 - u) ** 0.5 * 2.2
    const v = bp.proc(ruido()) * env * ganancia
    const [gl, gr] = paneo(-0.6 + 1.2 * u)
    sumar(n0 + k, v * gl, v * gr, 0.3)
  }
}

/** Golpe en un corte: caída de subgrave, ráfaga de ruido y el acorde nuevo brillando. */
function golpe(t, fuerza = 1) {
  const n0 = muestra(t)
  const total = muestra(2.6 * fuerza)
  const lp = new Biquad("lp", 3000, 0.7)
  let fase = 0
  for (let k = 0; k < total; k++) {
    const tt = k / SR
    fase += (2 * Math.PI * (30 + 55 * Math.exp(-tt * 6))) / SR
    const sub = Math.sin(fase) * Math.exp(-tt * (2.2 / fuerza)) * 0.75
    const rafaga = lp.proc(ruido()) * Math.exp(-tt * 10) * 0.35
    const v = Math.tanh((sub + rafaga) * 1.3) * 0.8 * fuerza
    sumar(n0 + k, v, v, 0.3)
  }
  const acorde = acordeEn(t + 0.01)
  acorde.notas.forEach((nota, i) => {
    const sierra = new Sierra(azar())
    const lpNota = new Biquad("lp", 5000, 0.9)
    const [gl, gr] = paneo(-0.5 + (i / Math.max(1, acorde.notas.length - 1)) * 1.0)
    const largo = muestra(1.6 * fuerza)
    const f = mtof(nota + 12)
    for (let k = 0; k < largo; k++) {
      const tt = k / SR
      if (k % 32 === 0) lpNota.ajustar(900 + 4000 * Math.exp(-tt * 5), 0.9)
      const v = lpNota.proc(sierra.valor(f)) * Math.exp(-tt * (2.4 / fuerza)) * 0.035
      sumar(n0 + k, v * gl, v * gr, 0.6, 0.2)
    }
  })
}

function drone(inicio, fin, ganancia) {
  const n0 = muestra(inicio)
  const total = muestra(fin - inicio)
  let fase = 0
  for (let k = 0; k < total; k++) {
    const t = inicio + k / SR
    fase += (2 * Math.PI * mtof(acordeEn(t).bajo - 12)) / SR
    const env = Math.min(1, (k / SR) / 2.5) * Math.min(1, (total - k) / (SR * 1.5))
    const v = Math.sin(fase) * env * ganancia
    sumar(n0 + k, v, v)
  }
}

/* ── Composición ── */

console.log(`Componiendo ${DURACION} s a 120 BPM · cortes en ${cortes.join(", ")} s`)

const pulsos = []
for (let t = INICIO_RITMO; t < INICIO_CIERRE - 1e-6; t += PULSO) pulsos.push(t)

/* Percusión y bajo: primero el bombo, porque deja la curva de compresión */
for (const t of pulsos) if (!esCorte(t)) bombo(t)

for (const t of pulsos) {
  const posicion = pulsoGlobal(t) % 4
  const modulos = t >= INICIO_MODULOS
  if (modulos && (posicion === 1 || posicion === 3)) palmas(t)

  const abierto = pulsoGlobal(t) % 8 === 7
  const golpes = [
    [t + PULSO / 2, 1, abierto, pulsoGlobal(t) % 2 ? 0.25 : -0.25],
    ...(modulos
      ? [
          [t + SEMICORCHEA, 0.35, false, 0.4],
          [t + SEMICORCHEA * 3, 0.35, false, -0.4],
        ]
      : []),
  ]
  for (const [momento, intensidad, esAbierto, pan] of golpes) {
    if (!esRespiro(momento)) hat(momento, intensidad, esAbierto && !esRespiro(momento + 0.25), pan)
  }

  const acorde = acordeEn(t)
  const nota = posicion === 3 ? acorde.bajo + 7 : acorde.bajo
  bajo(t, nota, 0.8, 0.22)
  if (!esRespiro(t + PULSO / 2)) bajo(t + PULSO / 2, nota, 1, 0.22)
}

/* Arpegio: corcheas en el Dashboard, semicorcheas en los módulos; se abre dentro de cada escena */
const PATRON = [0, 2, 1, 3, 2, 4, 3, 1]
for (let t = INICIO_RITMO; t < INICIO_CIERRE - 1e-6; t += SEMICORCHEA) {
  const paso = Math.round(t / SEMICORCHEA)
  if ((t < INICIO_MODULOS && paso % 2) || esRespiro(t)) continue
  const escena = escenaEn(t)
  const progreso = (t - escena.inicio) / escena.segundos
  const apertura = (t < INICIO_MODULOS ? 0.25 : 0.4) + 0.55 * progreso
  const acorde = acordeEn(t)
  const tonos = [...acorde.notas, acorde.notas[0] + 12]
  const nota = tonos[PATRON[paso % PATRON.length] % tonos.length] + 12
  const acento = paso % 4 === 0 ? 1 : 0.7
  pulsacion(t, nota, acento, apertura, paso % 2 ? 0.35 : -0.35)
}

/* Colchón de acordes, compás a compás, y el acorde final */
for (let t = 0; t < INICIO_CIERRE - 1e-6; t += COMPAS) {
  const intro = t < INICIO_RITMO
  const ganancia = intro ? 0.3 + 0.12 * (t / INICIO_RITMO) : 0.2
  colchon(t, Math.min(t + COMPAS, INICIO_CIERRE), acordeEn(t), ganancia, t === 0 ? 2.5 : 0.35, 0.9)
}
colchon(INICIO_CIERRE, DURACION, FINAL, 0.28, 0.2, 0.01)

/* Subgrave de fondo en la intro y el cierre */
drone(0, INICIO_RITMO, 0.11)
drone(INICIO_CIERRE, DURACION, 0.09)

/* Campanas: la intro crece hasta el estallido del logo; el cierre se va apagando */
for (let t = 0.3; t < 4.8; t += PULSO / 2) {
  if (azar() > 0.72) continue
  const acorde = acordeEn(t)
  const nota = acorde.notas[Math.floor(azar() * acorde.notas.length)] + 24
  campana(t, nota, 0.7 + 1.1 * (t / 4.8), azar() * 1.4 - 0.7)
}
for (let t = INICIO_CIERRE + 0.25; t < DURACION - 1.2; t += SEMICORCHEA * 2) {
  const u = (t - INICIO_CIERRE) / (DURACION - INICIO_CIERRE)
  if (azar() < u * 0.8) continue
  const nota = FINAL.notas[Math.floor(azar() * FINAL.notas.length)] + 24
  campana(t, nota, 1 - u * 0.7, azar() * 1.4 - 0.7, 1.8)
}

/* Momentos de cada escena */
for (const e of escenas) {
  for (const s of e.barridos) barrido(e.inicio + s)
  for (const s of e.destellos) {
    const t = e.inicio + s
    const acorde = acordeEn(t)
    acorde.notas.slice(0, 3).forEach((nota, i) => campana(t + i * 0.03, nota + 24, 1.6, -0.4 + i * 0.4, 2.2))
  }
}

/* Subidas y golpes en los cortes */
for (const c of cortes) {
  /* El estallido del logo y la llegada al cierre llevan una subida más larga y un golpe mayor */
  const especial = c === cortes[0] || c === INICIO_CIERRE
  const duracionSubida = c === INICIO_CIERRE ? 2 : especial ? 1.7 : 1.4
  subida(c, duracionSubida, especial ? 0.28 : 0.2)
  golpe(c, c === INICIO_CIERRE ? 1.35 : especial ? 1.15 : 1)
}

/* ── Efectos de envío ── */

function eco(tiempo, retro, corte) {
  const d = muestra(tiempo)
  const bufL = new Float32Array(d)
  const bufR = new Float32Array(d)
  const lpL = new Biquad("lp", corte, 0.7)
  const lpR = new Biquad("lp", corte, 0.7)
  const salL = new Float32Array(N)
  const salR = new Float32Array(N)
  let i = 0
  for (let n = 0; n < N; n++) {
    const yL = bufL[i]
    const yR = bufR[i]
    /* Ping-pong: la entrada va a la izquierda y cada repetición cambia de lado */
    bufL[i] = (ecoL[n] + ecoR[n]) * 0.5 + lpR.proc(yR) * retro
    bufR[i] = lpL.proc(yL) * retro
    salL[n] = yL
    salR[n] = yR
    if (++i >= d) i = 0
  }
  return [salL, salR]
}

function reverberacion(sala, amortiguacion) {
  const escala = SR / 44100
  const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617]
  const PASOTODOS = [556, 441, 341, 225]
  const canal = (desfase) => ({
    combs: COMBS.map((m) => ({ buf: new Float32Array(Math.round((m + desfase) * escala)), i: 0, filtro: 0 })),
    pasa: PASOTODOS.map((m) => ({ buf: new Float32Array(Math.round((m + desfase) * escala)), i: 0 })),
  })
  const canales = [canal(0), canal(23)]
  const salidas = [new Float32Array(N), new Float32Array(N)]
  const d1 = amortiguacion
  const d2 = 1 - amortiguacion
  for (let n = 0; n < N; n++) {
    const entrada = (revL[n] + revR[n]) * 0.015
    for (let c = 0; c < 2; c++) {
      const { combs, pasa } = canales[c]
      let s = 0
      for (let j = 0; j < combs.length; j++) {
        const cb = combs[j]
        const y = cb.buf[cb.i]
        cb.filtro = y * d2 + cb.filtro * d1
        cb.buf[cb.i] = entrada + cb.filtro * sala
        if (++cb.i >= cb.buf.length) cb.i = 0
        s += y
      }
      for (let j = 0; j < pasa.length; j++) {
        const ap = pasa[j]
        const b = ap.buf[ap.i]
        ap.buf[ap.i] = s + b * 0.5
        s = b - s
        if (++ap.i >= ap.buf.length) ap.i = 0
      }
      salidas[c][n] = s
    }
  }
  return salidas
}

console.log("Aplicando eco y reverberación…")
const [ecoSalL, ecoSalR] = eco(0.375, 0.38, 3500)
for (let n = 0; n < N; n++) {
  L[n] += ecoSalL[n] * 0.55
  R[n] += ecoSalR[n] * 0.55
  revL[n] += ecoSalL[n] * 0.2
  revR[n] += ecoSalR[n] * 0.2
}
const [revSalL, revSalR] = reverberacion(0.86, 0.3)
for (let n = 0; n < N; n++) {
  L[n] += revSalL[n] * 1.2
  R[n] += revSalR[n] * 1.2
}

/* ── Master: filtro de graves, fundidos, nivel y limitador ── */

const hpL = new Biquad("hp", 28, 0.7)
const hpR = new Biquad("hp", 28, 0.7)
const FUNDIDO = 1.8
for (let n = 0; n < N; n++) {
  const t = n / SR
  const entrada = Math.min(1, t / 0.03)
  const salida = t > DURACION - FUNDIDO ? Math.max(0, (DURACION - t) / FUNDIDO) ** 2 : 1
  L[n] = hpL.proc(L[n]) * entrada * salida
  R[n] = hpR.proc(R[n]) * entrada * salida
}

const rms = (desde, hasta) => {
  let suma = 0
  const a = muestra(desde)
  const b = Math.min(N, muestra(hasta))
  for (let n = a; n < b; n++) suma += (L[n] * L[n] + R[n] * R[n]) / 2
  return Math.sqrt(suma / Math.max(1, b - a))
}
const db = (x) => (20 * Math.log10(Math.max(x, 1e-9))).toFixed(1)

/* Nivel de referencia: la zona con ritmo a -14 dBFS RMS */
const objetivo = 10 ** (-14 / 20)
const ganancia = objetivo / rms(INICIO_RITMO, INICIO_CIERRE)
const UMBRAL = 0.8
const limitar = (x) => {
  const a = Math.abs(x)
  if (a <= UMBRAL) return x
  return Math.sign(x) * (UMBRAL + (1 - UMBRAL) * Math.tanh((a - UMBRAL) / (1 - UMBRAL)))
}
let pico = 0
for (let n = 0; n < N; n++) {
  L[n] = limitar(L[n] * ganancia)
  R[n] = limitar(R[n] * ganancia)
  pico = Math.max(pico, Math.abs(L[n]), Math.abs(R[n]))
}
const TECHO = 10 ** (-1 / 20)
if (pico > TECHO) {
  const ajuste = TECHO / pico
  for (let n = 0; n < N; n++) {
    L[n] *= ajuste
    R[n] *= ajuste
  }
  pico = TECHO
}

/* ── WAV estéreo de 16 bits ── */

const datos = Buffer.alloc(44 + N * 4)
datos.write("RIFF", 0)
datos.writeUInt32LE(36 + N * 4, 4)
datos.write("WAVE", 8)
datos.write("fmt ", 12)
datos.writeUInt32LE(16, 16)
datos.writeUInt16LE(1, 20)
datos.writeUInt16LE(2, 22)
datos.writeUInt32LE(SR, 24)
datos.writeUInt32LE(SR * 4, 28)
datos.writeUInt16LE(4, 32)
datos.writeUInt16LE(16, 34)
datos.write("data", 36)
datos.writeUInt32LE(N * 4, 40)
let noNumericos = 0
for (let n = 0; n < N; n++) {
  for (const [c, canal] of [[0, L], [1, R]]) {
    let v = canal[n]
    if (!Number.isFinite(v)) {
      noNumericos++
      v = 0
    }
    datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + n * 4 + c * 2)
  }
}
mkdirSync(path.dirname(ARCHIVO), { recursive: true })
writeFileSync(ARCHIVO, datos)

/* ── Informe ── */

console.log(`\nListo: ${path.relative(RAIZ, ARCHIVO)} · ${(datos.length / 1e6).toFixed(1)} MB`)
console.log(`Pico ${db(pico)} dBFS · RMS total ${db(rms(0, DURACION))} dBFS · muestras no numéricas: ${noNumericos}`)
console.log("\nNivel por escena:")
for (const e of escenas) console.log(`  ${e.id.padEnd(13)} ${db(rms(e.inicio, e.fin)).padStart(6)} dBFS RMS`)
console.log("\nGolpes en los cortes (RMS del medio segundo antes → primeros 150 ms):")
for (const c of cortes) console.log(`  ${String(c).padStart(3)} s   ${db(rms(c - 0.5, c - 0.35))} → ${db(rms(c, c + 0.15))} dBFS`)
