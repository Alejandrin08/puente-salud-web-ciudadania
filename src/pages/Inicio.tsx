import { getInicio } from '../features/mapa/api'
import { ArcoProgreso } from '../features/progreso/ArcoProgreso'
import { useApi } from '../shared/api/useApi'
import { fechaLarga, hora } from '../shared/lib/formato'
import { navegar } from '../shared/lib/router'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Icono } from '../shared/ui/Icono'

/** Pantalla 2: dónde voy (arco) y qué sigue. Una sola acción principal. */
export function Inicio() {
  const { estado, reintentar } = useApi(getInicio)

  if (estado.tipo === 'cargando')
    return (
      <main className="pagina" id="contenido">
        <div className="noche noche--inicio" />
        <Cargando texto="Cargando tu recorrido…" />
      </main>
    )
  if (estado.tipo === 'error') {
    if (estado.error.estado === 409) navegar('/bienvenida', { reemplazar: true })
    return (
      <main className="pagina" id="contenido">
        <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
      </main>
    )
  }
  const d = estado.datos
  const sp = d.siguiente_paso
  return (
    <main className="pagina" id="contenido">
      <header className="noche noche--inicio noche--con-hoja">
        <img src="/logo.svg" alt="" width={44} height={44} className="noche__logo noche__logo--chico" />
        <h1 className="titulo-xl">Hola, {d.nombre}</h1>
        <p className="noche__sub">
          {d.completado ? 'Llegaste a tu meta. ¡Sigue así!' : `Vas en el paso ${d.paso_actual} de 4`}
        </p>
        <ArcoProgreso paso={d.paso_actual} completado={d.completado} />
      </header>
      <section className="hoja" aria-label="Tu siguiente paso">
        <h2 className="titulo-l">
          {sp.titulo}
        </h2>
        <p className="lead">{sp.texto}</p>
        {sp.cita && (
          <p className="cita">
            <Icono nombre="calendario" tam={22} />
            <span>
              <strong>{fechaLarga(sp.cita.fecha)}</strong>
              {sp.cita.hora && <> a las {hora(sp.cita.hora)}</>}
            </span>
          </p>
        )}
        <button type="button" className="boton boton--primario boton--ancho" onClick={() => navegar('/mapa')}>
          <Icono nombre="pin" />
          Ver mi centro en el mapa
        </button>
        <button type="button" className="boton boton--texto" onClick={() => navegar('/recorrido')}>
          Ver todo mi recorrido
          <Icono nombre="flecha" tam={20} />
        </button>
        <p className="pie-nota">
          <Simulado />
        </p>
      </section>
    </main>
  )
}
