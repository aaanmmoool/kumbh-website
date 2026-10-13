import { useId } from 'react'
import type { CottageArt as ArtKind } from '../../content/cottages'
import type { PlaceId } from '../../content/site'

/**
 * Cottage illustrations for the listing cards. Same drawing language as the
 * rest of the site: flat fills, a gold hairline, and the light of each city —
 * dawn at the Sangam, morning under the hills at Haridwar, dusk on the Shipra,
 * midday at Nashik. Drawn on a 400×320 canvas, framed by the jharokha arch.
 */

type Tone = { skyTop: string; skyBottom: string; sun: string; sunY: number; hills?: string; ground: string; dusk?: boolean }

const TONES: Record<PlaceId, Tone> = {
  prayagraj: { skyTop: '#f4e1cf', skyBottom: '#eaa97f', sun: '#fbe0b4', sunY: 150, ground: '#d9c39c' },
  haridwar: { skyTop: '#e6edee', skyBottom: '#f1d5a7', sun: '#fff0cf', sunY: 96, hills: '#9fb2a6', ground: '#d6c59f' },
  ujjain: { skyTop: '#4a4378', skyBottom: '#e3925f', sun: '#f7b071', sunY: 178, ground: '#6f5a67', dusk: true },
  nashik: { skyTop: '#d6e4e8', skyBottom: '#f0e2c4', sun: '#fff3d6', sunY: 70, hills: '#b9a688', ground: '#dccaa2' },
}

const INK = '#232a5c'
const WALL = '#f5ecdc'
const WALL_SHADE = '#ddcdb2'
const THATCH = '#b07a45'
const THATCH_DARK = '#8a5a30'

