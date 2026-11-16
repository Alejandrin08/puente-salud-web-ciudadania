export type Sesion = {
  token: string
  expira: number
  folio: string
  nombre: string
  consentimiento: boolean | null
  curp_simulada: string | null
}

const CLAVE = 'puente-salud:sesion'

/** Se guarda en sessionStorage: al cerrar la pestaña en un teléfono compartido, la sesión termina. */
export function leerSesion(): Sesion | null {
  try {
    const raw = window.sessionStorage.getItem(CLAVE)
    if (!raw) return null
    const s = JSON.parse(raw) as Sesion
    if (s.expira * 1000 < Date.now()) {
      borrarSesion()
      return null
    }
    return s
  } catch {
    return null
  }
}

export function guardarSesion(s: Sesion) {
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(s))
  } catch {
    /* almacenamiento bloqueado: la sesión vive solo en memoria */
  }
  memoria = s
}

export function borrarSesion() {
  try {
    window.sessionStorage.removeItem(CLAVE)
  } catch {
    /* sin almacenamiento */
  }
  memoria = null
}

let memoria: Sesion | null = null

export function sesionActual(): Sesion | null {
  return leerSesion() ?? memoria
}
