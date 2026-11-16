import { LineaTiempo } from '../features/recorrido/LineaTiempo'
import { api } from '../shared/api/client'
import type { Recorrido } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta } from '../shared/lib/formato'
import { navegar } from '../shared/lib/router'
import { Cargando, ErrorEstado, Simulado, Vacio } from '../shared/ui/Estados'
import { Icono } from '../shared/ui/Icono'

const getRecorrido = () => api<Recorrido>('/api/v1/persona/me/recorrido')

/** Pantalla 3: etapas con fecha y la etapa actual. */
export function MiRecorrido() {
  const { estado, reintentar } = useApi(getRecorrido)
  return (
    <main className="pagina" id="contenido">
      <header className="noche noche--compacta">
        <h1 className="titulo-l">Mi recorrido</h1>
      </header>
      <div className="contenido">
        {estado.tipo === 'cargando' && <Cargando />}
        {estado.tipo === 'error' &&
          (estado.error.estado === 409 ? (
            (navegar('/bienvenida', { reemplazar: true }), null)
          ) : (
            <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
          ))}
        {estado.tipo === 'listo' && (
          <>
            <ol className="etapas" aria-label="Tus cuatro pasos">
              {estado.datos.etapas.map((e) => {
                const actual = !e.completada && e.paso === estado.datos.paso_actual
                return (
                  <li
                    key={e.clave}
                    className={`etapa ${e.completada ? 'etapa--hecha' : actual ? 'etapa--actual' : 'etapa--pendiente'}`}
                    aria-current={actual ? 'step' : undefined}
                  >
                    <span className="etapa__num" aria-hidden="true">
                      {e.completada ? <Icono nombre="check" tam={18} /> : e.paso}
                    </span>
                    <div>
                      <p className="etapa__titulo">
                        {e.titulo}
                        <span className="etapa__estado">
                          {e.completada ? (e.fecha ? fechaCorta(e.fecha) : 'Hecho') : actual ? 'Estás aquí' : 'Pendiente'}
                        </span>
                      </p>
                      <p className="etapa__detalle">{e.detalle}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <h2 className="titulo-m">Lo que ha pasado</h2>
            {estado.datos.eventos.length ? <LineaTiempo eventos={estado.datos.eventos} /> : <Vacio>Aún no hay eventos.</Vacio>}
            <p className="pie-nota">
              <Simulado />
            </p>
          </>
        )}
      </div>
    </main>
  )
}
