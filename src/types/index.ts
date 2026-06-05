export type Unidad = 'metros' | 'pies'

export interface TipoMetro {
  id: string
  user_id: string
  nombre: string
  precio: number
  unidad: Unidad
  created_at: string
}

export interface Trabajo {
  id: string
  user_id: string
  descripcion: string
  ubicacion: string
  estado: 'abierto' | 'pendiente_cobro' | 'cobrado'
  total_calculado: number
  total_cobrado: number | null
  notas: string | null
  fecha_ejecucion: string
  fecha_inicio: string
  fecha_cobro: string | null
  created_at: string
}

export interface LineaTrabajo {
  id: string
  trabajo_id: string
  tipo_metro_id: string
  nombre_tipo: string
  precio_unitario: number
  unidad: Unidad
  metros: number
  subtotal: number
  created_at: string
}
