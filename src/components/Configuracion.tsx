import { useState } from "react"

interface Categoria {
  id: string
  nombre: string
  slaHoras: number
  activa: boolean
}

interface EstadoFlujo {
  id: string
  nombre: string
  slug: string
  color: string
  textColor: string
  flujo: "Inicial" | "Final" | null
  activo: boolean
  descripcion: string
}

const initialCategorias: Categoria[] = [
  { id: "1", nombre: "General",                 slaHoras: 360, activa: true },
  { id: "2", nombre: "Reclamos de facturación", slaHoras: 48,  activa: true },
]

const initialEstados: EstadoFlujo[] = [
  { id: "1", nombre: "Recibido",   slug: "recibido",   color: "#0EA5E9", textColor: "#0369a1", flujo: "Inicial", activo: true, descripcion: "La PQRS fue radicada y está en espera de asignación." },
  { id: "2", nombre: "En gestión", slug: "en_gestion", color: "#f59e0b", textColor: "#92400e", flujo: null,      activo: true, descripcion: "La solicitud está siendo atendida por la dependencia correspondiente." },
  { id: "3", nombre: "Resuelto",   slug: "resuelto",   color: "#10b981", textColor: "#065f46", flujo: null,      activo: true, descripcion: "Se emitió respuesta formal. Pendiente de confirmación del ciudadano." },
  { id: "4", nombre: "Cerrado",    slug: "cerrado",    color: "#64748B", textColor: "#334155", flujo: "Final",   activo: true, descripcion: "Caso cerrado. No admite más seguimientos ni interacciones." },
]

function SlaBar({ horas }: { horas: number }) {
  const max = 360
  const pct = Math.min((horas / max) * 100, 100)
  const color = horas <= 48 ? "#ef4444" : horas <= 120 ? "#f59e0b" : "#10b981"
  const label = horas >= 24 ? `${horas / 24}d` : `${horas}h`
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold shrink-0" style={{ color }}>{label}</span>
    </div>
  )
}

