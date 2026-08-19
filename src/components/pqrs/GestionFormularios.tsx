import { useState } from "react"

interface Formulario {
  id: string
  nombre: string
  slug: string
  estado: "Publicado" | "Borrador"
  campos: number
  envios: number
  creado: string
  descripcion: string
}

const initialForms: Formulario[] = [
  {
    id: "1",
    nombre: "Demo · Campos condicionales",
    slug: "/f/demo-condiciones",
    estado: "Publicado",
    campos: 13,
    envios: 1,
    creado: "2026-08-02",
    descripcion:
      "Formulario con lógica condicional para enrutar el tipo de PQRS según las respuestas del usuario.",
  },
  {
    id: "2",
    nombre: "Nuevo formulario PQRS",
    slug: "/f/form-1242",
    estado: "Publicado",
    campos: 12,
    envios: 2,
    creado: "2026-07-31",
    descripcion:
      "Formulario estándar para recibir peticiones, quejas, reclamos y sugerencias de los ciudadanos.",
  },
  {
    id: "3",
    nombre: "Test PQRS 2",
    slug: "/f/form-9619",
    estado: "Borrador",
    campos: 12,
    envios: 1,
    creado: "2026-07-30",
    descripcion:
      "Versión de prueba con campos adicionales de verificación de identidad. Aún en desarrollo.",
  },
  {
    id: "4",
    nombre: "Test formulario público",
    slug: "/f/test-pqrslab-fom",
    estado: "Publicado",
    campos: 8,
    envios: 5,
    creado: "2026-07-30",
    descripcion:
      "Formulario simplificado para canales públicos. Solo captura información esencial.",
  },
]

const typeColors = ["#1E3A8A", "#0EA5E9", "#7c3aed", "#059669"]

function FormIcon({ idx }: { idx: number }) {
  const colors = typeColors
  const c = colors[idx % colors.length]
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: c + "18", border: `1.5px solid ${c}30` }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5"
        style={{ color: c }}
      >
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

export default function GestionFormularios() {
  const [forms, setForms] = useState<Formulario[]>(initialForms)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug =
      "/f/" +
      newName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    setForms((prev) => [
      {
        id: String(Date.now()),
        nombre: newName,
        slug,
        estado: "Borrador",
        campos: 0,
        envios: 0,
        creado: "2026-08-03",
        descripcion: newDesc,
      },
      ...prev,
    ])
    setNewName("")
    setNewDesc("")
    setShowModal(false)
  }

  const handleCopyLink = (slug: string, id: string) => {
    navigator.clipboard
      ?.writeText(`https://pqrs.conceptbpo.co${slug}`)
      .catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const published = forms.filter((f) => f.estado === "Publicado")
  const totalEnvios = forms.reduce((a, f) => a + f.envios, 0)

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Summary strip */}
      {/* <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total formularios", value: forms.length, icon: "📋", color: "#1E3A8A", bg: "#eff3ff" },
          { label: "Publicados",        value: published.length, icon: "🌐", color: "#059669", bg: "#ecfdf5" },
          { label: "Total envíos",      value: totalEnvios, icon: "📨", color: "#0EA5E9", bg: "#e0f2fe" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Mis Formularios</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formularios públicos para recibir PQRS de tus clientes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1E3A8A")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Crear Formulario
        </button>
      </div>

      {/* Form cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {forms.map((f, idx) => {
          const isHov = hoveredId === f.id
          return (
            <div
              key={f.id}
              onMouseEnter={() => setHoveredId(f.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-150 cursor-default"
              style={{
                boxShadow: isHov
                  ? "0 4px 20px rgba(30,58,138,0.08)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
                transform: isHov ? "translateY(-1px)" : "none",
              }}
            >
              {/* Card top strip */}
              <div
                className="h-1 w-full"
                style={{
                  background: f.estado === "Publicado" ? "#10b981" : "#cbd5e1",
                }}
              />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <FormIcon idx={idx} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {f.nombre}
                      </h3>
                      {f.estado === "Publicado" ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          Publicado
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                          Borrador
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {f.slug}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {f.descripcion}
                </p>

                {/* Stats chips */}
                {/* <div className="flex items-center gap-3 mb-4">
                  {[
                    { icon: "⚙", label: `${f.campos} campos` },
                    {
                      icon: "📨",
                      label: `${f.envios} envío${f.envios !== 1 ? "s" : ""}`,
                    },
                    { icon: "📅", label: f.creado },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100"
                    >
                      <span>{s.icon}</span>
                      <span className="font-medium">{s.label}</span>
                    </div>
                  ))}
                </div> */}

                {/* Action row */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleCopyLink(f.slug, f.id)}
                    className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-200 text-slate-600 hover:border-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-[#e0f2fe] transition-all cursor-pointer"
                  >
                    {copiedId === f.id ? (
                      <>
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-3.5 h-3.5 text-emerald-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.604 4a.75.75 0 00-.75.75v.75H6.25A2.25 2.25 0 004 7.75v5.5A2.25 2.25 0 006.25 15.5h5.5A2.25 2.25 0 0014 13.25V7.75A2.25 2.25 0 0011.75 5.5h-.396V4.75A.75.75 0 0010.604 4zM5.5 7.75A.75.75 0 016.25 7h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Copiar enlace
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-200 text-slate-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50 transition-all cursor-pointer">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                      <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                  </button>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-[#e0f2fe] hover:text-[#0EA5E9] transition-all cursor-pointer"
                      title="Vista previa"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer"
                      title="Eliminar"
                      onClick={() =>
                        setForms((prev) => prev.filter((x) => x.id !== f.id))
                      }
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add card CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-blue-50/30 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 group-hover:border-[#1E3A8A]/40 flex items-center justify-center transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold">Nuevo formulario</p>
          <p className="text-xs text-slate-300">Haz clic para crear</p>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,23,42,0.45)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#eff3ff" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-[#1E3A8A]"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Crear formulario
                </h3>
                <p className="text-xs text-slate-400">
                  Se creará en modo Borrador
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Ej: Formulario de quejas ciudadanas"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="¿Para qué se usará este formulario?"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 resize-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewName("")
                  setNewDesc("")
                }}
                className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                style={{ background: "#1E3A8A" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#162d6e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1E3A8A")
                }
                disabled={!newName.trim()}
              >
                Crear formulario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
