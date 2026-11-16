import { borrarSesion, guardarSesion, sesionActual } from './sesion'

const base = { token: 't', folio: 'PS1', nombre: 'Rosa', consentimiento: true, curp_simulada: null }

describe('sesión', () => {
  afterEach(() => borrarSesion())
  it('guarda y lee la sesión vigente', () => {
    guardarSesion({ ...base, expira: Date.now() / 1000 + 60 })
    expect(sesionActual()?.nombre).toBe('Rosa')
  })
  it('descarta una sesión vencida', () => {
    window.sessionStorage.setItem('puente-salud:sesion', JSON.stringify({ ...base, expira: 1 }))
    expect(sesionActual()).toBeNull()
  })
})