export default function Configuracion() {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias)
  const [estados] = useState<EstadoFlujo[]>(initialEstados)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [catNombre, setCatNombre] = useState("")
  const [catSla, setCatSla] = useState("")
  const [hovCat, setHovCat] = useState<string | null>(null)
  const [hovEst, setHovEst] = useState<string | null>(null)

  const handleAddCat = () => {
    if (!catNombre.trim() || !catSla.trim()) return
    const h = parseInt(catSla.replace(/\D/g, "")) || 0
    setCategorias(prev => [...prev, { id: String(Date.now()), nombre: catNombre, slaHoras: h, activa: true }])
    setCatNombre(""); setCatSla(""); setShowCatModal(false)
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-8">

      {/* ── Categorías / Tipologías ── */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Categorías / Tipologías</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
              El SLA de cada categoría fija el plazo máximo de resolución para los radicados de ese tipo.
            </p>
          </div>
          <button onClick={() => setShowCatModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Nueva categoría
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map(cat => (
            <div key={cat.id}
              onMouseEnter={() => setHovCat(cat.id)}
              onMouseLeave={() => setHovCat(null)}
              className="bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-150"
              style={{ boxShadow: hovCat === cat.id ? "0 4px 16px rgba(30,58,138,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{cat.nombre}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Activa
                  </span>
                </div>
                <div className="flex gap-1">
                  <button title="Editar" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-blue-50 hover:text-[#1E3A8A] transition-all cursor-pointer">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                  </button>
                  <button title="Eliminar" onClick={() => setCategorias(prev => prev.filter(c => c.id !== cat.id))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>SLA</span>
                  <span className="font-mono">{cat.slaHoras}h</span>
                </div>
                <SlaBar horas={cat.slaHoras} />
                <p className="text-[10px] text-slate-400 pt-1">
                  {cat.slaHoras >= 24
                    ? `Equivale a ${cat.slaHoras / 24} día${cat.slaHoras / 24 !== 1 ? "s" : ""} naturales`
                    : "Urgente — menos de 24 horas"}
                </p>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button onClick={() => setShowCatModal(true)}
            className="rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#1E3A8A]/30 hover:text-[#1E3A8A] hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[140px]"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 group-hover:border-[#1E3A8A]/40 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            </div>
            <p className="text-xs font-semibold">Nueva categoría</p>
          </button>
        </div>
      </section>

      {/* ── Estados del flujo ── */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Estados del flujo</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
              Define el ciclo de vida de las PQRS. Debe existir un estado inicial y al menos uno final.
            </p>
          </div>
          <button onClick={() => setShowEstadoModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
            style={{ background: "#1E3A8A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Nuevo estado
          </button>
        </div>

        {/* Flow diagram */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Diagrama del flujo</p>
          <div className="flex items-center gap-1 flex-wrap">
            {estados.map((est, i) => (
              <div key={est.id} className="flex items-center gap-1">
                <div className="relative">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border"
                    style={{ background: est.color + "15", borderColor: est.color + "40", color: est.textColor }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: est.color }} />
                    {est.nombre}
                    {est.flujo && (
                      <span className="text-[9px] font-black rounded px-1.5 py-0.5 text-white ml-0.5" style={{ background: est.color }}>
                        {est.flujo.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {i < estados.length - 1 && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-200 shrink-0">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Estado rows */}
        <div className="space-y-2">
          {estados.map(est => (
            <div key={est.id}
              onMouseEnter={() => setHovEst(est.id)}
              onMouseLeave={() => setHovEst(null)}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 transition-all duration-100"
              style={{ boxShadow: hovEst === est.id ? "0 2px 12px rgba(30,58,138,0.06)" : "none", borderLeftWidth: 3, borderLeftColor: est.color }}
            >
              {/* Color dot + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: est.color + "15" }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: est.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-700">{est.nombre}</p>
                    <code className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{est.slug}</code>
                    {est.flujo && (
                      <span className="text-[10px] font-semibold rounded-full border px-2 py-0.5 text-slate-500 border-slate-200 bg-white">
                        {est.flujo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{est.descripcion}</p>
                </div>
              </div>

              {/* Activo badge */}
              <span className="shrink-0 text-[11px] font-bold rounded-md px-2.5 py-1 text-white" style={{ background: "#10b981" }}>
                Activo
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button title="Editar" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-blue-50 hover:text-[#1E3A8A] transition-all cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </button>
                <button title="Eliminar" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modal Nueva Categoría ── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#eff3ff" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Nueva categoría</h3>
                <p className="text-xs text-slate-400">Define el SLA máximo de resolución</p>
              </div>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre <span className="text-red-400">*</span></label>
                <input autoFocus type="text" value={catNombre} onChange={e => setCatNombre(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddCat()}
                  placeholder="Ej: Reclamos urgentes"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">SLA (horas) <span className="text-red-400">*</span></label>
                <input type="number" min="1" value={catSla} onChange={e => setCatSla(e.target.value)}
                  placeholder="Ej: 72"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all"
                />
                {catSla && !isNaN(parseInt(catSla)) && parseInt(catSla) > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    = {parseInt(catSla) >= 24 ? `${parseInt(catSla) / 24} días` : `${catSla} horas`} de plazo máximo
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowCatModal(false); setCatNombre(""); setCatSla("") }}
                className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleAddCat} disabled={!catNombre.trim() || !catSla.trim()}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                Crear categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nuevo Estado ── */}
      {showEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#eff3ff" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#1E3A8A]"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Nuevo estado del flujo</h3>
                <p className="text-xs text-slate-400">Define cómo se llama y su rol en el ciclo</p>
              </div>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre visible</label>
                <input autoFocus type="text" placeholder="Ej: En revisión legal"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Slug interno</label>
                <input type="text" placeholder="en_revision_legal"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 font-mono transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tipo de flujo</label>
                  <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 cursor-pointer">
                    <option value="">Intermedio</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#0EA5E9"
                      className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-slate-50" />
                    <span className="text-xs text-slate-400">Seleccionar color</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEstadoModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => setShowEstadoModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer active:scale-95"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                Crear estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
