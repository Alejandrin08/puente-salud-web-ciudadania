import { useState } from 'react'
import { Consentimiento } from '../features/acceso/Consentimiento'
import { FormAcceso } from '../features/acceso/FormAcceso'
import { borrarSesion, sesionActual, type Sesion } from '../shared/api/sesion'
import { navegar } from '../shared/lib/router'
import { Simulado } from '../shared/ui/Estados'

/** Pantalla 1: bienvenida, acceso con folio y código de demostración, y consentimiento. */
export function Bienvenida() {
  const [sesion, setSesion] = useState<Sesion | null>(() => sesionActual())
  const [rechazo, setRechazo] = useState(false)
  const paso = !sesion ? 'acceso' : rechazo ? 'rechazo' : 'consentimiento'

  return (
    <main className="pagina pagina--bienvenida" id="contenido">
      <header className="noche noche--bienvenida noche--con-hoja">
        <img src="/logo.svg" alt="" width={56} height={56} className="noche__logo" />
        <h1 className="titulo-xl">{paso === 'acceso' ? 'Tu atención, paso a paso' : `Hola, ${sesion?.nombre}`}</h1>
        <p className="noche__sub">
          {paso === 'acceso'
            ? 'Entra con el folio que te dio tu programa de salud.'
            : paso === 'consentimiento'
              ? 'Antes de empezar, confirma si aceptas compartir tus datos.'
              : 'Respetamos tu decisión.'}
        </p>
      </header>
      <section className="hoja" aria-labelledby="titulo-hoja">
        <h2 id="titulo-hoja" className="solo-lector">
          {paso === 'acceso' ? 'Entrar' : 'Uso de tus datos'}
        </h2>
        {paso === 'acceso' && (
          <FormAcceso
            onListo={(s) => {
              setSesion(s)
              if (s.consentimiento) navegar('/', { reemplazar: true })
            }}
          />
        )}
        {paso === 'consentimiento' && sesion && (
          <Consentimiento
            sesion={sesion}
            onListo={(ok) => (ok ? navegar('/', { reemplazar: true }) : setRechazo(true))}
          />
        )}
        {paso === 'rechazo' && (
          <div className="consentimiento">
            <p className="lead">Sin tu permiso no podemos mostrarte tu recorrido, pero puedes ver los centros de salud cercanos y las señales de alarma.</p>
            <div className="acciones">
              <button type="button" className="boton boton--primario boton--ancho" onClick={() => setRechazo(false)}>
                Cambiar mi decisión
              </button>
              <button type="button" className="boton boton--secundario boton--ancho" onClick={() => navegar('/mapa')}>
                Ver centros de salud
              </button>
              <button
                type="button"
                className="boton boton--texto"
                onClick={() => {
                  borrarSesion()
                  setSesion(null)
                  setRechazo(false)
                }}
              >
                Salir
              </button>
            </div>
          </div>
        )}
        <p className="pie-nota">
          <Simulado texto="Prototipo con datos simulados: usa solo el folio de prueba." />
        </p>
      </section>
    </main>
  )
}
