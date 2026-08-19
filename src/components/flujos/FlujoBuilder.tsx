import { useState } from "react"
import {
  IconoPaso,
  slaTotal,
  tipoPasoMeta,
  type Flujo,
  type PasoFlujo,
  type TipoPaso,
} from "./FlujosData"

interface Props {
  inicial?: Flujo | null
  nextId: string
  onClose: () => void
  onGuardar: (f: Flujo) => void
}

const modulos = ["PQRS", "Cobranza", "Envíos", "Usuarios", "Fábrica de Créditos"]

const disparadoresSugeridos = [
  "Radicado creado · Tipo ∈ {Petición, Queja, Sugerencia}",
  "Radicado creado · Tipo = Reclamo",
  "Radicado cerrado · Han pasado 48 horas",
  "Cartera · Mora ≥ 30 días · Sin acuerdo vigente",
  "Conversación cerrada · Resultado = Escalado",
  "Manual · El líder lo inicia desde el caso",
]

const responsables = [
  "Sistema PQRS",
  "Sistema Envíos",
  "Sistema Cobranza",
  "Mesa de entrada",
  "Analista de dependencia",
  "Analista de cartera",
  "Jefe de dependencia",
  "Jefe de Tesorería",
  "Oficina Jurídica",
  "Supervisor de calidad",
  "Asesor de cobranza",
]

