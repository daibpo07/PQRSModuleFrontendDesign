import { useState } from "react"
import PlantillaMetaEditor from "./PlantillaMetaEditor"
import {
  aprobacionMetaEstilo,
  calidadMetaEstilo,
  canalPlantillaMeta,
  categoriaMetaEstilo,
  nf,
  type AprobacionMeta,
  type CanalPlantilla,
  type PlantillaIndividual,
} from "./EnviosIndividualesData"

interface Props {
  plantillas: PlantillaIndividual[]
  onGuardar: (p: PlantillaIndividual) => void
  onEliminar: (id: string) => void
}

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

/* ─────────────────────────────────────────────
   Subvista Plantillas
───────────────────────────────────────────── */
export default function PlantillasMeta({ plantillas, onGuardar, onEliminar }: Props) {
  const [canal, setCanal] = useState<"Todos" | CanalPlantilla>("Todos")
  const [aprobacion, setAprobacion] = useState<"Todas" | AprobacionMeta>("Todas")
  const [buscar, setBuscar] = useState("")
  const [editor, setEditor] = useState<{ abierto: boolean; base: PlantillaIndividual | null }>({
    abierto: false,
    base: null,
  })

  const filtradas = plantillas.filter(p => {
    if (canal !== "Todos" && p.canal !== canal) return false
    if (aprobacion !== "Todas" && p.aprobacion !== aprobacion) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      return p.nombre.toLowerCase().includes(q) || p.atajo.includes(q) || p.cuerpo.toLowerCase().includes(q)
    }
    return true
  })

  const conteoCanal = (c: "Todos" | CanalPlantilla) =>
    c === "Todos" ? plantillas.length : plantillas.filter(p => p.canal === c).length

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Plantillas de mensajería</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mensajes estructurados para atención uno a uno por WhatsApp Business, Instagram Direct y SMS.
          </p>
        </div>
        <button
          onClick={() => setEditor({ abierto: true, base: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: "#1E3A8A" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva plantilla
        </button>
      </div>

      {/* Estado de las cuentas Meta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" fill="#0866FF" className="w-4 h-4">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-800">Cuentas conectadas</h3>
          <span className="ml-auto text-[10px] text-slate-300">Sincronizado hace 4 min</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              canal: "whatsapp" as CanalPlantilla,
              cuenta: "+57 300 000 0000",
              detalle: "WABA · Pqrslab S.A.S.",
              estado: "Verificado",
              calidad: "Alta" as const,
              extra: "1.000 conversaciones de servicio gratis al mes",
            },
            {
              canal: "instagram" as CanalPlantilla,
              cuenta: "@pqrslab",
              detalle: "Cuenta profesional vinculada",
              estado: "Conectado",
              calidad: "Alta" as const,
              extra: "Respuestas dentro de la ventana de 24 horas",
            },
            {
              canal: "sms" as CanalPlantilla,
              cuenta: "Remitente PQRSLAB",
              detalle: "Proveedor externo · Colombia",
              estado: "Activo",
              calidad: "Media" as const,
              extra: "$52 COP por segmento de 160 caracteres",
            },
          ].map(c => {
            const m = canalPlantillaMeta[c.canal]
            const cal = calidadMetaEstilo[c.calidad]
            return (
              <div key={c.canal} className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.color }}>
                    <IconoCanal canal={c.canal} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 truncate">{c.cuenta}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.detalle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: "#d1fae5", color: "#065f46" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                    {c.estado}
                  </span>
                  <span className="text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: cal.bg, color: cal.color }}>
                    Calidad {c.calidad}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-2">{c.extra}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Anatomía */}
      {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800">Anatomía de una plantilla</h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Cada plantilla se arma con cuatro bloques. Solo el cuerpo es obligatorio, y cada canal admite un
          subconjunto distinto.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Encabezado", d: "Una línea en negrita que resume el mensaje.", req: "Opcional", c: "#0EA5E9", canales: ["whatsapp"] },
            { n: "2", t: "Cuerpo", d: "El contenido, con variables como {{nombre}}.", req: "Obligatorio", c: "#1E3A8A", canales: ["whatsapp", "instagram", "sms"] },
            { n: "3", t: "Pie de página", d: "Texto pequeño para la firma o el aviso de baja.", req: "Opcional", c: "#6d28d9", canales: ["whatsapp"] },
            { n: "4", t: "Botones", d: "Respuestas rápidas, enlaces o llamada.", req: "Opcional", c: "#059669", canales: ["whatsapp", "instagram"] },
          ].map(b => (
            <div key={b.n} className="rounded-xl border border-slate-200 p-3.5" style={{ background: "#f8fafc" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: b.c }}>
                  {b.n}
                </span>
                <p className="text-xs font-bold text-slate-700">{b.t}</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{b.d}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-semibold" style={{ color: b.req === "Obligatorio" ? "#dc2626" : "#94a3b8" }}>
                  {b.req}
                </span>
                <span className="text-slate-200">·</span>
                <div className="flex items-center gap-1">
                  {(b.canales as CanalPlantilla[]).map(c => (
                    <span key={c} title={canalPlantillaMeta[c].label} style={{ color: canalPlantillaMeta[c].color }}>
                      <IconoCanal canal={c} className="w-2.5 h-2.5" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {(["Todos", "whatsapp", "instagram", "sms"] as const).map(c => {
            const activo = canal === c
            const m = c === "Todos" ? null : canalPlantillaMeta[c]
            return (
              <button
                key={c}
                onClick={() => setCanal(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activo
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                }`}
              >
                {m && (
                  <span style={{ color: activo ? "#fff" : m.color }}>
                    <IconoCanal canal={c as CanalPlantilla} className="w-3 h-3" />
                  </span>
                )}
                {m ? m.corto : "Todos"}
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                    activo ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {conteoCanal(c)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={aprobacion}
            onChange={e => setAprobacion(e.target.value as "Todas" | AprobacionMeta)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 focus:outline-none focus:border-[#0EA5E9] cursor-pointer transition-all"
          >
            {["Todas", "Aprobada", "En revisión", "Rechazada", "No requiere"].map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar plantilla o atajo…"
              className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/25 focus:border-[#0EA5E9] text-slate-700 w-56 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtradas.map(p => {
          const m = canalPlantillaMeta[p.canal]
          const ap = aprobacionMetaEstilo[p.aprobacion]
          const cat = categoriaMetaEstilo[p.categoria]
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-[#c7d7fe] transition-colors group"
            >
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.color }}>
                  <IconoCanal canal={p.canal} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <code className="text-[10px] font-mono font-bold rounded px-1.5 py-0.5" style={{ background: "#eff3ff", color: "#1E3A8A" }}>
                      {p.atajo}
                    </code>
                    <span className="text-[9px] font-bold rounded px-1.5 py-0.5" style={{ background: cat.bg, color: cat.color }}>
                      {p.categoria}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold rounded-full px-2 py-0.5 shrink-0" style={{ background: ap.bg, color: ap.text }}>
                  {p.aprobacion}
                </span>
              </div>

              {/* Vista previa estructurada */}
              <div className="mx-4 mb-3 rounded-xl p-3 flex-1 space-y-1.5" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                {p.encabezado && <p className="text-[11px] font-bold text-slate-700 leading-snug">{p.encabezado}</p>}
                <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap line-clamp-5">
                  {p.cuerpo.split(/(\{\{\w+\}\})/g).map((parte, i) =>
                    /^\{\{\w+\}\}$/.test(parte) ? (
                      <span key={i} className="rounded px-1 font-semibold" style={{ background: "#fef9c3", color: "#854d0e" }}>
                        {parte}
                      </span>
                    ) : (
                      <span key={i}>{parte}</span>
                    ),
                  )}
                </p>
                {p.pie && <p className="text-[10px] text-slate-400 italic">{p.pie}</p>}
                {p.botones && p.botones.length > 0 && (
                  <div className="flex gap-1 flex-wrap pt-1.5 border-t border-slate-200">
                    {p.botones.map((b, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold rounded px-1.5 py-0.5 border bg-white"
                        style={{ borderColor: m.border, color: m.color }}
                      >
                        {b.tipo === "enlace" ? "↗ " : b.tipo === "telefono" ? "✆ " : "↩ "}
                        {b.texto}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2" style={{ background: "#f8fafc" }}>
                <span className="text-[10px] text-slate-400 min-w-0 truncate">
                  <span className="font-mono font-bold text-slate-600">{nf(p.usos)}</span> usos
                  {p.tasaLectura > 0 && (
                    <>
                      {" · "}
                      <span className="font-mono font-bold" style={{ color: m.color }}>{p.tasaLectura}%</span> lectura
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditor({ abierto: true, base: p })}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(p.id)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        <button
          onClick={() => setEditor({ abierto: true, base: null })}
          className="rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 py-12 text-slate-300 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer min-h-[240px]"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">Crear plantilla</span>
        </button>
      </div>

      {filtradas.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center gap-2">
          <p className="text-sm text-slate-400 font-medium">Sin plantillas</p>
          <p className="text-xs text-slate-300">Ajusta los filtros o crea una nueva</p>
        </div>
      )}

      {editor.abierto && (
        <PlantillaMetaEditor
          inicial={editor.base}
          onClose={() => setEditor({ abierto: false, base: null })}
          onGuardar={p => {
            onGuardar(p)
            setEditor({ abierto: false, base: null })
          }}
        />
      )}
    </div>
  )
}
