import { lazy, Suspense, useEffect, useState } from 'react'
import { Alarma } from './pages/Alarma'
import { Bienvenida } from './pages/Bienvenida'
import { Inicio } from './pages/Inicio'
import { MiRecorrido } from './pages/MiRecorrido'
import { borrarSesion, sesionActual } from './shared/api/sesion'
import { navegar, useRuta } from './shared/lib/router'
import { Cargando } from './shared/ui/Estados'
import { Icono } from './shared/ui/Icono'

// MapLibre pesa: el mapa se carga solo cuando se abre
const MapaAtencion = lazy(() => import('./pages/MapaAtencion').then((m) => ({ default: m.MapaAtencion })))

const PRIVADAS = new Set(['/', '/recorrido'])
const NAV = [
  { ruta: '/', texto: 'Inicio', icono: 'inicio', privada: true },
  { ruta: '/recorrido', texto: 'Recorrido', icono: 'recorrido', privada: true },
  { ruta: '/mapa', texto: 'Mapa', icono: 'mapa', privada: false },
  { ruta: '/alarma', texto: 'Alarma', icono: 'alarma', privada: false },
]
const TAMANOS = ['100%', '112.5%', '125%']

function useTamanoTexto(): [number, () => void] {
  const [i, setI] = useState(() => {
    try {
      return Number(window.localStorage.getItem('puente-salud:texto') ?? 0) % TAMANOS.length
    } catch {
      return 0
    }
  })
  useEffect(() => {
    document.documentElement.style.fontSize = TAMANOS[i]
    try {
      window.localStorage.setItem('puente-salud:texto', String(i))
    } catch {
      /* preferencia solo en memoria */
    }
  }, [i])
  return [i, () => setI((x) => (x + 1) % TAMANOS.length)]
}

export default function App() {
  const ruta = useRuta()
  const sesion = sesionActual()
  const [tamano, cambiarTamano] = useTamanoTexto()
  const necesitaEntrar = PRIVADAS.has(ruta) && (!sesion || !sesion.consentimiento)

  useEffect(() => {
    if (necesitaEntrar) navegar('/bienvenida', { reemplazar: true })
  }, [necesitaEntrar])

  useEffect(() => {
    const titulos: Record<string, string> = {
      '/': 'Inicio', '/recorrido': 'Mi recorrido', '/mapa': 'Dónde atenderte', '/alarma': 'Señales de alarma', '/bienvenida': 'Bienvenida',
    }
    document.title = `${titulos[ruta] ?? 'Inicio'} · Puente Salud`
  }, [ruta])

  let pagina
  if (ruta === '/bienvenida' || necesitaEntrar) pagina = <Bienvenida />
  else if (ruta === '/recorrido') pagina = <MiRecorrido />
  else if (ruta === '/mapa')
    pagina = (
      <Suspense fallback={<Cargando texto="Cargando el mapa…" />}>
        <MapaAtencion />
      </Suspense>
    )
  else if (ruta === '/alarma') pagina = <Alarma />
  else pagina = <Inicio />

  const conSesion = !!sesion?.consentimiento
  const enBienvenida = ruta === '/bienvenida' || necesitaEntrar

  return (
    <div className="app">
      <a href="#contenido" className="saltar">
        Ir al contenido
      </a>
      <div className="utilidades">
        <button type="button" className="chip-util" onClick={cambiarTamano} aria-label={`Tamaño de letra: ${['normal', 'grande', 'muy grande'][tamano]}. Cambiar`}>
          <Icono nombre="texto" tam={20} />
          <span aria-hidden="true">{['A', 'A+', 'A++'][tamano]}</span>
        </button>
        {conSesion && !enBienvenida && (
          <button
            type="button"
            className="chip-util"
            onClick={() => {
              borrarSesion()
              navegar('/bienvenida', { reemplazar: true })
            }}
          >
            <Icono nombre="salir" tam={20} />
            Salir
          </button>
        )}
      </div>
      {pagina}
      {!enBienvenida ? (
        <nav className="nav-inferior" aria-label="Secciones">
          {NAV.filter((n) => conSesion || !n.privada).map((n) => (
            <a
              key={n.ruta}
              href={n.ruta}
              className={`nav-inferior__item${n.icono === 'alarma' ? ' nav-inferior__item--alarma' : ''}`}
              aria-current={ruta === n.ruta ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                navegar(n.ruta)
              }}
            >
              <Icono nombre={n.icono} />
              <span>{n.texto}</span>
            </a>
          ))}
          {!conSesion && (
            <a
              href="/bienvenida"
              className="nav-inferior__item"
              onClick={(e) => {
                e.preventDefault()
                navegar('/bienvenida')
              }}
            >
              <Icono nombre="inicio" />
              <span>Entrar</span>
            </a>
          )}
        </nav>
      ) : null}
    </div>
  )
}
