import { useState } from "react"
import Cartera from "./Cartera"
import ConfiguracionCobranza from "./ConfiguracionCobranza"
import DeudorFicha from "./DeudorFicha"
import Juridica from "./Juridica"
import Negociacion from "./Negociacion"
import Triage from "./Triage"
import { ley2300, mockDeudores, prescripcion, type Acuerdo, type ColaGestion, type Deudor } from "./CobranzaData"

/* ─────────────────────────────────────────────
   Módulo Cobranza y Jurídica

   Cinco subvistas que siguen el ciclo completo:
   la cartera se reparte (Triage), el asesor la
   trabaja (Cartera → Ficha 360°), negocia
   (Negociación), lo que no se recupera escala
   (Jurídica) y todo se gobierna desde un sitio
   (Configuración).
───────────────────────────────────────────── */

type Subvista = "triage" | "cartera" | "negociacion" | "juridica" | "configuracion"

export default function Cobranza() {
  const [subvista, setSubvista] = useState<Subvista>("triage")
  const [deudores, setDeudores] = useState<Deudor[]>(mockDeudores)
  const [abierto, setAbierto] = useState<Deudor | null>(null)
  const [colaFiltro, setColaFiltro] = useState<ColaGestion | null>(null)
  const [paraNegociar, setParaNegociar] = useState<Deudor | null>(null)
  const [paraExpediente, setParaExpediente] = useState<Deudor | null>(null)

  /* Señales que merecen un número en la pestaña */
  const prescripcionEnRiesgo = deudores.filter(
    d =>
      !d.expediente &&
      d.obligaciones.some(o => ["critica", "prescrita"].includes(prescripcion(o).nivel)),
  ).length
  const sinContactar = deudores.filter(d => d.cola === "asesor" && ley2300(d).puede).length
  const porAprobar = deudores.reduce(
    (a, d) => a + d.acuerdos.filter(x => x.estado === "En aprobación").length,
    0,
  )

  const guardarAcuerdo = (deudorId: string, acuerdo: Acuerdo) =>
    setDeudores(l => l.map(d => (d.id === deudorId ? { ...d, acuerdos: [acuerdo, ...d.acuerdos] } : d)))

  const irACartera = (cola: ColaGestion) => {
    setColaFiltro(cola)
    setSubvista("cartera")
  }

  const tabs: [Subvista, string, number | null][] = [
    ["triage", "Triage", null],
    ["cartera", "Cartera", sinContactar > 0 ? sinContactar : null],
    ["negociacion", "Negociación", porAprobar > 0 ? porAprobar : null],
    ["juridica", "Jurídica", prescripcionEnRiesgo > 0 ? prescripcionEnRiesgo : null],
    ["configuracion", "Configuración", null],
  ]

  /* La ficha 360° ocupa la pantalla entera: es donde se trabaja */
  if (abierto) {
    const vivo = deudores.find(d => d.id === abierto.id) ?? abierto
    return (
      <DeudorFicha
        deudor={vivo}
        onVolver={() => setAbierto(null)}
        onNegociar={d => {
          setAbierto(null)
          setParaNegociar(d)
          setSubvista("negociacion")
        }}
        onVerExpediente={d => {
          setAbierto(null)
          setParaExpediente(d)
          setSubvista("juridica")
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Barra de subvistas */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0 overflow-x-auto">
        {tabs.map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => {
              setSubvista(key)
              if (key !== "cartera") setColaFiltro(null)
            }}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              subvista === key
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            {label}
            {badge !== null && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold"
                style={{
                  background: key === "juridica" ? "#fee2e2" : subvista === key ? "#eff3ff" : "#f1f5f9",
                  color: key === "juridica" ? "#991b1b" : subvista === key ? "#1E3A8A" : "#94a3b8",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {subvista === "triage" && <Triage onVerCartera={irACartera} />}

      {subvista === "cartera" && (
        <Cartera
          key={colaFiltro ?? "todas"}
          deudores={deudores}
          colaInicial={colaFiltro}
          onAbrir={setAbierto}
        />
      )}

      {subvista === "negociacion" && (
        <Negociacion
          deudores={deudores}
          deudorPreseleccionado={paraNegociar}
          onConsumirPreseleccion={() => setParaNegociar(null)}
          onGuardarAcuerdo={guardarAcuerdo}
        />
      )}

      {subvista === "juridica" && (
        <Juridica
          deudores={deudores}
          expedienteInicial={paraExpediente}
          onConsumirInicial={() => setParaExpediente(null)}
          onAbrirDeudor={setAbierto}
        />
      )}

      {subvista === "configuracion" && <ConfiguracionCobranza />}
    </div>
  )
}