function Riverside() {
  return (
    <g>
      <path d="M0 254h400v66H0z" fill="#7ea2b2" />
      <path d="M30 270h90M170 280h70M260 266h110M70 298h120M230 304h90" stroke="#f3ecdf" strokeOpacity="0.5" />
      <path d="M118 238h164v16H118z" fill="#c9b08a" />
      <path d="M118 246h164" stroke="#a88d63" />
      <path d="M138 180h124v58H138z" fill={WALL} />
      <path d="M226 180h36v58h-36z" fill={WALL_SHADE} />
      <path d="M112 188L200 124l88 64z" fill={THATCH} />
      <path d="M112 188L200 124l88 64" fill="none" stroke={THATCH_DARK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M140 172l60-40 60 40M160 158l40-26 40 26" fill="none" stroke={THATCH_DARK} strokeOpacity="0.5" />
      <path d="M188 238v-24a12 12 0 0 1 24 0v24z" fill={INK} />
      <path d="M150 200h22v16h-22zM232 200h18v16h-18z" fill={INK} opacity="0.85" />
      <path d="M146 188v50M254 188v50" stroke={THATCH_DARK} strokeWidth="3" />
      <g transform="translate(300 246)">
        <circle cx="0" cy="-6" r="14" fill="#f6c98b" opacity="0.35" />
        <path d="M-8 2c2 3 14 3 16 0l-1-2H-7z" fill="#a1633b" />
        <path d="M0-8c2.5 3 3 5.5 0 8.5-3-3-2.5-5.5 0-8.5z" fill="#f2a94e" />
      </g>
    </g>
  )
}

function Garden() {
  return (
    <g>
      <path d="M0 250h400v70H0z" fill="#a9b48a" />
      <path d="M176 320l14-70h20l14 70z" fill="#e9dcbf" />
      <g fill="#6f7d4f">
        <circle cx="62" cy="196" r="34" />
        <circle cx="92" cy="176" r="30" />
        <circle cx="40" cy="168" r="26" />
        <circle cx="338" cy="188" r="36" />
        <circle cx="362" cy="160" r="26" />
      </g>
      <path d="M72 250v-40M346 250v-40" stroke="#5a4630" strokeWidth="6" />
      <path d="M128 186h144v64H128z" fill={WALL} />
      <path d="M236 186h36v64h-36z" fill={WALL_SHADE} />
      <path d="M112 192l36-42h104l36 42z" fill="#a8562e" />
      <path d="M112 192l36-42h104l36 42" fill="none" stroke="#7d3c1c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M130 174h140M140 162h120" stroke="#7d3c1c" strokeOpacity="0.45" />
      <path d="M186 250v-30a14 14 0 0 1 28 0v30z" fill={INK} />
      <path d="M144 206h24v18h-24zM240 206h20v18h-20z" fill={INK} opacity="0.85" />
      <g fill="#e08a2e">
        {[120, 134, 148, 252, 266, 280].map((x, i) => (
          <circle key={x} cx={x} cy={252 - (i % 2) * 4} r="6" />
        ))}
      </g>
      <g fill="#f0b23a">
        {[127, 141, 259, 273].map((x) => (
          <circle key={x} cx={x} cy={246} r="4" />
        ))}
      </g>
    </g>
  )
}

function Tent() {
  const flags = [0, 1, 2, 3, 4, 5, 6]
  return (
    <g>
      <path d="M0 256h400v64H0z" fill="#d9c39c" />
      <path d="M92 250h216v12H92z" fill="#a37b52" />
      <path d="M92 256h216M128 250v12M164 250v12M200 250v12M236 250v12M272 250v12" stroke="#7d5a38" strokeOpacity="0.6" />
      <path d="M118 250V204l82-58 82 58v46z" fill="#efe4cf" />
      <path d="M200 146l82 58v46h-34V198z" fill="#ddccad" />
      <path d="M200 146L118 204M200 146l82 58" fill="none" stroke="#b49b74" strokeWidth="2" />
      <path d="M200 250v-62l-22 62zM200 250v-62l22 62z" fill="#8a6a45" />
      <path d="M200 188l-22 62h44z" fill={INK} opacity="0.75" />
      <path d="M118 204l-26 46M282 204l26 46" stroke="#8a7a60" strokeWidth="1.2" />
      <path d="M200 146v-22" stroke={INK} strokeWidth="2" />
      <path d="M201 124l20 6-20 6z" fill="#d68b38" />
      {flags.map((i) => {
        const x = 134 + i * 22
        const y = 200 - Math.abs(i - 3) * 13 + 6
        return <path key={i} d={`M${x} ${y}l8 0-4 9z`} fill={i % 2 ? '#d68b38' : '#2c6b70'} />
      })}
    </g>
  )
}

function Family() {
  return (
    <g>
      <path d="M0 252h400v68H0z" fill="#cdb98f" />
      <path d="M86 196h228v56H86z" fill={WALL} />
      <path d="M272 196h42v56h-42z" fill={WALL_SHADE} />
      <path d="M74 202l66-62 66 62z" fill={THATCH} />
      <path d="M194 202l66-62 66 62z" fill="#9c6a3c" />
      <path d="M74 202l66-62 66 62M194 202l66-62 66 62" fill="none" stroke={THATCH_DARK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M140 140v-14M260 140v-14" stroke={INK} strokeWidth="2" />
      <circle cx="140" cy="122" r="4" fill="#b8954f" />
      <circle cx="260" cy="122" r="4" fill="#b8954f" />
      <path d="M126 252v-28a14 14 0 0 1 28 0v28z" fill={INK} />
      <path d="M100 212h18v16h-18zM168 212h20v16h-20zM218 212h20v16h-20zM284 212h18v16h-18z" fill={INK} opacity="0.85" />
      <path d="M80 252h240" stroke="#a88d63" strokeWidth="2" />
      <path d="M232 252v-26M252 252v-26" stroke={THATCH_DARK} strokeWidth="3" />
    </g>
  )
}

const DRAWINGS: Record<ArtKind, () => React.JSX.Element> = { riverside: Riverside, garden: Garden, tent: Tent, family: Family }

export function CottageArt({ art, place, className = '' }: { art: ArtKind; place: PlaceId; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const tone = TONES[place]
  const Drawing = DRAWINGS[art]
  return (
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone.skyTop} />
          <stop offset="1" stopColor={tone.skyBottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill={`url(#sky-${uid})`} />
      <circle cx="300" cy={tone.sunY} r="30" fill={tone.sun} />
      <circle cx="300" cy={tone.sunY} r="42" fill="none" stroke="#b8954f" strokeOpacity="0.35" />
      {tone.hills && (
        <g fill={tone.hills}>
          <path d="M0 210c40-50 80-70 130-46s70 10 110-20 90-20 160 30v86H0z" opacity="0.55" />
          <path d="M0 232c60-30 110-34 170-14s110 4 150-12 60-6 80 4v60H0z" opacity="0.8" />
        </g>
      )}
      {!tone.hills && <path d="M0 236h400v20H0z" fill={tone.ground} opacity="0.6" />}
      {tone.dusk &&
        [40, 90, 70, 340, 360].map((x, i) => <circle key={i} cx={x} cy={30 + i * 14} r="1.4" fill="#f3ecdf" opacity="0.8" />)}
      <Drawing />
    </svg>
  )
}
