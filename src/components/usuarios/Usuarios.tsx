import { useMemo, useState } from "react"
import UsuarioDetalle from "./UsuarioDetalle"
import {
  actividadPorModulo,
  colorAvatar,
  diasDesde,
  estadoPersonaEstilo,
  fatigaDeContacto,
  haceCuanto,
  iniciales,
  mockPersonas,
  modulosTraza,
  municipios,
  rangosActividad,
  type ModuloTraza,
  type PersonaCRM,
} from "./UsuariosData"

/* ─────────────────────────────────────────────
   Módulo Usuarios

   El directorio es la puerta: se busca a alguien y
   se entra a su trazabilidad. Por eso los filtros
   no son decorativos —tienen que resolver las
   preguntas reales del operador: "quién de Bello
   sigue esperando", "a quién le escribimos de más",
   "quién no vuelve desde hace tres meses".
───────────────────────────────────────────── */

const modulosFiltrables: ModuloTraza[] = ["pqrs", "individuales", "masivos", "flujos"]

function Chip({
  activo,
  onClick,
  color,
  children,
}: {
  activo: boolean
  onClick: () => void
  color?: string
  children: React.ReactNode
}) {
  const c = color ?? "#1E3A8A"
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap"
      style={{
        background: activo ? c + "14" : "#fff",
        borderColor: activo ? c : "#e2e8f0",
        color: activo ? c : "#64748b",
      }}
    >
      {children}
    </button>
  )
}

function Select({
  valor,
  onChange,
  children,
}: {
  valor: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={valor}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
    >
      {children}
    </select>
  )
}

function Kpi({ valor, label, color }: { valor: string | number; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-1 min-w-0">
      <p className="text-2xl font-bold tracking-tight leading-none" style={{ color }}>
        {valor}
      </p>
      <p className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-snug">{label}</p>
    </div>
  )
}

