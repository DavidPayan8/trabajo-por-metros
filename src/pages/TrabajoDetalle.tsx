import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLineasTrabajo } from '../hooks/useTrabajos'
import { useTipos } from '../hooks/useTipos'
import { useDialog } from '../hooks/useDialog'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import type { Trabajo } from '../types'

const ESTADO_PILL: Record<Trabajo['estado'], { label: string; cls: string }> = {
  abierto: { label: 'Abierto', cls: 'bg-ios-blue/10 text-ios-blue' },
  pendiente_cobro: { label: 'Pendiente Cobro', cls: 'bg-ios-orange/10 text-ios-orange' },
  cobrado: { label: 'Cobrado', cls: 'bg-ios-green/10 text-ios-green' },
}

export function TrabajoDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [loadingTrabajo, setLoadingTrabajo] = useState(true)
  const { lineas, loading: loadingLineas, addLinea, deleteLinea } = useLineasTrabajo(id!)
  const { tipos } = useTipos()
  const { confirm, dialogProps } = useDialog()

  const [tipoId, setTipoId] = useState('')
  const [metros, setMetros] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCobrado, setTotalCobrado] = useState('')
  const [notas, setNotas] = useState('')
  const [savingPDF, setSavingPDF] = useState(false)

  const fetchTrabajo = async () => {
    const { data } = await supabase.from('trabajo').select('*').eq('id', id!).single()
    setTrabajo(data)
    if (data?.notas) setNotas(data.notas)
    setLoadingTrabajo(false)
  }

  useEffect(() => { fetchTrabajo() }, [id])

  const handleGuardarNotas = async () => {
    await supabase.from('trabajo').update({ notas }).eq('id', id!)
    setTrabajo((prev) => prev ? { ...prev, notas } : prev)
  }

  const handleGenerarPDF = async () => {
    if (!trabajo) return
    setSavingPDF(true)
    try {
      const { generarPresupuestoPDF } = await import('../utils/generarPDF')
      await generarPresupuestoPDF({ ...trabajo, notas }, lineas)
    } catch { /* share cancelled or PDF error */ }
    setSavingPDF(false)
  }

  const handleAddLinea = async () => {
    const tipo = tipos.find((t) => t.id === tipoId)
    if (!tipo || !metros) return
    setSaving(true)
    setError(null)
    try {
      await addLinea(tipo, parseFloat(metros))
      await fetchTrabajo()
      setMetros('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
    setSaving(false)
  }

  const handleDeleteLinea = async (lineaId: string) => {
    const ok = await confirm('Esta acción no se puede deshacer.', {
      title: '¿Eliminar línea?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    await deleteLinea(lineaId)
    await fetchTrabajo()
  }

  const handleMarcarPendiente = async () => {
    const ok = await confirm('El trabajo pasará a estado "Pendiente de cobro" y no podrás añadir más líneas.', {
      title: 'Finalizar trabajo',
      confirmLabel: 'Finalizar',
    })
    if (!ok) return
    await supabase.from('trabajo').update({ estado: 'pendiente_cobro' }).eq('id', id!)
    await fetchTrabajo()
  }

  const handleCobrar = async () => {
    const cobrado = parseFloat(totalCobrado)
    if (isNaN(cobrado)) return
    await supabase.from('trabajo').update({
      estado: 'cobrado',
      total_cobrado: cobrado,
      fecha_cobro: new Date().toISOString(),
    }).eq('id', id!)
    navigate('/trabajos')
  }

  if (loadingTrabajo) return <p className="text-body-md text-ios-gray text-center py-20">Cargando...</p>
  if (!trabajo) return <p className="text-body-md text-ios-red text-center py-20">Trabajo no encontrado.</p>

  const esAbierto = trabajo.estado === 'abierto'
  const esPendiente = trabajo.estado === 'pendiente_cobro'
  const esCobrado = trabajo.estado === 'cobrado'
  const pill = ESTADO_PILL[trabajo.estado]
  const diferencia = totalCobrado && !isNaN(parseFloat(totalCobrado))
    ? parseFloat(totalCobrado) - Number(trabajo.total_calculado)
    : null
  const diferenciaCobro = esCobrado && trabajo.total_cobrado !== null
    ? Number(trabajo.total_cobrado) - Number(trabajo.total_calculado)
    : null
  const pctDesviacion = diferenciaCobro !== null && Number(trabajo.total_calculado) !== 0
    ? ((diferenciaCobro / Number(trabajo.total_calculado)) * 100).toFixed(1)
    : null

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 ios-blur bg-surface/80 border-b border-outline-variant/30 safe-pt flex flex-col justify-end px-margin-main">
        <div className="flex items-center justify-between h-touch-target-min">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-ios-blue active:opacity-50 transition-opacity"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            <span className="text-body-lg">Trabajos</span>
          </button>
          <h1 className="text-headline-md text-on-surface">Detalle</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="pb-[160px]">
        {/* Hero */}
        <section className="px-margin-main pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold uppercase tracking-wider ${pill.cls}`}>
              {pill.label}
            </span>
          </div>
          <h2 className="text-display text-charcoal-text leading-tight mb-1">{trabajo.ubicacion}</h2>
          <p className="text-body-md text-ios-gray">{trabajo.descripcion}</p>
          <p className="text-label-md text-ios-gray mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {new Date(trabajo.fecha_ejecucion + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </section>

        {/* Notas */}
        <section className="px-margin-main mb-section-gap">
          <label className="text-label-lg text-ios-gray uppercase tracking-wider px-1 block mb-2">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={handleGuardarNotas}
            placeholder="Añade notas sobre este trabajo..."
            rows={3}
            className="w-full px-4 py-3 bg-surface-grouped border border-black/5 rounded-2xl text-body-md text-charcoal-text placeholder:text-ios-gray focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue resize-none shadow-sm"
          />
        </section>

        {/* Resumen cobro — solo cuando cobrado */}
        {esCobrado && trabajo.total_cobrado !== null && (
          <section className="px-margin-main mb-section-gap">
            <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-label-lg text-ios-gray uppercase tracking-wider">Total cobrado</span>
                  <p className="text-display text-ios-green leading-tight">
                    {Number(trabajo.total_cobrado).toFixed(2)} $
                  </p>
                </div>
                <div className="bg-ios-green/10 p-2 rounded-xl">
                  <span
                    className="material-symbols-outlined text-ios-green text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
              </div>
              <div className="border-t border-outline-variant/20 pt-3 flex flex-col gap-2.5">
                <div className="flex justify-between text-body-md">
                  <span className="text-ios-gray">Presupuesto calculado</span>
                  <span className="text-charcoal-text font-semibold">
                    {Number(trabajo.total_calculado).toFixed(2)} $
                  </span>
                </div>
                <div className="flex justify-between text-body-md">
                  <span className="text-ios-gray">Desviación</span>
                  {diferenciaCobro === 0 ? (
                    <span className="text-ios-green font-semibold">Sin desviación</span>
                  ) : (
                    <span className={`font-semibold ${diferenciaCobro! > 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                      {diferenciaCobro! > 0 ? '+' : ''}{diferenciaCobro!.toFixed(2)} $
                      {pctDesviacion && ` (${diferenciaCobro! > 0 ? '+' : ''}${pctDesviacion}%)`}
                    </span>
                  )}
                </div>
                {trabajo.fecha_cobro && (
                  <div className="flex justify-between text-body-md">
                    <span className="text-ios-gray">Fecha de cobro</span>
                    <span className="text-charcoal-text">
                      {new Date(trabajo.fecha_cobro).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {trabajo.fecha_cobro && (
                  <div className="flex justify-between text-body-md">
                    <span className="text-ios-gray">Tiempo hasta cobro</span>
                    <span className="text-charcoal-text">
                      {Math.round((new Date(trabajo.fecha_cobro).getTime() - new Date(trabajo.fecha_ejecucion + 'T00:00:00').getTime()) / 86400000)} días
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Añadir línea */}
        {esAbierto && (
          <section className="px-margin-main mb-section-gap flex flex-col gap-3">
            <div>
              <label className="text-label-lg text-charcoal-text ml-1 block mb-1.5">
                Tipo de metro
              </label>
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="w-full min-h-[44px] px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-lg text-charcoal-text focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue"
              >
                <option value="">Seleccionar tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} — {t.precio.toFixed(2)} $/{t.unidad === 'pies' ? 'ft' : 'm'}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Metros"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={metros}
              onChange={(e) => setMetros(e.target.value)}
              placeholder="0,00"
            />
            {error && <p className="text-label-lg text-ios-red">{error}</p>}
            <button
              onClick={handleAddLinea}
              disabled={!tipoId || !metros || saving}
              className="w-full min-h-[44px] rounded-xl bg-white border border-dashed border-ios-blue/40 text-ios-blue flex items-center justify-center gap-2 active:bg-surface-container-low disabled:opacity-40 transition-colors"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined">add_circle</span>
              }
              <span className="text-body-lg font-semibold">Añadir</span>
            </button>
          </section>
        )}

        {/* Cobro form */}
        {esPendiente && (
          <section className="px-margin-main mb-section-gap flex flex-col gap-3">
            <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <h3 className="text-headline-md-mobile text-charcoal-text">Registrar cobro</h3>
              <div className="flex justify-between text-body-md">
                <span className="text-ios-gray">Total calculado</span>
                <span className="text-charcoal-text font-semibold">
                  {Number(trabajo.total_calculado).toFixed(2)} $
                </span>
              </div>
              <Input
                label="Total cobrado ($)"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={totalCobrado}
                onChange={(e) => setTotalCobrado(e.target.value)}
                placeholder="0,00"
              />
              {diferencia !== null && (
                <div className="flex justify-between text-body-md">
                  <span className="text-ios-gray">Diferencia</span>
                  <span className={diferencia >= 0 ? 'text-ios-green font-semibold' : 'text-ios-red font-semibold'}>
                    {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} $
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Líneas */}
        <section className="px-margin-main mb-stack-gap">
          <h3 className="text-label-lg text-ios-gray uppercase tracking-wider px-1 mb-2">
            Partidas Registradas
          </h3>

          {loadingLineas ? (
            <p className="text-body-md text-ios-gray text-center py-4">Cargando...</p>
          ) : lineas.length === 0 ? (
            <p className="text-body-md text-ios-gray text-center py-4">Sin líneas aún.</p>
          ) : (
            <div className="bg-surface-grouped rounded-xl border border-black/5 divide-y divide-black/5 overflow-hidden shadow-sm">
              {lineas.map((linea) => (
                <div key={linea.id} className="p-4 flex justify-between items-center bg-white active:bg-surface-container-high transition-colors">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-body-lg text-charcoal-text font-semibold truncate">
                      {linea.nombre_tipo}
                    </span>
                    <span className="text-body-md text-ios-gray">
                      {Number(linea.precio_unitario).toFixed(2)} $/{linea.unidad === 'pies' ? 'ft' : 'm'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end ml-3 shrink-0">
                    <span className="text-numeric-data text-charcoal-text">
                      {Number(linea.metros).toFixed(2)} {linea.unidad === 'pies' ? 'ft' : 'm'}
                    </span>
                    <span className="text-label-lg text-ios-blue">
                      {Number(linea.subtotal).toFixed(2)} $
                    </span>
                    {esAbierto && (
                      <button
                        onClick={() => handleDeleteLinea(linea.id)}
                        className="text-ios-red text-label-md mt-1 active:opacity-60"
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer fijo */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] ios-blur bg-surface/80 pt-4 safe-pb px-margin-main border-t border-outline-variant/30 z-[60]">
        <div className="flex flex-col gap-3 pb-2">
          {esAbierto && lineas.length > 0 && (
            <Button
              onClick={handleMarcarPendiente}
              size="lg"
              className="w-full shadow-lg shadow-ios-blue/20"
              icon="payments"
            >
              Finalizar y Cobrar
            </Button>
          )}
          {esPendiente && (
            <Button
              onClick={handleCobrar}
              disabled={!totalCobrado || isNaN(parseFloat(totalCobrado))}
              size="lg"
              className="w-full shadow-lg shadow-ios-blue/20"
              icon="payments"
            >
              Confirmar Cobro
            </Button>
          )}
          {(esAbierto || esPendiente || esCobrado) && (
            <div className="flex gap-3">
              <button
                onClick={handleGenerarPDF}
                disabled={savingPDF}
                className="flex-1 min-h-[44px] bg-white border border-black/5 rounded-xl text-label-lg text-charcoal-text flex items-center justify-center gap-2 active:bg-surface-container-high disabled:opacity-50 transition-colors"
              >
                {savingPDF
                  ? <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                }
                Presupuesto
              </button>
              {(esAbierto || esPendiente) && (
                <button className="flex-1 min-h-[44px] bg-white border border-black/5 rounded-xl text-label-lg text-ios-red flex items-center justify-center gap-2 active:bg-error-container/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                  Anular
                </button>
              )}
            </div>
          )}
        </div>
      </footer>

      <Dialog {...dialogProps} />
    </>
  )
}
