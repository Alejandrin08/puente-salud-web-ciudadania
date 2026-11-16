import { SIGNOS } from '../features/alarma/signos'
import { getUnidades } from '../features/mapa/api'
import { useOrigen } from '../features/mapa/useOrigen'
import { useApi } from '../shared/api/useApi'
import { distancia, nombrePropio } from '../shared/lib/formato'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Icono } from '../shared/ui/Icono'

/** Pantalla 5: el 911 primero. Esta app no es un canal de urgencias. */
export function Alarma() {
  const origen = useOrigen()
  const { estado, reintentar } = useApi(
    () => (origen.listo ? getUnidades('urgencias', origen) : new Promise<never>(() => {})),
    [origen.listo, origen.lat],
  )
  return (
    <main className="pagina" id="contenido">
      <header className="alarma">
        <h1 className="titulo-l">¿Es una emergencia?</h1>
        <a className="boton boton--911" href="tel:911">
          <Icono nombre="telefono" tam={28} />
          Llamar al 911
        </a>
        <p className="alarma__nota">Esta app no atiende urgencias. Si tienes alguna de estas señales, llama ya o pide que te lleven a urgencias.</p>
      </header>
      <div className="contenido">
        <h2 className="titulo-m">Señales de alarma</h2>
        <ul className="signos">
          {SIGNOS.map((s) => (
            <li key={s.titulo}>
              <Icono nombre="alarma" tam={22} />
              <div>
                <p className="signos__titulo">{s.titulo}</p>
                <p className="signos__detalle">{s.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
        <h2 className="titulo-m">Urgencias más cercanas</h2>
        {estado.tipo === 'cargando' && <Cargando />}
        {estado.tipo === 'error' && <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && (
          <ul className="urgencias">
            {estado.datos.slice(0, 4).map((u) => (
              <li key={u.clues}>
                <Icono nombre="hospital" tam={22} />
                <div>
                  <p className="signos__titulo">{nombrePropio(u.nombre)}</p>
                  <p className="signos__detalle">
                    {u.horario}
                    {u.distancia_km != null && <span className="tabular"> · {distancia(u.distancia_km)}</span>}
                    {!u.publica && ' · Privado'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="pie-nota">
          <Simulado texto="Horario y ubicación simulados. Orientación general: no sustituye la valoración médica." />
        </p>
      </div>
    </main>
  )
}
