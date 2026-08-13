/* ─────────────────────────────────────────────
   Vista previa de mensaje por dispositivo.
   Componente compartido: define su propia unión
   de canales para no acoplarse a ningún módulo.
───────────────────────────────────────────── */
export type CanalPreview = "whatsapp" | "instagram" | "sms" | "email" | "push"

export interface BotonPreview {
  tipo: string
  texto: string
  url?: string
}

/* ─────────────────────────────────────────────
   Datos de ejemplo usados en las vistas previas
───────────────────────────────────────────── */
export const sampleVars: Record<string, string> = {
  nombre: "Carlos Morales",
  radicado: "PQR-2026-000012",
  fecha: "15 Ago 2026",
  dependencia: "Planeación Municipal",
  zona: "Zona Norte",
  lugar: "Centro Cívico",
  valor: "$ 148.500",
}

/** Pinta el texto resaltando las variables, o sustituyéndolas por datos de ejemplo. */
export function renderCuerpo(text: string, conDatos: boolean) {
  return text.split(/(\{\{\w+\}\})/g).map((parte, i) => {
    const m = parte.match(/^\{\{(\w+)\}\}$/)
    if (!m) return <span key={i}>{parte}</span>
    if (conDatos)
      return (
        <span key={i} className="font-semibold">
          {sampleVars[m[1]] ?? parte}
        </span>
      )
    return (
      <span key={i} className="rounded px-1 font-semibold" style={{ background: "#fef9c3", color: "#854d0e" }}>
        {parte}
      </span>
    )
  })
}

interface Props {
  canal: CanalPreview
  cuerpo: string
  conDatos: boolean
  asunto?: string
  encabezado?: string
  pie?: string
  botones?: BotonPreview[]
}

