import { useMemo } from 'react'
import { seeded, round } from '../../lib/random'
import { chhatri, dots, ghatSteps, haveli, haveliWindows, rect, shikhara, shikharaFlag, tree } from './shapes'

/* -------------------------------------------------------------------------- */
/*  Far skyline — temples and chhatris on the opposite bank, softened by haze  */
/* -------------------------------------------------------------------------- */

export function FarSkyline({ className = '' }: { className?: string }) {
  const d = useMemo(() => {
    const rand = seeded(7)
    const g = 150
    return [
      rect(0, g, 1600, 12),
      haveli(30, g, 80, 58),
      shikhara(150, g, 34, 112),
      chhatri(222, g, 26, 50),
      chhatri(252, g, 20, 40),
      haveli(300, g, 118, 44),
      tree(450, g, 34, rand),
      shikhara(530, g, 28, 92),
      chhatri(612, g, 28, 54),
      haveli(668, g, 150, 52, true),
      tree(850, g, 40, rand),
      shikhara(940, g, 44, 146),
      chhatri(1020, g, 24, 46),
      chhatri(1048, g, 20, 38),
      haveli(1090, g, 110, 50),
      tree(1236, g, 28, rand),
      shikhara(1310, g, 34, 104),
      chhatri(1398, g, 30, 58),
      haveli(1450, g, 120, 56, true),
      tree(1585, g, 36, rand),
    ].join('')
  }, [])

  return (
    <svg viewBox="0 0 1600 162" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <path d={d} fill="#2f2f63" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Ghat banks — stepped embankments with havelis, temples and lit windows      */
/* -------------------------------------------------------------------------- */

type BankProps = { side: 'left' | 'right'; low?: boolean; className?: string; id: string }

export function GhatBank({ side, low = false, className = '', id }: BankProps) {
  const art = useMemo(() => {
    const rand = seeded(side === 'left' ? 11 : 23)
    if (side === 'left' && low) {
      // A quieter bank for wide screens, where the headline sits above it.
      const g = 298
      const steps = ghatSteps({ x0: 0, x1: 640, top: g, water: 340, count: 4, edge: 'right', run: 22 })
      return {
        viewBox: '0 0 900 340',
        buildings: [
          haveli(0, g, 96, 58),
          chhatri(132, g, 40, 72),
          chhatri(176, g, 32, 58),
          haveli(214, g, 128, 50),
          tree(388, g, 32, rand),
          chhatri(470, g, 30, 54),
          haveli(520, g, 88, 40),
        ].join(''),
        windows: [haveliWindows(0, g, 96, 58, rand, 0.5), haveliWindows(214, g, 128, 50, rand, 0.5)].join(''),
        flags: '',
        steps,
      }
    }
    if (side === 'left') {
      const g = 262
      const steps = ghatSteps({ x0: 0, x1: 700, top: g, water: 340, count: 7, edge: 'right', run: 18 })
      return {
        viewBox: '0 0 900 340',
        buildings: [
          haveli(0, g, 150, 172, true),
          tree(198, g, 54, rand),
          shikhara(305, g, 72, 224),
          chhatri(402, g, 46, 92),
          haveli(440, g, 122, 122),
          chhatri(588, g, 34, 70),
          chhatri(632, g, 34, 70),
          shikhara(684, g, 26, 66),
        ].join(''),
        windows: [haveliWindows(0, g, 150, 172, rand, 0.42), haveliWindows(440, g, 122, 122, rand, 0.5)].join(''),
        flags: '',
        steps,
      }
    }
    const g = 230
    const steps = ghatSteps({ x0: 120, x1: 760, top: g, water: 300, count: 6, edge: 'left', run: 16 })
    return {
      viewBox: '0 0 760 300',
      buildings: [
        chhatri(150, g, 30, 58),
        shikhara(206, g, 40, 122),
        haveli(252, g, 150, 150, true),
        shikhara(474, g, 64, 204),
        tree(566, g, 42, rand),
        haveli(612, g, 148, 118),
      ].join(''),
      windows: [haveliWindows(252, g, 150, 150, rand, 0.45), haveliWindows(612, g, 148, 118, rand, 0.4)].join(''),
      flags: [shikharaFlag(474, g, 64, 204)].join(''),
      steps,
    }
  }, [side, low])

  return (
    <svg
      viewBox={art.viewBox}
      preserveAspectRatio={side === 'left' ? 'xMinYMax meet' : 'xMaxYMax meet'}
      className={className}
      aria-hidden="true"
    >
      <g id={id}>
        <path d={art.buildings} fill="#171c45" />
        <path d={art.steps.treads} fill="#1d2350" />
        <path d={art.steps.lines} stroke="#c9a66a" strokeOpacity="0.2" strokeWidth="1" fill="none" />
        <path d={art.windows} fill="#f2b45c" opacity="0.9" />
        {art.flags && <path d={art.flags} fill="#d68b38" />}
      </g>
    </svg>
  )
}

const BANK_VIEWBOX = { left: '0 0 900 340', right: '0 0 760 300' }

/** The bank's reflection reuses the drawing above via <use>, so it costs almost nothing. */
export function GhatReflection({ side, of, className = '' }: { side: 'left' | 'right'; of: string; className?: string }) {
  return (
    <svg
      viewBox={BANK_VIEWBOX[side]}
      preserveAspectRatio={side === 'left' ? 'xMinYMax meet' : 'xMaxYMax meet'}
      className={className}
      aria-hidden="true"
    >
      <use href={`#${of}`} />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Small atmospheric pieces                                                   */
/* -------------------------------------------------------------------------- */

export function Stars({ className = '' }: { className?: string }) {
  const { still, twinkle } = useMemo(() => {
    const rand = seeded(3)
    const all = Array.from({ length: 74 }, () => ({
      x: round(rand() * 1600),
      y: round(Math.pow(rand(), 1.6) * 560),
      r: round(0.5 + rand() * 1.15, 2),
      t: rand() > 0.84,
      delay: round(rand() * 4, 1),
    }))
    return { still: dots(all.filter((s) => !s.t)), twinkle: all.filter((s) => s.t) }
  }, [])

  return (
    <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden="true">
      <path d={still} fill="#f3ecdf" opacity="0.7" />
      {twinkle.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#f3ecdf"
          className="anim-twinkle"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  )
}

/** The sun's path on the water: broken strokes that shimmer out of step. */
export function SunTrail({ className = '' }: { className?: string }) {
  const lines = useMemo(() => {
    const rand = seeded(5)
    return Array.from({ length: 16 }, (_, i) => {
      const y = 6 + i * 15 + rand() * 4
      const w = (110 - i * 5.2) * (0.6 + rand() * 0.5)
      return { y: round(y), x: round(100 - w / 2 + (rand() - 0.5) * 18), w: round(w), o: round(0.95 - i * 0.05, 2), d: round(rand() * 3, 1) }
    })
  }, [])
  return (
    <svg viewBox="0 0 200 250" className={className} aria-hidden="true">
      {lines.map((l, i) => (
        <rect
          key={i}
          x={l.x}
          y={l.y}
          width={l.w}
          height="2.4"
          rx="1.2"
          fill={i < 5 ? '#f6c98b' : '#e0a05f'}
          opacity={l.o}
          className="anim-shimmer"
          style={{ animationDelay: `${l.d}s` }}
        />
      ))}
    </svg>
  )
}

/** A clay diya on a leaf boat, with a soft halo. */
export function FloatingDiya({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 60 44"
      className={`anim-bob ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <circle cx="30" cy="18" r="18" fill="#f2b45c" opacity="0.18" />
      <path d="M8 30c8 7 36 7 44 0-6 3-38 3-44 0Z" fill="#2f4a3a" />
      <path d="M17 27c3 5 23 5 26 0l-2-3H19Z" fill="#a1633b" />
      <path d="M30 12c3 4 4 7 0 11-4-4-3-7 0-11Z" fill="#f6c98b" />
    </svg>
  )
}

/** River surface lines — quiet horizontal ripples across the water. */
export function Ripples({ className = '' }: { className?: string }) {
  const d = useMemo(() => {
    const rand = seeded(19)
    return Array.from({ length: 22 }, (_, i) => {
      const y = 8 + Math.pow(i / 22, 1.35) * 380
      return rect(rand() * 1600, y, 60 + rand() * 260, 1.5)
    }).join('')
  }, [])
  return (
    <svg viewBox="0 0 1600 400" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={d} fill="#c7d3e6" opacity="0.16" />
    </svg>
  )
}
