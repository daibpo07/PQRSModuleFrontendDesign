import { useState } from 'react'
import type { Radicado } from "@/App"

interface Props {
  onSubmit: (r: Radicado) => void
  onCancel: () => void
}

const dependencias = [
  'Planeación Municipal',
  'Servicios Públicos',
  'Empresa de Acueducto',
  'Infraestructura Vial',
  'Tránsito y Movilidad',
  'Concejo Municipal',
  'Secretaría de Salud',
  'Secretaría de Educación',
  'Hacienda Municipal',
  'Cultura y Turismo',
  'Registro Civil',
  'Servicios al Ciudadano',
]

const tipoInfo: Record<string, { desc: string; bg: string; border: string; text: string }> = {
  Petición:   { desc: 'Solicitud de información, documentos o actuación de la entidad.', bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  Queja:      { desc: 'Inconformidad por conducta irregular de un servidor público.', bg: '#fff1f2', border: '#fca5a5', text: '#dc2626' },
  Reclamo:    { desc: 'Exigencia de revisión por un servicio deficiente o derecho desconocido.', bg: '#fff7ed', border: '#fdba74', text: '#ea580c' },
  Sugerencia: { desc: 'Propuesta de mejora en procesos o servicios de la entidad.', bg: '#f0fdf4', border: '#86efac', text: '#059669' },
}

export default function FormNew({ onSubmit, onCancel }: Props) {
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<Radicado['tipo'] | ''>('')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [dependencia, setDependencia] = useState('')
  const [prioridad, setPrioridad] = useState<Radicado['prioridad']>('Media')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!tipo) e.tipo = 'Selecciona el tipo de solicitud'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e: Record<string, string> = {}
    if (!asunto.trim() || asunto.trim().length < 10) e.asunto = 'El asunto debe tener al menos 10 caracteres'
    if (!descripcion.trim() || descripcion.trim().length < 30) e.descripcion = 'La descripción debe tener al menos 30 caracteres'
    if (!dependencia) e.dependencia = 'Selecciona la dependencia'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validate1()) setStep(2)
    else if (step === 2 && validate2()) setStep(3)
  }

  const handleSubmit = () => {
    const now = new Date()
    const fecha = now.toISOString().split('T')[0]
    const num = String(Math.floor(Math.random() * 900) + 100).padStart(6, '0')
    const id = `PQR-${now.getFullYear()}-${num}`
    onSubmit({
      id,
      tipo: tipo as Radicado['tipo'],
      asunto,
      descripcion,
      estado: 'Recibido',
      prioridad,
      fecha,
      peticionario: { nombre: 'Carlos Morales', cedula: '1020304050' },
      dependencia,
      canal: 'Portal Web',
      seguimientos: [
        { fecha, autor: 'Sistema PQRS', nota: 'Radicado recibido y registrado exitosamente.' },
      ],
    })
  }

  const steps = ['Tipo de solicitud', 'Detalle del caso', 'Confirmación']

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step bar */}
      <div className="flex items-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                style={{
                  background: i + 1 < step ? '#1E3A8A' : i + 1 === step ? '#1E3A8A' : '#fff',
                  borderColor: i + 1 <= step ? '#1E3A8A' : '#e2e8f0',
                  color: i + 1 <= step ? '#fff' : '#94a3b8',
                }}
              >
                {i + 1 < step ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : i + 1}
              </div>
              <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2"
                style={{ background: i + 1 < step ? '#1E3A8A' : '#e2e8f0' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">¿Qué tipo de solicitud deseas radicar?</h2>
            <p className="text-sm text-slate-400 mb-5">Selecciona la categoría que mejor describe tu requerimiento.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(tipoInfo) as Radicado['tipo'][]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTipo(t); setErrors({}) }}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: tipo === t ? tipoInfo[t].border : '#e2e8f0',
                    background: tipo === t ? tipoInfo[t].bg : '#f8fafc',
                  }}
                >
                  <p className="text-sm font-bold mb-1" style={{ color: tipo === t ? tipoInfo[t].text : '#1e293b' }}>{t}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{tipoInfo[t].desc}</p>
                </button>
              ))}
            </div>
            {errors.tipo && <p className="mt-3 text-xs text-red-500">{errors.tipo}</p>}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Describe tu {tipo}</h2>
              <p className="text-sm text-slate-400">Proporciona la mayor cantidad de detalles posibles.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Asunto <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                placeholder="Resumen breve de tu solicitud"
                className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 ${errors.asunto ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.asunto && <p className="mt-1 text-xs text-red-500">{errors.asunto}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Descripción <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Describe los hechos, fechas, personas involucradas y lo que esperas como respuesta."
                className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-300 resize-none ${errors.descripcion ? 'border-red-300' : 'border-slate-200'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.descripcion ? <p className="text-xs text-red-500">{errors.descripcion}</p> : <span />}
                <p className="text-xs text-slate-300 ml-auto">{descripcion.length} chars</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Dependencia <span className="text-red-400">*</span>
                </label>
                <select
                  value={dependencia}
                  onChange={e => setDependencia(e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] text-slate-700 ${errors.dependencia ? 'border-red-300' : 'border-slate-200'}`}
                >
                  <option value="">Seleccionar...</option>
                  {dependencias.map(d => <option key={d}>{d}</option>)}
                </select>
                {errors.dependencia && <p className="mt-1 text-xs text-red-500">{errors.dependencia}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Prioridad
                </label>
                <select
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value as Radicado['prioridad'])}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] text-slate-700"
                >
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">Confirma tu radicado</h2>
            <p className="text-sm text-slate-400 mb-5">Revisa la información antes de enviar.</p>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden mb-5">
              {[
                { label: 'Tipo', value: tipo },
                { label: 'Asunto', value: asunto },
                { label: 'Dependencia', value: dependencia },
                { label: 'Prioridad', value: prioridad },
                { label: 'Canal', value: 'Portal Web' },
                { label: 'Fecha', value: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 px-4 py-3 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">{label}</span>
                  <span className="text-sm text-slate-700 font-medium">{value}</span>
                </div>
              ))}
              <div className="px-4 py-3 bg-slate-50">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Descripción</span>
                <p className="text-sm text-slate-700">{descripcion}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#e0f2fe] border border-[#bae6fd] p-4 flex gap-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-[#0284c7] leading-relaxed">
                La entidad tiene <strong>15 días hábiles</strong> para responder tu solicitud según la Ley 1755 de 2015.
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {step === 1 ? 'Cancelar' : '← Atrás'}
          </button>
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
              style={{ background: '#1E3A8A' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#162d6e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1E3A8A')}
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
              style={{ background: '#0EA5E9' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0284c7')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0EA5E9')}
            >
              Radicar Solicitud
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
