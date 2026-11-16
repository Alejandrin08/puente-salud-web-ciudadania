import type { Evento } from '../../shared/api/tipos'
import { fechaCorta } from '../../shared/lib/formato'
import { Icono } from '../../shared/ui/Icono'

const ICONO: Record<Evento['estado'], string> = { hecho: 'check', pendiente: 'calendario', perdido: 'info' }
const LECTOR: Record<Evento['estado'], string> = { hecho: 'Hecho', pendiente: 'Pendiente', perdido: 'No asististe' }

/** Línea de tiempo: lo más reciente arriba. El estado se dice con ícono y texto, no solo color. */
export function LineaTiempo({ eventos }: { eventos: Evento[] }) {
  const orden = [...eventos].reverse()
  return (
    <ol className="tiempo">
      {orden.map((e, i) => (
        <li key={`${e.fecha}-${e.tipo}-${i}`} className={`tiempo__item tiempo__item--${e.estado}`}>
          <span className="tiempo__marca" aria-hidden="true">
            <Icono nombre={ICONO[e.estado]} tam={16} />
          </span>
          <div>
            <p className="tiempo__fecha">
              <time dateTime={e.fecha}>{fechaCorta(e.fecha)}</time>
              <span className="solo-lector">. {LECTOR[e.estado]}.</span>
            </p>
            <p className="tiempo__titulo">{e.titulo}</p>
            <p className="tiempo__detalle">{e.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
