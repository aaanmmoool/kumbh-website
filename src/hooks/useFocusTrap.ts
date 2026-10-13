import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Keeps Tab focus inside `container` while `active`, and closes on Escape. */
export function useFocusTrap(container: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return
    const el = container.current
    if (!el) return

    const items = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
    items()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key !== 'Tab') return
      const list = items()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [container, active, onEscape])
}
