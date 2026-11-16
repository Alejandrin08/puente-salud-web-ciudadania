import { useState } from 'react'
import type { Sesion } from '../../shared/api/sesion'
import { Icono } from '../../shared/ui/Icono'
import { consentir } from './api'

const COMPARTE = [
  'Tu folio, fecha de nacimiento y la zona donde vives (no tu dirección exacta).',
  'Si tienes seguridad social y qué programa te detectó.',
  'Tus mediciones de presión y glucosa, tus citas y tu tratamiento.',
]

export function Consentimiento({ sesion, onListo }: { sesion: Sesion; onListo: (aceptado: boolean) => void }) {
  const [enviando, setEnviando] = useState<null | boolean>(null)
  const [error, setError] = useState<string | null>(null)

  async function responder(aceptado: boolean) {
    setEnviando(aceptado)
    setError(null)
    try {
      await consentir(aceptado)
      onListo(aceptado)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div className="consentimiento">
      <div className="identidad">
        <p className="identidad__dato">
          <span>Folio</span>
          <strong>{sesion.folio}</strong>
        </p>
        {sesion.curp_simulada && (
          <p className="identidad__dato">
            <span>CURP (simulada)</span>
            <strong className="tabular">{sesion.curp_simulada}</strong>
          </p>
        )}
      </div>
      <p className="lead">
        Para darte seguimiento, los programas de salud que te atienden comparten <strong>solo lo necesario</strong>:
      </p>
      <ul className="lista-check">
        {COMPARTE.map((t) => (
          <li key={t}>
            <Icono nombre="check" tam={20} />
            {t}
          </li>
        ))}
      </ul>
      <p className="nota">
        <Icono nombre="escudo" tam={20} />
        Puedes cambiar tu decisión cuando quieras. Sin tu permiso no compartimos nada entre programas.
      </p>
      {error && (
        <p className="formulario__error" role="alert">
          {error}
        </p>
      )}
      <div className="acciones">
        <button type="button" className="boton boton--primario boton--ancho" onClick={() => responder(true)} disabled={enviando !== null}>
          {enviando === true ? 'Guardando…' : 'Acepto compartir mis datos'}
        </button>
        <button type="button" className="boton boton--secundario boton--ancho" onClick={() => responder(false)} disabled={enviando !== null}>
          No acepto
        </button>
      </div>
    </div>
  )
}
