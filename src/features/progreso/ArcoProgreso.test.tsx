import { render, screen } from '@testing-library/react'
import { ArcoProgreso, estadoDePaso } from './ArcoProgreso'

describe('ArcoProgreso', () => {
  it('anuncia el paso actual para lector de pantalla', () => {
    render(<ArcoProgreso paso={2} />)
    expect(screen.getByRole('figure', { name: 'Paso 2 de 4: Confirmar' })).toBeInTheDocument()
    expect(screen.getByText('Paso 1, Te detectaron: completado')).toBeInTheDocument()
    expect(screen.getByText('Paso 2, Confirmar: paso actual')).toBeInTheDocument()
    expect(screen.getByText('Paso 4, En control: pendiente')).toBeInTheDocument()
  })

  it('no depende solo del color: los pasos hechos llevan palomita y los demás su número', () => {
    const { container } = render(<ArcoProgreso paso={3} />)
    expect(container.querySelectorAll('.arco__paso--hecho .arco__check')).toHaveLength(2)
    expect(container.querySelector('.arco__paso--actual .arco__num')?.textContent).toBe('3')
    expect(container.querySelector('.arco__paso--pendiente .arco__num')?.textContent).toBe('4')
  })

  it('completado: los cuatro pasos hechos', () => {
    const { container } = render(<ArcoProgreso paso={4} completado />)
    expect(container.querySelectorAll('.arco__paso--hecho')).toHaveLength(4)
    expect(screen.getByRole('figure', { name: /Completaste los 4 pasos/ })).toBeInTheDocument()
  })

  it('acota pasos fuera de rango', () => {
    render(<ArcoProgreso paso={9} />)
    expect(screen.getByRole('figure', { name: 'Paso 4 de 4: En control' })).toBeInTheDocument()
  })

  it.each([
    [0, 2, false, 'hecho'],
    [1, 2, false, 'actual'],
    [2, 2, false, 'pendiente'],
    [3, 4, true, 'hecho'],
  ] as const)('estadoDePaso(%i, %i, %s) = %s', (i, paso, comp, esperado) => {
    expect(estadoDePaso(i, paso, comp)).toBe(esperado)
  })
})
