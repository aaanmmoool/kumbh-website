import { m } from 'motion/react'
import { useId, useMemo } from 'react'
import type { MomentId } from '../../content/site'
import { seeded, round } from '../../lib/random'
import { chhatri, ghatSteps, haveli, haveliWindows, shikhara, tree } from './shapes'

type Palette = {
  skyTop: string
  skyBottom: string
  water: string
  waterDeep: string
  land: string
  near: string
  glow: string
  sun: { x: number; y: number; color: string; r: number }
  moon: number
  stars: number
  lamps: number
  windows: number
}

/** One palette per hour. The sun travels an arc; lamps come out after dusk. */
export const PALETTES: Record<MomentId, Palette> = {
  brahma: {
    skyTop: '#090d26', skyBottom: '#353568', water: '#151b48', waterDeep: '#0a0e2a',
    land: '#0f1336', near: '#080b22', glow: '#5b4a80',
    sun: { x: 360, y: 470, color: '#f4b469', r: 34 }, moon: 1, stars: 1, lamps: 1, windows: 0.9,
  },
  sunrise: {
    skyTop: '#6f6aa0', skyBottom: '#f2b47c', water: '#9a86a0', waterDeep: '#3f4a78',
    land: '#3a3466', near: '#231f48', glow: '#f6c08a',
    sun: { x: 400, y: 318, color: '#fad49a', r: 40 }, moon: 0, stars: 0, lamps: 0.35, windows: 0.2,
  },
  midday: {
    skyTop: '#9cbfd2', skyBottom: '#efe3c6', water: '#78a4b4', waterDeep: '#2c6b70',
    land: '#8c7656', near: '#6b5638', glow: '#fff3d6',
    sun: { x: 600, y: 96, color: '#fff1cf', r: 36 }, moon: 0, stars: 0, lamps: 0, windows: 0,
  },
  dusk: {
    skyTop: '#3a3a74', skyBottom: '#e8935c', water: '#6c5478', waterDeep: '#2b2a5c',
    land: '#2c2650', near: '#1a1738', glow: '#f09a62',
    sun: { x: 810, y: 322, color: '#f7b071', r: 42 }, moon: 0, stars: 0.3, lamps: 1, windows: 0.8,
  },
  night: {
    skyTop: '#05081c', skyBottom: '#1d2152', water: '#0c1134', waterDeep: '#05081c',
    land: '#0a0d2a', near: '#04061a', glow: '#3b3a74',
    sun: { x: 860, y: 470, color: '#f7b071', r: 34 }, moon: 1, stars: 1, lamps: 1, windows: 1,
  },
}

const HORIZON = 330
const T = { duration: 1.4, ease: [0.65, 0, 0.35, 1] as const }

