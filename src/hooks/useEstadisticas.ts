import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Trabajo } from '../types'

export interface MesData {
  mes: string
  cobrado: number
  calculado: number
}

export interface Estadisticas {
  totalCobrado: number
  totalCalculado: number
  numTrabajos: number
  ticketMedio: number
  desviacionMedia: number
  diasMediosCobro: number | null
  totalPendiente: number
  numPendientes: number
  porMes: MesData[]
}

export function useEstadisticas() {
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)

      const [{ data: pendientesData }, { data }] = await Promise.all([
        supabase.from('trabajo').select('total_calculado').eq('estado', 'pendiente_cobro'),
        supabase
          .from('trabajo')
          .select('total_cobrado, total_calculado, fecha_cobro, fecha_ejecucion')
          .eq('estado', 'cobrado')
          .not('total_cobrado', 'is', null)
          .order('fecha_cobro', { ascending: true }),
      ])

      const totalPendiente = (pendientesData ?? []).reduce((s, t) => s + Number(t.total_calculado), 0)
      const numPendientes = (pendientesData ?? []).length

      if (!data || data.length === 0) {
        setStats({
          totalCobrado: 0, totalCalculado: 0, numTrabajos: 0, ticketMedio: 0,
          desviacionMedia: 0, diasMediosCobro: null, totalPendiente, numPendientes, porMes: [],
        })
        setLoading(false)
        return
      }

      const trabajos = data as Pick<Trabajo, 'total_cobrado' | 'total_calculado' | 'fecha_cobro' | 'fecha_ejecucion'>[]

      const totalCobrado = trabajos.reduce((s, t) => s + Number(t.total_cobrado), 0)
      const totalCalculado = trabajos.reduce((s, t) => s + Number(t.total_calculado), 0)
      const numTrabajos = trabajos.length
      const ticketMedio = totalCobrado / numTrabajos

      const desviaciones = trabajos
        .filter((t) => Number(t.total_calculado) > 0)
        .map((t) => ((Number(t.total_cobrado) - Number(t.total_calculado)) / Number(t.total_calculado)) * 100)
      const desviacionMedia = desviaciones.length > 0
        ? desviaciones.reduce((s, d) => s + d, 0) / desviaciones.length
        : 0

      // Últimos 12 meses
      const now = new Date()
      const porMes: MesData[] = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        const delMes = trabajos.filter((t) => t.fecha_cobro?.startsWith(key))
        porMes.push({
          mes: label,
          cobrado: parseFloat(delMes.reduce((s, t) => s + Number(t.total_cobrado), 0).toFixed(2)),
          calculado: parseFloat(delMes.reduce((s, t) => s + Number(t.total_calculado), 0).toFixed(2)),
        })
      }

      const diasList = trabajos
        .filter((t) => t.fecha_cobro && t.fecha_ejecucion)
        .map((t) => Math.round(
          (new Date(t.fecha_cobro!).getTime() - new Date(t.fecha_ejecucion + 'T00:00:00').getTime()) / 86400000
        ))
      const diasMediosCobro = diasList.length > 0
        ? Math.round(diasList.reduce((s, d) => s + d, 0) / diasList.length)
        : null

      setStats({
        totalCobrado, totalCalculado, numTrabajos, ticketMedio, desviacionMedia,
        diasMediosCobro, totalPendiente, numPendientes, porMes,
      })
      setLoading(false)
    }

    fetch()
  }, [])

  return { stats, loading }
}
