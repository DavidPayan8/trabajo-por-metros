import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TipoMetro, Unidad } from '../types'

export function useTipos() {
  const [tipos, setTipos] = useState<TipoMetro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTipos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tipo_metro')
      .select('*')
      .order('nombre')
    if (error) setError(error.message)
    else setTipos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTipos() }, [fetchTipos])

  const createTipo = async (nombre: string, precio: number, unidad: Unidad) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('tipo_metro').insert({ nombre, precio, unidad, user_id: user!.id })
    if (error) throw error
    await fetchTipos()
  }

  const updateTipo = async (id: string, nombre: string, precio: number, unidad: Unidad) => {
    const { error } = await supabase
      .from('tipo_metro')
      .update({ nombre, precio, unidad })
      .eq('id', id)
    if (error) throw error
    await fetchTipos()
  }

  const deleteTipo = async (id: string) => {
    const { error } = await supabase.from('tipo_metro').delete().eq('id', id)
    if (error) throw error
    await fetchTipos()
  }

  return { tipos, loading, error, createTipo, updateTipo, deleteTipo }
}
