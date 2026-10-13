/**
 * Generates the small raster assets the site uses:
 *  - public/textures/grain.{avif,webp}  a tileable paper-grain texture
 *  - public/apple-touch-icon.png        from public/favicon.svg
 * Run with `npm run assets`. Outputs are committed, so the build does not need this.
 */
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const pub = (...p) => path.join(root, 'public', ...p)

function seeded(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

async function grain() {
  const size = 220
  const rand = seeded(2024)
  const pixels = Buffer.alloc(size * size)
  for (let i = 0; i < pixels.length; i++) {
    // Mostly near-white with sparse darker fibres; multiplied over ivory it reads as paper.
    const n = rand()
    pixels[i] = n > 0.985 ? 150 + rand() * 50 : 215 + rand() * 40
  }
  const image = sharp(pixels, { raw: { width: size, height: size, channels: 1 } }).blur(0.45)
  await mkdir(pub('textures'), { recursive: true })
  await image.clone().avif({ quality: 50, effort: 6 }).toFile(pub('textures', 'grain.avif'))
  await image.clone().webp({ quality: 70, effort: 6 }).toFile(pub('textures', 'grain.webp'))
}

async function touchIcon() {
  const svg = await readFile(pub('favicon.svg'))
  await sharp(svg, { density: 600 }).resize(180, 180).png({ compressionLevel: 9 }).toFile(pub('apple-touch-icon.png'))
}

await Promise.all([grain(), touchIcon()])
console.log('assets: grain.avif, grain.webp, apple-touch-icon.png written to public/')
