import type { SVGProps } from 'react'
import { brand } from '../../content/site'

/** The mark: a kumbh with a lotus-bud flame, resting on the river. */
export function LogoMark({ strokeWidth = 1.5, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false" {...props}>
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 3.5c2.8 3.2 2.8 6.1 0 8.4-2.8-2.3-2.8-5.2 0-8.4Z" />
        <path d="M13.5 14h13" />
        <path d="M16 14c0 2.2-4 3.6-4.9 8C10.2 26.8 14 30 20 30s9.8-3.2 8.9-8c-.9-4.4-4.9-5.8-4.9-8" />
        <path d="M11.6 21.2h16.8" />
        <path d="M7 35c2.2-1.4 4.4-1.4 6.6 0s4.4 1.4 6.4 0 4.4-1.4 6.6 0 4.4 1.4 6.4 0" />
      </g>
      <circle cx="20" cy="25" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0 text-gold-pale" />
      <span className="font-serif text-[1.4rem] font-semibold leading-none tracking-[-0.01em]">{brand.name}</span>
    </span>
  )
}
