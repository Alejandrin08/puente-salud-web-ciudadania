/**
 * Barra de progreso en arco: la forma del logo convertida en los 4 pasos del recorrido.
 * El estado nunca depende solo del color: palomita, número y texto (también para lector de pantalla).
 */
export const PASOS = ['Te detectaron', 'Confirmar', 'Tratamiento', 'En control'] as const

const W = 340
const H = 210
const CX = W / 2
const CY = 176
const RX = 136
const RY = 124

function punto(t: number): [number, number] {
  const a = Math.PI - t * Math.PI
  return [CX + RX * Math.cos(a), CY - RY * Math.sin(a)]
}

function tramo(t0: number, t1: number): string {
  const [x0, y0] = punto(t0)
  const [x1, y1] = punto(t1)
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${RX} ${RY} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

type EstadoPaso = 'hecho' | 'actual' | 'pendiente'

export function estadoDePaso(i: number, paso: number, completado: boolean): EstadoPaso {
  const n = i + 1
  if (completado || n < paso) return 'hecho'
  return n === paso ? 'actual' : 'pendiente'
}

// Dónde va cada etiqueta respecto a su círculo
const ETIQUETAS: { dx: number; dy: number; ancla: 'start' | 'middle' | 'end' }[] = [
  { dx: 26, dy: -4, ancla: 'start' },
  { dx: 30, dy: 6, ancla: 'start' },
  { dx: -4, dy: -34, ancla: 'middle' },
  { dx: -26, dy: -4, ancla: 'end' },
]

export function ArcoProgreso({ paso, completado = false }: { paso: number; completado?: boolean }) {
  const p = Math.min(Math.max(paso, 1), 4)
  const ts = [0, 1 / 3, 2 / 3, 1]
  const avance = completado ? 1 : ts[p - 1]
  const resumen = completado ? 'Completaste los 4 pasos: En control' : `Paso ${p} de 4: ${PASOS[p - 1]}`

  return (
    <figure className="arco" aria-label={resumen}>
      <svg viewBox={`0 0 ${W} ${H}`} className="arco__svg" aria-hidden="true" focusable="false">
        <path d={tramo(0, 1)} className="arco__base" />
        {avance > 0 && <path d={tramo(0, avance)} className="arco__avance" pathLength={1} />}
        {PASOS.map((nombre, i) => {
          const [x, y] = punto(ts[i])
          const e = estadoDePaso(i, p, completado)
          const et = ETIQUETAS[i]
          const lineas = nombre === 'Te detectaron' ? ['Te', 'detectaron'] : [nombre]
          return (
            <g key={nombre} className={`arco__paso arco__paso--${e}`}>
              {e === 'actual' && <circle cx={x} cy={y} r={30} className="arco__halo" />}
              <circle cx={x} cy={y} r={e === 'actual' ? 20 : 15} className="arco__punto" />
              {e === 'hecho' ? (
                <path
                  d={`M${x - 6} ${y + 0.5} l4 4 l8 -9`}
                  className="arco__check"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <text x={x} y={y + 1} className="arco__num" textAnchor="middle" dominantBaseline="central">
                  {i + 1}
                </text>
              )}
              <text x={x + et.dx} y={y + et.dy} textAnchor={et.ancla} className="arco__etiqueta">
                {lineas.map((l, j) => (
                  <tspan key={l} x={x + et.dx} dy={j === 0 ? 0 : 18}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
      <ol className="solo-lector">
        {PASOS.map((nombre, i) => {
          const e = estadoDePaso(i, p, completado)
          return (
            <li key={nombre}>
              Paso {i + 1}, {nombre}: {e === 'hecho' ? 'completado' : e === 'actual' ? 'paso actual' : 'pendiente'}
            </li>
          )
        })}
      </ol>
      <figcaption className="solo-lector">{resumen}</figcaption>
    </figure>
  )
}
