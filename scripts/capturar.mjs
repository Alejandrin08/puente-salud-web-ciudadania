// Capturas de revisión visual (no son pruebas). Uso: node scripts/capturar.mjs [url-base] [carpeta]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const OUT = process.argv[3] ?? '.impeccable/review'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
for (const [nombre, viewport] of [['movil', { width: 390, height: 844 }], ['escritorio', { width: 1280, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: nombre === 'movil' ? 2 : 1, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/bienvenida`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/${nombre}-1-bienvenida.png`, fullPage: true })
  await page.getByRole('button', { name: 'Usar datos de prueba' }).click()
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.getByRole('figure').waitFor()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nombre}-2-inicio.png`, fullPage: true })
  for (const [ruta, archivo] of [['/recorrido', '3-recorrido'], ['/mapa', '4-mapa'], ['/alarma', '5-alarma']]) {
    await page.evaluate((r) => {
      window.history.pushState(null, '', r)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, ruta)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(ruta === '/mapa' ? 2500 : 500)
    await page.screenshot({ path: `${OUT}/${nombre}-${archivo}.png`, fullPage: true })
  }
  await ctx.close()
}
await browser.close()
console.log('capturas en', OUT)
