import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrabajos } from '../hooks/useTrabajos'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LocationPicker } from '../components/LocationPicker'
import type { Trabajo } from '../types'

const ESTADO_PILL: Record<Trabajo['estado'], { label: string; cls: string }> = {
  abierto: { label: 'Abierto', cls: 'bg-ios-blue/10 text-ios-blue' },
  pendiente_cobro: { label: 'Pendiente', cls: 'bg-ios-orange/10 text-ios-orange' },
  cobrado: { label: 'Cobrado', cls: 'bg-ios-green/10 text-ios-green' },
}

const TOTAL_COLOR: Record<Trabajo['estado'], string> = {
  abierto: 'text-charcoal-text',
  pendiente_cobro: 'text-ios-orange',
  cobrado: 'text-ios-green',
}

const TOTAL_LABEL: Record<Trabajo['estado'], string> = {
  abierto: 'Presupuesto est.',
  pendiente_cobro: 'Total a Cobrar',
  cobrado: 'Cobrado',
}

export function Trabajos() {
  const navigate = useNavigate()
  const { trabajos, loading, createTrabajo } = useTrabajos(['abierto', 'pendiente_cobro'])
  const [showForm, setShowForm] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abiertos = trabajos.filter((t) => t.estado === 'abierto')
  const pendientes = trabajos.filter((t) => t.estado === 'pendiente_cobro')

  const handleCreate = async () => {
    if (!descripcion.trim()) { setError('La descripción es obligatoria.'); return }
    if (!ubicacion.trim()) { setError('Selecciona una ubicación.'); return }
    setSaving(true)
    setError(null)
    try {
      const trabajo = await createTrabajo(descripcion.trim(), ubicacion.trim())
      setShowForm(false)
      setDescripcion('')
      setUbicacion('')
      navigate(`/trabajos/${trabajo.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear')
    }
    setSaving(false)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 ios-blur bg-surface/80 border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-margin-main h-touch-target-min">
          <h1 className="text-headline-md-mobile font-bold text-ios-blue">Trabajos</h1>
          <button
            onClick={() => { setShowForm(true); setError(null) }}
            className="flex items-center justify-center h-10 w-10 text-ios-blue active:opacity-60 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <div className="px-margin-main pt-section-gap pb-4 flex flex-col gap-section-gap">
        <h2 className="text-display text-charcoal-text leading-tight">Actividad</h2>

        {/* Nuevo trabajo form */}
        {showForm && (
          <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-headline-md-mobile text-charcoal-text">Nuevo trabajo</h3>
            <Input
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Pintura salón"
              icon="description"
            />

            {/* Ubicación con picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg text-charcoal-text ml-1">Ubicación</label>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full min-h-[44px] px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center gap-3 active:bg-surface-container-high transition-colors text-left"
              >
                <span className="material-symbols-outlined text-ios-blue text-[20px] shrink-0">location_on</span>
                {ubicacion
                  ? <span className="text-body-md text-charcoal-text flex-1 truncate">{ubicacion}</span>
                  : <span className="text-body-md text-ios-gray flex-1">Seleccionar ubicación...</span>
                }
                <span className="material-symbols-outlined text-ios-gray text-[18px] shrink-0">chevron_right</span>
              </button>
            </div>

            {error && <p className="text-label-lg text-ios-red">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleCreate} loading={saving} className="flex-1" icon="add_circle">
                Crear
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!showForm && (
          <Button
            onClick={() => { setShowForm(true); setError(null) }}
            size="md"
            className="w-full"
            icon="add_circle"
          >
            Nuevo Trabajo
          </Button>
        )}

        {loading ? (
          <p className="text-body-md text-ios-gray text-center py-8">Cargando...</p>
        ) : trabajos.length === 0 ? (
          <p className="text-body-md text-ios-gray text-center py-8">Sin trabajos activos.</p>
        ) : (
          <>
            {abiertos.length > 0 && (
              <TrabajoSection
                title="Abiertos"
                count={abiertos.length}
                countCls="bg-ios-blue/10 text-ios-blue"
                trabajos={abiertos}
                onPress={(id) => navigate(`/trabajos/${id}`)}
              />
            )}
            {pendientes.length > 0 && (
              <TrabajoSection
                title="Pendiente Cobro"
                count={pendientes.length}
                countCls="bg-ios-orange/10 text-ios-orange"
                trabajos={pendientes}
                onPress={(id) => navigate(`/trabajos/${id}`)}
              />
            )}
          </>
        )}
      </div>

      <LocationPicker
        isOpen={showLocationPicker}
        initial={ubicacion}
        onConfirm={(loc) => { setUbicacion(loc); setShowLocationPicker(false) }}
        onCancel={() => setShowLocationPicker(false)}
      />
    </>
  )
}

function TrabajoSection({
  title, count, countCls, trabajos, onPress,
}: {
  title: string
  count: number
  countCls: string
  trabajos: Trabajo[]
  onPress: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-stack-gap px-1">
        <span className="text-label-lg text-ios-gray uppercase tracking-wider">{title}</span>
        <span className={`text-label-md px-2 py-0.5 rounded-full ${countCls}`}>{count}</span>
      </div>
      <div className="space-y-stack-gap">
        {trabajos.map((t) => {
          const pill = ESTADO_PILL[t.estado]
          return (
            <div
              key={t.id}
              onClick={() => onPress(t.id)}
              className="bg-surface-grouped border border-black/5 rounded-2xl p-gutter-card flex flex-col gap-2 active:bg-surface-container-high transition-colors cursor-pointer group shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-headline-md-mobile text-charcoal-text leading-tight truncate">
                    {t.descripcion}
                  </h3>
                  <div className="flex items-center gap-1 text-ios-gray mt-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="text-body-md truncate">{t.ubicacion}</span>
                  </div>
                </div>
                <span className={`text-label-md font-label-lg px-3 py-1 rounded-full shrink-0 ${pill.cls}`}>
                  {pill.label}
                </span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="text-label-md text-ios-gray">{TOTAL_LABEL[t.estado]}</span>
                  <span className={`text-numeric-data ${TOTAL_COLOR[t.estado]}`}>
                    {Number(t.total_calculado).toFixed(2)} $
                  </span>
                </div>
                <span className="material-symbols-outlined text-ios-gray group-active:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
