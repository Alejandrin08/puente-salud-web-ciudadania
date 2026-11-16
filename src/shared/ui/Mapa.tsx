import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapaML, type Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export type Punto = {
  id: string
  lat: number
  lon: number
  etiqueta: string
  tipo: 'unidad' | 'mia' | 'feria' | 'urgencias' | 'zona'
}

const ESTILO = (import.meta.env.VITE_MAP_STYLE as string | undefined) ?? 'https://tiles.openfreemap.org/styles/positron'
const CENTRO_TLAQUEPAQUE: [number, number] = [-103.32, 20.6]

/** Respaldo si el mapa base no carga: fondo liso; los puntos y la lista siguen funcionando. */
function estiloLiso(): maplibregl.StyleSpecification {
  const fondo = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-2').trim()
  return { version: 8, sources: {}, layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': fondo || 'white' } }] }
}

/**
 * Mapa de puntos. Siempre se acompaña de una lista: es la vía accesible (teclado y lector) para cada punto.
 */
export function Mapa({
  puntos,
  seleccionado,
  onSeleccionar,
  etiqueta,
}: {
  puntos: Punto[]
  seleccionado?: string | null
  onSeleccionar?: (id: string) => void
  etiqueta: string
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<MapaML | null>(null)
  const marcadores = useRef<Map<string, Marker>>(new Map())
  const puntosRef = useRef(puntos)
  puntosRef.current = puntos

  function encuadrar() {
    const m = mapa.current
    const ps = puntosRef.current
    if (!m || !ps.length) return
    if (ps.length === 1) return m.jumpTo({ center: [ps[0].lon, ps[0].lat], zoom: 14 })
    const b = new maplibregl.LngLatBounds()
    ps.forEach((p) => b.extend([p.lon, p.lat]))
    m.fitBounds(b, { padding: 48, maxZoom: 15, duration: 0 })
  }

  useEffect(() => {
    if (!contenedor.current) return
    let m: MapaML
    try {
      m = new maplibregl.Map({
        container: contenedor.current,
        style: ESTILO,
        center: CENTRO_TLAQUEPAQUE,
        zoom: 12,
        attributionControl: { compact: true, customAttribution: '© OpenStreetMap · OpenFreeMap' },
        cooperativeGestures: true,
      })
    } catch {
      return // sin WebGL: la lista sigue disponible
    }
    mapa.current = m
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    let respaldo = false
    m.on('error', (e) => {
      if (!respaldo && !m.isStyleLoaded() && String(e.error?.message ?? '').match(/style|fetch|load/i)) {
        respaldo = true
        m.setStyle(estiloLiso())
      }
    })
    m.once('load', () => {
      m.getContainer().querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show')
      m.resize()
      encuadrar()
    })
    // El contenedor puede cambiar de tamaño después de crear el mapa (carga diferida, giro del teléfono)
    const ro = new ResizeObserver(() => m.resize())
    ro.observe(contenedor.current)
    m.once('remove', () => ro.disconnect())
    return () => {
      m.remove()
      mapa.current = null
      marcadores.current.clear()
    }
  }, [])

  useEffect(() => {
    const m = mapa.current
    if (!m) return
    marcadores.current.forEach((mk) => mk.remove())
    marcadores.current.clear()
    const limites = new maplibregl.LngLatBounds()
    for (const p of puntos) {
      // Indicador visual: la lista de al lado es el control equivalente accesible (WCAG 2.5.8, excepción «equivalente»)
      const el = document.createElement('div')
      el.className = `marcador marcador--${p.tipo}`
      el.setAttribute('aria-hidden', 'true')
      el.title = p.etiqueta
      if (p.tipo !== 'zona') el.addEventListener('click', () => onSeleccionar?.(p.id))
      const mk = new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(m)
      marcadores.current.set(p.id, mk)
      limites.extend([p.lon, p.lat])
    }
    if (!limites.isEmpty()) encuadrar()
  }, [puntos, onSeleccionar])

  useEffect(() => {
    marcadores.current.forEach((mk, id) => mk.getElement().classList.toggle('marcador--activo', id === seleccionado))
    const sel = seleccionado ? puntos.find((p) => p.id === seleccionado) : null
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (sel && mapa.current) mapa.current.easeTo({ center: [sel.lon, sel.lat], duration: reducir ? 0 : 400 })
  }, [seleccionado, puntos])

  return <div ref={contenedor} className="mapa" role="region" aria-label={etiqueta} />
}
