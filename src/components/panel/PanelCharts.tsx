import { useState } from "react"
import { modulos, nf, ordenModulos, rampaOrdinal, tinta, type DiaActividad, type ModuloId } from "./PanelData"

/* ─────────────────────────────────────────────
   Átomos de gráfica

   Especificaciones fijas en todos los gráficos:
   · barras ≤ 24px, extremo redondeado 4px y recto
     sobre la línea base
   · líneas de 2px, marcador ≥ 8px con anillo de
     2px del color de superficie
   · relleno de área al 10% de la tinta
   · rejilla y ejes en gris de un paso, 1px sólido
   · 2px de superficie separando marcas que se tocan
   · el texto nunca lleva el color de la serie
───────────────────────────────────────────── */

const SUPERFICIE = "#ffffff"
const REJILLA = "#f1f5f9"

/** Escala de ticks redondeados para el eje vertical. */
function ticksDe(max: number, cantidad = 4) {
  const bruto = max / cantidad
  const magnitud = Math.pow(10, Math.floor(Math.log10(bruto)))
  const paso = Math.ceil(bruto / magnitud) * magnitud
  const tope = paso * cantidad
  return { tope, valores: Array.from({ length: cantidad + 1 }, (_, i) => tope - i * paso) }
}

/* ─────────────────────────────────────────────
   Sparkline — sin ejes, vive dentro de un KPI
───────────────────────────────────────────── */
export function Sparkline({ serie, color, alto = 32 }: { serie: number[]; color: string; alto?: number }) {
  const max = Math.max(...serie)
  const min = Math.min(...serie)
  const rango = max - min || 1
  const W = 100
  const H = 30
  const puntos = serie.map((v, i) => {
    const x = (i / (serie.length - 1)) * W
    const y = H - ((v - min) / rango) * (H - 4) - 2
    return `${x},${y}`
  })
  const linea = `M ${puntos.join(" L ")}`
  const area = `${linea} L ${W},${H} L 0,${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: alto, width: "100%" }} aria-hidden="true">
      <path d={area} fill={color} opacity={0.1} />
      <path
        d={linea}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Tarjeta de indicador — el número es el gráfico
───────────────────────────────────────────── */
export function TarjetaKpi({
  label,
  valor,
  sufijo,
  delta,
  invertido,
  serie,
  color = "#2d4fa8",
  nota,
}: {
  label: string
  valor: string
  sufijo?: string
  delta: number
  invertido?: boolean
  serie: number[]
  color?: string
  nota?: string
}) {
  const sube = delta >= 0
  /** En métricas invertidas (tiempos, costos) bajar es lo bueno. */
  const bueno = invertido ? !sube : sube
  const colorDelta = bueno ? "#059669" : "#dc2626"

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tinta.suave }}>
        {label}
      </p>
      <div className="flex items-end gap-1.5 mt-1.5">
        <p className="text-3xl font-bold leading-none" style={{ color: tinta.fuerte }}>
          {valor}
        </p>
        {sufijo && (
          <span className="text-sm font-semibold mb-0.5" style={{ color: tinta.suave }}>
            {sufijo}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold" style={{ color: colorDelta }}>
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
            <path d={sube ? "M6 2l4 6H2z" : "M6 10L2 4h8z"} />
          </svg>
          {Math.abs(delta).toLocaleString("es-CO")}%
        </span>
        <span className="text-[10px]" style={{ color: tinta.suave }}>
          vs. periodo anterior
        </span>
      </div>

      <div className="mt-3">
        <Sparkline serie={serie} color={color} />
      </div>

      {nota && (
        <p className="text-[10px] leading-snug mt-2" style={{ color: tinta.tenue }}>
          {nota}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Columnas apiladas — actividad diaria por módulo

   Parte-de-un-todo sobre el tiempo con cuatro
   identidades: columna apilada, color categórico.
───────────────────────────────────────────── */
export function ColumnasApiladas({ dias }: { dias: DiaActividad[] }) {
  const [activo, setActivo] = useState<number | null>(null)
  const [verTabla, setVerTabla] = useState(false)

  const totales = dias.map(d => d.pqrs + d.masivos + d.individuales + d.flujos)
  const { tope, valores } = ticksDe(Math.max(...totales))

  /* Se apila de abajo hacia arriba en el orden del catálogo; con justify-end
     el primer hijo queda arriba, por eso se invierte al pintar. */
  const capas = [...ordenModulos].reverse()

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
            Actividad consolidada por módulo
          </h3>
          <p className="text-xs mt-0.5" style={{ color: tinta.suave }}>
            Eventos procesados cada día. Un evento es una unidad de trabajo, comparable entre módulos.
          </p>
        </div>
        <button
          onClick={() => setVerTabla(v => !v)}
          className="text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer shrink-0"
          style={{
            background: verTabla ? "#eff3ff" : "#fff",
            color: verTabla ? "#1E3A8A" : tinta.medio,
            borderColor: verTabla ? "#c7d7fe" : "#e2e8f0",
          }}
        >
          {verTabla ? "Ver gráfico" : "Ver tabla"}
        </button>
      </div>

      {/* Leyenda — la identidad nunca depende solo del color */}
      <div className="flex items-center gap-4 flex-wrap mt-3 mb-4">
        {ordenModulos.map(id => (
          <span key={id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: modulos[id].color }} />
            <span className="text-[11px] font-medium" style={{ color: tinta.medio }}>
              {modulos[id].corto}
            </span>
          </span>
        ))}
      </div>

      {verTabla ? (
        <TablaDatos
          columnas={["Día", ...ordenModulos.map(id => modulos[id].corto), "Total"]}
          filas={dias.map((d, i) => [
            d.fecha,
            nf(d.pqrs),
            nf(d.masivos),
            nf(d.individuales),
            nf(d.flujos),
            nf(totales[i]),
          ])}
        />
      ) : (
        <div>
          {/* Área de trazado: la rejilla comparte exactamente su alto con las columnas */}
          <div className="relative" style={{ height: 220 }}>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {valores.map(v => (
                <div key={v} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono w-8 text-right shrink-0" style={{ color: tinta.tenue }}>
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: REJILLA }} />
                </div>
              ))}
            </div>

            <div className="relative h-full flex items-end gap-1.5 pl-10">
              {dias.map((d, i) => {
                const total = totales[i]
                const resaltado = activo === null || activo === i
                /* El tooltip se ancla a su propia columna, no a un porcentaje del ancho */
                const desplazamiento = i < 3 ? "-10%" : i > dias.length - 4 ? "-90%" : "-50%"
                return (
                  <div
                    key={d.fecha}
                    className="relative flex-1 h-full flex flex-col justify-end transition-opacity duration-150"
                    style={{ opacity: resaltado ? 1 : 0.45, maxWidth: 24 }}
                    onMouseEnter={() => setActivo(i)}
                    onMouseLeave={() => setActivo(null)}
                  >
                    {capas.map((id, capaIdx) => {
                      const valor = d[id]
                      const alto = (valor / tope) * 100
                      const esTope = capaIdx === 0
                      return (
                        <div
                          key={id}
                          style={{
                            height: `${alto}%`,
                            background: modulos[id].color,
                            /* 2px de superficie separan los segmentos que se tocan */
                            marginBottom: capaIdx === capas.length - 1 ? 0 : 2,
                            /* extremo de dato redondeado, recto contra la base */
                            borderTopLeftRadius: esTope ? 4 : 0,
                            borderTopRightRadius: esTope ? 4 : 0,
                          }}
                        />
                      )
                    })}

                    {activo === i && (
                      <div
                        className="absolute rounded-xl border border-slate-200 bg-white shadow-lg px-3 py-2.5 pointer-events-none z-10"
                        style={{ top: 0, left: "50%", transform: `translateX(${desplazamiento})`, minWidth: 172 }}
                      >
                        <p className="text-[11px] font-bold mb-1.5" style={{ color: tinta.fuerte }}>
                          {d.fecha}
                          {d.finDeSemana && (
                            <span className="font-normal ml-1.5" style={{ color: tinta.tenue }}>
                              fin de semana
                            </span>
                          )}
                        </p>
                        {ordenModulos.map(id => (
                          <div key={id} className="flex items-center gap-2 py-0.5">
                            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: modulos[id].color }} />
                            <span className="text-[10px] flex-1" style={{ color: tinta.medio }}>
                              {modulos[id].corto}
                            </span>
                            <span className="text-[10px] font-mono font-bold" style={{ color: tinta.fuerte }}>
                              {nf(d[id])}
                            </span>
                          </div>
                        ))}
                        <div
                          className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t"
                          style={{ borderColor: REJILLA }}
                        >
                          <span className="text-[10px] font-semibold" style={{ color: tinta.medio }}>
                            Total
                          </span>
                          <span className="text-[10px] font-mono font-bold" style={{ color: tinta.fuerte }}>
                            {nf(total)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Eje de fechas, fuera del área de trazado */}
          <div className="flex gap-1.5 pl-10 mt-1.5">
            {dias.map((d, i) => (
              <span
                key={d.fecha}
                className="flex-1 text-center text-[9px] font-mono truncate"
                style={{ color: activo === i ? tinta.medio : tinta.tenue, maxWidth: 24 }}
              >
                {d.fecha.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Barra de participación — una sola barra
   horizontal apilada para el reparto del total
───────────────────────────────────────────── */
export function BarraParticipacion({ dias }: { dias: DiaActividad[] }) {
  const suma = ordenModulos.reduce(
    (acc, id) => ({ ...acc, [id]: dias.reduce((a, d) => a + d[id], 0) }),
    {} as Record<ModuloId, number>,
  )
  const total = ordenModulos.reduce((a, id) => a + suma[id], 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold" style={{ color: tinta.fuerte }}>
        Reparto de la actividad
      </h3>
      <p className="text-xs mt-0.5 mb-4" style={{ color: tinta.suave }}>
        Participación de cada módulo sobre {nf(total)} eventos del periodo.
      </p>

      <div className="flex h-6 rounded-lg overflow-hidden" style={{ gap: 2 }}>
        {ordenModulos.map(id => {
          const pct = (suma[id] / total) * 100
          /* La etiqueta solo va dentro del segmento si cabe con holgura */
          const cabe = pct >= 12
          return (
            <div
              key={id}
              className="flex items-center justify-center transition-all"
              style={{ width: `${pct}%`, background: modulos[id].color }}
              title={`${modulos[id].nombre}: ${nf(suma[id])} eventos`}
            >
              {cabe && (
                <span className="text-[10px] font-bold" style={{ color: "#fff" }}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-2 mt-4">
        {ordenModulos.map(id => {
          const pct = (suma[id] / total) * 100
          return (
            <div key={id} className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: modulos[id].color }} />
              <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color: tinta.medio }}>
                {modulos[id].nombre}
              </span>
              <span className="text-[11px] font-mono" style={{ color: tinta.suave }}>
                {nf(suma[id])}
              </span>
              <span className="text-[11px] font-mono font-bold w-11 text-right" style={{ color: tinta.fuerte }}>
                {pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tendencia — una sola serie: área + línea,
   sin leyenda porque el título ya la nombra
───────────────────────────────────────────── */
export function AreaTendencia({
  datos,
  color,
  unidad,
  alto = 190,
}: {
  datos: { label: string; valor: number }[]
  color: string
  unidad: string
  alto?: number
}) {
  const [activo, setActivo] = useState<number | null>(null)

  const W = 640
  const H = 200
  const PAD_L = 46
  const PAD_B = 24
  const PAD_T = 12

  const max = Math.max(...datos.map(d => d.valor))
  const { tope, valores } = ticksDe(max)

  const px = (i: number) => PAD_L + (i / (datos.length - 1)) * (W - PAD_L - 12)
  const py = (v: number) => PAD_T + (1 - v / tope) * (H - PAD_T - PAD_B)

  const linea = `M ${datos.map((d, i) => `${px(i)},${py(d.valor)}`).join(" L ")}`
  const area = `${linea} L ${px(datos.length - 1)},${H - PAD_B} L ${px(0)},${H - PAD_B} Z`
  const ultimo = datos[datos.length - 1]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: alto }} role="img">
        {/* Rejilla recesiva, 1px sólido */}
        {valores.map(v => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - 12}
              y1={py(v)}
              y2={py(v)}
              stroke={REJILLA}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text x={PAD_L - 8} y={py(v) + 3} textAnchor="end" fontSize={9} fill={tinta.tenue} fontFamily="ui-monospace, monospace">
              {v >= 1000 ? `${v / 1000}k` : v}
            </text>
          </g>
        ))}

        {/* Área al 10% y línea de 2px */}
        <path d={area} fill={color} opacity={0.1} />
        <path
          d={linea}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Cruceta del punto activo */}
        {activo !== null && (
          <line
            x1={px(activo)}
            x2={px(activo)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke={tinta.tenue}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Marcador final: r ≥ 4 con anillo de 2px en color de superficie */}
        <circle cx={px(datos.length - 1)} cy={py(ultimo.valor)} r={5} fill={color} stroke={SUPERFICIE} strokeWidth={2} />
        {activo !== null && activo !== datos.length - 1 && (
          <circle cx={px(activo)} cy={py(datos[activo].valor)} r={5} fill={color} stroke={SUPERFICIE} strokeWidth={2} />
        )}

        {/* Etiquetas del eje horizontal */}
        {datos.map((d, i) => (
          <text
            key={d.label}
            x={px(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={9}
            fill={activo === i ? tinta.medio : tinta.tenue}
            fontFamily="ui-monospace, monospace"
          >
            {d.label.replace("Sem ", "")}
          </text>
        ))}

        {/* Zonas de detección, más anchas que la marca */}
        {datos.map((d, i) => (
          <rect
            key={d.label}
            x={px(i) - (W - PAD_L) / (datos.length * 2)}
            y={0}
            width={(W - PAD_L) / datos.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
          />
        ))}
      </svg>

      {/* Etiqueta directa solo en el extremo */}
      <div className="flex items-baseline justify-end gap-1.5 -mt-1">
        <span className="text-[10px]" style={{ color: tinta.suave }}>
          último periodo
        </span>
        <span className="text-sm font-mono font-bold" style={{ color: tinta.fuerte }}>
          {nf(ultimo.valor)}
        </span>
        <span className="text-[10px]" style={{ color: tinta.suave }}>
          {unidad}
        </span>
      </div>

      {activo !== null && (
        <div
          className="absolute top-2 rounded-xl border border-slate-200 bg-white shadow-lg px-3 py-2 pointer-events-none z-10"
          style={{
            left: `${(px(activo) / W) * 100}%`,
            transform: activo > datos.length / 2 ? "translateX(-110%)" : "translateX(10%)",
          }}
        >
          <p className="text-[10px]" style={{ color: tinta.suave }}>
            {datos[activo].label}
          </p>
          <p className="text-sm font-mono font-bold" style={{ color: tinta.fuerte }}>
            {nf(datos[activo].valor)}{" "}
            <span className="text-[10px] font-sans font-normal" style={{ color: tinta.suave }}>
              {unidad}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Barras horizontales — categorías nominales.
   Todas comparten la tinta del módulo: la
   longitud ya codifica la magnitud.
───────────────────────────────────────────── */
export function BarrasHorizontales({
  datos,
  color,
  unidad,
}: {
  datos: { label: string; valor: number }[]
  color: string
  unidad: string
}) {
  const max = Math.max(...datos.map(d => d.valor))
  const total = datos.reduce((a, d) => a + d.valor, 0)

  return (
    <div className="space-y-3">
      {datos.map(d => (
        <div key={d.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-[11px] font-medium truncate" style={{ color: tinta.medio }}>
              {d.label}
            </span>
            <span className="text-[11px] shrink-0" style={{ color: tinta.suave }}>
              <span className="font-mono font-bold" style={{ color: tinta.fuerte }}>
                {nf(d.valor)}
              </span>{" "}
              · {((d.valor / total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 rounded-sm" style={{ background: REJILLA }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(d.valor / max) * 100}%`,
                background: color,
                /* extremo de dato redondeado, recto en la base */
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
      <p className="text-[10px] pt-1" style={{ color: tinta.tenue }}>
        Total del periodo: {nf(total)} {unidad}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Embudo — etapas ordenadas, rampa de una tinta
───────────────────────────────────────────── */
export function Embudo({ etapas }: { etapas: { label: string; valor: number }[] }) {
  const base = etapas[0]?.valor || 1

  return (
    <div className="space-y-2.5">
      {etapas.map((e, i) => {
        const pct = (e.valor / base) * 100
        const caida = i > 0 ? ((etapas[i - 1].valor - e.valor) / etapas[i - 1].valor) * 100 : 0
        const tono = rampaOrdinal[Math.min(i, rampaOrdinal.length - 1)]
        return (
          <div key={e.label}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-[11px] font-medium" style={{ color: tinta.medio }}>
                {e.label}
              </span>
              <span className="text-[11px] shrink-0" style={{ color: tinta.suave }}>
                <span className="font-mono font-bold" style={{ color: tinta.fuerte }}>
                  {nf(e.valor)}
                </span>{" "}
                · {pct.toFixed(1)}%
                {i > 0 && caida > 0 && <span style={{ color: "#dc2626" }}> · −{caida.toFixed(1)}%</span>}
              </span>
            </div>
            <div className="h-5 rounded-sm" style={{ background: REJILLA }}>
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${Math.max(3, pct)}%`,
                  background: tono,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Medidor — una razón contra un límite
───────────────────────────────────────────── */
export function Medidor({
  actual,
  objetivo,
  maximo,
  unidad,
  color,
}: {
  actual: number
  objetivo: number
  maximo: number
  unidad: string
  color: string
}) {
  const pctActual = Math.min(100, (actual / maximo) * 100)
  const pctObjetivo = Math.min(100, (objetivo / maximo) * 100)

  return (
    <div>
      <div className="relative h-2.5 rounded-sm" style={{ background: REJILLA }}>
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{ width: `${pctActual}%`, background: color, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
        />
        {/* Marca del objetivo */}
        <span
          className="absolute -top-1 bottom-[-4px] w-0.5 rounded-full"
          style={{ left: `${pctObjetivo}%`, background: tinta.medio }}
          title={`Objetivo: ${objetivo}${unidad}`}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px]" style={{ color: tinta.suave }}>
          Actual{" "}
          <span className="font-mono font-bold" style={{ color: tinta.fuerte }}>
            {actual.toLocaleString("es-CO")}
            {unidad}
          </span>
        </span>
        <span className="text-[10px]" style={{ color: tinta.suave }}>
          Objetivo{" "}
          <span className="font-mono font-bold" style={{ color: tinta.medio }}>
            {objetivo.toLocaleString("es-CO")}
            {unidad}
          </span>
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Vista de tabla — respaldo accesible de
   cualquier gráfico
───────────────────────────────────────────── */
export function TablaDatos({ columnas, filas }: { columnas: string[]; filas: string[][] }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {columnas.map((c, i) => (
                <th
                  key={c}
                  className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase border-b border-slate-100 whitespace-nowrap ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                  style={{ color: tinta.suave }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                {f.map((celda, j) => (
                  <td
                    key={j}
                    className={`px-3 py-2 text-[11px] whitespace-nowrap ${
                      j === 0 ? "text-left font-medium" : "text-right font-mono"
                    }`}
                    style={{ color: j === 0 ? tinta.medio : tinta.fuerte }}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
