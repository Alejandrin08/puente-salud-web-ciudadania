import { useState, type FormEvent } from 'react'
import { ApiError } from '../../shared/api/client'
import type { Sesion } from '../../shared/api/sesion'
import { acceder } from './api'

export const FOLIO_DEMO = 'PS081368'
export const CODIGO_DEMO = '246810'

export function FormAcceso({ onListo }: { onListo: (s: Sesion) => void }) {
  const [folio, setFolio] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!folio.trim() || !codigo.trim()) {
      setError('Escribe tu folio y tu código.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      onListo(await acceder(folio, codigo))
    } catch (err) {
      setError(err instanceof ApiError && err.estado === 401 ? 'El folio o el código no coinciden. Revísalos e intenta de nuevo.' : (err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate aria-describedby={error ? 'acceso-error' : undefined}>
      <div className="campo">
        <label htmlFor="folio">Tu folio</label>
        <input
          id="folio"
          name="folio"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder="Ejemplo: PS081368"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          aria-invalid={!!error}
        />
        <p className="campo__ayuda">Viene en el papel que te dieron cuando te detectaron.</p>
      </div>
      <div className="campo">
        <label htmlFor="codigo">Código</label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 números"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="formulario__error" id="acceso-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="boton boton--primario boton--ancho" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
      <div className="demo">
        <p>
          <strong>Para probar:</strong> folio <code>{FOLIO_DEMO}</code> y código <code>{CODIGO_DEMO}</code>.
        </p>
        <button
          type="button"
          className="boton boton--texto"
          onClick={() => {
            setFolio(FOLIO_DEMO)
            setCodigo(CODIGO_DEMO)
          }}
        >
          Usar datos de prueba
        </button>
      </div>
    </form>
  )
}
