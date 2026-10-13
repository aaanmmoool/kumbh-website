/**
 * Packages a relative-base build (npm run build:artifact) for hosting as a
 * claude.ai Artifact, whose host supplies the <html>/<head>/<body> skeleton and
 * only allows fonts and images that ship inside the page:
 *  - strips the document wrapper, keeping title, styles, content and scripts
 *  - inlines the fonts the page uses (and the grain texture) as data: URIs
 *  - writes dist-artifact/index.html and copies the JavaScript chunks beside it
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const out = path.join(root, 'dist-artifact')

let html = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!html.includes('src="./assets/')) throw new Error('package-artifact: run a relative-base build first (npm run build:artifact)')

const dataUri = async (file, type) => `data:${type};base64,${(await readFile(path.join(dist, file))).toString('base64')}`

// Fonts: drop subsets the page never renders, inline the rest as woff2 data URIs.
const UNUSED = /(greek|mukta-devanagari)/
let inlinedFonts = 0
const faces = [...html.matchAll(/@font-face\{[^}]*\}/g)].map((m) => m[0])
for (const face of faces) {
  const woff2 = face.match(/url\(\.\/(assets\/[^)]+\.woff2)\)/)
  if (!woff2 || UNUSED.test(woff2[1])) {
    html = html.replace(face, '')
    continue
  }
  const uri = await dataUri(woff2[1], 'font/woff2')
  const replaced = face.replace(/src:[^;}]+/, `src:url(${uri}) format("woff2")`)
  html = html.replace(face, () => replaced)
  inlinedFonts++
}

// The paper-grain texture.
for (const [file, type] of [
  ['textures/grain.avif', 'image/avif'],
  ['textures/grain.webp', 'image/webp'],
]) {
  const uri = await dataUri(file, type)
  html = html.replace(new RegExp(`(?:\\.{1,2})?/${file.replace('.', '\\.')}`, 'g'), uri)
}

// Unwrap the document: the host provides doctype, <head> meta and <body>.
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
const keep = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta\s+name="viewport"[^>]*>/i, '')
  .replace(/<link rel="(icon|apple-touch-icon|preload)"[^>]*>/g, '')
  .replace(/<title>[^<]*<\/title>/, '')
  .trim()
const page = `<title>Tirtha Kumbh Cottages</title>\n${keep}\n${body.trim()}\n`

await rm(out, { recursive: true, force: true })
await mkdir(path.join(out, 'assets'), { recursive: true })
await writeFile(path.join(out, 'index.html'), page)
const scripts = (await readdir(path.join(dist, 'assets'))).filter((f) => f.endsWith('.js'))
for (const f of scripts) await cp(path.join(dist, 'assets', f), path.join(out, 'assets', f))

console.log(
  `package-artifact: dist-artifact/index.html (${(page.length / 1024).toFixed(0)} kB, ${inlinedFonts} fonts inlined) + ${scripts.length} scripts: ${scripts.join(', ')}`,
)
