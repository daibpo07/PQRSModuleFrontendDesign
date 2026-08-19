import { useMemo, useState } from "react"
import DevicePreview, { sampleVars } from "@/components/shared/DevicePreview"
import {
  CanalIcon,
  canalMeta,
  nf,
  type Campana,
  type Canal,
  type Plantilla,
  type Segmento,
} from "./EnviosMasivosData"

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface Props {
  segmentos: Segmento[]
  plantillas: Plantilla[]
  nextId: string
  onClose: () => void
  onCreate: (c: Campana) => void
}

/* ─────────────────────────────────────────────
   Costo unitario estimado por mensaje, en pesos
───────────────────────────────────────────── */
const costoUnitario: Record<Canal, number> = {
  whatsapp: 38,
  sms: 52,
  email: 4,
  push: 1,
}

/* ─────────────────────────────────────────────
   Asistente de campaña
───────────────────────────────────────────── */
const pasos = ["Canal", "Audiencia", "Mensaje", "Programación"]

export default function CampanaWizard({ segmentos, plantillas, nextId, onClose, onCreate }: Props) {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState("")
  const [canal, setCanal] = useState<Canal>("whatsapp")
  const [segmentosSel, setSegmentosSel] = useState<string[]>([])
  const [excluirOptOut, setExcluirOptOut] = useState(true)
  const [excluirRecientes, setExcluirRecientes] = useState(true)
  const [plantillaId, setPlantillaId] = useState<string>("")
  const [asunto, setAsunto] = useState("")
  const [cuerpo, setCuerpo] = useState("")
  const [conDatos, setConDatos] = useState(true)
  const [cuando, setCuando] = useState<"ahora" | "programar">("programar")
  const [fecha, setFecha] = useState("2026-08-16")
  const [hora, setHora] = useState("09:00")
  const [ritmo, setRitmo] = useState(300)
  const [ventanaSilencio, setVentanaSilencio] = useState(true)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const meta = canalMeta[canal]
  const plantillasCanal = plantillas.filter(p => p.canal === canal && p.aprobacion !== "Rechazada")
  const plantillaSel = plantillas.find(p => p.id === plantillaId)

  /* Alcance calculado */
  const brutos = segmentos
    .filter(s => segmentosSel.includes(s.id))
    .reduce((acc, s) => acc + s.total, 0)
  const descartados = Math.round(
    brutos * ((excluirOptOut ? 0.031 : 0) + (excluirRecientes ? 0.048 : 0)),
  )
  const alcance = Math.max(0, brutos - descartados)

  const costo = alcance * costoUnitario[canal]
  const duracionMin = ritmo > 0 ? Math.ceil(alcance / ritmo) : 0
  const restantes = meta.limite - cuerpo.length

  const variablesUsadas = useMemo(
    () => Array.from(new Set([...cuerpo.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]))),
    [cuerpo],
  )

  /* Validación por paso */
  const validar = (p: number) => {
    const e: Record<string, string> = {}
    if (p === 1 && nombre.trim().length < 5) e.nombre = "Dale un nombre de al menos 5 caracteres"
    if (p === 2 && segmentosSel.length === 0) e.segmentos = "Selecciona al menos una audiencia"
    if (p === 3) {
      if (!cuerpo.trim()) e.cuerpo = "El mensaje no puede estar vacío"
      else if (cuerpo.length > meta.limite) e.cuerpo = `Excede el límite de ${meta.limite} caracteres`
      if (canal === "email" && !asunto.trim()) e.asunto = "El asunto es obligatorio en correo"
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const siguiente = () => {
    if (validar(paso)) setPaso(p => Math.min(4, p + 1))
  }

  const elegirPlantilla = (p: Plantilla) => {
    setPlantillaId(p.id)
    setCuerpo(p.cuerpo)
    if (canal === "email" && !asunto.trim()) setAsunto(p.nombre)
  }

  const insertarVariable = (v: string) => setCuerpo(c => `${c}{{${v}}}`)

  const crear = () => {
    const plantilla = plantillas.find(p => p.id === plantillaId)
    onCreate({
      id: nextId,
      nombre: nombre.trim(),
      descripcion:
        segmentos
          .filter(s => segmentosSel.includes(s.id))
          .map(s => s.nombre)
          .join(" · ") || "Campaña sin audiencia",
      canales: [canal],
      estado: cuando === "ahora" ? "Enviando" : "Programada",
      segmento: segmentos.find(s => s.id === segmentosSel[0])?.nombre ?? "—",
      plantilla: plantilla?.nombre ?? "Mensaje personalizado",
      autor: "Lic. Martínez, A.",
      fecha: cuando === "ahora" ? "2026-08-13" : fecha,
      hora: cuando === "ahora" ? "Ahora" : hora,
      total: alcance,
      enviados: 0,
      entregados: 0,
      leidos: 0,
      respondidos: 0,
      fallidos: 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Encabezado ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nueva campaña masiva</h3>
              <p className="text-xs text-slate-400">
                Cuatro pasos: canal, audiencia, mensaje y programación
              </p>
            </div>
            <span className="ml-auto font-mono text-[10px] text-slate-300 hidden sm:block">{nextId}</span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Barra de pasos */}
          <div className="flex items-center gap-0 mt-4">
            {pasos.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i + 1 < paso && setPaso(i + 1)}
                  className={`flex items-center gap-2 ${i + 1 < paso ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors shrink-0"
                    style={{
                      background: i + 1 <= paso ? "#1E3A8A" : "#fff",
                      borderColor: i + 1 <= paso ? "#1E3A8A" : "#e2e8f0",
                      color: i + 1 <= paso ? "#fff" : "#94a3b8",
                    }}
                  >
                    {i + 1 < paso ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className="text-[11px] font-semibold whitespace-nowrap hidden sm:block"
                    style={{ color: i + 1 <= paso ? "#1E3A8A" : "#94a3b8" }}
                  >
                    {s}
                  </span>
                </button>
                {i < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3" style={{ background: i + 1 < paso ? "#1E3A8A" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_300px]">

            {/* Formulario */}
            <div className="p-6 space-y-5 min-w-0">

              {/* Paso 1 — Canal */}
              {paso === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Nombre de la campaña
                    </label>
                    <input
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej. Recordatorio de vencimiento — agosto"
                      className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                      style={{ borderColor: errores.nombre ? "#fca5a5" : "#e2e8f0" }}
                    />
                    {errores.nombre && <p className="text-[11px] text-red-500 mt-1">{errores.nombre}</p>}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Canal de envío</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(canalMeta) as Canal[]).map(c => {
                        const m = canalMeta[c]
                        const sel = canal === c
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              setCanal(c)
                              setPlantillaId("")
                              setCuerpo("")
                            }}
                            className="flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                            style={{
                              borderColor: sel ? m.color : "#e2e8f0",
                              background: sel ? m.bg : "#f8fafc",
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white shadow-sm"
                              style={{ color: m.color }}
                            >
                              <CanalIcon canal={c} className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700">{m.label}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {m.limite} caracteres · ${costoUnitario[c]} COP/msg
                              </p>
                            </div>
                            {sel && (
                              <span
                                className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: m.color }}
                              >
                                <svg viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#eff3ff" }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Los envíos por <span className="font-semibold">WhatsApp</span> requieren una plantilla
                      aprobada por Meta. Las plantillas en revisión no pueden programarse todavía.
                    </p>
                  </div>
                </>
              )}

              {/* Paso 2 — Audiencia */}
              {paso === 2 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">Audiencias incluidas</p>
                    {errores.segmentos && <p className="text-[11px] text-red-500">{errores.segmentos}</p>}
                  </div>

                  <div className="space-y-2">
                    {segmentos.map(s => {
                      const sel = segmentosSel.includes(s.id)
                      return (
                        <button
                          key={s.id}
                          onClick={() =>
                            setSegmentosSel(prev =>
                              prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id],
                            )
                          }
                          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                          style={{ borderColor: sel ? "#1E3A8A" : "#e2e8f0", background: sel ? "#eff3ff" : "#fff" }}
                        >
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2"
                            style={{
                              background: sel ? "#1E3A8A" : "#fff",
                              borderColor: sel ? "#1E3A8A" : "#cbd5e1",
                            }}
                          >
                            {sel && (
                              <svg viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{s.nombre}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {s.origen} · actualizado {s.actualizado.toLowerCase()}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold shrink-0" style={{ color: sel ? "#1E3A8A" : "#94a3b8" }}>
                            {nf(s.total)}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-slate-600">Reglas de exclusión</p>
                    {[
                      {
                        on: excluirOptOut,
                        set: setExcluirOptOut,
                        label: "Excluir quienes cancelaron la suscripción",
                        sub: "Obligatorio para cumplir con la Ley 1581 de protección de datos",
                      },
                      {
                        on: excluirRecientes,
                        set: setExcluirRecientes,
                        label: "Excluir contactados en las últimas 24 horas",
                        sub: "Evita saturar al mismo ciudadano con varias campañas",
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
                          <span
                            className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all"
                            style={{ left: r.on ? 16 : 2 }}
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700">{r.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Paso 3 — Mensaje */}
              {paso === 3 && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Plantillas de {meta.label}
                    </p>
                    {plantillasCanal.length === 0 ? (
                      <p className="text-[11px] text-slate-400 rounded-xl border border-dashed border-slate-200 p-4 text-center">
                        No hay plantillas para este canal. Escribe el mensaje directamente.
                      </p>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {plantillasCanal.map(p => (
                          <button
                            key={p.id}
                            onClick={() => elegirPlantilla(p)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                            style={{
                              background: plantillaId === p.id ? "#1E3A8A" : "#fff",
                              color: plantillaId === p.id ? "#fff" : "#64748b",
                              borderColor: plantillaId === p.id ? "#1E3A8A" : "#e2e8f0",
                            }}
                          >
                            {p.nombre}
                            {p.aprobacion === "En revisión" && (
                              <span className="ml-1.5 text-[9px] opacity-70">· en revisión</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {canal === "email" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Asunto</label>
                      <input
                        value={asunto}
                        onChange={e => setAsunto(e.target.value)}
                        placeholder="Asunto del correo"
                        className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                        style={{ borderColor: errores.asunto ? "#fca5a5" : "#e2e8f0" }}
                      />
                      {errores.asunto && <p className="text-[11px] text-red-500 mt-1">{errores.asunto}</p>}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-600">Mensaje</label>
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{ color: restantes < 0 ? "#dc2626" : restantes < 40 ? "#d97706" : "#94a3b8" }}
                      >
                        {cuerpo.length} / {meta.limite}
                      </span>
                    </div>
                    <textarea
                      value={cuerpo}
                      onChange={e => setCuerpo(e.target.value)}
                      rows={7}
                      placeholder="Escribe el mensaje. Usa variables como {{nombre}} para personalizarlo."
                      className="w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
                      style={{ borderColor: errores.cuerpo ? "#fca5a5" : "#e2e8f0" }}
                    />
                    {errores.cuerpo && <p className="text-[11px] text-red-500 mt-1">{errores.cuerpo}</p>}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Insertar variable
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.keys(sampleVars).map(v => {
                        const usada = variablesUsadas.includes(v)
                        return (
                          <button
                            key={v}
                            onClick={() => insertarVariable(v)}
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
                </>
              )}

              {/* Paso 4 — Programación */}
              {paso === 4 && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">¿Cuándo enviar?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { v: "ahora" as const, t: "Enviar ahora", s: "Inicia en cuanto confirmes" },
                        { v: "programar" as const, t: "Programar", s: "Elige fecha y hora exactas" },
                      ]).map(o => (
                        <button
                          key={o.v}
                          onClick={() => setCuando(o.v)}
                          className="p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                          style={{
                            borderColor: cuando === o.v ? "#1E3A8A" : "#e2e8f0",
                            background: cuando === o.v ? "#eff3ff" : "#f8fafc",
                          }}
                        >
                          <p className="text-xs font-bold text-slate-700">{o.t}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{o.s}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {cuando === "programar" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha</label>
                        <input
                          type="date"
                          value={fecha}
                          onChange={e => setFecha(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hora</label>
                        <input
                          type="time"
                          value={hora}
                          onChange={e => setHora(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-600">Ritmo de envío</label>
                      <span className="text-[11px] font-mono font-bold text-[#1E3A8A]">
                        {nf(ritmo)} msg/min
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={1000}
                      step={50}
                      value={ritmo}
                      onChange={e => setRitmo(Number(e.target.value))}
                      className="w-full accent-[#1E3A8A] cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Duración estimada: <span className="font-semibold text-slate-600">
                        {duracionMin < 60 ? `${duracionMin} min` : `${Math.floor(duracionMin / 60)} h ${duracionMin % 60} min`}
                      </span> · un ritmo alto puede activar límites del proveedor
                    </p>
                  </div>

                  <button
                    onClick={() => setVentanaSilencio(v => !v)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-left transition-all cursor-pointer hover:border-slate-300"
                  >
                    <span
                      className="w-8 rounded-full relative shrink-0 transition-colors"
                      style={{ background: ventanaSilencio ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                    >
                      <span
                        className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all"
                        style={{ left: ventanaSilencio ? 16 : 2 }}
                      />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">Respetar ventana de silencio</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        No enviar entre las 20:00 y las 07:00; los pendientes se reanudan al día siguiente
                      </p>
                    </div>
                  </button>

                  {/* Resumen */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Resumen de la campaña
                      </p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {[
                        { l: "Campaña", v: nombre || "—" },
                        { l: "Canal", v: meta.label },
                        { l: "Audiencia bruta", v: nf(brutos) },
                        { l: "Excluidos por reglas", v: `− ${nf(descartados)}` },
                        { l: "Destinatarios finales", v: nf(alcance), destacado: true },
                        { l: "Costo estimado", v: `$ ${nf(costo)} COP`, destacado: true },
                      ].map(f => (
                        <div key={f.l} className="flex items-center justify-between px-4 py-2">
                          <span className="text-[11px] text-slate-400">{f.l}</span>
                          <span
                            className={`text-[11px] font-mono ${f.destacado ? "font-bold" : "font-semibold"}`}
                            style={{ color: f.destacado ? "#1E3A8A" : "#334155" }}
                          >
                            {f.v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Vista previa lateral */}
            <div className="border-l border-slate-100 p-5 space-y-4" style={{ background: "#f8fafc" }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Vista previa
                </p>
                <button
                  onClick={() => setConDatos(v => !v)}
                  title="Alternar entre variables y datos de ejemplo"
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
                asunto={asunto}
                conDatos={conDatos}
                encabezado={plantillaSel?.encabezado}
                pie={plantillaSel?.pie}
                botones={plantillaSel?.botones}
              />

              {/* Contador de alcance en vivo */}
              <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Alcance estimado
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#1E3A8A" }}>
                  {nf(alcance)}
                </p>
                <p className="text-[10px] text-slate-400">
                  destinatarios · {segmentosSel.length} audiencia{segmentosSel.length === 1 ? "" : "s"}
                </p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (alcance / 25000) * 100)}%`,
                      background: "linear-gradient(90deg,#1E3A8A,#0EA5E9)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
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
            Paso {paso} de {pasos.length} · {pasos[paso - 1]}
          </p>

          <div className="ml-auto flex items-center gap-2">
            {paso === 4 && (
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                Guardar borrador
              </button>
            )}
            <button
              onClick={paso === 4 ? crear : siguiente}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              style={{ background: "#1E3A8A" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
            >
              {paso === 4 ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  {cuando === "ahora" ? "Lanzar campaña" : "Programar campaña"}
                </>
              ) : (
                "Continuar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
