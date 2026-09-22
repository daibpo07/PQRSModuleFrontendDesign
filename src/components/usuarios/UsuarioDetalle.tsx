import { useEffect, useMemo, useState } from "react"
import {
  UMBRAL_FATIGA,
  VENTANA_FATIGA_DIAS,
  asesoresDe,
  colorAvatar,
  estadoPersonaEstilo,
  fatigaDeContacto,
  fechaLarga,
  haceCuanto,
  iniciales,
  modulosTraza,
  referenciasDe,
  type EventoTraza,
  type ModuloTraza,
  type PersonaCRM,
} from "./UsuariosData"

/* ─────────────────────────────────────────────
   Ficha 360 de una persona

   "Información" abre la ficha: quién es y qué hay
   que tener en cuenta, todo junto y sin competir
   con nada. Las demás pestañas dejan la pantalla
   entera para la traza, porque leer una historia
   larga a tres columnas cansa.
───────────────────────────────────────────── */

type Pestana = "info" | "todo" | ModuloTraza
type Densidad = "compacta" | "detallada"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

/** Cuántos eventos se muestran antes de pedir más. */
const TAMANO_PAGINA = 20

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

function Tarjeta({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Etiqueta>{titulo}</Etiqueta>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
    </div>
  )
}

function Dato({ label, valor, mono = false }: { label: string; valor?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[11px] font-semibold text-slate-700 text-right ${mono ? "font-mono" : ""}`}>
        {valor || "—"}
      </span>
    </div>
  )
}

/* Icono por módulo de origen: se reconoce de dónde viene el hecho antes de leerlo */
function IconoEvento({ modulo, color, className = "w-3.5 h-3.5" }: { modulo: ModuloTraza; color: string; className?: string }) {
  const iconos: Record<ModuloTraza, React.ReactNode> = {
    pqrs: (
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    ),
    individuales: (
      <path
        fillRule="evenodd"
        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
        clipRule="evenodd"
      />
    ),
    masivos: (
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    ),
    flujos: (
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    ),
    sistema: (
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    ),
  }
  return (
    <svg viewBox="0 0 20 20" fill={color} className={className}>
      {iconos[modulo]}
    </svg>
  )
}

function SelloSaliente() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold rounded px-1.5 py-0.5 shrink-0"
      style={{ background: "#f1f5f9", color: "#64748b" }}
      title="Mensaje que la plataforma le envió a la persona"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
        <path d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L12 6.414V16a1 1 0 11-2 0V6.414L6.707 9.707a1 1 0 01-1.414-1.414l5-5z" />
      </svg>
      Saliente
    </span>
  )
}

function Actor({ e, compacto = false }: { e: EventoTraza; compacto?: boolean }) {
  if (e.actor === "Sistema") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 shrink-0">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-300">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
        Automático
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
        style={{ background: colorAvatar(e.actor) }}
      >
        {iniciales(e.actor)}
      </span>
      <span className="text-[10px] font-semibold text-slate-600">{e.actor}</span>
      {!compacto && e.actorRol && <span className="text-[10px] text-slate-300">· {e.actorRol}</span>}
    </span>
  )
}

/* ── Fila compacta: una línea por evento, para recorrer cientos sin perderse ── */
function FilaCompacta({ e, abierto, onToggle }: { e: EventoTraza; abierto: boolean; onToggle: () => void }) {
  const meta = modulosTraza[e.modulo]

  return (
    <div className="border-b border-slate-50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
      >
        <span className="text-[10px] font-mono text-slate-400 shrink-0 w-[78px]">
          {MESES_CORTOS[Number(e.fecha.split("-")[1]) - 1]} {e.fecha.split("-")[2]} · {e.hora}
        </span>

        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: meta.bg }}
          title={meta.nombre}
        >
          <IconoEvento modulo={e.modulo} color={meta.color} className="w-3 h-3" />
        </span>

        <span
          className="text-[9px] font-bold uppercase tracking-widest rounded px-1.5 py-0.5 shrink-0 w-[92px] text-center truncate"
          style={{ background: meta.bg, color: meta.color }}
        >
          {e.tipo}
        </span>

        <span className="text-[12px] font-semibold text-slate-700 truncate flex-1 min-w-0 group-hover:text-[#1E3A8A] transition-colors">
          {e.titulo}
        </span>

        {e.referencia && (
          <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden xl:inline">{e.referencia}</span>
        )}
        {e.saliente && <span className="hidden lg:inline"><SelloSaliente /></span>}
        <span className="hidden md:inline"><Actor e={e} compacto /></span>

        {e.resultado && (
          <span
            className="text-[10px] font-bold shrink-0 hidden xl:inline text-right w-[150px] truncate"
            style={{ color: meta.color }}
          >
            {e.resultado}
          </span>
        )}

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 shrink-0 text-slate-300 transition-transform ${abierto ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Se despliega solo lo que se pide: el resto del listado sigue corto */}
      {abierto && (
        <div className="px-4 pb-4 pl-[122px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            {e.detalle && <p className="text-[11px] text-slate-600 leading-relaxed">{e.detalle}</p>}

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Actor e={e} />
              {e.canal && (
                <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-px">
                  {e.canal}
                </span>
              )}
              {e.referencia && <span className="text-[10px] font-mono text-slate-400">{e.referencia}</span>}
            </div>

            {e.datos && e.datos.length > 0 && (
              <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-200 flex-wrap">
                {e.datos.map(d => (
                  <div key={d.label}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{d.label}</p>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{d.valor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Fila detallada: la tarjeta completa, para leer con calma ── */
function FilaDetallada({ e }: { e: EventoTraza }) {
  const meta = modulosTraza[e.modulo]

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shrink-0"
          style={{ background: meta.bg, boxShadow: `0 0 0 1px ${meta.color}33` }}
        >
          <IconoEvento modulo={e.modulo} color={meta.color} />
        </span>
        <span className="flex-1 w-px my-1" style={{ background: "#e2e8f0" }} />
      </div>

      <div className="flex-1 min-w-0 pb-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
          <span className="w-1 shrink-0" style={{ background: meta.color }} />

          <div className="flex-1 min-w-0 p-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[9px] font-bold uppercase tracking-widest rounded px-1.5 py-0.5"
                style={{ background: meta.bg, color: meta.color }}
              >
                {e.tipo}
              </span>
              {e.referencia && <span className="text-[10px] font-mono text-slate-400">{e.referencia}</span>}
              {e.canal && (
                <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-px">
                  {e.canal}
                </span>
              )}
              {e.saliente && <SelloSaliente />}
              <span className="ml-auto text-[10px] font-mono text-slate-300 shrink-0">
                {fechaLarga(e.fecha)} · {e.hora}
              </span>
            </div>

            <p className="text-[13px] font-semibold text-slate-800 mt-2 leading-snug">{e.titulo}</p>
            {e.detalle && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{e.detalle}</p>}

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Actor e={e} />
              {e.resultado && (
                <span className="ml-auto text-[10px] font-bold" style={{ color: meta.color }}>
                  {e.resultado}
                </span>
              )}
            </div>

            {e.datos && e.datos.length > 0 && (
              <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap">
                {e.datos.map(d => (
                  <div key={d.label}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{d.label}</p>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{d.valor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Navegador de periodos

   Una traza de años no se recorre con scroll. Este
   histograma muestra dónde se concentró la actividad
   y deja saltar al mes que interesa de un clic: el
   scroll deja de ser la única forma de llegar.
───────────────────────────────────────────── */
function NavegadorPeriodos({
  eventos,
  mesActivo,
  onMes,
}: {
  eventos: EventoTraza[]
  mesActivo: string | null
  onMes: (clave: string | null) => void
}) {
  const barras = useMemo(() => {
    if (!eventos.length) return []
    const conteo = new Map<string, number>()
    for (const e of eventos) {
      const clave = e.fecha.slice(0, 7)
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1)
    }

    /* El rango va completo aunque haya meses vacíos: los huecos también informan */
    const claves = [...conteo.keys()].sort()
    const [a0, m0] = claves[0].split("-").map(Number)
    const [a1, m1] = claves[claves.length - 1].split("-").map(Number)

    const salida: { clave: string; label: string; n: number }[] = []
    let anio = a0
    let mes = m0
    while (anio < a1 || (anio === a1 && mes <= m1)) {
      const clave = `${anio}-${String(mes).padStart(2, "0")}`
      salida.push({ clave, label: `${MESES_CORTOS[mes - 1]} ${anio}`, n: conteo.get(clave) ?? 0 })
      mes += 1
      if (mes > 12) {
        mes = 1
        anio += 1
      }
    }
    return salida
  }, [eventos])

  if (barras.length < 2) return null

  const max = Math.max(...barras.map(b => b.n), 1)

  return (
    <div className="flex items-end gap-3">
      <div className="flex items-end gap-[2px] overflow-x-auto pb-1">
        {barras.map(b => {
          const activo = mesActivo === b.clave
          const vacio = b.n === 0
          return (
            <button
              key={b.clave}
              onClick={() => onMes(activo ? null : b.clave)}
              disabled={vacio}
              title={`${b.label} · ${b.n} ${b.n === 1 ? "evento" : "eventos"}`}
              className="flex flex-col items-center gap-1 shrink-0 group disabled:cursor-default cursor-pointer"
            >
              <span className="text-[9px] font-mono font-bold text-slate-300 group-hover:text-slate-500 transition-colors h-3">
                {b.n || ""}
              </span>
              <span
                className="w-4 rounded-t-[3px] transition-all"
                style={{
                  height: vacio ? 3 : Math.max(5, Math.round((b.n / max) * 34)),
                  background: vacio ? "#f1f5f9" : activo ? "#1E3A8A" : mesActivo ? "#c7d7fb" : "#4f76d0",
                }}
              />
              <span
                className="text-[8px] font-semibold uppercase tracking-wide transition-colors"
                style={{ color: activo ? "#1E3A8A" : "#cbd5e1" }}
              >
                {b.label.split(" ")[0]}
              </span>
            </button>
          )
        })}
      </div>

      {mesActivo && (
        <button
          onClick={() => onMes(null)}
          className="shrink-0 mb-4 text-[10px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
        >
          Ver todo el periodo
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Pestaña Información
───────────────────────────────────────────── */
function PanelInformacion({ p }: { p: PersonaCRM }) {
  const fatiga = fatigaDeContacto(p)
  const asesores = asesoresDe(p)

  return (
    <div>
      {/* ───── Fatiga de contacto ─────
          Va arriba y a todo el ancho porque es una alerta, no un dato
          más: define si esta persona puede entrar en la próxima campaña.
          El dato que ningún módulo tiene por separado. */}
      <div
        className="rounded-2xl border shadow-sm p-5 mb-5"
        style={{ background: fatiga.bg, borderColor: fatiga.borde }}
      >
        <div className="flex items-center gap-2">
          <Etiqueta>Fatiga de contacto</Etiqueta>
          <span
            className="text-[9px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
            style={{ background: "#fff", color: fatiga.color }}
          >
            {fatiga.nivel}
          </span>
          <span className="text-[10px] ml-auto" style={{ color: fatiga.color, opacity: 0.7 }}>
            últimos {VENTANA_FATIGA_DIAS} días · umbral {UMBRAL_FATIGA}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-4 flex-wrap">
          {/* Cuántos */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-4xl font-bold tracking-tight leading-none" style={{ color: fatiga.color }}>
              {fatiga.total}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: fatiga.color, opacity: 0.8 }}>
              mensajes
              <span className="block" style={{ opacity: 0.75 }}>
                salientes
              </span>
            </span>
          </div>

          {/* Contra el umbral, y de dónde salieron */}
          <div className="flex-1 min-w-[220px]">
            <div className="h-2 rounded-full bg-white/70 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (fatiga.total / (UMBRAL_FATIGA + 2)) * 100)}%`,
                  background: fatiga.color,
                }}
              />
            </div>
            {Object.keys(fatiga.porModulo).length > 0 && (
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {Object.entries(fatiga.porModulo).map(([m, n]) => {
                  const meta = modulosTraza[m as ModuloTraza]
                  return (
                    <span key={m} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {meta.corto} {n}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Qué hacer con eso */}
          <p
            className="text-[11px] leading-relaxed flex-1 min-w-[260px]"
            style={{ color: fatiga.color, opacity: 0.9 }}
          >
            {fatiga.nivel === "alta"
              ? "Está por encima del umbral. Excluirla de campañas no esenciales antes de que la queja llegue por spam."
              : fatiga.nivel === "media"
                ? "Se acerca al umbral. Conviene reservar los próximos envíos para lo que de verdad necesite saber."
                : "Dentro de lo razonable. Puede entrar en campañas sin riesgo de saturación."}
          </p>
        </div>
      </div>

      {/* ───── El resto, en columnas que se equilibran solas ─────
          Con columnas fijas la izquierda quedaba vacía y la derecha
          larguísima, porque cada persona tiene distinta cantidad de
          notas, consentimientos y casos. El flujo multicolumna reparte
          las tarjetas hasta igualar las alturas, sea cual sea el
          contenido. */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-5">
        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Identificación">
            <Dato label="Nombre completo" valor={p.nombre} />
            <Dato label="Documento" valor={`${p.tipoDocumento} ${p.documento}`} mono />
            <Dato label="Fecha de nacimiento" valor={p.fechaNacimiento ? fechaLarga(p.fechaNacimiento) : undefined} />
            <Dato label="Ocupación" valor={p.ocupacion} />
            <Dato label="Tipo" valor={p.tipoPersona} />
          </Tarjeta>
        </div>

        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Contacto y residencia">
            <Dato label="Correo" valor={p.correo} />
            <Dato label="Teléfono" valor={p.telefono} mono />
            <Dato label="Teléfono alterno" valor={p.telefonoAlterno} mono />
            <Dato label="Municipio" valor={p.municipio} />
            <Dato label="Departamento" valor={p.departamento} />
            <Dato label="Dirección" valor={p.direccion} />
            <Dato label="Canal preferido" valor={p.canalPreferido} />
          </Tarjeta>
        </div>

        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Relación con la organización">
            <Dato label="Tenant" valor={p.tenant} />
            <Dato label="Origen" valor={p.origen} />
            <Dato label="Primer contacto" valor={`${fechaLarga(p.primerContacto)} · ${haceCuanto(p.primerContacto)}`} />
            <Dato
              label="Última interacción"
              valor={`${fechaLarga(p.ultimaInteraccion)} · ${haceCuanto(p.ultimaInteraccion)}`}
            />
            <Dato label="Asesor principal" valor={p.asesorPrincipal} />
          </Tarjeta>
        </div>

        <div className="break-inside-avoid mb-5">
          <Tarjeta
            titulo="Quién lo ha atendido"
            extra={<span className="text-[10px] text-slate-300">{asesores.length}</span>}
          >
            {asesores.length ? (
              <div className="flex flex-col gap-2.5">
                {asesores.map(a => (
                  <div key={a.nombre} className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: colorAvatar(a.nombre) }}
                    >
                      {iniciales(a.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{a.nombre}</p>
                      <p className="text-[10px] text-slate-400 truncate">{a.rol}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-slate-600">{a.veces}</p>
                      <p className="text-[9px] text-slate-300">{haceCuanto(a.ultimo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Solo tiene eventos automáticos.</p>
            )}
          </Tarjeta>
        </div>

        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Casos relacionados">
            <div className="flex flex-col gap-3">
              {(["pqrs", "individuales", "masivos", "flujos"] as ModuloTraza[]).map(m => {
                const refs = referenciasDe(p, m)
                if (!refs.length) return null
                const meta = modulosTraza[m]
                return (
                  <div key={m}>
                    <p className="text-[10px] font-bold" style={{ color: meta.color }}>
                      {meta.nombre}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {refs.map(r => (
                        <span
                          key={r}
                          className="text-[10px] font-mono font-semibold rounded px-2 py-1 border cursor-pointer hover:shadow-sm transition-all"
                          style={{ background: meta.bg, borderColor: meta.color + "26", color: meta.color }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Tarjeta>
        </div>

        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Consentimientos">
            <div className="flex flex-col gap-2">
              {p.consentimientos.map(c => {
                const ok = c.estado === "Otorgado"
                return (
                  <div
                    key={c.canal}
                    className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2"
                    style={{ background: ok ? "#ecfdf5" : "#fef2f2", borderColor: ok ? "#a7f3d0" : "#fecaca" }}
                  >
                    <svg viewBox="0 0 20 20" fill={ok ? "#059669" : "#dc2626"} className="w-3.5 h-3.5 shrink-0">
                      {ok ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold" style={{ color: ok ? "#065f46" : "#991b1b" }}>
                        {c.canal}
                      </p>
                      <p className="text-[9px]" style={{ color: ok ? "#047857" : "#b91c1c", opacity: 0.8 }}>
                        {c.fuente} · {fechaLarga(c.fecha)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              Tratamiento de datos bajo la Ley 1581 de 2012. Un canal revocado excluye a la persona de toda
              audiencia de ese canal.
            </p>
          </Tarjeta>
        </div>

        {p.etiquetas.length > 0 && (
          <div className="break-inside-avoid mb-5">
            <Tarjeta titulo="Etiquetas">
              <div className="flex flex-wrap gap-1.5">
                {p.etiquetas.map(e => (
                  <span
                    key={e}
                    className="text-[10px] font-semibold rounded-full px-2.5 py-1 border border-slate-200 bg-slate-50 text-slate-600"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </Tarjeta>
          </div>
        )}

        <div className="break-inside-avoid mb-5">
          <Tarjeta titulo="Notas internas" extra={<span className="text-[10px] text-slate-300">{p.notas.length}</span>}>
            {p.notas.length ? (
              <div className="flex flex-col gap-2.5">
                {p.notas.map((n, i) => (
                  <div
                    key={i}
                    className="rounded-xl border px-3 py-2.5"
                    style={{ background: "#fffbeb", borderColor: "#fef3c7" }}
                  >
                    <p className="text-[11px] leading-relaxed" style={{ color: "#78350f" }}>
                      {n.texto}
                    </p>
                    <p className="text-[9px] font-semibold mt-2" style={{ color: "#b45309" }}>
                      — {n.autor} · {n.rol} · {fechaLarga(n.fecha)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Nadie ha dejado notas sobre esta persona.</p>
            )}
            <button className="w-full mt-3 py-2 rounded-xl text-[11px] font-semibold border border-dashed border-slate-200 text-slate-400 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer">
              Agregar una nota
            </button>
          </Tarjeta>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Pestañas de traza
───────────────────────────────────────────── */
function PanelTraza({ p, pestana }: { p: PersonaCRM; pestana: Exclude<Pestana, "info"> }) {
  const [densidad, setDensidad] = useState<Densidad>("compacta")
  const [mes, setMes] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [actor, setActor] = useState("todos")
  const [limite, setLimite] = useState(TAMANO_PAGINA)
  const [abiertos, setAbiertos] = useState<string[]>([])

  /* Cambiar de filtro devuelve la lista a su primera página.
     El cambio de pestaña no necesita reinicio: el `key` del padre
     remonta este panel entero. */
  useEffect(() => {
    setLimite(TAMANO_PAGINA)
  }, [mes, busqueda, actor])

  const delModulo = useMemo(
    () => (pestana === "todo" ? p.traza : p.traza.filter(e => e.modulo === pestana)),
    [p, pestana],
  )

  const actores = useMemo(
    () => [...new Set(delModulo.filter(e => e.actor !== "Sistema").map(e => e.actor))].sort(),
    [delModulo],
  )

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return delModulo
      .filter(e => {
        if (mes && !e.fecha.startsWith(mes)) return false
        if (actor !== "todos" && e.actor !== actor) return false
        if (q) {
          const heno = `${e.titulo} ${e.detalle ?? ""} ${e.tipo} ${e.referencia ?? ""} ${e.actor} ${e.resultado ?? ""}`.toLowerCase()
          if (!heno.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))
  }, [delModulo, mes, actor, busqueda])

  const visibles = filtrados.slice(0, limite)
  const restantes = filtrados.length - visibles.length

  /* Los encabezados de mes se insertan sobre la lista ya recortada */
  const conEncabezados = useMemo(() => {
    const salida: ({ tipo: "mes"; clave: string; label: string } | { tipo: "evento"; e: EventoTraza })[] = []
    let ultimo = ""
    for (const e of visibles) {
      const clave = e.fecha.slice(0, 7)
      if (clave !== ultimo) {
        const [anio, m] = clave.split("-")
        salida.push({ tipo: "mes", clave, label: `${MESES[Number(m) - 1]} ${anio}` })
        ultimo = clave
      }
      salida.push({ tipo: "evento", e })
    }
    return salida
  }, [visibles])

  const hayFiltros = mes !== null || busqueda.trim() !== "" || actor !== "todos"

  return (
    /* Sin overflow-hidden: ese recorte convertiría la tarjeta en el
       contenedor de scroll y los encabezados de mes dejarían de pegarse */
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

      {/* ───── Barra de herramientas ───── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <Etiqueta>
              {pestana === "todo" ? "Línea de tiempo unificada" : `Actividad en ${modulosTraza[pestana].nombre}`}
            </Etiqueta>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
              {pestana === "todo"
                ? `Todo lo que la plataforma registró sobre ${p.nombre.split(" ")[0]}, sin importar en qué módulo ocurrió. El color indica de dónde viene cada hecho.`
                : `Solo los hechos que ocurrieron en ${modulosTraza[pestana].nombre}.`}
            </p>
          </div>

          {/* Densidad */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            {(
              [
                ["compacta", "Compacta"],
                ["detallada", "Detallada"],
              ] as [Densidad, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setDensidad(k)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                style={{
                  background: densidad === k ? "#1E3A8A" : "transparent",
                  color: densidad === k ? "#fff" : "#64748b",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Navegador de periodos */}
        <div className="mt-4">
          <NavegadorPeriodos eventos={delModulo} mesActivo={mes} onMes={setMes} />
        </div>

        {/* Búsqueda y actor */}
        <div className="flex items-center gap-2.5 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300"
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
              placeholder="Buscar en la traza: radicado, campaña, palabra del detalle…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
            />
          </div>

          {actores.length > 1 && (
            <select
              value={actor}
              onChange={e => setActor(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all cursor-pointer"
            >
              <option value="todos">Cualquier responsable</option>
              {actores.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="Sistema">Automático</option>
            </select>
          )}

          <span className="text-[11px] text-slate-400 shrink-0">
            <span className="font-bold text-slate-600">{filtrados.length}</span> de {delModulo.length}
          </span>

          {hayFiltros && (
            <button
              onClick={() => {
                setMes(null)
                setBusqueda("")
                setActor("todos")
              }}
              className="text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer shrink-0"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ───── Lista ───── */}
      {densidad === "compacta" ? (
        <div>
          {conEncabezados.map(fila =>
            fila.tipo === "mes" ? (
              <div
                key={`m-${fila.clave}`}
                className="sticky top-0 z-10 flex items-center gap-3 px-5 py-2 bg-slate-50 border-y border-slate-100"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{fila.label}</span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
            ) : (
              <FilaCompacta
                key={fila.e.id}
                e={fila.e}
                abierto={abiertos.includes(fila.e.id)}
                onToggle={() =>
                  setAbiertos(prev =>
                    prev.includes(fila.e.id) ? prev.filter(x => x !== fila.e.id) : [...prev, fila.e.id],
                  )
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="p-5">
          {conEncabezados.map(fila =>
            fila.tipo === "mes" ? (
              <div key={`m-${fila.clave}`} className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 rounded-full px-2.5 py-1">
                  {fila.label}
                </span>
                <span className="flex-1 h-px bg-slate-100" />
              </div>
            ) : (
              <FilaDetallada key={fila.e.id} e={fila.e} />
            ),
          )}
        </div>
      )}

      {/* ───── Pie: cuánto falta ───── */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-sm font-semibold text-slate-400">
            {hayFiltros ? "Nada coincide con lo que buscas" : "Sin actividad en este módulo"}
          </p>
          <p className="text-xs text-slate-400">
            {hayFiltros
              ? "Prueba con otro mes, otro responsable o menos texto."
              : `${p.nombre.split(" ")[0]} no tiene registros aquí.`}
          </p>
        </div>
      ) : (
        restantes > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => setLimite(l => l + TAMANO_PAGINA)}
              className="px-4 py-2 rounded-xl text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-slate-50 transition-all cursor-pointer"
            >
              Mostrar {Math.min(TAMANO_PAGINA, restantes)} más
            </button>
            <button
              onClick={() => setLimite(filtrados.length)}
              className="text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              Ver los {filtrados.length}
            </button>
            <span className="ml-auto text-[11px] text-slate-400">
              Mostrando {visibles.length} · quedan {restantes}
            </span>
          </div>
        )
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Componente
───────────────────────────────────────────── */
export default function UsuarioDetalle({ persona, onVolver }: { persona: PersonaCRM; onVolver: () => void }) {
  const [pestana, setPestana] = useState<Pestana>("info")

  const p = persona
  const est = estadoPersonaEstilo[p.estado]

  const conteo = useMemo(() => {
    const base: Record<ModuloTraza, number> = { pqrs: 0, masivos: 0, individuales: 0, flujos: 0, sistema: 0 }
    for (const e of p.traza) base[e.modulo] += 1
    return base
  }, [p])

  const pestanas: [Pestana, string, number | null][] = [
    ["info", "Información", null],
    ["todo", "Trazabilidad 360", p.traza.length],
    ["pqrs", "PQRSDF", conteo.pqrs],
    ["individuales", "Conversaciones", conteo.individuales],
    ["masivos", "Campañas", conteo.masivos],
    ["flujos", "Flujos", conteo.flujos],
    ["sistema", "Plataforma", conteo.sistema],
  ]

  const kpis: { modulo: ModuloTraza; label: string; valor: number; sufijo: string }[] = [
    { modulo: "pqrs", label: "Radicados", valor: referenciasDe(p, "pqrs").length, sufijo: "en PQRSDF" },
    {
      modulo: "individuales",
      label: "Conversaciones",
      valor: referenciasDe(p, "individuales").length,
      sufijo: "uno a uno",
    },
    { modulo: "masivos", label: "Campañas", valor: referenciasDe(p, "masivos").length, sufijo: "recibidas" },
    { modulo: "flujos", label: "Ejecuciones", valor: referenciasDe(p, "flujos").length, sufijo: "de flujo" },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ═══════════ Cabecera fija ═══════════ */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-6 pt-4">
          <button
            onClick={onVolver}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Volver al directorio
          </button>

          {/* Identidad */}
          <div className="flex items-start gap-4 mt-3.5 flex-wrap">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white shrink-0"
              style={{ background: colorAvatar(p.nombre) }}
            >
              {iniciales(p.nombre)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{p.nombre}</h2>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: est.bg, color: est.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: est.dot }} />
                  {p.estado}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: "#eff3ff", color: "#1E3A8A" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tenant {p.tenant}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded-full px-2.5 py-1">
                  {p.tipoPersona}
                </span>
              </div>

              <div className="flex items-center gap-x-5 gap-y-1 mt-2 flex-wrap">
                {[
                  { icono: "doc", valor: `${p.tipoDocumento} ${p.documento}`, mono: true },
                  { icono: "mail", valor: p.correo },
                  { icono: "tel", valor: p.telefono, mono: true },
                  { icono: "pin", valor: `${p.municipio}, ${p.departamento}` },
                ].map(d => (
                  <span key={d.valor} className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-300 shrink-0">
                      {d.icono === "doc" && (
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      )}
                      {d.icono === "mail" && (
                        <>
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </>
                      )}
                      {d.icono === "tel" && (
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      )}
                      {d.icono === "pin" && (
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <span className={`text-[11px] text-slate-500 ${d.mono ? "font-mono" : ""}`}>{d.valor}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-slate-50 transition-all cursor-pointer">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Escribirle
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98]"
                style={{ background: "#1E3A8A", boxShadow: "0 10px 24px -12px rgba(30,58,138,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#162d6e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Radicar a su nombre
              </button>
            </div>
          </div>

          {/* Indicadores por módulo */}
          <div className="flex items-stretch gap-3 mt-4 flex-wrap">
            {kpis.map(k => {
              const meta = modulosTraza[k.modulo]
              return (
                <button
                  key={k.label}
                  onClick={() => setPestana(k.modulo)}
                  className="rounded-xl border px-4 py-2.5 flex items-center gap-3 flex-1 min-w-[150px] text-left transition-all cursor-pointer hover:shadow-sm"
                  style={{ borderColor: k.valor ? meta.color + "33" : "#e2e8f0", background: k.valor ? meta.bg : "#fff" }}
                >
                  <span
                    className="text-2xl font-bold tracking-tight leading-none"
                    style={{ color: k.valor ? meta.color : "#cbd5e1" }}
                  >
                    {k.valor}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">{k.label}</p>
                    <p className="text-[10px] text-slate-400">{k.sufijo}</p>
                  </div>
                </button>
              )
            })}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex items-center gap-3 flex-1 min-w-[150px]">
              <span
                className="text-2xl font-bold tracking-tight leading-none"
                style={{
                  color: p.satisfaccion
                    ? p.satisfaccion >= 4
                      ? "#059669"
                      : p.satisfaccion >= 3
                        ? "#d97706"
                        : "#dc2626"
                    : "#cbd5e1",
                }}
              >
                {p.satisfaccion ? p.satisfaccion.toFixed(1) : "—"}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-700 leading-tight">Satisfacción</p>
                <p className="text-[10px] text-slate-400">promedio sobre 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex items-center px-6 mt-3 overflow-x-auto">
          {pestanas.map(([key, label, n]) => (
            <button
              key={key}
              onClick={() => setPestana(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                pestana === key
                  ? "border-[#1E3A8A] text-[#1E3A8A]"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              {label}
              {n !== null && (
                <span
                  className="rounded-full px-1.5 py-px text-[10px] font-bold"
                  style={{
                    background: pestana === key ? "#eff3ff" : "#f1f5f9",
                    color: pestana === key ? "#1E3A8A" : "#94a3b8",
                  }}
                >
                  {n}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ Cuerpo ═══════════ */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "#F8FAFC" }}>
        {pestana === "info" ? (
          <PanelInformacion p={p} />
        ) : (
          <PanelTraza key={pestana} p={p} pestana={pestana} />
        )}
      </div>
    </div>
  )
}
