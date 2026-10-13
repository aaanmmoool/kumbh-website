import { useId, type CSSProperties } from 'react'
import { petal } from './shapes'

type Ring = {
  angles: number[]
  length: (a: number) => number
  halfWidth: number
  fill: string
  delay: number
}

/**
 * Hand-drawn front view of the lotus-kumbh emblem. It is the visual twin of the
 * WebGL centrepiece, shown on phones, without WebGL, and while the 3D loads.
 */
export function LotusEmblem({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${name}-${uid}`

  const rings: Ring[] = [
    {
      angles: [-104, -122, 104, 122],
      length: () => 108,
      halfWidth: 32,
      fill: id('sand-deep'),
      delay: 0.15,
    },
    {
      angles: [-78, -52, -26, 0, 26, 52, 78],
      length: (a) => 152 - Math.abs(a) * 0.38,
      halfWidth: 44,
      fill: id('sand'),
      delay: 0.25,
    },
    {
      angles: [-58, -34, -11, 11, 34, 58],
      length: (a) => 128 - Math.abs(a) * 0.3,
      halfWidth: 37,
      fill: id('saffron'),
      delay: 0.4,
    },
  ]
  const front: Ring = {
    angles: [-46, -23, 0, 23, 46],
    length: (a) => 86 - Math.abs(a) * 0.2,
    halfWidth: 27,
    fill: id('gold'),
    delay: 0.6,
  }

  const drawRing = (ring: Ring) => (
    <g
      className={animate ? 'anim-unfurl' : undefined}
      style={{ animationDelay: `${ring.delay}s` } as CSSProperties}
    >
      {ring.angles.map((a) => (
        <g key={a} transform={`translate(200 262) rotate(${a})`}>
          <path
            d={petal(ring.length(a), ring.halfWidth)}
            fill={`url(#${ring.fill})`}
            stroke="#e9cf8e"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </g>
  )

  return (
    <svg viewBox="0 0 400 340" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('glow')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f4b469" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#d68b38" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d68b38" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('sand')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#cf8a4c" />
          <stop offset="0.55" stopColor="#f0d9b8" />
          <stop offset="1" stopColor="#fcf4e6" />
        </linearGradient>
        <linearGradient id={id('sand-deep')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8a6a45" />
          <stop offset="1" stopColor="#e6d2ae" />
        </linearGradient>
        <linearGradient id={id('saffron')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b5602a" />
          <stop offset="0.6" stopColor="#e7ae74" />
          <stop offset="1" stopColor="#f6cf9c" />
        </linearGradient>
        <linearGradient id={id('gold')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8d6a2c" />
          <stop offset="0.6" stopColor="#d7b468" />
          <stop offset="1" stopColor="#f3dda2" />
        </linearGradient>
        <linearGradient id={id('pot')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c5a22" />
          <stop offset="0.38" stopColor="#e7c77f" />
          <stop offset="0.55" stopColor="#f6e2ad" />
          <stop offset="1" stopColor="#8a6628" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="190" r="190" fill={`url(#${id('glow')})`} />

      <g fill="none" stroke="#e2c98f" strokeWidth="1" className={animate ? 'anim-fade' : undefined}>
        <circle cx="200" cy="178" r="156" strokeOpacity="0.35" />
        <circle cx="200" cy="178" r="168" strokeOpacity="0.18" strokeDasharray="1.5 7.3" strokeWidth="3" />
        <ellipse cx="200" cy="214" rx="186" ry="44" strokeOpacity="0.4" transform="rotate(-11 200 214)" />
        <ellipse cx="200" cy="208" rx="166" ry="34" strokeOpacity="0.28" transform="rotate(14 200 208)" />
        <circle cx="35" cy="247" r="4" fill="#f3dda2" stroke="none" />
      </g>

      {rings.map((ring, i) => (
        <g key={i}>{drawRing(ring)}</g>
      ))}

      <g className={animate ? 'anim-fade-up' : undefined} style={{ animationDelay: '0.5s' }}>
        <path
          d="M200 122c4.5 6.5 7 10 7 13.5a7 7 0 0 1-14 0c0-3.5 2.5-7 7-13.5Z"
          fill="#f6e2ad"
          className={animate ? 'anim-bob' : undefined}
        />
        <path d="M181 165h38v6.5h-38Z" fill={`url(#${id('pot')})`} />
        <path
          d="M186 171.5c0 10-20 16-23 36-3 22 15 38 37 38s40-16 37-38c-3-20-23-26-23-36Z"
          fill={`url(#${id('pot')})`}
        />
        <path d="M163.6 205.5h72.8" stroke="#7c5a22" strokeOpacity="0.55" strokeWidth="1.4" />
        <path d="M188 245.5h24l3 8h-30Z" fill="#8a6628" />
      </g>

      {drawRing(front)}

      <g fill="none" stroke="#e2c98f" strokeLinecap="round">
        <ellipse cx="200" cy="264" rx="122" ry="9" strokeOpacity="0.45" />
        <ellipse cx="200" cy="266" rx="168" ry="13" strokeOpacity="0.2" />
        <path d="M170 282h60M182 292h36M192 302h16" strokeOpacity="0.35" strokeWidth="2" />
      </g>
    </svg>
  )
}
