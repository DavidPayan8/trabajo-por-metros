import { useState } from 'react'
import { useTipos } from '../hooks/useTipos'
import { useDialog } from '../hooks/useDialog'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import type { TipoMetro, Unidad } from '../types'

const ICON_COLORS = [
  { bg: 'bg-primary-fixed-dim', text: 'text-primary', icon: 'format_paint' },
  { bg: 'bg-secondary-fixed', text: 'text-secondary', icon: 'grid_view' },
  { bg: 'bg-tertiary-fixed', text: 'text-tertiary', icon: 'texture' },
  { bg: 'bg-ios-orange/10', text: 'text-ios-orange', icon: 'layers' },
]

const UNIDAD_LABEL: Record<Unidad, string> = { metros: 'm', pies: 'ft' }

export function Tipos() {
  const { tipos, loading, createTipo, updateTipo, deleteTipo } = useTipos()
  const { confirm, dialogProps } = useDialog()
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<TipoMetro | null>(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [unidad, setUnidad] = useState<Unidad>('metros')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openNew = () => {
    setEditando(null)
    setNombre('')
    setPrecio('')
    setUnidad('metros')
    setError(null)
    setShowForm(true)
  }

  const openEdit = (tipo: TipoMetro) => {
    setEditando(tipo)
    setNombre(tipo.nombre)
    setPrecio(String(tipo.precio))
    setUnidad(tipo.unidad)
    setError(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!nombre.trim() || !precio) return
    setSaving(true)
    setError(null)
    try {
      if (editando) {
        await updateTipo(editando.id, nombre.trim(), parseFloat(precio), unidad)
      } else {
        await createTipo(nombre.trim(), parseFloat(precio), unidad)
      }
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm('Esta acción no se puede deshacer.', {
      title: '¿Eliminar tipo?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deleteTipo(id)
    } catch (e: unknown) {
      await confirm(e instanceof Error ? e.message : 'Error al eliminar', {
        title: 'Error',
        confirmLabel: 'Cerrar',
        cancelLabel: 'Cerrar',
      })
    }
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 ios-blur bg-surface/80 border-b border-outline-variant/30 safe-pt">
        <div className="flex justify-between items-center px-margin-main h-touch-target-min">
          <h1 className="text-headline-md-mobile font-bold text-ios-blue">Tipos</h1>
          <button
            onClick={openNew}
            className="flex items-center justify-center h-10 w-10 text-ios-blue active:opacity-60 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <div className="px-margin-main pt-6 pb-4 flex flex-col gap-4">
        <div>
          <h2 className="text-headline-lg-mobile text-charcoal-text mb-1">Lista de Servicios</h2>
          <p className="text-body-md text-ios-gray">Gestione sus tarifas por unidad lineal.</p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-headline-md-mobile text-charcoal-text">
              {editando ? 'Editar tipo' : 'Nuevo tipo'}
            </h3>
            <Input
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pintura, Solado..."
            />
            <Input
              label="Precio por unidad ($)"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0,00"
            />

            {/* Selector de unidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg text-charcoal-text ml-1">Unidad de medida</label>
              <div className="flex gap-2 bg-surface-container rounded-xl p-1">
                {(['metros', 'pies'] as Unidad[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnidad(u)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-label-lg transition-all
                      ${unidad === u
                        ? 'bg-white text-ios-blue shadow-sm font-semibold'
                        : 'text-ios-gray'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {u === 'metros' ? 'straighten' : 'square_foot'}
                    </span>
                    {u === 'metros' ? 'Metros (m)' : 'Pies (ft)'}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-label-lg text-ios-red">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSave} loading={saving} className="flex-1">
                Guardar
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-body-md text-ios-gray text-center py-8">Cargando...</p>
        ) : (
          <div className="grid gap-3">
            {tipos.map((tipo, i) => {
              const colors = ICON_COLORS[i % ICON_COLORS.length]
              return (
                <div
                  key={tipo.id}
                  className="bg-surface-grouped p-4 rounded-xl border border-black/5 flex justify-between items-center shadow-sm active:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {colors.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-body-lg font-semibold text-charcoal-text">{tipo.nombre}</h3>
                      <p className="text-ios-blue font-semibold text-[18px]">
                        {tipo.precio.toFixed(2)} $
                        <span className="text-label-md font-normal text-ios-gray ml-1">
                          /{UNIDAD_LABEL[tipo.unidad]}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(tipo)}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container text-ios-blue active:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container text-ios-red active:bg-error-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={openNew}
              className="w-full h-24 border-2 border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center text-ios-gray active:text-ios-blue active:border-ios-blue/50 transition-all"
            >
              <span className="material-symbols-outlined text-[32px] mb-1">add_circle</span>
              <span className="text-label-lg uppercase tracking-wider text-[11px]">
                Nuevo tipo de servicio
              </span>
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openNew}
        className="fixed right-6 bottom-24 h-14 w-14 bg-ios-blue text-white rounded-full shadow-lg shadow-ios-blue/30 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      <Dialog {...dialogProps} />
    </>
  )
}