export default function Usuarios() {
  const [personas] = useState<PersonaCRM[]>(mockPersonas)
  const [seleccionada, setSeleccionada] = useState<PersonaCRM | null>(null)

  const [busqueda, setBusqueda] = useState("")
  const [municipio, setMunicipio] = useState("todos")
  const [estado, setEstado] = useState("todos")
  const [tipo, setTipo] = useState("todos")
  const [rango, setRango] = useState("todos")
  const [modulosActivos, setModulosActivos] = useState<ModuloTraza[]>([])
  const [soloFatiga, setSoloFatiga] = useState(false)
  const [soloRevocados, setSoloRevocados] = useState(false)
  const [orden, setOrden] = useState("reciente")

  const alternarModulo = (m: ModuloTraza) =>
    setModulosActivos(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]))

  const limpiar = () => {
    setBusqueda("")
    setMunicipio("todos")
    setEstado("todos")
    setTipo("todos")
    setRango("todos")
    setModulosActivos([])
    setSoloFatiga(false)
    setSoloRevocados(false)
  }

  const hayFiltros =
    busqueda.trim() !== "" ||
    municipio !== "todos" ||
    estado !== "todos" ||
    tipo !== "todos" ||
    rango !== "todos" ||
    modulosActivos.length > 0 ||
    soloFatiga ||
    soloRevocados

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    const lista = personas.filter(p => {
      /* La búsqueda libre cubre los cuatro campos por los que alguien llega: nombre, documento, correo y teléfono */
      if (q) {
        const heno = `${p.nombre} ${p.documento} ${p.correo} ${p.telefono} ${p.telefonoAlterno ?? ""} ${p.etiquetas.join(" ")}`
          .toLowerCase()
          .replace(/\s+/g, " ")
        if (!heno.includes(q)) return false
      }
      if (municipio !== "todos" && p.municipio !== municipio) return false
      if (estado !== "todos" && p.estado !== estado) return false
      if (tipo !== "todos" && p.tipoPersona !== tipo) return false

      if (rango !== "todos") {
        const cfg = rangosActividad.find(r => r.id === rango)
        const d = diasDesde(p.ultimaInteraccion)
        if (cfg?.dias != null) {
          if (cfg.dias > 0 && d > cfg.dias) return false
          if (cfg.dias < 0 && d < Math.abs(cfg.dias)) return false
        }
      }

      if (modulosActivos.length) {
        const act = actividadPorModulo(p)
        if (!modulosActivos.every(m => act[m] > 0)) return false
      }

      if (soloFatiga && fatigaDeContacto(p).nivel === "baja") return false
      if (soloRevocados && !p.consentimientos.some(c => c.estado === "Revocado")) return false

      return true
    })

    return lista.sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre, "es")
      if (orden === "actividad") return b.traza.length - a.traza.length
      return b.ultimaInteraccion.localeCompare(a.ultimaInteraccion)
    })
  }, [personas, busqueda, municipio, estado, tipo, rango, modulosActivos, soloFatiga, soloRevocados, orden])

  /* ── Detalle a pantalla completa ── */
  if (seleccionada) {
    return <UsuarioDetalle persona={seleccionada} onVolver={() => setSeleccionada(null)} />
  }

  const activos = personas.filter(p => p.estado === "Activo").length
  const recientes = personas.filter(p => diasDesde(p.ultimaInteraccion) <= 30).length
  const conRevocacion = personas.filter(p => p.consentimientos.some(c => c.estado === "Revocado")).length

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#F8FAFC" }}>

      {/* ───── Encabezado ───── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Usuarios</h2>
          <p className="text-xs text-slate-400 mt-1">
            Directorio único de personas del tenant. Al abrir una ficha se ve todo lo que ha pasado con ella en
            cada módulo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select valor={orden} onChange={setOrden}>
            <option value="reciente">Más recientes primero</option>
            <option value="nombre">Nombre A-Z</option>
            <option value="actividad">Más actividad</option>
          </Select>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* ───── Resumen del directorio ───── */}
      <div className="flex items-stretch gap-3 mt-5">
        <Kpi valor={personas.length} label="Personas en el directorio" color="#1E3A8A" />
        <Kpi valor={activos} label="Activas" color="#059669" />
        <Kpi valor={recientes} label="Con interacción en 30 días" color="#0EA5E9" />
        <Kpi valor={conRevocacion} label="Con algún consentimiento revocado" color="#b45309" />
      </div>

      {/* ───── Filtros ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mt-5">

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[260px]">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Nombre, cédula, correo, teléfono o etiqueta…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
            />
          </div>

          <Select valor={municipio} onChange={setMunicipio}>
            <option value="todos">Todos los municipios</option>
            {municipios.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>

          <Select valor={estado} onChange={setEstado}>
            <option value="todos">Cualquier estado</option>
            <option value="Activo">Activo</option>
            <option value="Sin actividad">Sin actividad</option>
            <option value="Bloqueado">Bloqueado</option>
          </Select>

          <Select valor={tipo} onChange={setTipo}>
            <option value="todos">Persona o empresa</option>
            <option value="Ciudadano">Ciudadano</option>
            <option value="Empresa">Empresa</option>
            <option value="Funcionario">Funcionario</option>
          </Select>

          <Select valor={rango} onChange={setRango}>
            {rangosActividad.map(r => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Filtros por módulo y señales */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Con actividad en
          </span>
          {modulosFiltrables.map(m => {
            const meta = modulosTraza[m]
            return (
              <Chip
                key={m}
                activo={modulosActivos.includes(m)}
                onClick={() => alternarModulo(m)}
                color={meta.color}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.corto}
              </Chip>
            )
          })}

          <span className="w-px h-5 bg-slate-200 mx-1" />

          <Chip activo={soloFatiga} onClick={() => setSoloFatiga(v => !v)} color="#dc2626">
            Alto contacto reciente
          </Chip>
          <Chip activo={soloRevocados} onClick={() => setSoloRevocados(v => !v)} color="#b45309">
            Con consentimiento revocado
          </Chip>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              <span className="font-bold text-slate-600">{visibles.length}</span> de {personas.length}
            </span>
            {hayFiltros && (
              <button
                onClick={limpiar}
                className="text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───── Tabla ───── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100">
                {["Persona", "Contacto", "Ubicación", "Actividad por módulo", "Última interacción", "Estado"].map(
                  h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visibles.map(p => {
                const act = actividadPorModulo(p)
                const est = estadoPersonaEstilo[p.estado]
                const fat = fatigaDeContacto(p)
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSeleccionada(p)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Persona */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                          style={{ background: colorAvatar(p.nombre) }}
                        >
                          {iniciales(p.nombre)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#1E3A8A] transition-colors">
                            {p.nombre}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {p.tipoDocumento} {p.documento}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-slate-600 truncate max-w-[220px]">{p.correo}</p>
                      <p className="text-[11px] font-mono text-slate-400">{p.telefono}</p>
                    </td>

                    {/* Ubicación */}
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium text-slate-700">{p.municipio}</p>
                      <p className="text-[10px] text-slate-400">{p.departamento}</p>
                    </td>

                    {/* Actividad */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {modulosFiltrables.map(m => {
                          const meta = modulosTraza[m]
                          const n = act[m]
                          return (
                            <span
                              key={m}
                              title={`${meta.nombre}: ${n} ${n === 1 ? "evento" : "eventos"}`}
                              className="inline-flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5 text-[10px] font-bold border"
                              style={{
                                background: n ? meta.bg : "#fff",
                                borderColor: n ? "transparent" : "#f1f5f9",
                                color: n ? meta.color : "#cbd5e1",
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: n ? meta.color : "#e2e8f0" }}
                              />
                              {n}
                            </span>
                          )
                        })}
                        {fat.nivel === "alta" && (
                          <span
                            title={`${fat.total} mensajes salientes en los últimos 30 días`}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ml-1"
                            style={{ background: fat.bg, borderColor: fat.borde, color: fat.color }}
                          >
                            Alto contacto
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Última interacción */}
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium text-slate-700">{haceCuanto(p.ultimaInteraccion)}</p>
                      <p className="text-[10px] font-mono text-slate-400">{p.ultimaInteraccion}</p>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                          style={{ background: est.bg, color: est.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                          {p.estado}
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <span
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "#eff3ff", color: "#1E3A8A" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Ninguna persona coincide con los filtros</p>
              <p className="text-xs text-slate-400 mt-1">Prueba con menos criterios o limpia la búsqueda.</p>
            </div>
            {hayFiltros && (
              <button
                onClick={limpiar}
                className="text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
