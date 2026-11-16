import { api } from '../../shared/api/client'
import type { Feria, Inicio, Unidad } from '../../shared/api/tipos'

type Origen = { lat: number | null; lon: number | null } | null

function q(origen: Origen, extra: Record<string, string> = {}) {
  const p = new URLSearchParams(extra)
  if (origen?.lat != null && origen?.lon != null) {
    p.set('lat', String(origen.lat))
    p.set('lon', String(origen.lon))
  }
  return p.toString()
}

export const getUnidades = (tipo: 'folios' | 'urgencias' | 'todas', origen: Origen) =>
  api<Unidad[]>(`/api/v1/unidades?${q(origen, { tipo })}`)

export const getFerias = (origen: Origen) => api<Feria[]>(`/api/v1/ferias?${q(origen)}`)

export const getInicio = () => api<Inicio>('/api/v1/persona/me')
