import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useEstadisticas } from '../hooks/useEstadisticas'

function KpiCard({ label, value, sub, color = 'text-charcoal-text' }: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
      <span className="text-label-lg text-ios-gray uppercase tracking-wider">{label}</span>
      <span className={`text-numeric-data leading-tight ${color}`}>{value}</span>
      {sub && <span className="text-label-md text-ios-gray">{sub}</span>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black/10 rounded-xl px-3 py-2 shadow-lg text-label-lg">
      <p className="text-ios-gray mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={p.dataKey === 'cobrado' ? 'text-ios-green' : 'text-ios-blue'}>
          {p.dataKey === 'cobrado' ? 'Cobrado' : 'Calculado'}: {p.value.toFixed(2)} $
        </p>
      ))}
    </div>
  )
}

export function Estadisticas() {
  const { stats, loading } = useEstadisticas()

  return (
    <>
      <header className="sticky top-0 z-50 ios-blur bg-surface/80 border-b border-outline-variant/30 safe-pt">
        <div className="flex justify-between items-center px-margin-main h-touch-target-min">
          <h1 className="text-headline-md-mobile font-bold text-ios-blue">Estadísticas</h1>
        </div>
      </header>

      <div className="px-margin-main pt-section-gap pb-8 flex flex-col gap-section-gap">
        <h2 className="text-display text-charcoal-text leading-tight">Resumen</h2>

        {!loading && stats && stats.numPendientes > 0 && (
          <div className="bg-ios-orange/10 border border-ios-orange/20 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-label-lg text-ios-orange uppercase tracking-wider">Pendiente de cobro</p>
              <p className="text-numeric-data text-charcoal-text">{stats.totalPendiente.toFixed(2)} $</p>
              <p className="text-label-md text-ios-gray">
                {stats.numPendientes} trabajo{stats.numPendientes !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="material-symbols-outlined text-ios-orange text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_top
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-body-md text-ios-gray text-center py-12">Cargando...</p>
        ) : !stats || stats.numTrabajos === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-ios-gray">
            <span className="material-symbols-outlined text-[48px]">bar_chart</span>
            <p className="text-body-md">Sin datos cobrados aún.</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Total cobrado"
                value={`${stats.totalCobrado.toFixed(2)} $`}
                color="text-ios-green"
              />
              <KpiCard
                label="Trabajos"
                value={String(stats.numTrabajos)}
                sub="completados"
              />
              <KpiCard
                label="Ticket medio"
                value={`${stats.ticketMedio.toFixed(2)} $`}
                sub="por trabajo"
              />
              <KpiCard
                label="Desviación media"
                value={`${stats.desviacionMedia > 0 ? '+' : ''}${stats.desviacionMedia.toFixed(1)} %`}
                sub={stats.desviacionMedia >= 0 ? 'cobras de más' : 'cobras de menos'}
                color={stats.desviacionMedia >= 0 ? 'text-ios-green' : 'text-ios-red'}
              />
              {stats.diasMediosCobro !== null && (
                <KpiCard
                  label="Tiempo medio cobro"
                  value={`${stats.diasMediosCobro} días`}
                  sub="desde ejecución"
                />
              )}
            </div>

            {/* Cobros por mes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-label-lg text-ios-gray uppercase tracking-wider px-1">
                Cobrado por mes
              </h3>
              <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.porMes} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 10, fill: '#8E8E93' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#8E8E93' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}$`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F2F2F7' }} />
                    <Bar dataKey="cobrado" fill="#34C759" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Presupuesto vs Cobrado por mes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-label-lg text-ios-gray uppercase tracking-wider px-1">
                Presupuesto vs Cobrado
              </h3>
              <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-ios-blue inline-block" />
                    <span className="text-label-md text-ios-gray">Calculado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-ios-green inline-block" />
                    <span className="text-label-md text-ios-gray">Cobrado</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.porMes} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="25%" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 10, fill: '#8E8E93' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#8E8E93' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}$`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F2F2F7' }} />
                    <Bar dataKey="calculado" fill="#007AFF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cobrado" fill="#34C759" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Desviación total */}
            <div className="bg-surface-grouped border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
              <h3 className="text-label-lg text-ios-gray uppercase tracking-wider">Global</h3>
              <div className="flex justify-between text-body-md">
                <span className="text-ios-gray">Total presupuestado</span>
                <span className="text-charcoal-text font-semibold">{stats.totalCalculado.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-ios-gray">Total cobrado</span>
                <span className="text-ios-green font-semibold">{stats.totalCobrado.toFixed(2)} $</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-2 flex justify-between text-body-md">
                <span className="text-ios-gray">Diferencia global</span>
                {(() => {
                  const diff = stats.totalCobrado - stats.totalCalculado
                  return (
                    <span className={`font-semibold ${diff >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)} $
                    </span>
                  )
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
