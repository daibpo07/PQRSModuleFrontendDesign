import { useMemo, useRef, useState } from "react"
import { nf, origenMeta, type OrigenSegmento, type Segmento } from "./EnviosMasivosData"

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface Props {
  onClose: () => void
  onCrear: (s: Segmento) => void
}

/* ─────────────────────────────────────────────
   Campos del sistema a los que se mapea el archivo
───────────────────────────────────────────── */
const campos = [
  { key: "nombre",    label: "Nombre",             hints: ["nombre", "name", "cliente", "titular", "ciudadano", "razon"] },
  { key: "documento", label: "Documento",          hints: ["documento", "cedula", "cédula", "nit", "identificac", "doc"] },
  { key: "telefono",  label: "Teléfono / WhatsApp", hints: ["tel", "cel", "movil", "móvil", "whats", "phone", "numero", "número"] },
  { key: "email",     label: "Correo electrónico", hints: ["mail", "correo", "e-mail"] },
  { key: "ciudad",    label: "Ciudad",             hints: ["ciudad", "municipio", "city", "depart"] },
  { key: "radicado",  label: "Radicado PQRS",      hints: ["radicad", "pqr", "caso", "ticket"] },
] as const

type CampoKey = (typeof campos)[number]["key"] | "ignorar"

/* Archivo de muestra, para poder recorrer el flujo sin subir nada */
const csvEjemplo = `nombre;documento;celular;correo;ciudad
Carlos Morales Ruiz;1035700880;3001234567;carlos.morales@gmail.com;Medellín
María López Grisales;1017245512;3109876543;maria.lopez@hotmail.com;Envigado
Pedro Ramírez Ortiz;71234567;3145558899;;Itagüí
Ana Sofía Rodríguez;43112233;;ana.sofia@empresa.com;Medellín
Lucía Fernández Mesa;1020304050;3112223344;lucia.fernandez@outlook.com;Bello
Roberto Silva Cano;98765432;3009998877;roberto.silva@gmail.com;Sabaneta
Carlos Morales Ruiz;1035700880;3001234567;carlos.morales@gmail.com;Medellín
Juan García Pineda;1122334455;3021112233;juan.garcia@gmail.com;Medellín
Sandra Osorio Vélez;39887766;3156667788;;Caldas
Diego Zapata Muñoz;15667788;;diego.zapata@yahoo.com;La Estrella
Paula Restrepo Uribe;1098776655;3184445566;paula.restrepo@gmail.com;Rionegro
Andrés Betancur Flórez;1035700881;3007778899;andres.betancur@gmail.com;Medellín`

/* ─────────────────────────────────────────────
   Utilidades de archivo
───────────────────────────────────────────── */
function parseCSV(texto: string) {
  const lineas = texto.trim().split(/\r?\n/).filter(l => l.trim())
  if (lineas.length === 0) return { headers: [], filas: [] as string[][] }
  const puntoComa = (lineas[0].match(/;/g) ?? []).length
  const coma = (lineas[0].match(/,/g) ?? []).length
  const sep = puntoComa > coma ? ";" : ","
  const corta = (l: string) => l.split(sep).map(c => c.trim().replace(/^"|"$/g, ""))
  return { headers: corta(lineas[0]), filas: lineas.slice(1).map(corta) }
}

function autoMapear(headers: string[]): CampoKey[] {
  const usados = new Set<string>()
  return headers.map(h => {
    const norm = h.toLowerCase()
    const match = campos.find(c => !usados.has(c.key) && c.hints.some(x => norm.includes(x)))
    if (match) {
      usados.add(match.key)
      return match.key as CampoKey
    }
    return "ignorar" as CampoKey
  })
}

const soloDigitos = (s: string) => s.replace(/\D/g, "")

/* ─────────────────────────────────────────────
   Constructor de reglas dinámicas
───────────────────────────────────────────── */
interface Regla {
  campo: string
  operador: string
  valor: string
}

const camposRegla: Record<string, string[]> = {
  "Estado del radicado": ["Recibido", "En gestión", "Resuelto", "Cerrado", "Rechazado"],
  "Tipo de solicitud": ["Petición", "Queja", "Reclamo", "Sugerencia"],
  Dependencia: ["Planeación Municipal", "Servicios al Ciudadano", "Empresa de Acueducto", "Secretaría de Salud"],
  Prioridad: ["Alta", "Media", "Baja"],
  "Días para vencer": ["3", "7", "15", "30"],
  "Canal de ingreso": ["Portal Web", "Correo Electrónico", "Presencial", "Línea 195"],
}

