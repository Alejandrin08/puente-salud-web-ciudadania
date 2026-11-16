import { useEffect, useState } from 'react'
import { sesionActual } from '../../shared/api/sesion'
import type { Inicio } from '../../shared/api/tipos'
import { getInicio } from './api'

export type Origen = { lat: number | null; lon: number | null; clues: string | null; listo: boolean }

/**
 * Punto de referencia para «cercanos»: el centro de la zona (AGEB) de la persona si inició sesión.
 * No pide la ubicación del teléfono ni usa el domicilio exacto.
 */
export function useOrigen(): Origen {
  const [o, setO] = useState<Origen>({ lat: null, lon: null, clues: null, listo: !sesionActual() })
  useEffect(() => {
    const s = sesionActual()
    if (!s || !s.consentimiento) {
      setO((x) => ({ ...x, listo: true }))
      return
    }
    getInicio()
      .then((i: Inicio) => setO({ lat: i.zona.lat, lon: i.zona.lon, clues: i.unidad.clues, listo: true }))
      .catch(() => setO((x) => ({ ...x, listo: true })))
  }, [])
  return o
}
