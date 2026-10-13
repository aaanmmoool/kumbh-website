import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'saffron' | 'outline-light' | 'night' | 'outline-dark'

const base =
  'group relative inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[3px] px-6 py-3 text-[1.0625rem] font-medium leading-none tracking-[0.005em] transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-soft)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70'

const variants: Record<Variant, string> = {
  saffron: 'bg-saffron text-night hover:bg-gold-pale',
  'outline-light': 'border border-ivory/45 text-ivory hover:border-ivory hover:bg-ivory/8',
  night: 'bg-night text-ivory hover:bg-indigo',
  'outline-dark': 'border border-ink/35 text-ink hover:border-ink hover:bg-ink/5',
}

export const buttonClass = (variant: Variant, extra = '') => `${base} ${variants[variant]} ${extra}`

export function LinkButton({
  variant = 'saffron',
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={buttonClass(variant, className)} {...props}>
      {children}
    </a>
  )
}

export function Button({
  variant = 'saffron',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  )
}
