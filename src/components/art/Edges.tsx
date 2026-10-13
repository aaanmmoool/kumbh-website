/**
 * Section edges. Each one is drawn in `currentColor` and sits at the bottom of a
 * section, filled with the colour of the section that follows.
 */

type EdgeProps = { className?: string }

/** Ghat steps rising out of the night into the day. */
export function StepsEdge({ className = '' }: EdgeProps) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`block h-[clamp(28px,4.4vw,64px)] w-full translate-y-px ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 64V54h240v-9h240v-9h240v-9h240v-9h240v-9h240V64Z" fill="currentColor" />
    </svg>
  )
}

/** A slow river contour. */
export function RiverEdge({ className = '', flip = false }: EdgeProps & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      className={`block h-[clamp(24px,3.6vw,56px)] w-full ${flip ? '-scale-x-100' : ''} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 30c120-18 240 14 360 0s240-22 360-4 240 26 360 8 240-20 360-6V56H0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** A small ornamental rule: two river lines meeting at a bindu. */
export function Confluence({ className = '' }: EdgeProps) {
  return (
    <svg viewBox="0 0 120 16" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M2 8c10-5 20 5 30 0s20-5 22 0" />
        <path d="M118 8c-10 5-20-5-30 0s-20 5-22 0" />
      </g>
      <circle cx="60" cy="8" r="2.4" fill="currentColor" />
    </svg>
  )
}
