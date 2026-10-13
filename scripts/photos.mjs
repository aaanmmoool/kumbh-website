/**
 * Fetches the photos listed in src/content/photos.json from Wikimedia Commons,
 * records their author and licence, and writes responsive AVIF + WebP files.
 *
 *   npm run photos
 *
 * Downloads go to assets-src/photos/ (not committed); outputs go to public/photos/
 * and src/content/photo-data.json (sizes, blurred placeholders and credits).
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(path.join(root, 'src/content/photos.json'), 'utf8')).photos
const sourceDir = path.join(root, 'assets-src/photos')
const outDir = path.join(root, 'public/photos')
const WIDTHS = [480, 800, 1200, 1800, 2400]
const UA = { 'User-Agent': 'KumbhCottagesSite/1.0 (photo build script)' }
await mkdir(sourceDir, { recursive: true })
await mkdir(outDir, { recursive: true })

const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

const query = new URLSearchParams({
  action: 'query',
  titles: manifest.map((p) => p.file).join('|'),
  prop: 'imageinfo',
  iiprop: 'url|size|extmetadata',
  iiurlwidth: '2400',
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|UsageTerms',
  format: 'json',
})
const api = await (await fetch(`https://commons.wikimedia.org/w/api.php?${query}`, { headers: UA })).json()
const pages = Object.values(api.query.pages)
const normalized = Object.fromEntries((api.query.normalized ?? []).map((n) => [n.from, n.to]))

const data = {}
for (const photo of manifest) {
  const title = normalized[photo.file] ?? photo.file
  const page = pages.find((p) => p.title === title)
  if (!page?.imageinfo) throw new Error(`photos: ${photo.file} not found on Commons`)
  const info = page.imageinfo[0]
  const meta = info.extmetadata
  const license = meta.LicenseShortName?.value ?? ''
  if (!/^(CC BY(-SA)? [\d.]+|CC0|Public domain)/i.test(license)) throw new Error(`photos: ${photo.file} has licence "${license}"`)

  const source = path.join(sourceDir, `${photo.slug}.jpg`)
  const exists = await stat(source).then(() => true, () => false)
  if (!exists) {
    const res = await fetch(info.thumburl ?? info.url, { headers: UA })
    if (!res.ok) throw new Error(`photos: download failed for ${photo.file} (${res.status})`)
    await writeFile(source, Buffer.from(await res.arrayBuffer()))
  }

  const image = sharp(source).rotate()
  const { width, height } = await image.metadata()
  const widths = WIDTHS.filter((w) => w <= width)
  if (!widths.includes(width) && width < WIDTHS.at(-1)) widths.push(width)
  for (const w of widths) {
    const resized = image.clone().resize({ width: w })
    await resized.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(outDir, `${photo.slug}-${w}.avif`))
    await resized.clone().webp({ quality: 74, effort: 5 }).toFile(path.join(outDir, `${photo.slug}-${w}.webp`))
  }
  const lqip = await image.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer()

  data[photo.slug] = {
    alt: photo.alt,
    position: photo.position,
    width,
    height,
    widths: widths.sort((a, b) => a - b),
    placeholder: `data:image/webp;base64,${lqip.toString('base64')}`,
    credit: {
      author: stripHtml(meta.Artist?.value) || 'Unknown author',
      license,
      licenseUrl: meta.LicenseUrl?.value ?? '',
      source: info.descriptionurl,
      title: title.replace(/^File:/, ''),
    },
  }
  console.log(`photos: ${photo.slug} ${width}×${height} ${license} — ${data[photo.slug].credit.author}`)
}

await writeFile(path.join(root, 'src/content/photo-data.json'), JSON.stringify(data, null, 2) + '\n')
console.log(`photos: wrote ${Object.keys(data).length} photos to public/photos and src/content/photo-data.json`)
