export type Cita = { fecha: string; hora: string | null; tipo: string; estado: string }

export type Etapa = { paso: number; clave: string; titulo: string; completada: boolean; fecha: string | null; detalle: string }

export type Inicio = {
  folio: string
  nombre: string
  paso_actual: number
  completado: boolean
  etapas: Etapa[]
  siguiente_paso: { titulo: string; texto: string; cita: Cita | null }
  unidad: { clues: string; nombre: string; lat: number | null; lon: number | null }
  zona: { lat: number | null; lon: number | null }
  simulated: boolean
}

export type Evento = { fecha: string; tipo: string; titulo: string; detalle: string; estado: 'hecho' | 'pendiente' | 'perdido' }

export type Recorrido = { folio: string; paso_actual: number; etapas: Etapa[]; eventos: Evento[]; simulated: boolean }

export type Unidad = {
  clues: string
  nombre: string
  institucion: string
  tipo: string | null
  publica: boolean
  urgencias: boolean
  asigna_folios: boolean
  lat: number
  lon: number
  horario: string | null
  servicios: string[]
  distancia_km: number | null
  ubicacion_simulada: boolean
}

export type Feria = {
  id: number
  nombre: string
  programa: string
  fecha: string
  horario: string
  lugar: string
  lat: number
  lon: number
  servicios: string[]
  distancia_km: number | null
}
