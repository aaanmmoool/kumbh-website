/**
 * Renders public/og-image.jpg (1200×630) from the real hero, using the SVG
 * emblem so the image is deterministic. Requires a build: `npm run build && npm run og-image`.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const port = 4180
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'pipe' })
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => String(d).includes('Local') && resolve())
  setTimeout(() => reject(new Error('preview server did not start')), 20000)
})

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
  await page.goto(`http://localhost:${port}/?no3d`, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: 'header{display:none!important} a[href="#threshold"]{display:none!important}' })
  await page.waitForTimeout(3500)
  const png = await page.screenshot({ type: 'png' })
  await sharp(png).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, 'public', 'og-image.jpg'))
  console.log('og-image: wrote public/og-image.jpg')
} finally {
  await browser.close()
  server.kill()
}
