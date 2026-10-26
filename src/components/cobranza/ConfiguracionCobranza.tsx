import { useState } from "react"
import {
  FACTOR_MORATORIO,
  TASA_USURA,
  TOPE_CONTACTOS_SEMANA,
  cop,
  franjasLey2300,
  reglasPorDefecto,
  type ReglasNegociacion,
} from "./CobranzaData"

/* ─────────────────────────────────────────────
   Administración y configuración

   Las perillas que gobiernan todo lo demás. Cada
   una se muestra con su consecuencia al lado,
   porque subir un tope sin ver qué desbloquea es
   como firmar sin leer.
───────────────────────────────────────────── */

type Seccion = "mora" | "negociacion" | "normativa" | "integraciones"

const diasNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const tramosMora = [
  { desde: 1, hasta: 30, nombre: "Mora temprana", cola: "Autogestión", color: "#eab308" },
  { desde: 31, hasta: 90, nombre: "Mora media", cola: "Asesor", color: "#f59e0b" },
  { desde: 91, hasta: 180, nombre: "Mora tardía", cola: "Asesor", color: "#ea580c" },
  { desde: 181, hasta: 360, nombre: "Prejurídico", cola: "Asesor senior", color: "#ef4444" },
  { desde: 361, hasta: 9999, nombre: "Jurídico", cola: "Jurídica", color: "#7c3aed" },
]

const integraciones = [
  {
    nombre: "Core financiero",
    detalle: "Saldos, pagos y aplicación de abonos en tiempo real.",
    estado: "Conectado",
    ultima: "Hace 2 minutos",
  },
  {
    nombre: "Pasarela de pagos PSE",
    detalle: "Botón de pago y conciliación automática de recaudos.",
    estado: "Conectado",
    ultima: "Hace 6 minutos",
  },
  {
    nombre: "Rama Judicial · RPA",
    detalle: "Consulta diaria de actuaciones por radicado.",
    estado: "Conectado",
    ultima: "Hoy 06:00",
  },
  {
    nombre: "Centrales de riesgo",
    detalle: "Reporte y actualización del comportamiento de pago.",
    estado: "Degradado",
    ultima: "Hace 3 días",
  },
  {
    nombre: "Firma electrónica",
    detalle: "Firma de acuerdos y envío del PDF cifrado.",
    estado: "Conectado",
    ultima: "Hace 1 hora",
  },
]

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{children}</p>
}

