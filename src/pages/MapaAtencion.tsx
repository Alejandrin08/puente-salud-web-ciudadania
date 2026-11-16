import { useMemo, useState } from 'react'
import { getFerias, getUnidades } from '../features/mapa/api'
import { TarjetaFeria, TarjetaUnidad } from '../features/mapa/ListaLugares'
import { useOrigen } from '../features/mapa/useOrigen'
import { useApi } from '../shared/api/useApi'
import { nombrePropio } from '../shared/lib/formato'
import { Cargando, ErrorEstado, Simulado, Vacio } from '../shared/ui/Estados'
import { Mapa, type Punto } from '../shared/ui/Mapa'

type Vista = 'centros' | 'ferias'

/** Pantalla 4: centros de salud y ferias cercanos. El mapa siempre va con su lista. */
export function MapaAtencion() {
  const origen = useOrigen()
  const [vista, setVista] = useState<Vista>('centros')
  const [sel, setSel] = useState<string | null>(null)
  const { estado, reintentar } = useApi(
    () =>
      origen.listo
        ? Promise.all([getUnidades('folios', origen), getFerias(origen)])
        : new Promise<never>(() => {}),
    [origen.listo, origen.lat, origen.lon],
  )

  const puntos = useMemo<Punto[]>(() => {
    if (estado.tipo !== 'listo') return []
    const [unidades, ferias] = estado.datos
    const ps: Punto[] =
      vista === 'centros'
        ? unidades.map((u) => ({
            id: u.clues,
            lat: u.lat,
            lon: u.lon,
            etiqueta: nombrePropio(u.nombre) + (u.clues === origen.clues ? ' (tu centro de salud)' : ''),
            tipo: u.clues === origen.clues ? 'mia' : 'unidad',
          }))
        : ferias.map((f) => ({ id: `f${f.id}`, lat: f.lat, lon: f.lon, etiqueta: `${f.lugar}, ${f.fecha}`, tipo: 'feria' }))
    if (origen.lat != null && origen.lon != null)
      ps.push({ id: 'zona', lat: origen.lat, lon: origen.lon, etiqueta: 'Tu zona', tipo: 'zona' })
    return ps
  }, [estado, vista, origen])

  return (
    <main className="pagina" id="contenido">
      <header className="noche noche--compacta">
        <h1 className="titulo-l">Dónde atenderte</h1>
        <div className="segmentado" role="group" aria-label="Qué quieres ver">
          {(['centros', 'ferias'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => {
                setVista(v)
                setSel(null)
              }}
            >
              {v === 'centros' ? 'Centros de salud' : 'Ferias de salud'}
            </button>
          ))}
        </div>
      </header>
      <div className="contenido contenido--mapa">
        {estado.tipo === 'cargando' && <Cargando texto="Buscando lugares cercanos…" />}
        {estado.tipo === 'error' && <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && (
          <>
            <Mapa
              puntos={puntos}
              seleccionado={sel}
              onSeleccionar={setSel}
              etiqueta={vista === 'centros' ? 'Mapa de centros de salud' : 'Mapa de ferias de salud'}
            />
            <p className="nota nota--compacta">
              <Simulado texto="Ubicación aproximada y horarios simulados" />
              {origen.lat == null && ' Entra con tu folio para ordenar por cercanía.'}
            </p>
            <h2 className="solo-lector">Lista de lugares</h2>
            <div className="lugares">
              {vista === 'centros' &&
                (() => {
                  const us = [...estado.datos[0]].sort((a, b) => Number(b.clues === origen.clues) - Number(a.clues === origen.clues))
                  return us.slice(0, 8).map((u) => (
                    <TarjetaUnidad key={u.clues} u={u} esMia={u.clues === origen.clues} activa={sel === u.clues} onVer={() => setSel(u.clues)} />
                  ))
                })()}
              {vista === 'ferias' &&
                (estado.datos[1].length ? (
                  estado.datos[1].slice(0, 8).map((f) => (
                    <TarjetaFeria key={f.id} f={f} activa={sel === `f${f.id}`} onVer={() => setSel(`f${f.id}`)} />
                  ))
                ) : (
                  <Vacio>No hay ferias programadas por ahora.</Vacio>
                ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
