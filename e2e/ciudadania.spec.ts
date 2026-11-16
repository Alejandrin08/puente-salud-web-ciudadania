import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const API = process.env.E2E_API_URL ?? 'http://localhost:8000'
const FOLIO = 'PS081368'
const CODIGO = '246810'
const FOLIO_CONSENTIMIENTO = 'PS077861'

async function sinViolacionesGraves(page: Page, pantalla: string) {
  // Se mide en reposo: espera a que terminen las transiciones finitas (las animaciones infinitas no cuentan)
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  )
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(graves.map((v) => `${pantalla}: ${v.id} (${v.nodes.length}) ${v.help}`)).toEqual([])
}

async function entrar(page: Page, folio = FOLIO) {
  await page.goto('/bienvenida')
  await page.getByLabel('Tu folio').fill(folio)
  await page.getByLabel('Código').fill(CODIGO)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

test('happy path de la persona: entrar, ver su paso, recorrido, mapa y alarma', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/bienvenida$/)
  await expect(page.getByRole('heading', { name: 'Tu atención, paso a paso' })).toBeVisible()
  await sinViolacionesGraves(page, 'bienvenida')

  await page.getByLabel('Tu folio').fill('PS000000')
  await page.getByLabel('Código').fill('000000')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('no coinciden')

  await entrar(page)
  await expect(page.getByRole('figure', { name: 'Paso 2 de 4: Confirmar' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Confirma tu diagnóstico' })).toBeVisible()
  await expect(page.getByText('Datos simulados').first()).toBeVisible()
  await sinViolacionesGraves(page, 'inicio')

  await page.getByRole('button', { name: 'Ver todo mi recorrido' }).click()
  await expect(page.getByRole('heading', { name: 'Mi recorrido' })).toBeVisible()
  await expect(page.locator('[aria-current="step"]')).toContainText('Confirmar')
  await sinViolacionesGraves(page, 'recorrido')

  await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link', { name: 'Mapa' }).click()
  await expect(page.getByRole('heading', { name: 'Dónde atenderte' })).toBeVisible()
  await expect(page.getByText('Tu centro de salud', { exact: true })).toBeVisible()
  await expect(page.getByText('Ubicación aproximada y horarios simulados')).toBeVisible()
  await page.getByRole('button', { name: 'Ferias de salud' }).click()
  await expect(page.getByRole('button', { name: 'Ferias de salud' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.lugar').first()).toBeVisible()
  await sinViolacionesGraves(page, 'mapa')

  await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link', { name: 'Alarma' }).click()
  await expect(page.getByRole('link', { name: 'Llamar al 911' })).toHaveAttribute('href', 'tel:911')
  await expect(page.getByRole('heading', { name: 'Urgencias más cercanas' })).toBeVisible()
  await expect(page.locator('.urgencias li').first()).toBeVisible()
  await sinViolacionesGraves(page, 'alarma')

  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page).toHaveURL(/\/bienvenida$/)
})

test('consentimiento: sin aceptar no se ven datos; al aceptar se entra al inicio', async ({ page, request }) => {
  // Deja el folio sin consentimiento para que la prueba sea repetible
  const acc = await request.post(`${API}/api/v1/persona/acceso`, { data: { folio: FOLIO_CONSENTIMIENTO, codigo: CODIGO } })
  const { token } = await acc.json()
  await request.post(`${API}/api/v1/persona/consentimiento`, { data: { aceptado: false }, headers: { Authorization: `Bearer ${token}` } })

  await entrar(page, FOLIO_CONSENTIMIENTO)
  await expect(page.getByText('CURP (simulada)')).toBeVisible()
  await sinViolacionesGraves(page, 'consentimiento')
  await page.getByRole('button', { name: 'No acepto' }).click()
  await expect(page.getByText('Sin tu permiso no podemos mostrarte tu recorrido')).toBeVisible()
  await page.getByRole('button', { name: 'Cambiar mi decisión' }).click()
  await page.getByRole('button', { name: 'Acepto compartir mis datos' }).click()
  await expect(page.getByRole('figure', { name: /Paso \d de 4|Completaste/ })).toBeVisible()
})

test('el mapa y la alarma funcionan sin iniciar sesión', async ({ page }) => {
  await page.goto('/alarma')
  await expect(page.getByRole('link', { name: 'Llamar al 911' })).toBeVisible()
  await page.goto('/mapa')
  await expect(page.locator('.lugar').first()).toBeVisible()
  await expect(page.getByText('Entra con tu folio para ordenar por cercanía.')).toBeVisible()
})

test('tamaño de letra ajustable', async ({ page }) => {
  await page.goto('/bienvenida')
  const boton = page.getByRole('button', { name: /Tamaño de letra/ })
  await boton.click()
  await expect(page.locator('html')).toHaveAttribute('style', /font-size: 112.5%/)
  await boton.click()
  await boton.click()
  await expect(page.locator('html')).toHaveAttribute('style', /font-size: 100%/)
})
