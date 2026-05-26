import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Trabajo, LineaTrabajo, TipoMetro } from '../types'

export function useTrabajos(estado?: Trabajo['estado'] | Trabajo['estado'][]) {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const estadoKey = JSON.stringify(estado)

  const fetchTrabajos = useCallback(async () => {
    setLoading(true)
    const estadoParsed: typeof estado = estadoKey ? JSON.parse(estadoKey) : undefined
    let query = supabase.from('trabajo').select('*').order('created_at', { ascending: false })
    if (estadoParsed) {
      if (Array.isArray(estadoParsed)) query = query.in('estado', estadoParsed)
      else query = query.eq('estado', estadoParsed)
    }
    const { data, error } = await query
    if (error) setError(error.message)
    else setTrabajos(data ?? [])
    setLoading(false)
  }, [estadoKey])

  useEffect(() => { fetchTrabajos() }, [fetchTrabajos])

  const createTrabajo = async (descripcion: string, ubicacion: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('trabajo')
      .insert({ descripcion, ubicacion, user_id: user!.id })
      .select()
      .single()
    if (error) throw error
    await fetchTrabajos()
    return data as Trabajo
  }

  const updateEstado = async (
    id: string,
    nuevoEstado: Trabajo['estado'],
    extra?: { total_cobrado?: number; fecha_cobro?: string }
  ) => {
    const { error } = await supabase
      .from('trabajo')
      .update({ estado: nuevoEstado, ...extra })
      .eq('id', id)
    if (error) throw error
    await fetchTrabajos()
  }

  return { trabajos, loading, error, createTrabajo, updateEstado, refetch: fetchTrabajos }
}

export function useLineasTrabajo(trabajoId: string) {
  const [lineas, setLineas] = useState<LineaTrabajo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLineas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('linea_trabajo')
      .select('*')
      .eq('trabajo_id', trabajoId)
      .order('created_at')
    setLineas(data ?? [])
    setLoading(false)
  }, [trabajoId])

  useEffect(() => { fetchLineas() }, [fetchLineas])

  const addLinea = async (tipo: TipoMetro, metros: number) => {
    const subtotal = parseFloat((tipo.precio * metros).toFixed(2))
    const { error } = await supabase.from('linea_trabajo').insert({
      trabajo_id: trabajoId,
      tipo_metro_id: tipo.id,
      nombre_tipo: tipo.nombre,
      precio_unitario: tipo.precio,
      unidad: tipo.unidad,
      metros,
      subtotal,
    })
    if (error) throw error
    await fetchLineas()
    await recalcularTotal(trabajoId)
  }

  const deleteLinea = async (id: string) => {
    const { error } = await supabase.from('linea_trabajo').delete().eq('id', id)
    if (error) throw error
    await fetchLineas()
    await recalcularTotal(trabajoId)
  }

  return { lineas, loading, addLinea, deleteLinea, refetch: fetchLineas }
}

async function recalcularTotal(trabajoId: string) {
  const { data } = await supabase
    .from('linea_trabajo')
    .select('subtotal')
    .eq('trabajo_id', trabajoId)
  const total = (data ?? []).reduce((sum, l) => sum + Number(l.subtotal), 0)
  await supabase
    .from('trabajo')
    .update({ total_calculado: parseFloat(total.toFixed(2)) })
    .eq('id', trabajoId)
}