/* ── Cadena vertical para la vista previa ── */
function CadenaVertical({ pasos, activo }: { pasos: PasoFlujo[]; activo: string | null }) {
  if (pasos.length === 0)
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 flex flex-col items-center gap-2 text-slate-300">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        <p className="text-[11px] font-medium text-slate-400">Sin pasos todavía</p>
        <p className="text-[10px] text-slate-300 text-center px-4">Agrega el primero y verás aquí cómo se arma el flujo</p>
      </div>
    )

  return (
    <div className="relative">
      {pasos.map((p, i) => {
        const m = tipoPasoMeta[p.tipo]
        const sel = activo === p.id
        return (
          <div key={p.id} className="flex gap-2.5">
            {/* Riel */}
            <div className="flex flex-col items-center shrink-0">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-2"
                style={{ background: m.bg, color: m.color, borderColor: sel ? m.color : "transparent" }}
              >
                <IconoPaso tipo={p.tipo} className="w-3.5 h-3.5" />
              </span>
              {i < pasos.length - 1 && <div className="w-px flex-1 min-h-[18px]" style={{ background: "#cbd5e1" }} />}
            </div>

            {/* Contenido */}
            <div className="min-w-0 flex-1 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-300">{String(i + 1).padStart(2, "0")}</span>
                <p
                  className="text-[11px] font-bold leading-snug truncate"
                  style={{ color: sel ? m.color : "#334155" }}
                >
                  {p.nombre || "Paso sin nombre"}
                </p>
              </div>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                {p.responsable} · {p.slaHoras} h · {p.checklist.length} ítems
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Constructor de flujos
───────────────────────────────────────────── */
const pasosWizard = ["Datos del flujo", "Pasos", "Reglas y revisión"]

export default function FlujoBuilder({ inicial, nextId, onClose, onGuardar }: Props) {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState(inicial?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "")
  const [modulo, setModulo] = useState(inicial?.modulo ?? "PQRS")
  const [disparador, setDisparador] = useState(inicial?.disparador ?? disparadoresSugeridos[0])
  const [pasos, setPasos] = useState<PasoFlujo[]>(inicial?.pasos ?? [])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [escalamiento, setEscalamiento] = useState(true)
  const [recordatorio, setRecordatorio] = useState(true)
  const [pausarFestivos, setPausarFestivos] = useState(false)
  const [activarAlGuardar, setActivarAlGuardar] = useState(!inicial || inicial.estado === "Activo")
  const [errores, setErrores] = useState<Record<string, string>>({})

  const horasTotales = slaTotal(pasos)
  const humanos = pasos.filter(p => p.tipo === "humana" || p.tipo === "aprobacion").length
  const automaticos = pasos.length - humanos
  const sensibles = pasos.filter(p => p.datosSensibles).length

  const agregarPaso = (tipo: TipoPaso) => {
    const id = `s${Date.now()}`
    setPasos(p => [
      ...p,
      {
        id,
        nombre: "",
        tipo,
        responsable: tipo === "automatica" || tipo === "espera" || tipo === "notificacion" ? "Sistema PQRS" : "Analista de dependencia",
        slaHoras: tipo === "automatica" ? 0.5 : tipo === "espera" ? 24 : 8,
        descripcion: "",
        checklist: [],
      },
    ])
    setExpandido(id)
  }

  const actualizar = (id: string, campo: keyof PasoFlujo, valor: unknown) =>
    setPasos(p => p.map(x => (x.id === id ? { ...x, [campo]: valor } : x)))

  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= pasos.length) return
    setPasos(p => {
      const copia = [...p]
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return copia
    })
  }

  const validar = (n: number) => {
    const e: Record<string, string> = {}
    if (n === 1) {
      if (nombre.trim().length < 5) e.nombre = "Dale un nombre de al menos 5 caracteres"
      if (descripcion.trim().length < 15) e.descripcion = "Explica en una frase para qué sirve este flujo"
    }
    if (n === 2) {
      if (pasos.length < 2) e.pasos = "Un flujo necesita al menos dos pasos"
      else if (pasos.some(p => !p.nombre.trim())) e.pasos = "Todos los pasos necesitan un nombre"
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const guardar = () => {
    if (!validar(1) || !validar(2)) {
      setPaso(nombre.trim().length < 5 || descripcion.trim().length < 15 ? 1 : 2)
      return
    }
    onGuardar({
      id: inicial?.id ?? nextId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      disparador,
      modulo,
      estado: activarAlGuardar ? "Activo" : "Borrador",
      version: inicial ? `v${(parseFloat(inicial.version.slice(1)) + 0.1).toFixed(1)}` : "v1.0",
      pasos,
      ejecuciones: inicial?.ejecuciones ?? 0,
      cumplimiento: inicial?.cumplimiento ?? 0,
      duracionMedia: inicial?.duracionMedia ?? "—",
      autor: "Ana Martínez",
      actualizado: "2026-08-13",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ height: "min(92vh, 780px)" }}
      >
        {/* ── Encabezado ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eff3ff" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{inicial ? "Editar flujo" : "Nuevo flujo de trabajo"}</h3>
              <p className="text-xs text-slate-400">Defines los pasos y quién responde por cada uno</p>
            </div>
            <span className="ml-auto font-mono text-[10px] text-slate-300 hidden sm:block">{inicial?.id ?? nextId}</span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-0 mt-4">
            {pasosWizard.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i + 1 < paso && setPaso(i + 1)}
                  className={`flex items-center gap-2 ${i + 1 < paso ? "cursor-pointer" : "cursor-default"}`}
                >
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
                  <span className="text-[11px] font-semibold whitespace-nowrap hidden md:block" style={{ color: i + 1 <= paso ? "#1E3A8A" : "#94a3b8" }}>
                    {s}
                  </span>
                </button>
                {i < pasosWizard.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3" style={{ background: i + 1 < paso ? "#1E3A8A" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_290px]">

          <div className="overflow-y-auto p-6 min-w-0" style={{ background: "#f8fafc" }}>

            {/* Paso 1 · Datos */}
            {paso === 1 && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Datos del flujo</h4>
                  <p className="text-xs text-slate-400 mt-1">Qué proceso representa y qué lo pone en marcha.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Nombre</label>
                    <input
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      autoFocus
                      placeholder="Ej. Gestión de PQRS estándar"
                      className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all"
                      style={{ borderColor: errores.nombre ? "#fca5a5" : "#e2e8f0" }}
                    />
                    {errores.nombre && <p className="text-[11px] text-red-500 mt-1">{errores.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Descripción</label>
                    <textarea
                      value={descripcion}
                      onChange={e => setDescripcion(e.target.value)}
                      rows={3}
                      placeholder="Para qué sirve y en qué casos se usa"
                      className="w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
                      style={{ borderColor: errores.descripcion ? "#fca5a5" : "#e2e8f0" }}
                    />
                    {errores.descripcion && <p className="text-[11px] text-red-500 mt-1">{errores.descripcion}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Módulo</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {modulos.map(m => (
                        <button
                          key={m}
                          onClick={() => setModulo(m)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                          style={{
                            background: modulo === m ? "#1E3A8A" : "#fff",
                            color: modulo === m ? "#fff" : "#64748b",
                            borderColor: modulo === m ? "#1E3A8A" : "#e2e8f0",
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                      Disparador — el evento que inicia el flujo
                    </label>
                    <div className="space-y-1.5">
                      {disparadoresSugeridos.map(d => (
                        <button
                          key={d}
                          onClick={() => setDisparador(d)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 text-left transition-all cursor-pointer"
                          style={{
                            borderColor: disparador === d ? "#1E3A8A" : "#e2e8f0",
                            background: disparador === d ? "#eff3ff" : "#fff",
                          }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center"
                            style={{ borderColor: disparador === d ? "#1E3A8A" : "#cbd5e1" }}
                          >
                            {disparador === d && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1E3A8A" }} />}
                          </span>
                          <span className="text-[11px] font-mono text-slate-600 truncate">{d}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Paso 2 · Pasos */}
            {paso === 2 && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Pasos del flujo</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Agrega los pasos en orden. Cada uno define quién responde, en cuánto tiempo y qué debe verificar.
                  </p>
                </div>

                {/* Agregar paso */}
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Agregar paso</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {(Object.keys(tipoPasoMeta) as TipoPaso[]).map(t => {
                      const m = tipoPasoMeta[t]
                      return (
                        <button
                          key={t}
                          onClick={() => agregarPaso(t)}
                          className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-dashed bg-white transition-all cursor-pointer hover:border-solid"
                          style={{ borderColor: "#cbd5e1", color: m.color }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = m.color)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#cbd5e1")}
                        >
                          <IconoPaso tipo={t} className="w-4 h-4" />
                          <span className="text-[9px] font-bold text-slate-500">{m.corto}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {errores.pasos && (
                  <p className="text-[11px] text-red-500 rounded-lg px-3 py-2 mb-3" style={{ background: "#fef2f2" }}>
                    {errores.pasos}
                  </p>
                )}

                {/* Lista de pasos */}
                <div className="space-y-2">
                  {pasos.map((p, i) => {
                    const m = tipoPasoMeta[p.tipo]
                    const abierto = expandido === p.id
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl border bg-white overflow-hidden transition-all"
                        style={{ borderColor: abierto ? m.color : "#e2e8f0" }}
                      >
                        <div className="flex items-center gap-2 p-2.5">
                          <span className="text-[9px] font-mono font-bold text-slate-300 w-5 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: m.bg, color: m.color }}
                          >
                            <IconoPaso tipo={p.tipo} className="w-3.5 h-3.5" />
                          </span>
                          <input
                            value={p.nombre}
                            onChange={e => actualizar(p.id, "nombre", e.target.value)}
                            placeholder={`Nombre del paso ${m.corto.toLowerCase()}`}
                            className="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-transparent bg-transparent text-xs font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:bg-slate-50 focus:border-slate-200 transition-all"
                          />
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => mover(i, -1)}
                              disabled={i === 0}
                              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer disabled:opacity-25"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => mover(i, 1)}
                              disabled={i === pasos.length - 1}
                              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer disabled:opacity-25"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setExpandido(a => (a === p.id ? null : p.id))}
                              className="px-2 h-6 flex items-center justify-center rounded-md text-[10px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-[#1E3A8A] transition-all cursor-pointer"
                            >
                              {abierto ? "Cerrar" : "Detalle"}
                            </button>
                            <button
                              onClick={() => setPasos(ps => ps.filter(x => x.id !== p.id))}
                              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {abierto && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-3" style={{ background: "#f8fafc" }}>
                            <div className="grid sm:grid-cols-2 gap-2.5 pt-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Responsable</label>
                                <select
                                  value={p.responsable}
                                  onChange={e => actualizar(p.id, "responsable", e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
                                >
                                  {responsables.map(r => (
                                    <option key={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">SLA del paso (horas)</label>
                                <input
                                  type="number"
                                  min={0.25}
                                  step={0.25}
                                  value={p.slaHoras}
                                  onChange={e => actualizar(p.id, "slaHoras", Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-mono font-semibold text-slate-600 focus:outline-none focus:border-[#0EA5E9] transition-all"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Instrucción para el responsable</label>
                              <textarea
                                value={p.descripcion}
                                onChange={e => actualizar(p.id, "descripcion", e.target.value)}
                                rows={2}
                                placeholder="Qué debe hacer en este paso"
                                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-[#0EA5E9] transition-all resize-none leading-relaxed"
                              />
                            </div>

                            {/* Checklist */}
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1.5">
                                Lista de chequeo — lo que verá el equipo en su bandeja
                              </label>
                              <div className="space-y-1.5">
                                {p.checklist.map((c, ci) => (
                                  <div key={ci} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded border-2 border-slate-300 shrink-0" />
                                    <input
                                      value={c}
                                      onChange={e =>
                                        actualizar(
                                          p.id,
                                          "checklist",
                                          p.checklist.map((x, j) => (j === ci ? e.target.value : x)),
                                        )
                                      }
                                      className="flex-1 min-w-0 px-2 py-1 rounded-md border border-slate-200 bg-white text-[11px] text-slate-600 focus:outline-none focus:border-[#0EA5E9] transition-all"
                                    />
                                    <button
                                      onClick={() =>
                                        actualizar(p.id, "checklist", p.checklist.filter((_, j) => j !== ci))
                                      }
                                      className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-400 transition-all cursor-pointer shrink-0"
                                    >
                                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => actualizar(p.id, "checklist", [...p.checklist, ""])}
                                className="w-full mt-1.5 py-1.5 rounded-md text-[10px] font-semibold border border-dashed border-slate-300 bg-white text-slate-400 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer"
                              >
                                + Ítem de chequeo
                              </button>
                            </div>

                            <button
                              onClick={() => actualizar(p.id, "datosSensibles", !p.datosSensibles)}
                              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white text-left transition-all cursor-pointer hover:border-slate-300"
                            >
                              <span
                                className="w-8 rounded-full relative shrink-0 transition-colors"
                                style={{ background: p.datosSensibles ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                              >
                                <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: p.datosSensibles ? 16 : 2 }} />
                              </span>
                              <div>
                                <p className="text-[11px] font-semibold text-slate-700">Maneja datos sensibles</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Se enmascaran los datos del titular y queda registro de quién los consultó
                                </p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {pasos.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 flex flex-col items-center gap-2">
                    <p className="text-sm text-slate-400 font-medium">Este flujo aún no tiene pasos</p>
                    <p className="text-xs text-slate-300">Usa los botones de arriba para agregar el primero</p>
                  </div>
                )}
              </>
            )}

            {/* Paso 3 · Reglas y revisión */}
            {paso === 3 && (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Reglas y revisión</h4>
                  <p className="text-xs text-slate-400 mt-1">Qué pasa cuando un paso se retrasa y cómo queda el flujo al guardar.</p>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      on: escalamiento,
                      set: setEscalamiento,
                      label: "Escalar al líder cuando un paso supere su SLA",
                      sub: "Se notifica al jefe del responsable y el caso pasa a estado En riesgo",
                    },
                    {
                      on: recordatorio,
                      set: setRecordatorio,
                      label: "Recordar al responsable a mitad del SLA",
                      sub: "Un aviso interno cuando queda la mitad del tiempo del paso",
                    },
                    {
                      on: pausarFestivos,
                      set: setPausarFestivos,
                      label: "Pausar el reloj en fines de semana y festivos",
                      sub: "El SLA se calcula solo sobre días hábiles",
                    },
                  ].map(o => (
                    <button
                      key={o.label}
                      onClick={() => o.set(!o.on)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white text-left transition-all cursor-pointer hover:border-slate-300"
                    >
                      <span
                        className="w-8 rounded-full relative shrink-0 transition-colors"
                        style={{ background: o.on ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                      >
                        <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: o.on ? 16 : 2 }} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-700">{o.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{o.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mt-4">
                  <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resumen del flujo</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { l: "Nombre", v: nombre || "—" },
                      { l: "Módulo", v: modulo },
                      { l: "Disparador", v: disparador },
                      { l: "Pasos", v: `${pasos.length} · ${humanos} con persona, ${automaticos} automáticos` },
                      { l: "SLA acumulado", v: `${horasTotales} h (${Math.round((horasTotales / 24) * 10) / 10} días)` },
                      { l: "Pasos con datos sensibles", v: String(sensibles) },
                    ].map(f => (
                      <div key={f.l} className="flex items-start justify-between gap-4 px-4 py-2.5">
                        <span className="text-[11px] text-slate-400 shrink-0">{f.l}</span>
                        <span className="text-[11px] font-semibold text-slate-700 text-right">{f.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActivarAlGuardar(v => !v)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer mt-4"
                  style={{
                    borderColor: activarAlGuardar ? "#1E3A8A" : "#e2e8f0",
                    background: activarAlGuardar ? "#eff3ff" : "#fff",
                  }}
                >
                  <span
                    className="w-8 rounded-full relative shrink-0 transition-colors"
                    style={{ background: activarAlGuardar ? "#1E3A8A" : "#cbd5e1", height: 18 }}
                  >
                    <span className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all" style={{ left: activarAlGuardar ? 16 : 2 }} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700">Activar el flujo al guardar</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {activarAlGuardar
                        ? "Los casos nuevos que cumplan el disparador entrarán por esta ruta"
                        : "Queda como borrador y no procesará casos hasta que lo actives"}
                    </p>
                  </div>
                </button>

                <div className="rounded-xl p-3.5 flex items-start gap-3 mt-4" style={{ background: "#eff3ff" }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-[#1E3A8A]">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Cada ejecución de este flujo queda registrada paso a paso. Ese histórico es el que más adelante
                    alimentará la orquestación asistida por IA.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Vista previa del flujo — siempre visible */}
          <div className="border-l border-slate-100 bg-white overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vista previa</p>
              <span className="text-[10px] font-mono font-bold" style={{ color: "#1E3A8A" }}>
                {pasos.length} paso{pasos.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Disparador */}
            <div className="rounded-xl p-3" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Se dispara cuando</p>
              <p className="text-[10px] font-mono text-slate-600 leading-relaxed">{disparador}</p>
            </div>

            <CadenaVertical pasos={pasos} activo={expandido} />

            {pasos.length > 0 && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100" style={{ background: "#f8fafc" }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Balance del flujo</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { l: "SLA acumulado", v: `${horasTotales} h` },
                    { l: "Con persona", v: String(humanos) },
                    { l: "Automáticos", v: String(automaticos) },
                    { l: "Datos sensibles", v: String(sensibles) },
                  ].map(x => (
                    <div key={x.l} className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-[10px] text-slate-400">{x.l}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-600">{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            Paso {paso} de 3 · {pasosWizard[paso - 1]}
          </p>
          <button
            onClick={() => (paso === 3 ? guardar() : validar(paso) && setPaso(p => p + 1))}
            className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            {paso === 3 ? (activarAlGuardar ? "Guardar y activar" : "Guardar borrador") : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
