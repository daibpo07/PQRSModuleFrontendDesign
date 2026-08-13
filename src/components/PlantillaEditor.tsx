import { useState } from "react"
import DevicePreview, { sampleVars } from "./DevicePreview"
import {
  CanalIcon,
  canalMeta,
  type BotonPlantilla,
  type Canal,
  type Plantilla,
} from "./EnviosMasivosData"

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface Props {
  inicial?: Plantilla | null
  onClose: () => void
  onGuardar: (p: Plantilla) => void
}

const categorias: Plantilla["categoria"][] = [
  "Notificación",
  "Recordatorio",
  "Encuesta",
  "Alerta",
  "Cierre",
]

/** Partes que acepta cada canal. Meta solo permite estructura completa en WhatsApp. */
const soporta: Record<Canal, { encabezado: boolean; pie: boolean; botones: number; asunto: boolean }> = {
  whatsapp: { encabezado: true, pie: true, botones: 3, asunto: false },
  email:    { encabezado: true, pie: true, botones: 2, asunto: true },
  sms:      { encabezado: false, pie: false, botones: 0, asunto: false },
  push:     { encabezado: true, pie: false, botones: 0, asunto: false },
}

/* ─────────────────────────────────────────────
   Bloque de sección del constructor
───────────────────────────────────────────── */
function Bloque({
  n,
  titulo,
  ayuda,
  opcional,
  children,
}: {
  n: string
  titulo: string
  ayuda: string
  opcional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-start gap-2.5 px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-px"
          style={{ background: "#eff3ff", color: "#1E3A8A" }}
        >
          {n}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-slate-700">{titulo}</p>
            {opcional && (
              <span className="text-[9px] font-semibold rounded px-1.5 py-px bg-slate-100 text-slate-400">
                Opcional
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{ayuda}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Editor de plantillas
───────────────────────────────────────────── */
export default function PlantillaEditor({ inicial, onClose, onGuardar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "")
  const [canal, setCanal] = useState<Canal>(inicial?.canal ?? "whatsapp")
  const [categoria, setCategoria] = useState<Plantilla["categoria"]>(inicial?.categoria ?? "Notificación")
  const [encabezado, setEncabezado] = useState(inicial?.encabezado ?? "")
  const [cuerpo, setCuerpo] = useState(inicial?.cuerpo ?? "")
  const [pie, setPie] = useState(inicial?.pie ?? "")
  const [botones, setBotones] = useState<BotonPlantilla[]>(inicial?.botones ?? [])
  const [conDatos, setConDatos] = useState(true)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const meta = canalMeta[canal]
  const cap = soporta[canal]
  const restantes = meta.limite - cuerpo.length

  const variables = Array.from(
    new Set([...`${encabezado} ${cuerpo}`.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1])),
  )

  const insertar = (v: string) => setCuerpo(c => `${c}{{${v}}}`)

  const agregarBoton = (tipo: BotonPlantilla["tipo"]) => {
    if (botones.length >= cap.botones) return
    setBotones(b => [...b, { tipo, texto: "", url: tipo === "enlace" ? "https://" : undefined }])
  }

  const actualizarBoton = (i: number, campo: keyof BotonPlantilla, valor: string) =>
    setBotones(b => b.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)))

  const guardar = () => {
    const e: Record<string, string> = {}
    if (nombre.trim().length < 5) e.nombre = "Dale un nombre de al menos 5 caracteres"
    if (!cuerpo.trim()) e.cuerpo = "El cuerpo del mensaje es obligatorio"
    else if (cuerpo.length > meta.limite) e.cuerpo = `Excede el límite de ${meta.limite} caracteres`
    if (botones.some(b => !b.texto.trim())) e.botones = "Todos los botones necesitan texto"
    setErrores(e)
    if (Object.keys(e).length > 0) return

    onGuardar({
      id: inicial?.id ?? `p${Date.now()}`,
      nombre: nombre.trim(),
      canal,
      categoria,
      /* WhatsApp exige revisión de Meta antes de poder usarse */
      aprobacion: canal === "whatsapp" ? "En revisión" : "Aprobada",
      encabezado: cap.encabezado ? encabezado.trim() || undefined : undefined,
      cuerpo: cuerpo.trim(),
      pie: cap.pie ? pie.trim() || undefined : undefined,
      botones: botones.length > 0 ? botones : undefined,
      variables,
      usos: inicial?.usos ?? 0,
      tasaLectura: inicial?.tasaLectura ?? 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Encabezado ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {inicial ? "Editar plantilla" : "Nueva plantilla"}
            </h3>
            <p className="text-xs text-slate-400">
              Encabezado, cuerpo, pie y botones — la estructura que exige cada canal
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

        {/* ── Cuerpo ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_300px]">

            {/* Constructor */}
            <div className="p-6 space-y-4 min-w-0" style={{ background: "#f8fafc" }}>

              {/* 1 · Identidad */}
              <Bloque n="1" titulo="Identidad de la plantilla" ayuda="Cómo la reconocerás al armar una campaña.">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Nombre</label>
                    <input
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej. Recordatorio de vencimiento"
                      className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                      style={{ borderColor: errores.nombre ? "#fca5a5" : "#e2e8f0" }}
                    />
                    {errores.nombre && <p className="text-[11px] text-red-500 mt-1">{errores.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Canal</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(canalMeta) as Canal[]).map(c => {
                        const m = canalMeta[c]
                        const sel = canal === c
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              setCanal(c)
                              setBotones(b => b.slice(0, soporta[c].botones))
                            }}
                            className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 transition-all cursor-pointer"
                            style={{ borderColor: sel ? m.color : "#e2e8f0", background: sel ? m.bg : "#fff" }}
                          >
                            <CanalIcon canal={c} className="w-4 h-4" />
                            <span className="text-[10px] font-bold" style={{ color: sel ? m.color : "#94a3b8" }}>
                              {m.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Categoría</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {categorias.map(c => (
                        <button
                          key={c}
                          onClick={() => setCategoria(c)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                          style={{
                            background: categoria === c ? "#1E3A8A" : "#fff",
                            color: categoria === c ? "#fff" : "#64748b",
                            borderColor: categoria === c ? "#1E3A8A" : "#e2e8f0",
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Bloque>

              {/* 2 · Encabezado */}
              {cap.encabezado && (
                <Bloque
                  n="2"
                  titulo="Encabezado"
                  ayuda="Una línea corta en negrita sobre el mensaje. Ayuda a que se entienda de qué trata sin abrirlo."
                  opcional
                >
                  <input
                    value={encabezado}
                    onChange={e => setEncabezado(e.target.value)}
                    maxLength={60}
                    placeholder="Ej. Tu radicado está por vencer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right font-mono">{encabezado.length} / 60</p>
                </Bloque>
              )}

              {/* 3 · Cuerpo */}
              <Bloque
                n={cap.encabezado ? "3" : "2"}
                titulo="Cuerpo del mensaje"
                ayuda="El contenido principal. Usa variables para personalizarlo con los datos de cada destinatario."
              >
                <textarea
                  value={cuerpo}
                  onChange={e => setCuerpo(e.target.value)}
                  rows={6}
                  placeholder="Hola {{nombre}}, tu radicado {{radicado}} vence el {{fecha}}…"
                  className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
                  style={{ borderColor: errores.cuerpo ? "#fca5a5" : "#e2e8f0" }}
                />
                <div className="flex items-center justify-between mt-1">
                  {errores.cuerpo ? (
                    <p className="text-[11px] text-red-500">{errores.cuerpo}</p>
                  ) : (
                    <span className="text-[10px] text-slate-400">Enter crea un salto de línea</span>
                  )}
                  <span
                    className="text-[10px] font-mono font-semibold"
                    style={{ color: restantes < 0 ? "#dc2626" : restantes < 40 ? "#d97706" : "#94a3b8" }}
                  >
                    {cuerpo.length} / {meta.limite}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Variables disponibles
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.keys(sampleVars).map(v => {
                      const usada = variables.includes(v)
                      return (
                        <button
                          key={v}
                          onClick={() => insertar(v)}
                          title={`Se reemplaza por: ${sampleVars[v]}`}
                          className="px-2 py-1 rounded-md text-[10px] font-mono font-semibold border transition-all cursor-pointer"
                          style={{
                            background: usada ? "#fef9c3" : "#f8fafc",
                            color: usada ? "#854d0e" : "#64748b",
                            borderColor: usada ? "#fde68a" : "#e2e8f0",
                          }}
                        >
                          {`{{${v}}}`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Bloque>

              {/* 4 · Pie */}
              {cap.pie && (
                <Bloque
                  n={cap.encabezado ? "4" : "3"}
                  titulo="Pie de página"
                  ayuda="Texto pequeño al final, en gris. Suele usarse para la firma de la entidad o un aviso legal."
                  opcional
                >
                  <input
                    value={pie}
                    onChange={e => setPie(e.target.value)}
                    maxLength={60}
                    placeholder="Ej. Pqrslab · Atención al ciudadano"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right font-mono">{pie.length} / 60</p>
                </Bloque>
              )}

              {/* 5 · Botones */}
              {cap.botones > 0 && (
                <Bloque
                  n={cap.encabezado ? "5" : "4"}
                  titulo="Botones de acción"
                  ayuda={`Hasta ${cap.botones}. Los de respuesta rápida devuelven un mensaje al sistema; los de enlace abren una página.`}
                  opcional
                >
                  <div className="space-y-2">
                    {botones.map((b, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-2.5" style={{ background: "#f8fafc" }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold rounded px-1.5 py-0.5 shrink-0"
                            style={
                              b.tipo === "enlace"
                                ? { background: "#e0f2fe", color: "#0369a1" }
                                : { background: "#d1fae5", color: "#065f46" }
                            }
                          >
                            {b.tipo === "enlace" ? "Enlace" : "Respuesta"}
                          </span>
                          <input
                            value={b.texto}
                            onChange={e => actualizarBoton(i, "texto", e.target.value)}
                            maxLength={25}
                            placeholder="Texto del botón"
                            className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#0EA5E9] transition-all"
                          />
                          <button
                            onClick={() => setBotones(bs => bs.filter((_, j) => j !== i))}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer shrink-0"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        {b.tipo === "enlace" && (
                          <input
                            value={b.url ?? ""}
                            onChange={e => actualizarBoton(i, "url", e.target.value)}
                            placeholder="https://…"
                            className="w-full mt-2 px-2 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-mono text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-[#0EA5E9] transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {errores.botones && <p className="text-[11px] text-red-500 mt-2">{errores.botones}</p>}

                  {botones.length < cap.botones && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => agregarBoton("respuesta")}
                        className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                      >
                        + Respuesta rápida
                      </button>
                      <button
                        onClick={() => agregarBoton("enlace")}
                        className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                      >
                        + Enlace
                      </button>
                    </div>
                  )}
                </Bloque>
              )}

              {/* Aviso de aprobación */}
              <div
                className="rounded-xl p-3.5 flex items-start gap-3"
                style={{ background: canal === "whatsapp" ? "#fef3c7" : "#eff3ff" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: canal === "whatsapp" ? "#92400e" : "#1E3A8A" }}
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {canal === "whatsapp" ? (
                    <>
                      Al guardar, la plantilla queda <span className="font-semibold">En revisión</span> y se envía a
                      Meta para aprobación. El proceso tarda entre unos minutos y 24 horas; no podrás usarla en una
                      campaña hasta que quede aprobada.
                    </>
                  ) : (
                    <>
                      Las plantillas de {meta.label} quedan <span className="font-semibold">disponibles de inmediato</span>,
                      sin proceso de aprobación externo.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Vista previa */}
            <div className="border-l border-slate-100 p-5 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vista previa</p>
                <button
                  onClick={() => setConDatos(v => !v)}
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5 border transition-all cursor-pointer"
                  style={{
                    background: conDatos ? "#eff3ff" : "#fff",
                    color: conDatos ? "#1E3A8A" : "#94a3b8",
                    borderColor: conDatos ? "#c7d7fe" : "#e2e8f0",
                  }}
                >
                  {conDatos ? "Con datos" : "Variables"}
                </button>
              </div>

              <DevicePreview
                canal={canal}
                cuerpo={cuerpo}
                asunto={cap.asunto ? nombre : undefined}
                conDatos={conDatos}
                encabezado={cap.encabezado ? encabezado : ""}
                pie={cap.pie ? pie : ""}
                botones={botones}
              />

              {/* Estructura resuelta */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Estructura</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { l: "Encabezado", ok: cap.encabezado && !!encabezado.trim(), na: !cap.encabezado },
                    { l: "Cuerpo", ok: !!cuerpo.trim(), na: false },
                    { l: "Pie de página", ok: cap.pie && !!pie.trim(), na: !cap.pie },
                    { l: "Botones", ok: botones.length > 0, na: cap.botones === 0 },
                  ].map(x => (
                    <div key={x.l} className="flex items-center gap-2 px-3 py-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: x.na ? "#f1f5f9" : x.ok ? "#d1fae5" : "#fef3c7" }}
                      >
                        {x.ok && !x.na && (
                          <svg viewBox="0 0 20 20" fill="#059669" className="w-2 h-2">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">{x.l}</span>
                      <span className="ml-auto text-[9px] text-slate-300">
                        {x.na ? "no aplica" : x.ok ? "definido" : "vacío"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {variables.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#854d0e" }}>
                    {variables.length} variable{variables.length === 1 ? "" : "s"} en uso
                  </p>
                  <p className="text-[10px] leading-relaxed" style={{ color: "#854d0e" }}>
                    Cada destinatario recibirá su propio valor. Si un contacto no tiene el dato, la campaña lo omite
                    para evitar enviar el marcador en crudo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pie ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <p className="text-[11px] text-slate-400 hidden sm:block ml-1">
            {meta.label} · {categoria}
          </p>
          <button
            onClick={guardar}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {canal === "whatsapp" ? "Guardar y enviar a revisión" : "Guardar plantilla"}
          </button>
        </div>
      </div>
    </div>
  )
}
