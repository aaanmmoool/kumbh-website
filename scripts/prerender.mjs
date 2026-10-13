/**
 * Static prerender: renders <App /> to HTML at build time and writes it into
 * dist/index.html, so the page paints (and is indexable) before JavaScript runs.
 * The client then hydrates the same markup.
 */
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const env = loadEnv('production', root, 'VITE_')
const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')

const template = await readFile(path.join(dist, 'index.html'), 'utf8')
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const appHtml = render()

// Preload the two font files the first screen needs (Latin subsets only).
const assets = await readdir(path.join(dist, 'assets'))
const fonts = ['eczar-latin-wght-normal', 'mukta-latin-400-normal']
  .map((prefix) => assets.find((f) => f.startsWith(prefix) && f.endsWith('.woff2')))
  .filter(Boolean)
// Asset URLs follow the build's base: '/assets/…' normally, './assets/…' for relative builds.
const base = template.includes('src="./assets/') ? './' : '/'
const head = fonts.map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin />`)

if (siteUrl) {
  head.push(
    `<link rel="canonical" href="${siteUrl}/" />`,
    `<meta property="og:url" content="${siteUrl}/" />`,
    `<meta property="og:image" content="${siteUrl}/og-image.jpg" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
  )
} else {
  console.warn('prerender: VITE_SITE_URL is not set, so canonical and og:image tags were skipped.')
}

if (!template.includes('<!--app-html-->')) throw new Error('prerender: <!--app-html--> marker missing from dist/index.html')
let html = template.replace('<!--app-head-->', head.join('\n    ')).replace('<!--app-html-->', appHtml)

// Inline the stylesheet: it is small once compressed, and inlining removes the
// only render-blocking request between the HTML and the first paint.
const cssLink = html.match(/<link rel="stylesheet" crossorigin href="((?:\.\/|\/)assets\/[^"]+\.css)">/)
if (cssLink) {
  let css = await readFile(path.join(dist, cssLink[1]), 'utf8')
  // Relative url()s inside the stylesheet pointed at its own folder; re-point them from the page.
  const cssDir = path.posix.dirname(cssLink[1].replace(/^\.\//, ''))
  css = css.replace(/url\((['"]?)(?!data:|https?:|\/|#)([^'")]+)\1\)/g, (_m, q, rel) => `url(${q}./${path.posix.join(cssDir, rel)}${q})`)
  // image-set() keeps plain quoted paths rather than url()s; re-point those too.
  if (cssDir === 'assets') css = css.replace(/(["'])\.\.\//g, '$1./')
  html = html.replace(cssLink[0], () => `<style>${css}</style>`)
} else {
  console.warn('prerender: stylesheet link not found; CSS left external.')
}
await writeFile(path.join(dist, 'index.html'), html)
await rm(ssrDir, { recursive: true, force: true })

console.log(`prerender: wrote dist/index.html (${(html.length / 1024).toFixed(1)} kB, ${fonts.length} font preloads)`)
