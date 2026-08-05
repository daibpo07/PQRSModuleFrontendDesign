import type { Radicado } from '../App'

interface Props {
  radicado: Radicado
  onBack: () => void
}

const estadoStyle: Record<string, { bg: string; text: string }> = {
  Recibido:    { bg: '#0EA5E9', text: '#fff' },
  'En gestión':{ bg: '#f59e0b', text: '#fff' },
  Resuelto:    { bg: '#10b981', text: '#fff' },
  Cerrado:     { bg: '#64748B', text: '#fff' },
  Rechazado:   { bg: '#ef4444', text: '#fff' },
}

const tipoStyle: Record<string, { bg: string; text: string }> = {
  Petición:  { bg: '#dbeafe', text: '#1d4ed8' },
  Queja:     { bg: '#fee2e2', text: '#dc2626' },
  Reclamo:   { bg: '#ffedd5', text: '#ea580c' },
  Sugerencia:{ bg: '#d1fae5', text: '#059669' },
}

const prioridadColor: Record<string, string> = {
  Alta: '#dc2626',
  Media: '#d97706',
  Baja: '#059669',
}

const timeline = ['Recibido', 'Asignado', 'En revisión', 'Respondido']

const estadoProgress: Record<string, number> = {
  Recibido: 1,
  'En gestión': 2,
  Resuelto: 4,
  Cerrado: 4,
  Rechazado: 3,
}

export default function DetailView({ radicado, onBack }: Props) {
  const progress = estadoProgress[radicado.estado] ?? 1

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a PQRS
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                style={{ background: tipoStyle[radicado.tipo].bg, color: tipoStyle[radicado.tipo].text }}
              >
                {radicado.tipo}
              </span>
              <span className="font-mono text-xs text-slate-400">{radicado.id}</span>
            </div>
            <h2 className="text-base font-bold text-slate-800 leading-snug">{radicado.asunto}</h2>
            <p className="text-sm text-[#0EA5E9] mt-1">{radicado.peticionario.nombre}</p>
          </div>
          <span
            className="shrink-0 text-xs font-semibold rounded-full px-3 py-1"
            style={{ background: estadoStyle[radicado.estado].bg, color: estadoStyle[radicado.estado].text }}
          >
            {radicado.estado}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          {[
            { label: 'Radicado', value: radicado.id, mono: true },
            { label: 'Dependencia', value: radicado.dependencia },
            { label: 'Canal', value: radicado.canal },
            { label: 'Prioridad', value: radicado.prioridad, color: prioridadColor[radicado.prioridad] },
          ].map(m => (
            <div key={m.label}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{m.label}</p>
              <p
                className={`text-sm font-semibold ${m.mono ? 'font-mono text-xs' : ''}`}
                style={{ color: m.color ?? '#1e293b' }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Estado del Proceso</h3>
        <div className="flex items-center">
          {timeline.map((step, i) => {
            const done = i < progress
            const active = i === progress - 1
            return (
              <div key={step} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                    style={{
                      background: done ? '#1E3A8A' : '#fff',
                      borderColor: done ? '#1E3A8A' : '#e2e8f0',
                      color: done ? '#fff' : '#94a3b8',
                      outline: active ? '3px solid #bfdbfe' : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {done && !active ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${done ? 'text-slate-600' : 'text-slate-300'}`}>
                    {step}
                  </span>
                </div>
                {i < timeline.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{ background: i < progress - 1 ? '#1E3A8A' : '#e2e8f0' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {radicado.fechaRespuesta && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex gap-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-emerald-700">
              Solicitud respondida el <strong>{radicado.fechaRespuesta}</strong>. Consulta el historial para ver la respuesta completa.
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Descripción de la Solicitud</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{radicado.descripcion}</p>
      </div>

      {/* Seguimiento */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          Historial de Seguimiento
          <span
            className="ml-2 text-[10px] font-bold rounded-full px-2 py-0.5 text-white"
            style={{ background: '#1E3A8A' }}
          >
            {radicado.seguimientos.length}
          </span>
        </h3>

        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" />
          <div className="space-y-4">
            {radicado.seguimientos.map((seg, i) => (
              <div key={i} className="flex gap-4 relative">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{ background: '#1E3A8A' }}
                >
                  <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">{seg.autor}</span>
                    <span className="font-mono text-[10px] text-slate-400">{seg.fecha}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{seg.nota}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Acciones</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Descargar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Enviar comentario
          </button>
          {(radicado.estado === 'Recibido' || radicado.estado === 'En gestión') && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Desistir del radicado
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