/* ─────────────────────────────────────────────
   Botones de plantilla
───────────────────────────────────────────── */
function BotonesPreview({ botones, color }: { botones: BotonPreview[]; color: string }) {
  if (botones.length === 0) return null
  return (
    <div className="mt-1 space-y-1">
      {botones.map((b, i) => (
        <div key={i} className="rounded-xl bg-white shadow-sm px-2.5 py-1.5 flex items-center justify-center gap-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5" style={{ color }}>
            {b.tipo === "telefono" ? (
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            ) : b.tipo === "enlace" ? (
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <span className="text-[10px] font-semibold" style={{ color }}>
            {b.texto || "Botón sin texto"}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Vista previa por dispositivo
───────────────────────────────────────────── */
export default function DevicePreview({
  canal,
  cuerpo,
  conDatos,
  asunto = "",
  encabezado = "",
  pie = "",
  botones = [],
}: Props) {
  const vacio = !cuerpo.trim()
  const texto = vacio ? "Escribe el mensaje para ver la vista previa…" : cuerpo

  /* Email → maqueta de cliente de escritorio */
  if (canal === "email") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-b border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[9px] font-semibold text-slate-400">Bandeja de entrada</span>
        </div>
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[13px] font-bold text-slate-800 leading-snug">
            {asunto.trim() || "Asunto del correo"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "#1E3A8A" }}>
              CC
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-700">Concept CRM · Pqrslab</p>
              <p className="text-[9px] text-slate-400 truncate">
                notificaciones@pqrslab.com · para {conDatos ? "carlos.morales@gmail.com" : "{{email}}"}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3">
          {encabezado.trim() && (
            <p className="text-[12px] font-bold text-slate-800 mb-1.5">{renderCuerpo(encabezado, conDatos)}</p>
          )}
          <p className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words ${vacio ? "text-slate-300 italic" : "text-slate-600"}`}>
            {vacio ? texto : renderCuerpo(texto, conDatos)}
          </p>
          {botones.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {botones.map((b, i) => (
                <span key={i} className="text-[10px] font-semibold rounded-lg px-3 py-1.5 text-white" style={{ background: "#1E3A8A" }}>
                  {b.texto || "Botón"}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[8px] text-slate-300 leading-relaxed">
              {pie.trim() ||
                "Este mensaje fue enviado por Pqrslab a través de Concept CRM. Si no desea recibir más comunicaciones, puede darse de baja en cualquier momento."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* Instagram → maqueta del Direct */
  if (canal === "instagram") {
    return (
      <div className="mx-auto rounded-[30px] p-2 shadow-xl" style={{ width: 250, background: "#0f172a" }}>
        <div className="rounded-[24px] overflow-hidden bg-white">
          <div className="relative h-5 bg-white">
            <span className="absolute left-1/2 -translate-x-1/2 top-1 w-14 h-2.5 rounded-full bg-slate-900" />
          </div>

          {/* Cabecera del Direct */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-white">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-700">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div
              className="w-6 h-6 rounded-full p-[1.5px] shrink-0"
              style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-slate-800">
                CC
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-800 truncate">pqrslab</p>
              <p className="text-[8px] text-slate-400">Cuenta profesional</p>
            </div>
          </div>

          {/* Hilo */}
          <div className="px-3 py-4 min-h-[260px] bg-white">
            <div className="flex flex-col items-center gap-1 mb-4">
              <div
                className="w-10 h-10 rounded-full p-[2px]"
                style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
              >
                <div className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-slate-800">
                  CC
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-700">pqrslab</p>
              <p className="text-[8px] text-slate-400">Instagram · Atención al ciudadano</p>
            </div>

            <div className="max-w-[85%]">
              <div className="rounded-3xl px-3 py-2" style={{ background: "#efefef", borderBottomLeftRadius: 6 }}>
                <p className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words ${vacio ? "text-slate-400 italic" : "text-slate-800"}`}>
                  {vacio ? texto : renderCuerpo(texto, conDatos)}
                </p>
              </div>
              <p className="text-[8px] text-slate-400 mt-1 ml-2">Enviado ahora</p>
            </div>

            {/* Respuestas rápidas de Instagram */}
            {botones.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-end">
                {botones.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold rounded-full px-3 py-1.5 border-2"
                    style={{ borderColor: "#3797F0", color: "#3797F0" }}
                  >
                    {b.texto || "Respuesta"}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Barra de mensaje */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white">
            <div className="rounded-full border border-slate-200 px-3 py-1.5">
              <span className="text-[9px] text-slate-300">Enviar mensaje…</span>
            </div>
          </div>

          <div className="h-5 flex items-center justify-center bg-white">
            <span className="w-16 h-1 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    )
  }

  /* WhatsApp / SMS / Push → maqueta de teléfono */
  const esWhats = canal === "whatsapp"
  const esPush = canal === "push"

  return (
    <div className="mx-auto rounded-[30px] p-2 shadow-xl" style={{ width: 250, background: "#0f172a" }}>
      <div className="rounded-[24px] overflow-hidden bg-white">
        {/* Notch */}
        <div className="relative h-5" style={{ background: esPush ? "#1E3A8A" : esWhats ? "#075E54" : "#f1f5f9" }}>
          <span className="absolute left-1/2 -translate-x-1/2 top-1 w-14 h-2.5 rounded-full bg-slate-900" />
        </div>

        {esPush ? (
          /* Pantalla de bloqueo con notificación */
          <div className="px-3 pt-8 pb-10 min-h-[300px] flex flex-col" style={{ background: "linear-gradient(160deg, #1E3A8A 0%, #0EA5E9 100%)" }}>
            <p className="text-center text-white/90 text-3xl font-light tracking-tight">09:41</p>
            <p className="text-center text-white/50 text-[10px] mt-0.5 mb-6">jueves, 13 de agosto</p>
            <div className="rounded-2xl px-3 py-2.5 backdrop-blur shadow-lg" style={{ background: "rgba(255,255,255,0.9)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#1E3A8A" }}>
                  <svg viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Concept CRM</span>
                <span className="ml-auto text-[8px] text-slate-400">ahora</span>
              </div>
              {encabezado.trim() && (
                <p className="text-[11px] font-bold text-slate-800">{renderCuerpo(encabezado, conDatos)}</p>
              )}
              <p className={`text-[11px] leading-snug whitespace-pre-wrap break-words ${vacio ? "text-slate-400 italic" : "text-slate-700"}`}>
                {vacio ? texto : renderCuerpo(texto, conDatos)}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de conversación */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: esWhats ? "#075E54" : "#f1f5f9" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${esWhats ? "text-white/80" : "text-slate-400"}`}>
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: esWhats ? "#128C7E" : "#1E3A8A" }}>
                CC
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold truncate ${esWhats ? "text-white" : "text-slate-700"}`}>Concept CRM</p>
                <p className={`text-[8px] ${esWhats ? "text-white/60" : "text-slate-400"}`}>
                  {esWhats ? "cuenta de empresa" : "+57 300 000 0000"}
                </p>
              </div>
            </div>

            {/* Hilo */}
            <div
              className="px-3 py-4 min-h-[260px]"
              style={{
                background: esWhats
                  ? "linear-gradient(180deg,#ECE5DD 0%,#e7dfd6 100%)"
                  : "linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)",
              }}
            >
              <div className="flex justify-center mb-3">
                <span className="text-[8px] font-semibold rounded-full px-2 py-0.5 bg-white/70 text-slate-500 shadow-sm">HOY</span>
              </div>
              <div className="max-w-[92%]">
                <div
                  className="rounded-xl px-2.5 py-2 shadow-sm"
                  style={{ background: "#fff", borderTopLeftRadius: 4, border: esWhats ? "none" : "1px solid #e2e8f0" }}
                >
                  {esWhats && (
                    <p className="text-[8px] font-bold mb-1" style={{ color: "#128C7E" }}>
                      Pqrslab
                    </p>
                  )}
                  {encabezado.trim() && (
                    <p className="text-[11px] font-bold text-slate-800 mb-1">{renderCuerpo(encabezado, conDatos)}</p>
                  )}
                  <p className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words ${vacio ? "text-slate-300 italic" : "text-slate-700"}`}>
                    {vacio ? texto : renderCuerpo(texto, conDatos)}
                  </p>
                  {pie.trim() && <p className="text-[9px] text-slate-400 mt-1.5">{pie}</p>}
                  <p className="text-[8px] text-slate-400 text-right mt-1">09:41</p>
                </div>
                <BotonesPreview botones={botones} color={esWhats ? "#128C7E" : "#0EA5E9"} />
              </div>
            </div>
          </>
        )}

        {/* Barra inferior */}
        <div className="h-5 flex items-center justify-center" style={{ background: esPush ? "#0f172a" : "#f8fafc" }}>
          <span className="w-16 h-1 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  )
}
