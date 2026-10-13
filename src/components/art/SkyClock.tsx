import { m } from 'motion/react'
import { useMemo } from 'react'
import { seeded, round } from '../../lib/random'
import { dots } from './shapes'

/**
 * The legend diagram. One drawing with four states:
 * 0 the churning ocean, 1 four drops falling to four cities,
 * 2 Jupiter's twelve-year circuit, 3 the gathering on the banks.
 */

const C = 240 // centre
const R = 196 // sky circle radius

const polar = (angleDeg: number, radius: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: round(C + Math.cos(a) * radius), y: round(C + Math.sin(a) * radius) }
}

// Placed loosely by compass direction from one another — a diagram, not a map.
const CITIES = [
  { name: 'Haridwar', angle: 246 },
  { name: 'Prayagraj', angle: 338 },
  { name: 'Ujjain', angle: 172 },
  { name: 'Nashik', angle: 118 },
]

const ease = [0.22, 1, 0.36, 1] as const

// Vasuki wound around the churning rod: a sine wave crossing the axis.
const SERPENT = Array.from({ length: 49 }, (_, i) => {
  const t = i / 48
  const x = round(C + Math.sin(t * Math.PI * 5) * 34 * (1 - t * 0.35))
  const y = round(C - 136 + t * 120)
  return `${i ? 'L' : 'M'}${x} ${y}`
}).join('')

export function SkyClock({ step, className = '', idPrefix = 'sky' }: { step: number; className?: string; idPrefix?: string }) {
  const ticks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = i * 30 - 90
        const o = polar(a, R)
        const inner = polar(a, R - 12)
        return `M${o.x} ${o.y}L${inner.x} ${inner.y}`
      }).join(''),
    [],
  )
  const gathering = useMemo(() => {
    const rand = seeded(13)
    const points = Array.from({ length: 140 }, (_, i) => {
      const ring = i % 4
      const a = 20 + rand() * 140
      const p = polar(a, 120 + ring * 18 + rand() * 8)
      return { ...p, r: round(1 + rand() * 1.4, 2), bright: rand() > 0.5 }
    })
    return { bright: dots(points.filter((p) => p.bright)), dim: dots(points.filter((p) => !p.bright)) }
  }, [])
  const jupiterAngle = step < 2 ? -90 : step === 2 ? 270 : 300

  const show = (visible: boolean) => ({
    animate: { opacity: visible ? 1 : 0 },
    transition: { duration: 0.8, ease },
  })

  return (
    <svg viewBox="0 0 480 480" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${idPrefix}-halo`}>
          <stop offset="0" stopColor="#f4b469" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f4b469" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r="150" fill={`url(#${idPrefix}-halo)`} />

      {/* The sky circle and its twelve divisions — one for each year */}
      <g fill="none" stroke="#e2c98f">
        <circle cx={C} cy={C} r={R} strokeOpacity="0.4" />
        <circle cx={C} cy={C} r={R - 22} strokeOpacity="0.14" strokeDasharray="2 6" />
        <m.path d={ticks} strokeOpacity={0.7} {...show(true)} />
      </g>
      <m.circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#e2c98f"
        strokeWidth="2"
        initial={false}
        animate={{ pathLength: step >= 2 ? 1 : 0, opacity: step >= 2 ? 1 : 0 }}
        transition={{ duration: 1.6, ease }}
        style={{ rotate: -90, transformOrigin: '240px 240px' }}
      />

      {/* Jupiter travelling the zodiac */}
      <m.g
        initial={false}
        animate={{ rotate: jupiterAngle + 90, opacity: step >= 2 ? 1 : 0.35 }}
        transition={{ duration: 1.6, ease }}
        style={{ transformOrigin: '240px 240px' }}
      >
        <circle cx={C} cy={C - R} r="8" fill="#0d1331" stroke="#e2c98f" />
        <circle cx={C} cy={C - R} r="3.5" fill="#e2c98f" />
      </m.g>

      {/* Sun and moon on an inner orbit */}
      <m.g initial={false} {...show(step === 2)}>
        <circle cx={polar(200, 132).x} cy={polar(200, 132).y} r="10" fill="#f4b469" />
        <path
          d={`M${polar(340, 132).x - 4} ${polar(340, 132).y - 9}a10 10 0 1 0 9 15 8 8 0 1 1-9-15z`}
          fill="#f3e2b8"
        />
        <circle cx={C} cy={C} r="132" fill="none" stroke="#e2c98f" strokeOpacity="0.3" strokeDasharray="1 5" />
      </m.g>

      {/* 0 · The churning ocean: the mountain as the rod, the serpent wound round it */}
      <m.g initial={false} {...show(step === 0)}>
        <g fill="none" stroke="#8fb0bf" strokeLinecap="round">
          {[150, 118, 86, 54].map((rx, i) => (
            <ellipse
              key={rx}
              cx={C}
              cy={C + 58}
              rx={rx}
              ry={rx * 0.16}
              strokeOpacity={0.22 + i * 0.12}
              strokeDasharray={i % 2 ? '3 7' : undefined}
            />
          ))}
        </g>
        <path d={`M${C} ${C - 150}V${C + 58}`} stroke="#e2c98f" strokeWidth="2" strokeOpacity="0.55" />
        <path
          d={SERPENT}
          fill="none"
          stroke="#2c8a8f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </m.g>

      {/* 1 · Four drops, four cities */}
      <m.g initial={false} {...show(step === 1)}>
        {CITIES.map((city, i) => {
          const end = polar(city.angle, R)
          const label = polar(city.angle, R - 34)
          const anchor = end.x < C - 20 ? 'start' : end.x > C + 20 ? 'end' : 'middle'
          return (
            <g key={city.name}>
              <m.path
                d={`M${C} ${C}L${end.x} ${end.y}`}
                stroke="#e2c98f"
                strokeDasharray="2 6"
                strokeOpacity="0.6"
                initial={false}
                animate={{ pathLength: step === 1 ? 1 : 0 }}
                transition={{ duration: 1.2, delay: step === 1 ? 0.2 + i * 0.15 : 0, ease }}
              />
              <circle cx={end.x} cy={end.y} r="6" fill="#f4b469" />
              <circle cx={end.x} cy={end.y} r="12" fill="none" stroke="#f4b469" strokeOpacity="0.5" />
              <text
                x={label.x}
                y={label.y + 5}
                textAnchor={anchor}
                className="fill-ivory font-sans text-[18px]"
              >
                {city.name}
              </text>
            </g>
          )
        })}
      </m.g>

      {/* 3 · The gathering */}
      <m.g initial={false} {...show(step === 3)}>
        <path d={gathering.bright} fill="#f2b45c" />
        <path d={gathering.dim} fill="#f2b45c" opacity="0.5" />
      </m.g>

      {/* The kumbh at the centre */}
      <g transform={`translate(${C - 40} ${C - 44}) scale(2)`} fill="none" stroke="#e2c98f" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 3.5c2.8 3.2 2.8 6.1 0 8.4-2.8-2.3-2.8-5.2 0-8.4Z" fill="#f4b469" fillOpacity="0.35" />
        <path d="M13.5 14h13" />
        <path d="M16 14c0 2.2-4 3.6-4.9 8C10.2 26.8 14 30 20 30s9.8-3.2 8.9-8c-.9-4.4-4.9-5.8-4.9-8" fill="#0d1331" />
        <path d="M11.6 21.2h16.8" />
        <circle cx="20" cy="25" r="1.1" fill="#e2c98f" stroke="none" />
      </g>
    </svg>
  )
}