function Tarjeta({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <Etiqueta>{titulo}</Etiqueta>
      {nota && <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{nota}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Campo({
  label,
  valor,
  sufijo,
  consecuencia,
  onChange,
}: {
  label: string
  valor: number
  sufijo: string
  consecuencia: string
  onChange: (v: number) => void
}) {
  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-slate-600 flex-1 min-w-0">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            value={valor}
            onChange={e => onChange(Number(e.target.value))}
            className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 text-right focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
          />
          <span className="text-[11px] text-slate-400 w-14">{sufijo}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{consecuencia}</p>
    </div>
  )
}

export default function ConfiguracionCobranza() {
  const [seccion, setSeccion] = useState<Seccion>("mora")
  const [reglas, setReglas] = useState<ReglasNegociacion>(reglasPorDefecto)
  const [guardado, setGuardado] = useState(false)

  const set = (k: keyof ReglasNegociacion, v: number) => {
    setReglas(r => ({ ...r, [k]: v }))
    setGuardado(false)
  }

  const secciones: [Seccion, string][] = [
    ["mora", "Tramos de mora"],
    ["negociacion", "Límites de negociación"],
    ["normativa", "Ley 2300 y tasas"],
    ["integraciones", "Integraciones"],
  ]

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5" style={{ background: "#F8FAFC" }}>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Administración y configuración</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reglas de mora, topes de negociación, marco normativo e integraciones del módulo.
          </p>
        </div>
        <button
          onClick={() => setGuardado(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer active:scale-95 shrink-0"
          style={{ background: guardado ? "#059669" : "#1E3A8A" }}
        >
          {guardado ? "Cambios guardados" : "Guardar cambios"}
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 w-fit flex-wrap">
        {secciones.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSeccion(key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{ background: seccion === key ? "#1E3A8A" : "transparent", color: seccion === key ? "#fff" : "#64748b" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ───── Tramos de mora ───── */}
      {seccion === "mora" && (
        <Tarjeta
          titulo="Cómo se clasifica la mora"
          nota="Define el estado de cada obligación y a qué cola la manda el triage. Los tramos no se solapan: una obligación solo puede estar en uno."
        >
          <div className="flex flex-col gap-2">
            {tramosMora.map(t => (
              <div
                key={t.nombre}
                className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3 flex-wrap"
              >
                <span className="w-1.5 h-9 rounded-sm shrink-0" style={{ background: t.color }} />
                <div className="min-w-0 w-36">
                  <p className="text-[12px] font-bold text-slate-700">{t.nombre}</p>
                  <p className="text-[10px] text-slate-400">{t.cola}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    defaultValue={t.desde}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 text-right focus:outline-none focus:border-[#1E3A8A] transition-all"
                  />
                  <span className="text-[11px] text-slate-400">a</span>
                  <input
                    defaultValue={t.hasta === 9999 ? "∞" : t.hasta}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 text-right focus:outline-none focus:border-[#1E3A8A] transition-all"
                  />
                  <span className="text-[11px] text-slate-400">días</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ((t.hasta === 9999 ? 540 : t.hasta) / 540) * 100)}%`,
                        background: t.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}

      {/* ───── Límites de negociación ───── */}
      {seccion === "negociacion" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Tarjeta
            titulo="Atribuciones del asesor"
            nota="Lo que un asesor puede ofrecer sin pedirle permiso a nadie. Todo lo que pase de aquí entra a la cola de aprobación del coordinador."
          >
            <Campo
              label="Cuota inicial mínima"
              valor={reglas.inicialMinima}
              sufijo="% del saldo"
              consecuencia="Por debajo de este porcentaje el simulador bloquea el envío del acuerdo."
              onChange={v => set("inicialMinima", v)}
            />
            <Campo
              label="Plazo máximo"
              valor={reglas.maxCuotas}
              sufijo="cuotas"
              consecuencia="Plazos más largos bajan la cuota pero alargan la exposición al riesgo."
              onChange={v => set("maxCuotas", v)}
            />
            <Campo
              label="Descuento sin aprobación"
              valor={reglas.descuentoSinAprobacion}
              sufijo="%"
              consecuencia="Hasta aquí el asesor cierra solo. Más arriba, el acuerdo queda en aprobación."
              onChange={v => set("descuentoSinAprobacion", v)}
            />
            <Campo
              label="Descuento máximo absoluto"
              valor={reglas.descuentoMaximo}
              sufijo="%"
              consecuencia="Techo duro: ni el coordinador puede aprobar más sin cambiar esta política."
              onChange={v => set("descuentoMaximo", v)}
            />
            <Campo
              label="Cuota mínima operativa"
              valor={reglas.cuotaMinima}
              sufijo="COP"
              consecuencia={`Hoy en ${cop(reglas.cuotaMinima)}. Cuotas menores cuestan más en gestión de lo que recaudan.`}
              onChange={v => set("cuotaMinima", v)}
            />
          </Tarjeta>

          <Tarjeta
            titulo="Comisiones de recaudo"
            nota="Se liquidan sobre el pago efectivamente aplicado, no sobre la promesa. Un acuerdo firmado que nadie paga no genera comisión."
          >
            <div className="flex flex-col gap-2">
              {[
                { tramo: "Mora temprana (1–30 días)", pct: "1,5 %" },
                { tramo: "Mora media (31–90 días)", pct: "3,0 %" },
                { tramo: "Mora tardía (91–180 días)", pct: "4,5 %" },
                { tramo: "Prejurídico (181–360 días)", pct: "6,0 %" },
                { tramo: "Recuperación jurídica", pct: "8,0 %" },
              ].map(c => (
                <div key={c.tramo} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
                  <span className="text-[11px] text-slate-600">{c.tramo}</span>
                  <span className="text-[12px] font-bold" style={{ color: "#1E3A8A" }}>
                    {c.pct}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              El porcentaje sube con la mora porque recuperar una cuenta vieja cuesta más trabajo que recordarle a
              alguien que se le pasó la fecha.
            </p>
          </Tarjeta>
        </div>
      )}

      {/* ───── Normativa ───── */}
      {seccion === "normativa" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Tarjeta
            titulo="Franjas de contacto · Ley 2300 de 2023"
            nota="Fuera de estas franjas la plataforma no despacha ninguna comunicación de cobro, así el asesor lo intente."
          >
            <div className="flex flex-col gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map(d => {
                const f = franjasLey2300[d]
                return (
                  <div
                    key={d}
                    className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5"
                    style={{
                      background: f ? "#ecfdf5" : "#fef2f2",
                      borderColor: f ? "#a7f3d0" : "#fecaca",
                    }}
                  >
                    <span
                      className="text-[11px] font-bold w-24 shrink-0"
                      style={{ color: f ? "#065f46" : "#991b1b" }}
                    >
                      {diasNombre[d]}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: f ? "#047857" : "#b91c1c" }}>
                      {f ? `${f.desde} – ${f.hasta}` : "Sin contacto permitido"}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="rounded-xl border px-3.5 py-3 mt-3" style={{ background: "#eff3ff", borderColor: "#dce5fb" }}>
              <p className="text-[11px] font-bold" style={{ color: "#1E3A8A" }}>
                Tope de {TOPE_CONTACTOS_SEMANA} comunicación por semana y por deudor
              </p>
              <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#1E3A8A", opacity: 0.8 }}>
                El titular puede elegir día y canal preferido, y puede pedir que no lo contacten. Los festivos
                nacionales se descuentan automáticamente del calendario.
              </p>
            </div>
          </Tarjeta>

          <Tarjeta
            titulo="Tasas y topes"
            nota="Se actualizan con la certificación mensual de la Superintendencia Financiera. El simulador las lee de aquí."
          >
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border px-4 py-3.5" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#991b1b" }}>
                  Tasa de usura vigente
                </p>
                <p className="text-2xl font-bold tracking-tight mt-1" style={{ color: "#dc2626" }}>
                  {TASA_USURA} % EA
                </p>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "#991b1b", opacity: 0.85 }}>
                  Techo absoluto. Pactar por encima hace nulo el acuerdo y configura el delito de usura, así que el
                  simulador lo bloquea en vez de advertirlo.
                </p>
              </div>

              {[
                { l: "Factor de interés moratorio", v: `${FACTOR_MORATORIO} × corriente`, n: "Tope legal del moratorio sobre el bancario corriente." },
                { l: "Honorarios de cobranza", v: "Hasta 15 %", n: "Sobre el capital, solo desde la etapa prejurídica." },
                { l: "Días de gracia", v: "5 días", n: "Antes de causar moratorios y de entrar al triage." },
              ].map(m => (
                <div key={m.l} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-600">{m.l}</span>
                    <span className="text-[12px] font-bold text-slate-800">{m.v}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{m.n}</p>
                </div>
              ))}
            </div>
          </Tarjeta>
        </div>
      )}

      {/* ───── Integraciones ───── */}
      {seccion === "integraciones" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
          {integraciones.map(i => {
            const ok = i.estado === "Conectado"
            return (
              <div key={i.nombre} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ok ? "#ecfdf5" : "#fffbeb" }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: ok ? "#10b981" : "#f59e0b" }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-slate-800">{i.nombre}</p>
                    <span
                      className="text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: ok ? "#d1fae5" : "#fef3c7", color: ok ? "#065f46" : "#92400e" }}
                    >
                      {i.estado}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{i.detalle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400">Última sincronización</p>
                  <p className="text-[11px] font-mono font-semibold text-slate-600">{i.ultima}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] transition-all cursor-pointer shrink-0">
                  Probar conexión
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
