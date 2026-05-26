import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHistorial } from '../hooks/useHistorial'
import { Input } from '../components/ui/Input'

export function Historial() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [mostrarFechas, setMostrarFechas] = useState(false)
  const { trabajos: filtrados, loading } = useHistorial(filtro, desde, hasta)

  const totalGeneral = filtrados.reduce((sum, t) => sum + Number(t.total_cobrado ?? t.total_calculado), 0)
  const hayFiltros = filtro || desde || hasta

  const limpiarFechas = () => { setDesde(''); setHasta('') }

  return (
    <>
      <header className="sticky top-0 z-50 ios-blur bg-surface/80 border-b border-outline-variant/30 safe-pt">
        <div className="flex justify-between items-center px-margin-main h-touch-target-min">
          <h1 className="text-headline-md-mobile font-bold text-ios-blue">Historial</h1>
          <button
            onClick={() => { setMostrarFechas((v) => !v); if (mostrarFechas) limpiarFechas() }}
            className={`flex items-center gap-1 text-label-lg transition-colors active:opacity-60 ${(desde || hasta) ? 'text-ios-orange' : 'text-ios-blue'}`}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            {(desde || hasta) && <span className="w-2 h-2 rounded-full bg-ios-orange" />}
          </button>
        </div>
      </header>

      <div className="px-margin-main pt-section-gap pb-4 flex flex-col gap-section-gap">
        <h2 className="text-display text-charcoal-text leading-tight">Cobros</h2>

        <Input
          placeholder="Buscar por descripción o ubicación..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          icon="search"
        />

        {/* Filtro fechas */}
        {mostrarFechas && (
          <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-lg text-ios-gray uppercase tracking-wider">Rango de fechas</span>
              {(desde || hasta) && (
                <button onClick={limpiarFechas} className="text-label-lg text-ios-blue active:opacity-60">
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between min-h-[44px] px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl">
                <label className="text-body-md text-ios-gray shrink-0 mr-3">Desde</label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="flex-1 text-body-md text-charcoal-text text-right bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between min-h-[44px] px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl">
                <label className="text-body-md text-ios-gray shrink-0 mr-3">Hasta</label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="flex-1 text-body-md text-charcoal-text text-right bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumen total */}
        {filtrados.length > 0 && (
          <div className="bg-ios-green/10 border border-ios-green/20 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-label-lg text-ios-green uppercase tracking-wider">
                Total cobrado{hayFiltros ? ' (filtrado)' : ''}
              </p>
              <p className="text-numeric-data text-charcoal-text">{totalGeneral.toFixed(2)} $</p>
            </div>
            <span className="material-symbols-outlined text-ios-green text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-body-md text-ios-gray text-center py-8">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-ios-gray">
            <span className="material-symbols-outlined text-[48px]">history</span>
            <p className="text-body-md">Sin trabajos cobrados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtrados.map((t) => {
              const diferencia = t.total_cobrado !== null
                ? Number(t.total_cobrado) - Number(t.total_calculado)
                : 0
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/trabajos/${t.id}`)}
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
                      {t.fecha_cobro && (
                        <p className="text-label-md text-ios-gray mt-1">
                          {new Date(t.fecha_cobro).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="bg-ios-green/10 text-ios-green text-label-md font-label-lg px-3 py-1 rounded-full">
                        Cobrado
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-outline-variant/20">
                    <div>
                      <span className="text-label-md text-ios-gray">Total cobrado</span>
                      <p className="text-numeric-data text-ios-green">
                        {Number(t.total_cobrado ?? t.total_calculado).toFixed(2)} $
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.total_cobrado !== null && diferencia !== 0 && (
                        <span className={`text-label-lg ${diferencia > 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                          {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} $
                        </span>
                      )}
                      <span className="material-symbols-outlined text-ios-gray group-active:translate-x-1 transition-transform">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
