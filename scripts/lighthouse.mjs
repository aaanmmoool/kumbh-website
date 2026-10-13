/**
 * Runs Lighthouse (mobile and desktop) against the production preview.
 *   npm run build && npm run lighthouse
 * Uses the locally installed Chrome; set CHROME_PATH if it lives elsewhere.
 * Reports are written to reports/lighthouse-{mobile,desktop}.html
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const root = path.resolve(import.meta.dirname, '..')
const port = 4173
const url = `http://localhost:${port}/`

const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'pipe' })
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => String(d).includes('Local') && resolve())
  server.on('exit', (code) => reject(new Error(`preview server exited (${code})`)))
  setTimeout(() => reject(new Error('preview server did not start')), 20000)
})

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || undefined,
  chromeFlags: ['--headless=new', '--no-sandbox'],
})

await mkdir(path.join(root, 'reports'), { recursive: true })
const results = {}
try {
  for (const [name, config] of [
    ['mobile', undefined],
    ['desktop', desktopConfig],
  ]) {
    const run = await lighthouse(url, { port: chrome.port, output: 'html', logLevel: 'error' }, config)
    await writeFile(path.join(root, 'reports', `lighthouse-${name}.html`), run.report)
    const { categories, audits } = run.lhr
    results[name] = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      'best-practices': Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      FCP: audits['first-contentful-paint'].displayValue,
      LCP: audits['largest-contentful-paint'].displayValue,
      TBT: audits['total-blocking-time'].displayValue,
      CLS: audits['cumulative-layout-shift'].displayValue,
      'DOM size': audits['dom-size']?.displayValue,
    }
    const failing = Object.values(audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable')
      .map((a) => `${a.id} (${a.displayValue ?? a.score})`)
    results[name].attention = failing
  }
} finally {
  await chrome.kill()
  server.kill()
}
console.log(JSON.stringify(results, null, 2))
