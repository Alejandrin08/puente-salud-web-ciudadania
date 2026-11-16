import { distancia, fechaLarga, nombrePropio } from '../../shared/lib/formato'
import type { Feria, Unidad } from '../../shared/api/tipos'
import { Icono } from '../../shared/ui/Icono'

export function TarjetaUnidad({
  u,
  esMia,
  activa,
  onVer,
}: {
  u: Unidad
  esMia?: boolean
  activa?: boolean
  onVer?: () => void
}) {
  return (
    <article className={`lugar${activa ? ' lugar--activo' : ''}`} aria-current={activa ? 'true' : undefined}>
      <header className="lugar__cabeza">
        <h3>{nombrePropio(u.nombre)}</h3>
        {u.distancia_km != null && <span className="lugar__distancia tabular">{distancia(u.distancia_km)}</span>}
      </header>
      {esMia && <p className="lugar__mia">Tu centro de salud</p>}
      <p className="lugar__dato">
        <Icono nombre="reloj" tam={18} />
        {u.horario ?? 'Horario no disponible'}
      </p>
      <p className="lugar__servicios">{u.servicios.join(' · ')}</p>
      {onVer && (
        <button type="button" className="boton boton--texto" onClick={onVer}>
          <Icono nombre="pin" tam={18} />
          Ver en el mapa
        </button>
      )}
    </article>
  )
}

export function TarjetaFeria({ f, activa, onVer }: { f: Feria; activa?: boolean; onVer?: () => void }) {
  return (
    <article className={`lugar${activa ? ' lugar--activo' : ''}`}>
      <header className="lugar__cabeza">
        <h3>{f.lugar}</h3>
        {f.distancia_km != null && <span className="lugar__distancia tabular">{distancia(f.distancia_km)}</span>}
      </header>
      <p className="lugar__dato">
        <Icono nombre="calendario" tam={18} />
        <span>
          {fechaLarga(f.fecha)}, {f.horario}
        </span>
      </p>
      <p className="lugar__servicios">
        {f.programa}: {f.servicios.join(' · ')}
      </p>
      {onVer && (
        <button type="button" className="boton boton--texto" onClick={onVer}>
          <Icono nombre="pin" tam={18} />
          Ver en el mapa
        </button>
      )}
    </article>
  )
}
