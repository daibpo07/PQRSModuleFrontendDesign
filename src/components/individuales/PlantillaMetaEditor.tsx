import { useState } from "react"
import DevicePreview from "@/components/shared/DevicePreview"
import {
  canalPlantillaMeta,
  categoriaMetaEstilo,
  variablesPlantilla,
  type BotonPlantilla,
  type CanalPlantilla,
  type CategoriaMeta,
  type PlantillaIndividual,
} from "./EnviosIndividualesData"

interface Props {
  inicial?: PlantillaIndividual | null
  onClose: () => void
  onGuardar: (p: PlantillaIndividual) => void
}

const categorias: CategoriaMeta[] = ["Utilidad", "Servicio", "Autenticación", "Marketing"]

type PasoId = "identidad" | "encabezado" | "cuerpo" | "pie" | "botones" | "revision"

/* ── Icono de canal ── */
function IconoCanal({ canal, className = "w-4 h-4" }: { canal: CanalPlantilla; className?: string }) {
  if (canal === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  if (canal === "instagram")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
    </svg>
  )
}

/* ── Cabecera del paso ── */
function PasoHeader({ titulo, ayuda, opcional }: { titulo: string; ayuda: string; opcional?: boolean }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-slate-800">{titulo}</h4>
        {opcional && (
          <span className="text-[9px] font-semibold rounded px-1.5 py-px bg-slate-100 text-slate-400">Opcional</span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ayuda}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Editor de plantillas Meta por pasos
───────────────────────────────────────────── */
export default function PlantillaMetaEditor({ inicial, onClose, onGuardar }: Props) {
  const [pasoIdx, setPasoIdx] = useState(0)
  const [nombre, setNombre] = useState(inicial?.nombre ?? "")
  const [atajo, setAtajo] = useState(inicial?.atajo ?? "/")
  const [canal, setCanal] = useState<CanalPlantilla>(inicial?.canal ?? "whatsapp")
  const [categoria, setCategoria] = useState<CategoriaMeta>(inicial?.categoria ?? "Utilidad")
  const [idioma, setIdioma] = useState(inicial?.idioma ?? "Español (CO)")
  const [encabezado, setEncabezado] = useState(inicial?.encabezado ?? "")
  const [cuerpo, setCuerpo] = useState(inicial?.cuerpo ?? "")
  const [pie, setPie] = useState(inicial?.pie ?? "")
  const [botones, setBotones] = useState<BotonPlantilla[]>(inicial?.botones ?? [])
  const [conDatos, setConDatos] = useState(true)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const cap = canalPlantillaMeta[canal]
  const restantes = cap.limite - cuerpo.length
  const segmentosSms = canal === "sms" ? Math.max(1, Math.ceil(cuerpo.length / 160)) : 0

  const variables = Array.from(
    new Set([...`${encabezado} ${cuerpo}`.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1])),
  )

  const etiquetaBotones = canal === "instagram" ? "Respuestas rápidas" : "Botones"

  /* Los pasos dependen de lo que admite el canal */
  const pasos: { id: PasoId; label: string }[] = [
    { id: "identidad", label: "Identidad" },
    ...(cap.encabezado ? [{ id: "encabezado" as PasoId, label: "Encabezado" }] : []),
    { id: "cuerpo", label: "Cuerpo" },
    ...(cap.pie ? [{ id: "pie" as PasoId, label: "Pie" }] : []),
    ...(cap.botones > 0 ? [{ id: "botones" as PasoId, label: canal === "instagram" ? "Respuestas" : "Botones" }] : []),
    { id: "revision", label: "Revisión" },
  ]
  const idx = Math.min(pasoIdx, pasos.length - 1)
  const paso = pasos[idx].id
  const ultimo = idx === pasos.length - 1

  const cambiarCanal = (c: CanalPlantilla) => {
    setCanal(c)
    const nueva = canalPlantillaMeta[c]
    setBotones(b => b.slice(0, nueva.botones))
    if (!nueva.encabezado) setEncabezado("")
    if (!nueva.pie) setPie("")
    /* Instagram solo admite mensajes de servicio dentro de la ventana de 24 h */
    if (c === "instagram") setCategoria("Servicio")
    setPasoIdx(0)
  }

  const agregarBoton = (tipo: BotonPlantilla["tipo"]) => {
    if (botones.length >= cap.botones) return
    setBotones(b => [...b, { tipo, texto: "", url: tipo === "enlace" ? "https://" : undefined }])
  }

  const actualizarBoton = (i: number, campo: keyof BotonPlantilla, valor: string) =>
    setBotones(b => b.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)))

  /* Validación del paso actual */
  const validar = () => {
    const e: Record<string, string> = {}
    if (paso === "identidad") {
      if (nombre.trim().length < 5) e.nombre = "Dale un nombre de al menos 5 caracteres"
      if (!/^\/[a-z0-9]{2,}$/.test(atajo.trim().toLowerCase()))
        e.atajo = "El atajo debe empezar con / y tener al menos 2 letras"
    }
    if (paso === "cuerpo") {
      if (!cuerpo.trim()) e.cuerpo = "El cuerpo del mensaje es obligatorio"
      else if (cuerpo.length > cap.limite) e.cuerpo = `Excede el límite de ${cap.limite} caracteres del canal`
    }
    if (paso === "botones" && botones.some(b => !b.texto.trim())) e.botones = "Todos los botones necesitan texto"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const avanzar = () => {
    if (validar()) setPasoIdx(i => Math.min(pasos.length - 1, i + 1))
  }

  const irA = (i: number) => {
    if (i <= idx || validar()) setPasoIdx(i)
  }

  const guardar = () => {
    const e: Record<string, string> = {}
    if (nombre.trim().length < 5) e.nombre = "Falta el nombre de la plantilla"
    if (!cuerpo.trim()) e.cuerpo = "Falta el cuerpo del mensaje"
    setErrores(e)
    if (Object.keys(e).length > 0) {
      setPasoIdx(e.nombre ? 0 : pasos.findIndex(p => p.id === "cuerpo"))
      return
    }

    onGuardar({
      id: inicial?.id ?? `p${Date.now()}`,
      nombre: nombre.trim(),
      atajo: atajo.trim().toLowerCase(),
      canal,
      categoria,
      aprobacion: cap.requiereAprobacion ? "En revisión" : "No requiere",
      idioma,
      encabezado: cap.encabezado ? encabezado.trim() || undefined : undefined,
      cuerpo: cuerpo.trim(),
      pie: cap.pie ? pie.trim() || undefined : undefined,
      botones: botones.length > 0 ? botones : undefined,
      variables,
      usos: inicial?.usos ?? 0,
      tasaLectura: inicial?.tasaLectura ?? 0,
      calidad: inicial?.calidad,
      autor: inicial?.autor ?? "Ana Martínez",
      actualizado: "2026-08-13",
    })
  }

  const bloques: { id: PasoId; l: string; ok: boolean; na: boolean; valor: string }[] = [
    { id: "encabezado", l: "Encabezado", ok: cap.encabezado && !!encabezado.trim(), na: !cap.encabezado, valor: encabezado },
    { id: "cuerpo", l: "Cuerpo", ok: !!cuerpo.trim(), na: false, valor: cuerpo },
    { id: "pie", l: "Pie de página", ok: cap.pie && !!pie.trim(), na: !cap.pie, valor: pie },
    {
      id: "botones",
      l: etiquetaBotones,
      ok: botones.length > 0,
      na: cap.botones === 0,
      valor: botones.map(b => b.texto).join(" · "),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ height: "min(92vh, 760px)" }}
      >
        {/* ── Encabezado ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cap.bg, color: cap.color }}>
              <IconoCanal canal={canal} className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{inicial ? "Editar plantilla" : "Nueva plantilla"}</h3>
              <p className="text-xs text-slate-400">
                Un bloque por paso, con la vista previa siempre a la vista
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

          {/* Barra de pasos */}
          <div className="flex items-center gap-0 mt-4">
            {pasos.map((p, i) => (
              <div key={p.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => irA(i)}
                  className={`flex items-center gap-2 ${i <= idx ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors shrink-0"
                    style={{
                      background: i <= idx ? "#1E3A8A" : "#fff",
                      borderColor: i <= idx ? "#1E3A8A" : "#e2e8f0",
                      color: i <= idx ? "#fff" : "#94a3b8",
                    }}
                  >
                    {i < idx ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className="text-[11px] font-semibold whitespace-nowrap hidden md:block"
                    style={{ color: i <= idx ? "#1E3A8A" : "#94a3b8" }}
                  >
                    {p.label}
                  </span>
                </button>
                {i < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: i < idx ? "#1E3A8A" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Cuerpo: paso a la izquierda, vista previa anclada a la derecha ── */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_310px]">

          <div className="overflow-y-auto p-6 min-w-0" style={{ background: "#f8fafc" }}>

            {/* Paso · Identidad */}
            {paso === "identidad" && (
              <>
                <PasoHeader
                  titulo="Identidad de la plantilla"
                  ayuda="Cómo la reconocerás, con qué atajo la insertarás en el chat y por qué canal se enviará."
                />
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Nombre</label>
                      <input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        autoFocus
                        placeholder="Ej. Confirmación de radicado"
                        className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                        style={{ borderColor: errores.nombre ? "#fca5a5" : "#e2e8f0" }}
                      />
                      {errores.nombre && <p className="text-[11px] text-red-500 mt-1">{errores.nombre}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Atajo en el chat</label>
                      <input
                        value={atajo}
                        onChange={e => setAtajo(e.target.value)}
                        placeholder="/radicado"
                        className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                        style={{ borderColor: errores.atajo ? "#fca5a5" : "#e2e8f0" }}
                      />
                      {errores.atajo && <p className="text-[11px] text-red-500 mt-1">{errores.atajo}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Canal</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(canalPlantillaMeta) as CanalPlantilla[]).map(c => {
                        const m = canalPlantillaMeta[c]
                        const sel = canal === c
                        return (
                          <button
                            key={c}
                            onClick={() => cambiarCanal(c)}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-all cursor-pointer relative"
                            style={{ borderColor: sel ? m.color : "#e2e8f0", background: sel ? m.bg : "#fff" }}
                          >
                            <span style={{ color: sel ? m.color : "#94a3b8" }}>
                              <IconoCanal canal={c} />
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: sel ? m.color : "#94a3b8" }}>
                              {m.corto}
                            </span>
                            {m.esMeta && (
                              <span className="absolute top-1.5 right-1.5 text-[7px] font-bold rounded px-1 py-px bg-slate-100 text-slate-400">
                                META
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{cap.nota}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Categoría</label>
                      <select
                        value={categoria}
                        onChange={e => setCategoria(e.target.value as CategoriaMeta)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                      >
                        {categorias.map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {categoriaMetaEstilo[categoria].desc}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Idioma</label>
                      <select
                        value={idioma}
                        onChange={e => setIdioma(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                      >
                        {["Español (CO)", "Español (ES)", "Inglés (US)", "Portugués (BR)"].map(i => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Paso · Encabezado */}
            {paso === "encabezado" && (
              <>
                <PasoHeader
                  titulo="Encabezado"
                  ayuda="Una línea corta en negrita sobre el mensaje. Meta la muestra destacada en la notificación."
                  opcional
                />
                <input
                  value={encabezado}
                  onChange={e => setEncabezado(e.target.value)}
                  autoFocus
                  maxLength={60}
                  placeholder="Ej. Recibimos tu solicitud"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right font-mono">{encabezado.length} / 60</p>
                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                  Si lo dejas vacío, el mensaje empieza directamente por el cuerpo. Puedes continuar sin llenarlo.
                </p>
              </>
            )}

            {/* Paso · Cuerpo */}
            {paso === "cuerpo" && (
              <>
                <PasoHeader
                  titulo="Cuerpo del mensaje"
                  ayuda="El contenido principal. Usa variables para personalizarlo con los datos de la conversación abierta."
                />
                <textarea
                  value={cuerpo}
                  onChange={e => setCuerpo(e.target.value)}
                  autoFocus
                  rows={8}
                  placeholder="Hola {{nombre}}, tu radicado {{radicado}} quedó registrado…"
                  className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
                  style={{ borderColor: errores.cuerpo ? "#fca5a5" : "#e2e8f0" }}
                />
                <div className="flex items-center justify-between mt-1">
                  {errores.cuerpo ? (
                    <p className="text-[11px] text-red-500">{errores.cuerpo}</p>
                  ) : segmentosSms > 0 ? (
                    <span className="text-[10px] text-slate-400">
                      Se enviará en{" "}
                      <span className="font-semibold text-slate-600">
                        {segmentosSms} mensaje{segmentosSms === 1 ? "" : "s"}
                      </span>{" "}
                      de 160 caracteres
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Enter crea un salto de línea</span>
                  )}
                  <span
                    className="text-[10px] font-mono font-semibold"
                    style={{ color: restantes < 0 ? "#dc2626" : restantes < 40 ? "#d97706" : "#94a3b8" }}
                  >
                    {cuerpo.length} / {cap.limite}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Variables del contexto
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.keys(variablesPlantilla).map(v => {
                      const usada = variables.includes(v)
                      return (
                        <button
                          key={v}
                          onClick={() => setCuerpo(c => `${c}{{${v}}}`)}
                          title={`Se reemplaza por: ${variablesPlantilla[v]}`}
                          className="px-2 py-1 rounded-md text-[10px] font-mono font-semibold border transition-all cursor-pointer"
                          style={{
                            background: usada ? "#fef9c3" : "#fff",
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
              </>
            )}

            {/* Paso · Pie */}
            {paso === "pie" && (
              <>
                <PasoHeader
                  titulo="Pie de página"
                  ayuda="Texto pequeño en gris al final. Suele usarse para la firma de la entidad o el aviso de baja."
                  opcional
                />
                <input
                  value={pie}
                  onChange={e => setPie(e.target.value)}
                  autoFocus
                  maxLength={60}
                  placeholder="Ej. Pqrslab · Atención al ciudadano"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right font-mono">{pie.length} / 60</p>
              </>
            )}

            {/* Paso · Botones */}
            {paso === "botones" && (
              <>
                <PasoHeader
                  titulo={canal === "instagram" ? "Respuestas rápidas" : "Botones de acción"}
                  ayuda={
                    canal === "instagram"
                      ? `Hasta ${cap.botones}. Instagram las muestra como píldoras que el usuario toca para responder.`
                      : `Hasta ${cap.botones}. Los de respuesta devuelven un mensaje al sistema, los de enlace abren una página y los de teléfono inician una llamada.`
                  }
                  opcional
                />
                <div className="space-y-2">
                  {botones.map((b, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-2.5 bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-bold rounded px-1.5 py-0.5 shrink-0"
                          style={
                            b.tipo === "enlace"
                              ? { background: "#e0f2fe", color: "#0369a1" }
                              : b.tipo === "telefono"
                                ? { background: "#ede9fe", color: "#6d28d9" }
                                : { background: "#d1fae5", color: "#065f46" }
                          }
                        >
                          {b.tipo === "enlace" ? "Enlace" : b.tipo === "telefono" ? "Llamada" : "Respuesta"}
                        </span>
                        <input
                          value={b.texto}
                          onChange={e => actualizarBoton(i, "texto", e.target.value)}
                          maxLength={25}
                          placeholder="Texto del botón"
                          className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#0EA5E9] transition-all"
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
                          className="w-full mt-2 px-2 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-[#0EA5E9] transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {errores.botones && <p className="text-[11px] text-red-500 mt-2">{errores.botones}</p>}

                {botones.length < cap.botones ? (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => agregarBoton("respuesta")}
                      className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 bg-white text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                    >
                      + Respuesta
                    </button>
                    {canal === "whatsapp" && (
                      <>
                        <button
                          onClick={() => agregarBoton("enlace")}
                          className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 bg-white text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                        >
                          + Enlace
                        </button>
                        <button
                          onClick={() => agregarBoton("telefono")}
                          className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 bg-white text-slate-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                        >
                          + Llamada
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-3">
                    Alcanzaste el máximo de {cap.botones} en {cap.label}.
                  </p>
                )}
              </>
            )}

            {/* Paso · Revisión */}
            {paso === "revision" && (
              <>
                <PasoHeader titulo="Revisión final" ayuda="Comprueba cómo quedó armada la plantilla antes de guardarla." />
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resumen</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">Nombre · Atajo</span>
                      <span className="text-[11px] font-semibold text-slate-700 text-right truncate">
                        {nombre || "—"} · <span className="font-mono">{atajo}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">Canal · Categoría</span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {cap.corto} · {categoria}
                      </span>
                    </div>
                    {bloques.map(b => (
                      <div key={b.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                        <span className="text-[11px] text-slate-400 shrink-0">{b.l}</span>
                        {b.na ? (
                          <span className="text-[11px] text-slate-300">No aplica en {cap.corto}</span>
                        ) : b.ok ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] text-slate-600 truncate max-w-[220px]">{b.valor}</span>
                            <button
                              onClick={() => setPasoIdx(pasos.findIndex(p => p.id === b.id))}
                              className="text-[10px] font-semibold text-slate-300 hover:text-[#1E3A8A] transition-colors cursor-pointer shrink-0"
                            >
                              Editar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPasoIdx(pasos.findIndex(p => p.id === b.id))}
                            className="text-[11px] font-semibold text-slate-300 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                          >
                            Sin definir · añadir
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {errores.cuerpo && <p className="text-[11px] text-red-500 mt-2">{errores.cuerpo}</p>}

                <div
                  className="rounded-xl p-3.5 flex items-start gap-3 mt-4"
                  style={{ background: cap.requiereAprobacion ? "#fef3c7" : "#eff3ff" }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: cap.requiereAprobacion ? "#92400e" : "#1E3A8A" }}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] leading-relaxed text-slate-600">{cap.nota}</p>
                </div>
              </>
            )}
          </div>

          {/* Vista previa — permanece anclada en todos los pasos */}
          <div className="border-l border-slate-100 bg-white overflow-y-auto p-5 space-y-4">
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
              conDatos={conDatos}
              encabezado={cap.encabezado ? encabezado : ""}
              pie={cap.pie ? pie : ""}
              botones={botones}
            />

            {/* Estructura, con el bloque en edición resaltado */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Estructura</p>
              </div>
              <div className="divide-y divide-slate-50">
                {bloques.map(b => {
                  const editando = paso === b.id
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{ background: editando ? "#eff3ff" : undefined }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: b.na ? "#f1f5f9" : b.ok ? "#d1fae5" : "#fef3c7" }}
                      >
                        {b.ok && !b.na && (
                          <svg viewBox="0 0 20 20" fill="#059669" className="w-2 h-2">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: editando ? "#1E3A8A" : "#64748b", fontWeight: editando ? 700 : 400 }}
                      >
                        {b.l}
                      </span>
                      <span className="ml-auto text-[9px]" style={{ color: editando ? "#1E3A8A" : "#cbd5e1" }}>
                        {editando ? "editando" : b.na ? "no aplica" : b.ok ? "definido" : "vacío"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {variables.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#854d0e" }}>
                  {variables.length} variable{variables.length === 1 ? "" : "s"} en uso
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: "#854d0e" }}>
                  Se rellenan solas con el ciudadano, el radicado y el asesor de la conversación abierta al insertar la
                  plantilla con <span className="font-mono font-bold">{atajo || "/atajo"}</span>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Pie ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={() => (idx === 0 ? onClose() : setPasoIdx(i => i - 1))}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {idx === 0 ? "Cancelar" : "Atrás"}
          </button>
          <p className="text-[11px] text-slate-400 hidden sm:block ml-1">
            Paso {idx + 1} de {pasos.length} · {pasos[idx].label}
          </p>
          <button
            onClick={ultimo ? guardar : avanzar}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {ultimo ? (cap.requiereAprobacion ? "Guardar y enviar a Meta" : "Guardar plantilla") : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
