import { modulos, ordenModulos, tinta, type ModuloId } from "@/components/panel/PanelData"

/* ─────────────────────────────────────────────
   Tarjeta de organización

   Una organización del sistema con su plan y los
   módulos que tiene contratados. Los que no
   contrató aparecen con candado, como en la app.
───────────────────────────────────────────── */

export interface Organizacion {
  nombre: string
  plan: string
  inicial: string
  color: string
  contratados: ModuloId[]
  nota: string
}

function Candado() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function TarjetaOrganizacion({ organizacion: o }: { organizacion: Organizacion }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ width: 420 }}>
      <div style={{ height: 4, background: o.color }} />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ background: o.color }}
          >
            {o.inicial}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold truncate" style={{ color: tinta.fuerte }}>
              {o.nombre}
            </p>
            <p className="text-xs" style={{ color: tinta.suave }}>
              {o.plan}
            </p>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest mt-5 mb-2" style={{ color: tinta.suave }}>
          Módulos
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ordenModulos.map((id) => {
            const m = modulos[id]
            const activo = o.contratados.includes(id)
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold"
                style={{
                  background: activo ? m.bg : "#f1f5f9",
                  color: activo ? m.color : tinta.tenue,
                }}
              >
                {activo ? <span className="w-1.5 h-1.5 rounded-sm" style={{ background: m.color }} /> : <Candado />}
                {m.corto}
              </span>
            )
          })}
        </div>

        <p className="text-xs mt-4" style={{ color: tinta.medio }}>
          {o.nota}
        </p>
      </div>
    </div>
  )
}