/* ─────────────────────────────────────────────
   Componente
───────────────────────────────────────────── */
export default function ImportarAudiencia({ onClose, onCrear }: Props) {
  const [paso, setPaso] = useState(1)
  const [origen, setOrigen] = useState<OrigenSegmento>("importacion")
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [filas, setFilas] = useState<string[][]>([])
  const [mapeo, setMapeo] = useState<CampoKey[]>([])
  const [arrastrando, setArrastrando] = useState(false)
  const [reglas, setReglas] = useState<Regla[]>([
    { campo: "Estado del radicado", operador: "es igual a", valor: "En gestión" },
  ])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [excluirSinCanal, setExcluirSinCanal] = useState(true)
  const [excluirDuplicados, setExcluirDuplicados] = useState(true)
  const [error, setError] = useState("")
  const inputFile = useRef<HTMLInputElement>(null)

  const esImport = origen === "importacion"

  /* ── Carga del archivo ── */
  const cargarTexto = (texto: string, nombreArch: string) => {
    const { headers: h, filas: f } = parseCSV(texto)
    if (h.length === 0 || f.length === 0) {
      setError("No se pudo leer el archivo. Verifica que tenga una fila de encabezados y al menos un registro.")
      return
    }
    setHeaders(h)
    setFilas(f)
    setMapeo(autoMapear(h))
    setNombreArchivo(nombreArch)
    setNombre(n => n || nombreArch.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "))
    setError("")
  }

  const leerArchivo = (file: File) => {
    const lector = new FileReader()
    lector.onload = () => cargarTexto(String(lector.result ?? ""), file.name)
    lector.onerror = () => setError("No se pudo leer el archivo.")
    lector.readAsText(file)
  }

  /* ── Validación del archivo mapeado ── */
  const analisis = useMemo(() => {
    const idx = (k: CampoKey) => mapeo.indexOf(k)
    const iTel = idx("telefono")
    const iMail = idx("email")
    const iDoc = idx("documento")

    const vistos = new Set<string>()
    let conTel = 0
    let conMail = 0
    let sinCanal = 0
    let duplicados = 0

    filas.forEach(f => {
      const tel = iTel >= 0 ? soloDigitos(f[iTel] ?? "") : ""
      const mail = iMail >= 0 ? (f[iMail] ?? "").trim() : ""
      const doc = iDoc >= 0 ? soloDigitos(f[iDoc] ?? "") : ""

      const telOk = tel.length >= 7
      const mailOk = /.+@.+\..+/.test(mail)
      if (telOk) conTel++
      if (mailOk) conMail++
      if (!telOk && !mailOk) sinCanal++

      const clave = doc || tel || mail
      if (clave) {
        if (vistos.has(clave)) duplicados++
        else vistos.add(clave)
      }
    })

    const total = filas.length
    const validos = total - (excluirSinCanal ? sinCanal : 0) - (excluirDuplicados ? duplicados : 0)

    /* Cobertura estimada: el 78 % de los móviles del país tiene WhatsApp activo */
    const wa = conTel * 0.78
    const sms = conTel * 0.22
    const mail = conMail
    const suma = wa + sms + mail || 1

    return {
      total,
      conTel,
      conMail,
      sinCanal,
      duplicados,
      validos: Math.max(0, validos),
      mix: {
        whatsapp: Math.round((wa / suma) * 100),
        sms: Math.round((sms / suma) * 100),
        email: Math.round((mail / suma) * 100),
      },
      camposMapeados: mapeo.filter(m => m !== "ignorar").length,
    }
  }, [filas, mapeo, excluirSinCanal, excluirDuplicados])

  /* ── Estimación para reglas dinámicas ── */
  const totalRegla = useMemo(() => {
    const base = 18320
    const factor = reglas.reduce((a, r, i) => a * (0.34 + ((r.valor.length + i * 7) % 23) / 100), 1)
    return Math.max(12, Math.round(base * factor))
  }, [reglas])

  const totalFinal = esImport ? analisis.validos : totalRegla

  const puedeAvanzar = () => {
    if (paso === 1) return true
    if (paso === 2) return esImport ? filas.length > 0 : reglas.length > 0
    return true
  }

  const crear = () => {
    if (nombre.trim().length < 4) {
      setError("Dale un nombre de al menos 4 caracteres a la audiencia")
      return
    }
    onCrear({
      id: `s${Date.now()}`,
      nombre: nombre.trim(),
      descripcion:
        descripcion.trim() ||
        (esImport
          ? `Base importada desde ${nombreArchivo} con ${nf(analisis.validos)} contactos válidos.`
          : `Audiencia dinámica sobre los datos del sistema PQRS.`),
      total: totalFinal,
      filtros: esImport
        ? [`Archivo: ${nombreArchivo}`, `${analisis.camposMapeados} campos mapeados`, "Opt-in declarado"]
        : reglas.map(r => `${r.campo} ${r.operador} ${r.valor}`),
      origen,
      archivo: esImport ? nombreArchivo : undefined,
      actualizado: "Hace un momento",
      crecimiento: 0,
      mix: esImport ? analisis.mix : { whatsapp: 57, sms: 21, email: 22 },
    })
  }

  const pasos = ["Origen", esImport ? "Archivo y mapeo" : "Reglas", "Validación"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Encabezado ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nueva audiencia</h3>
              <p className="text-xs text-slate-400">
                Define de dónde salen los contactos y qué datos trae cada uno
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-0 mt-4">
            {pasos.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0"
                    style={{
                      background: i + 1 <= paso ? "#1E3A8A" : "#fff",
                      borderColor: i + 1 <= paso ? "#1E3A8A" : "#e2e8f0",
                      color: i + 1 <= paso ? "#fff" : "#94a3b8",
                    }}
                  >
                    {i + 1 < paso ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="text-[11px] font-semibold whitespace-nowrap hidden sm:block" style={{ color: i + 1 <= paso ? "#1E3A8A" : "#94a3b8" }}>
                    {s}
                  </span>
                </div>
                {i < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3" style={{ background: i + 1 < paso ? "#1E3A8A" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Contenido ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ═══ PASO 1 · Origen ═══ */}
          {paso === 1 && (
            <>
              <p className="text-xs text-slate-500 leading-relaxed">
                Una audiencia es simplemente una lista de destinatarios con su canal de contacto. Puede alimentarse de
                tres formas:
              </p>

              {(["importacion", "regla", "pqrs"] as OrigenSegmento[]).map(o => {
                const m = origenMeta[o]
                const sel = origen === o
                const bloqueado = o === "pqrs"
                return (
                  <button
                    key={o}
                    onClick={() => !bloqueado && setOrigen(o)}
                    className="w-full flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: sel ? m.color : "#e2e8f0",
                      background: sel ? m.bg : bloqueado ? "#f8fafc" : "#fff",
                      cursor: bloqueado ? "default" : "pointer",
                      opacity: bloqueado ? 0.75 : 1,
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm"
                      style={{ color: m.color }}
                    >
                      {o === "importacion" ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : o === "regla" ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-700">{m.label}</p>
                        {bloqueado && (
                          <span className="text-[9px] font-semibold rounded px-1.5 py-px bg-slate-100 text-slate-400">
                            Automático
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{m.descripcion}</p>
                    </div>
                  </button>
                )
              })}

              <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#eff3ff" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  La base de <span className="font-semibold">peticionarios del sistema</span> ya existe y crece sola:
                  cada radicado del portal, del buzón de correos o de la línea telefónica deja el contacto registrado.
                  Sobre esa base es que operan las reglas dinámicas.
                </p>
              </div>
            </>
          )}

          {/* ═══ PASO 2 · Archivo y mapeo ═══ */}
          {paso === 2 && esImport && (
            <>
              {filas.length === 0 ? (
                <>
                  <div
                    onDragOver={e => {
                      e.preventDefault()
                      setArrastrando(true)
                    }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={e => {
                      e.preventDefault()
                      setArrastrando(false)
                      const f = e.dataTransfer.files?.[0]
                      if (f) leerArchivo(f)
                    }}
                    onClick={() => inputFile.current?.click()}
                    className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-14 cursor-pointer transition-all"
                    style={{
                      borderColor: arrastrando ? "#1E3A8A" : "#cbd5e1",
                      background: arrastrando ? "#eff3ff" : "#f8fafc",
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#eff3ff" }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-[#1E3A8A]">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-9.707a1 1 0 011.414 0L9 8.586V3a1 1 0 112 0v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Arrastra tu archivo aquí</p>
                      <p className="text-xs text-slate-400 mt-1">CSV o TXT separado por comas o punto y coma · hasta 50.000 filas</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#1E3A8A] underline">o selecciónalo del equipo</span>
                    <input
                      ref={inputFile}
                      type="file"
                      accept=".csv,.txt,text/csv"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) leerArchivo(f)
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-semibold text-slate-300">O</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <button
                    onClick={() => cargarTexto(csvEjemplo, "base_ejemplo_ciudadanos.csv")}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer"
                  >
                    Usar un archivo de ejemplo para ver el flujo
                  </button>

                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Estructura esperada del archivo
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                        La primera fila debe ser el encabezado. No importa el nombre exacto de las columnas: en el
                        siguiente paso las mapeas a los campos del sistema.
                      </p>
                      <pre className="text-[10px] font-mono text-slate-500 bg-slate-50 rounded-lg p-3 overflow-x-auto leading-relaxed">
{`nombre;documento;celular;correo;ciudad
Carlos Morales;1035700880;3001234567;carlos@mail.com;Medellín
María López;1017245512;3109876543;maria@mail.com;Envigado`}
                      </pre>
                      <p className="text-[10px] text-slate-400 mt-2.5">
                        Se requiere al menos una columna de <span className="font-semibold">teléfono</span> o de{" "}
                        <span className="font-semibold">correo</span>; sin eso el contacto no es alcanzable.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Archivo cargado */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#d1fae5" }}>
                      <svg viewBox="0 0 20 20" fill="#059669" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate">{nombreArchivo}</p>
                      <p className="text-[10px] text-slate-400">
                        {nf(filas.length)} filas · {headers.length} columnas detectadas
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFilas([])
                        setHeaders([])
                        setMapeo([])
                        setNombreArchivo("")
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-500 hover:bg-white transition-all cursor-pointer shrink-0"
                    >
                      Cambiar archivo
                    </button>
                  </div>

                  {/* Mapeo */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Mapeo de columnas</p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Detectamos automáticamente {mapeo.filter(m => m !== "ignorar").length} de {headers.length}{" "}
                      columnas. Corrige lo que haga falta.
                    </p>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              {headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 border-b border-slate-100 text-left min-w-[150px]">
                                  <p className="text-[10px] font-mono text-slate-400 truncate mb-1.5">{h}</p>
                                  <select
                                    value={mapeo[i]}
                                    onChange={e =>
                                      setMapeo(m => m.map((x, j) => (j === i ? (e.target.value as CampoKey) : x)))
                                    }
                                    className="w-full px-2 py-1 rounded-md border text-[11px] font-semibold focus:outline-none focus:border-[#0EA5E9] transition-all cursor-pointer"
                                    style={{
                                      borderColor: mapeo[i] === "ignorar" ? "#e2e8f0" : "#1E3A8A",
                                      color: mapeo[i] === "ignorar" ? "#94a3b8" : "#1E3A8A",
                                      background: mapeo[i] === "ignorar" ? "#fff" : "#eff3ff",
                                    }}
                                  >
                                    <option value="ignorar">— No importar —</option>
                                    {campos.map(c => (
                                      <option key={c.key} value={c.key}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filas.slice(0, 5).map((f, i) => (
                              <tr key={i} className="border-b border-slate-50">
                                {headers.map((_, j) => (
                                  <td key={j} className="px-3 py-2 text-[11px] text-slate-500 truncate max-w-[180px]">
                                    {f[j] || <span className="text-slate-300 italic">vacío</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-3 py-2 border-t border-slate-100 text-[10px] text-slate-400" style={{ background: "#f8fafc" }}>
                        Vista previa de las primeras 5 filas de {nf(filas.length)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="text-[11px] text-red-500 rounded-lg px-3 py-2" style={{ background: "#fef2f2" }}>
                  {error}
                </p>
              )}
            </>
          )}

          {/* ═══ PASO 2 · Reglas ═══ */}
          {paso === 2 && !esImport && (
            <>
              <p className="text-xs text-slate-500 leading-relaxed">
                La audiencia se calcula sobre los peticionarios ya registrados en el sistema. Se recalcula sola justo
                antes de cada envío, así que siempre trabaja con datos frescos.
              </p>

              <div className="space-y-2">
                {reglas.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-300 w-6 shrink-0">{i === 0 ? "SI" : "Y"}</span>
                    <select
                      value={r.campo}
                      onChange={e =>
                        setReglas(rs =>
                          rs.map((x, j) =>
                            j === i ? { ...x, campo: e.target.value, valor: camposRegla[e.target.value][0] } : x,
                          ),
                        )
                      }
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer"
                    >
                      {Object.keys(camposRegla).map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={r.operador}
                      onChange={e => setReglas(rs => rs.map((x, j) => (j === i ? { ...x, operador: e.target.value } : x)))}
                      className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer shrink-0"
                    >
                      {["es igual a", "es distinto de", "es menor que", "es mayor que"].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <select
                      value={r.valor}
                      onChange={e => setReglas(rs => rs.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)))}
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer"
                    >
                      {camposRegla[r.campo].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setReglas(rs => rs.filter((_, j) => j !== i))}
                      disabled={reglas.length === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer shrink-0 disabled:opacity-30"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setReglas(rs => [...rs, { campo: "Prioridad", operador: "es igual a", valor: "Alta" }])}
                className="w-full py-2 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
              >
                + Agregar condición
              </button>

              <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4" style={{ background: "#eff3ff" }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coincidencias</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1E3A8A" }}>{nf(totalRegla)}</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed flex-1">
                  peticionarios cumplen estas condiciones ahora mismo. El número cambia con cada nuevo radicado.
                </p>
              </div>
            </>
          )}

          {/* ═══ PASO 3 · Validación ═══ */}
          {paso === 3 && (
            <>
              {esImport && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { l: "Filas leídas", v: nf(analisis.total), c: "#1E3A8A", b: "#eff3ff", bd: "#c7d7fe" },
                      { l: "Con teléfono", v: nf(analisis.conTel), c: "#059669", b: "#ecfdf5", bd: "#a7f3d0" },
                      { l: "Con correo", v: nf(analisis.conMail), c: "#0EA5E9", b: "#e0f2fe", bd: "#bae6fd" },
                      { l: "Sin canal", v: nf(analisis.sinCanal), c: "#d97706", b: "#fffbeb", bd: "#fde68a" },
                    ].map(x => (
                      <div key={x.l} className="rounded-xl p-3.5 border" style={{ background: x.b, borderColor: x.bd }}>
                        <p className="text-xl font-bold" style={{ color: x.c }}>{x.v}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{x.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        on: excluirSinCanal,
                        set: setExcluirSinCanal,
                        label: `Descartar ${nf(analisis.sinCanal)} contactos sin teléfono ni correo`,
                        sub: "No hay forma de alcanzarlos; incluirlos infla el conteo de la campaña",
                      },
                      {
                        on: excluirDuplicados,
                        set: setExcluirDuplicados,
                        label: `Descartar ${nf(analisis.duplicados)} registros duplicados`,
                        sub: "Se comparan por documento, teléfono o correo, en ese orden",
                      },
                    ].map(r => (
                      <button
                        key={r.label}
                        onClick={() => r.set(!r.on)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-left transition-all cursor-pointer hover:border-slate-300"
                      >
                        <span
                          className="w-8 rounded-full relative shrink-0 transition-colors"
                          style={{ background: r.on ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                        >
                          <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: r.on ? 16 : 2 }} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700">{r.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Cobertura estimada por canal
                    </p>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      {[
                        { v: analisis.mix.whatsapp, c: "#059669" },
                        { v: analisis.mix.sms, c: "#d97706" },
                        { v: analisis.mix.email, c: "#0EA5E9" },
                      ].map((x, i) => (
                        <span key={i} style={{ width: `${x.v}%`, background: x.c }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {[
                        { l: "WhatsApp", v: analisis.mix.whatsapp, c: "#059669" },
                        { l: "SMS", v: analisis.mix.sms, c: "#d97706" },
                        { l: "Email", v: analisis.mix.email, c: "#0EA5E9" },
                      ].map(x => (
                        <span key={x.l} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: x.c }} />
                          {x.l} <span className="font-semibold text-slate-600">{x.v}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre de la audiencia</label>
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Base ciudadana Antioquia"
                    className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                    style={{ borderColor: error && nombre.trim().length < 4 ? "#fca5a5" : "#e2e8f0" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Descripción <span className="text-slate-300 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    rows={2}
                    placeholder="Para qué sirve esta audiencia y quién la mantiene"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="rounded-xl px-4 py-3.5 flex items-center gap-4" style={{ background: "#1E3A8A" }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Audiencia final</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{nf(totalFinal)}</p>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed flex-1">
                  destinatarios quedarán disponibles para usar en cualquier campaña del módulo.
                </p>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Al crear la audiencia declaras que cuentas con autorización de tratamiento de datos de estos titulares,
                conforme a la Ley 1581 de 2012. Los contactos que hayan cancelado su suscripción se excluyen de forma
                automática en cada envío.
              </p>

              {error && nombre.trim().length < 4 && <p className="text-[11px] text-red-500">{error}</p>}
            </>
          )}
        </div>

        {/* ── Pie ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={() => (paso === 1 ? onClose() : setPaso(p => p - 1))}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {paso === 1 ? "Cancelar" : "Atrás"}
          </button>
          <p className="text-[11px] text-slate-400 hidden sm:block ml-1">
            Paso {paso} de 3 · {pasos[paso - 1]}
          </p>
          <button
            onClick={() => (paso === 3 ? crear() : puedeAvanzar() && setPaso(p => p + 1))}
            disabled={!puedeAvanzar()}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
            style={{ background: "#1E3A8A" }}
          >
            {paso === 3 ? "Crear audiencia" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
