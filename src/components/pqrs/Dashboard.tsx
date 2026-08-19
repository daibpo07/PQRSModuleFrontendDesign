import type { Radicado, View } from "@/App"

interface Props {
  radicados: Radicado[]
  setView: (v: View) => void
  openDetail: (id: string) => void
}

const tipoStyle: Record<string, { bg: string; text: string }> = {
  Petición:  { bg: '#dbeafe', text: '#1d4ed8' },
  Queja:     { bg: '#fee2e2', text: '#dc2626' },
  Reclamo:   { bg: '#ffedd5', text: '#ea580c' },
  Sugerencia:{ bg: '#d1fae5', text: '#059669' },
}

const estadoStyle: Record<string, { bg: string; text: string }> = {
  Recibido:    { bg: '#0EA5E9', text: '#fff' },
  'En gestión':{ bg: '#f59e0b', text: '#fff' },
  Resuelto:    { bg: '#10b981', text: '#fff' },
  Cerrado:     { bg: '#64748B', text: '#fff' },
  Rechazado:   { bg: '#ef4444', text: '#fff' },
}

const estadoDot: Record<string, string> = {
  Recibido: 'bg-[#0EA5E9]',
  'En gestión': 'bg-amber-400',
  Resuelto: 'bg-emerald-400',
  Cerrado: 'bg-slate-400',
  Rechazado: 'bg-red-400',
}

export default function Dashboard({ radicados, setView, openDetail }: Props) {
  const total = radicados.length
  const recibidos = radicados.filter(r => r.estado === 'Recibido').length
  const enGestion = radicados.filter(r => r.estado === 'En gestión').length
  const resueltos = radicados.filter(r => r.estado === 'Resuelto').length

  const byTipo = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'].map(tipo => ({
    tipo,
    count: radicados.filter(r => r.tipo === tipo).length,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center justify-between overflow-hidden relative"
        style={{ background: '#1E3A8A' }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 50%, #0EA5E9 0%, transparent 70%)' }} />
        <div className="relative">
          <p className="text-white/50 text-xs mb-0.5">Bienvenido al Sistema</p>
          <h2 className="text-white text-xl font-bold">PQRS — Concept CRM</h2>
          <p className="text-white/60 text-sm mt-1">
            <span className="text-[#0EA5E9] font-semibold">{recibidos + enGestion}</span> solicitudes activas · {total} radicados totales
          </p>
        </div>
        <div className="relative hidden sm:flex flex-col items-end gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Sesión activa</span>
          <span className="text-sm font-mono text-[#0EA5E9]">31 Jul 2026</span>
          <span className="text-[10px] text-white/40">Pqrslab · Portal Ciudadano</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Radicados', value: total, color: '#1E3A8A', bg: '#fff', border: '#e2e8f0' },
          { label: 'Recibidos', value: recibidos, color: '#0EA5E9', bg: '#e0f2fe', border: '#bae6fd' },
          { label: 'En Gestión', value: enGestion, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Resueltos', value: resueltos, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border" style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Radicados Recientes</h3>
            <button onClick={() => setView('table')} className="text-xs font-medium text-[#0EA5E9] hover:text-[#0284c7] transition-colors">
              Ver todos →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {radicados.slice(0, 5).map(r => (
              <button
                key={r.id}
                onClick={() => openDetail(r.id)}
                className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estadoDot[r.estado]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
                      <span
                        className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: tipoStyle[r.tipo].bg, color: tipoStyle[r.tipo].text }}
                      >
                        {r.tipo}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#1E3A8A] transition-colors">
                      {r.asunto}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.peticionario.nombre} · {r.fecha}</p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                    style={{ background: estadoStyle[r.estado].bg, color: estadoStyle[r.estado].text }}
                  >
                    {r.estado}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* By tipo */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Por Tipo</h3>
            <div className="space-y-3">
              {byTipo.map(({ tipo, count }) => (
                <div key={tipo}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{tipo}</span>
                    <span className="font-mono text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: total > 0 ? `${(count / total) * 100}%` : '0%',
                        background: '#0EA5E9',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert */}
          <div className="rounded-xl p-4 border" style={{ background: '#1E3A8A', borderColor: '#162d6e' }}>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.2)' }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white mb-1">Radicado próximo a vencer</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  PQR-2026-000010 vence el{' '}
                  <span className="text-amber-400 font-semibold">15 Ago 2026</span>. Quedan 15 días hábiles.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setView('new')}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors"
            style={{ background: '#0EA5E9' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0284c7')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0EA5E9')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Radicar nueva PQRS
          </button>
        </div>
      </div>
    </div>
  )
}
