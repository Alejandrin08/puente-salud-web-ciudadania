import { api } from '../../shared/api/client'
import { guardarSesion, sesionActual, type Sesion } from '../../shared/api/sesion'

type Respuesta = Sesion & { rol: string }

export async function acceder(folio: string, codigo: string): Promise<Sesion> {
  const r = await api<Respuesta>('/api/v1/persona/acceso', {
    method: 'POST',
    json: { folio: folio.trim().toUpperCase(), codigo: codigo.trim() },
  })
  const s: Sesion = {
    token: r.token,
    expira: r.expira,
    folio: r.folio,
    nombre: r.nombre,
    consentimiento: r.consentimiento,
    curp_simulada: r.curp_simulada,
  }
  guardarSesion(s)
  return s
}

export async function consentir(aceptado: boolean): Promise<void> {
  await api('/api/v1/persona/consentimiento', { method: 'POST', json: { aceptado } })
  const s = sesionActual()
  if (s) guardarSesion({ ...s, consentimiento: aceptado })
}
