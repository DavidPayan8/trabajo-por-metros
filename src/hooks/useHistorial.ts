import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Trabajo } from '../types'

export function useHistorial(filtro: string, desde: string, hasta: string) {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const fetch = async () => {
      setLoading(true)
      let query = supabase
        .from('trabajo')
        .select('*')
        .eq('estado', 'cobrado')
        .order('fecha_cobro', { ascending: false })

      const q = filtro.trim()
      if (q) {
        query = query.or(`descripcion.ilike.%${q}%,ubicacion.ilike.%${q}%`)
      }
      if (desde) {
        query = query.gte('fecha_cobro', desde)
      }
      if (hasta) {
        // hasta el final del día seleccionado
        query = query.lte('fecha_cobro', `${hasta}T23:59:59`)
      }

      const { data, error } = await query
      if (!error) setTrabajos(data ?? [])
      setLoading(false)
    }

    if (isFirstRun.current) {
      isFirstRun.current = false
      fetch()
    } else {
      debounceRef.current = setTimeout(fetch, 400)
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [filtro, desde, hasta])

  return { trabajos, loading }
}
