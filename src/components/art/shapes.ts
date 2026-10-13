import { round as r } from '../../lib/random'

/**
 * Path builders for the architectural silhouettes used across the site.
 * Everything is drawn on a y-down grid where `g` is the ground line, and each
 * builder returns plain path data so a whole skyline can be one <path>.
 */

export const rect = (x: number, y: number, w: number, h: number) =>
  `M${r(x)} ${r(y)}h${r(w)}v${r(h)}h${r(-w)}Z`

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r(cx - rx)} ${r(cy)}a${r(rx)} ${r(ry)} 0 1 1 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 1 ${r(-rx * 2)} 0Z`

/** Nagara temple: platform, curvilinear shikhara, amalaka, kalash finial and porch. */
export function shikhara(cx: number, g: number, w: number, h: number) {
  const plinth = h * 0.1
  const top = g - h * 0.88
  const tower = [
    `M${r(cx - w / 2)} ${r(g - plinth)}`,
    `C${r(cx - w / 2)} ${r(g - h * 0.5)} ${r(cx - w * 0.24)} ${r(g - h * 0.82)} ${r(cx - w * 0.13)} ${r(top)}`,
    `L${r(cx + w * 0.13)} ${r(top)}`,
    `C${r(cx + w * 0.24)} ${r(g - h * 0.82)} ${r(cx + w / 2)} ${r(g - h * 0.5)} ${r(cx + w / 2)} ${r(g - plinth)}Z`,
  ].join('')
  const porch = [
    `M${r(cx - w * 1.15)} ${r(g - plinth)}`,
    `L${r(cx - w * 1.15)} ${r(g - h * 0.26)}`,
    `L${r(cx - w * 0.82)} ${r(g - h * 0.42)}`,
    `L${r(cx - w * 0.5)} ${r(g - h * 0.3)}`,
    `L${r(cx - w * 0.5)} ${r(g - plinth)}Z`,
  ].join('')
  return [
    rect(cx - w * 1.3, g - plinth, w * 1.9, plinth),
    tower,
    porch,
    ellipse(cx, top - h * 0.02, w * 0.19, h * 0.032),
    ellipse(cx, top - h * 0.07, w * 0.06, h * 0.026),
    rect(cx - 0.6, top - h * 0.16, 1.2, h * 0.09),
  ].join('')
}

/** A flag on top of a shikhara of the same dimensions — kept separate so it can be saffron. */
export function shikharaFlag(cx: number, g: number, w: number, h: number) {
  const tip = g - h * 0.88 - h * 0.16
  return `M${r(cx + 0.6)} ${r(tip)}l${r(w * 0.42)} ${r(h * 0.03)}l${r(-w * 0.42)} ${r(h * 0.05)}Z`
}

/** Chhatri: a domed pavilion on slender pillars. The gaps between pillars stay open. */
export function chhatri(cx: number, g: number, w: number, h: number) {
  const plinth = h * 0.14
  const slab = g - h * 0.55
  const pillarW = Math.max(1.4, w * 0.09)
  const pillars = [-0.42, -0.14, 0.14, 0.42].map((p) =>
    rect(cx + p * w - pillarW / 2, slab, pillarW, g - plinth - slab),
  )
  return [
    rect(cx - w * 0.6, g - plinth, w * 1.2, plinth),
    ...pillars,
    rect(cx - w * 0.58, slab - h * 0.05, w * 1.16, h * 0.05),
    `M${r(cx - w * 0.46)} ${r(slab - h * 0.05)}C${r(cx - w * 0.46)} ${r(slab - h * 0.46)} ${r(cx + w * 0.46)} ${r(slab - h * 0.46)} ${r(cx + w * 0.46)} ${r(slab - h * 0.05)}Z`,
    rect(cx - 0.6, slab - h * 0.46, 1.2, h * 0.1),
    ellipse(cx, slab - h * 0.38, w * 0.05, w * 0.05),
  ].join('')
}

/** Haveli block with a parapet and an optional corner chhatri. */
export function haveli(x: number, g: number, w: number, h: number, withChhatri = false) {
  const parts = [rect(x, g - h, w, h), rect(x - 3, g - h - 4, w + 6, 4)]
  for (let i = 0; i < Math.floor(w / 14); i++) parts.push(rect(x + 3 + i * 14, g - h - 9, 6, 5))
  if (withChhatri) parts.push(chhatri(x + w - 14, g - h - 4, 22, 34))
  return parts.join('')
}

/** Lit windows for a haveli — returns rects on a loose grid, skipping a few. */
export function haveliWindows(
  x: number,
  g: number,
  w: number,
  h: number,
  rand: () => number,
  density = 0.38,
) {
  const parts: string[] = []
  const cols = Math.max(1, Math.floor((w - 12) / 18))
  const rows = Math.max(1, Math.floor((h - 26) / 26))
  for (let c = 0; c < cols; c++) {
    for (let row = 0; row < rows; row++) {
      if (rand() > density) continue
      const wx = x + 10 + c * 18
      const wy = g - h + 16 + row * 26
      parts.push(`M${r(wx)} ${r(wy + 4)}a3 4 0 0 1 6 0v6h-6Z`)
    }
  }
  return parts.join('')
}

/** Peepal / banyan canopy as a cluster of circles on a short trunk. */
export function tree(cx: number, g: number, size: number, rand: () => number) {
  const parts = [rect(cx - size * 0.06, g - size * 0.9, size * 0.12, size * 0.9)]
  const blobs = 6
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2
    const rr = size * (0.38 + rand() * 0.18)
    parts.push(
      ellipse(
        cx + Math.cos(a) * size * 0.42,
        g - size * 1.25 + Math.sin(a) * size * 0.28,
        rr,
        rr * 0.92,
      ),
    )
  }
  parts.push(ellipse(cx, g - size * 1.3, size * 0.55, size * 0.5))
  return parts.join('')
}

/** Ghat steps: horizontal treads descending to the waterline with a stepped edge. */
export function ghatSteps(opts: {
  x0: number
  x1: number
  top: number
  water: number
  count: number
  edge: 'left' | 'right'
  run: number
}) {
  const { x0, x1, top, water, count, edge, run } = opts
  const riser = (water - top) / count
  const treads: string[] = []
  const lines: string[] = []
  for (let i = 0; i < count; i++) {
    const y = top + i * riser
    const extra = run * (i + 1)
    const left = edge === 'left' ? x0 - extra : x0
    const right = edge === 'right' ? x1 + extra : x1
    treads.push(rect(left, y, right - left, riser + 0.5))
    lines.push(`M${r(left)} ${r(y)}H${r(right)}`)
  }
  return { treads: treads.join(''), lines: lines.join('') }
}

/** Petal outline pointing straight up from the origin (rotate it into place). */
export function petal(length: number, halfWidth: number) {
  const L = length
  const w = halfWidth
  return `M0 0C${r(w)} ${r(-L * 0.22)} ${r(w * 0.92)} ${r(-L * 0.7)} 0 ${r(-L)}C${r(-w * 0.92)} ${r(-L * 0.7)} ${r(-w)} ${r(-L * 0.22)} 0 0Z`
}

/** Many small dots as one path — keeps the DOM small for star fields and crowds. */
export const dots = (points: { x: number; y: number; r: number }[]) =>
  points.map((p) => ellipse(p.x, p.y, p.r, p.r)).join('')
