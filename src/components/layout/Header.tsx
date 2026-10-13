import { Menu, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { brand, cta, nav } from '../../content/site'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useHeaderState } from '../../hooks/useScrollDirection'
import { LogoMark, Wordmark } from '../art/Logo'
import { LinkButton } from '../ui/Button'

export function Header() {
  const { scrolled, hidden } = useHeaderState()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    toggle.current?.focus()
  }, [])

  /** Close the menu first so the page is scrollable again, then travel to the section. */
  const navigate = useCallback((href: string) => {
    setOpen(false)
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(href)
      if (!target) return
      try {
        history.pushState(null, '', href)
      } catch {
        // History may be locked down in embedded contexts; scrolling still works.
      }
      target.scrollIntoView()
      target.focus({ preventScroll: true })
    })
  }, [])

  // Close the menu if the viewport grows past the breakpoint where it isn't used.
  useEffect(() => {
    if (!open) return
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [open])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    const main = document.getElementById('main')
    const footer = document.querySelector('footer')
    if (open) {
      main?.setAttribute('inert', '')
      footer?.setAttribute('inert', '')
    } else {
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
    }
  }, [open])

  const solid = scrolled && !open

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-soft)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${solid ? 'border-b border-gold/20 bg-night/95' : 'border-b border-transparent bg-transparent'}`}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6 text-ivory">
          <a href="#top" className="-mx-2 rounded-sm px-2 py-1.5">
            <Wordmark />
            <span className="sr-only">, back to the top</span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="relative py-2 text-[1rem] text-ivory/80 transition-colors hover:text-ivory after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-pale after:transition-transform after:duration-500 hover:after:scale-x-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <LinkButton href={cta.nav.href} variant="outline-light" className="min-h-11 px-5 max-sm:hidden">
              {cta.nav.label}
            </LinkButton>
            <button
              ref={toggle}
              type="button"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-sm text-ivory lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => (open ? close() : setOpen(true))}
            >
              {open ? <X aria-hidden="true" size={24} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>{open && <MobileMenu onClose={close} onNavigate={navigate} />}</AnimatePresence>
    </>
  )
}

function MobileMenu({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => void }) {
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(panel, true, onClose)

  return (
    <m.div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-night text-ivory lg:hidden"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="jaali pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div className="wrap relative flex h-[calc(var(--header-h)+env(safe-area-inset-top))] shrink-0 items-center justify-between pt-[env(safe-area-inset-top)]">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('#top')
          }}
          className="-mx-2 rounded-sm px-2 py-1.5"
        >
          <Wordmark />
          <span className="sr-only">, back to the top</span>
        </a>
        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-sm"
          aria-label="Close menu"
          onClick={onClose}
        >
          <X aria-hidden="true" size={24} strokeWidth={1.5} />
        </button>
      </div>

      <nav aria-label="Mobile" className="wrap relative flex flex-1 flex-col justify-center py-10">
        <ul className="space-y-1">
          {nav.map((item, i) => (
            <m.li
              key={item.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.href)
                }}
                className="flex min-h-14 items-center border-b border-ivory/10 py-3 font-serif text-[clamp(2rem,9vw,3rem)] leading-tight"
              >
                {item.label}
              </a>
            </m.li>
          ))}
        </ul>
      </nav>

      <m.div
        className="wrap relative pb-[max(2rem,env(safe-area-inset-bottom))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <LinkButton
          href={cta.nav.href}
          onClick={(e) => {
            e.preventDefault()
            onNavigate(cta.nav.href)
          }}
          className="w-full"
        >
          {cta.nav.label}
        </LinkButton>
        <p className="mt-6 flex items-center gap-2 text-sm text-ivory/55">
          <LogoMark className="h-5 w-5" strokeWidth={1.6} />
          {brand.tagline}
        </p>
      </m.div>
    </m.div>
  )
}