export function DayScene({ moment, className = '' }: { moment: MomentId; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const p = PALETTES[moment]

  const art = useMemo(() => {
    const rand = seeded(31)
    const g = HORIZON
    const far = [
      haveli(40, g, 120, 60),
      shikhara(220, g, 46, 150),
      chhatri(290, g, 36, 64),
      haveli(330, g, 150, 70, true),
      tree(520, g, 42, rand),
      shikhara(610, g, 32, 96),
      haveli(660, g, 110, 54),
      chhatri(800, g, 30, 54),
      tree(860, g, 34, rand),
      haveli(920, g, 140, 66, true),
      shikhara(1110, g, 40, 124),
      haveli(1150, g, 50, 48),
    ].join('')
    const windows = [
      haveliWindows(40, g, 120, 60, rand, 0.5),
      haveliWindows(330, g, 150, 70, rand, 0.5),
      haveliWindows(660, g, 110, 54, rand, 0.5),
      haveliWindows(920, g, 140, 66, rand, 0.5),
    ].join('')
    const steps = ghatSteps({ x0: 0, x1: 220, top: 540, water: 640, count: 5, edge: 'right', run: 26 })
    const stars = Array.from({ length: 50 }, () => ({
      x: round(rand() * 1200),
      y: round(Math.pow(rand(), 1.4) * 280),
      r: round(0.6 + rand() * 1.2, 2),
    }))
    const lamps = Array.from({ length: 16 }, (_, i) => ({
      x: round(470 + i * 46 + (rand() - 0.5) * 30),
      y: round(HORIZON + 40 + Math.pow(i / 16, 0.8) * 190 + rand() * 20),
      s: round(0.5 + (i / 16) * 0.9, 2),
    }))
    return { far, windows, steps, stars, lamps }
  }, [])

  const id = (n: string) => `${n}-${uid}`

  return (
    <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <m.stop offset="0" initial={false} animate={{ stopColor: p.skyTop }} transition={T} />
          <m.stop offset="1" initial={false} animate={{ stopColor: p.skyBottom }} transition={T} />
        </linearGradient>
        <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
          <m.stop offset="0" initial={false} animate={{ stopColor: p.water }} transition={T} />
          <m.stop offset="1" initial={false} animate={{ stopColor: p.waterDeep }} transition={T} />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <m.stop offset="0" initial={false} animate={{ stopColor: p.glow }} transition={T} stopOpacity="0.75" />
          <m.stop offset="1" initial={false} animate={{ stopColor: p.glow }} transition={T} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('lamp')}>
          <stop offset="0" stopColor="#f6c98b" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f6c98b" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('sky-clip')}>
          <rect width="1200" height={HORIZON} />
        </clipPath>
      </defs>

      <rect width="1200" height={HORIZON + 2} fill={`url(#${id('sky')})`} />

      <m.g initial={false} animate={{ opacity: p.stars }} transition={T}>
        {art.stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f3ecdf" opacity="0.8" />
        ))}
      </m.g>

      {/* Sun on its arc (clipped at the horizon) */}
      <g clipPath={`url(#${id('sky-clip')})`}>
        <m.circle
          initial={false}
          animate={{ cx: p.sun.x, cy: p.sun.y }}
          transition={T}
          r="220"
          fill={`url(#${id('glow')})`}
        />
        <m.circle
          initial={false}
          animate={{ cx: p.sun.x, cy: p.sun.y, r: p.sun.r, fill: p.sun.color }}
          transition={T}
        />
      </g>

      <m.path
        d="M792 84a34 34 0 1 0 30 52 28 28 0 1 1-30-52z"
        fill="#f3e2b8"
        initial={false}
        animate={{ opacity: p.moon }}
        transition={T}
      />

      {/* Far bank */}
      <m.path d={art.far} initial={false} animate={{ fill: p.land }} transition={T} />
      <m.path d={art.windows} fill="#f2b45c" initial={false} animate={{ opacity: p.windows }} transition={T} />

      {/* River */}
      <rect y={HORIZON} width="1200" height={640 - HORIZON} fill={`url(#${id('water')})`} />
      <m.g initial={false} animate={{ opacity: p.sun.y < HORIZON ? 0.7 : 0 }} transition={T}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <m.rect
            key={i}
            initial={false}
            animate={{ x: p.sun.x - 50 + i * 3 - (i % 2) * 12, fill: p.sun.color }}
            transition={T}
            y={HORIZON + 12 + i * 18}
            width={100 - i * 11}
            height="2.6"
            rx="1.3"
          />
        ))}
      </m.g>
      <g stroke="#f3ecdf" strokeOpacity="0.16">
        <path d="M60 360h180M380 380h220M780 372h160M140 420h260M640 430h300M220 500h180M760 520h260" />
      </g>

      {/* Diyas on the current */}
      <m.g initial={false} animate={{ opacity: p.lamps }} transition={T}>
        {art.lamps.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
            <circle cx="0" cy="-6" r="22" fill={`url(#${id('lamp')})`} />
            <path d="M-14 6c6 5 22 5 28 0-4 2-24 2-28 0z" fill="#2f4a3a" />
            <path d="M-8 4c2 3 14 3 16 0l-1-2H-7z" fill="#a1633b" />
            <path d="M0-8c2.5 3 3 5.5 0 8.5-3-3-2.5-5.5 0-8.5z" fill="#f6c98b" />
          </g>
        ))}
      </m.g>

      {/* Near ghat */}
      <m.path d={art.steps.treads} initial={false} animate={{ fill: p.near }} transition={T} />
      <path d={art.steps.lines} stroke="#c9a66a" strokeOpacity="0.35" fill="none" />
    </svg>
  )
}
