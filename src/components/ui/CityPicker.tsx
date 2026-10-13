import { Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { places, search as copy } from '../../content/site'
import type { PlaceFilter } from '../../lib/booking'
import { Photo, type PhotoSlug } from './Photo'

type Choice = {
  value: PlaceFilter
  name: string
  detail: string
  devanagari?: string
  photos: { slug: PhotoSlug; position: string }[]
}

const CITY_CHOICES: Choice[] = places.map((p) => ({
  value: p.id,
  name: p.name,
  detail: `on the ${p.river}`,
  devanagari: p.devanagari,
  photos: [{ slug: p.photo as PhotoSlug, position: p.photoPosition }],
}))

const ALL_CHOICE: Choice = {
  value: 'all',
  name: copy.allPlaces,
  detail: places.map((p) => p.name).join(', '),
  photos: CITY_CHOICES.map((c) => c.photos[0]),
}

type Position = { left: number; width: number; top?: number; bottom?: number; maxHeight?: number; above: boolean }

type CityPickerProps = {
  id: string
  value: PlaceFilter | ''
  onChange: (value: PlaceFilter) => void
  placeholder: string
  /** Adds "All four cities" after the four cities. */
  includeAll?: boolean
  /** Classes for the trigger: size, padding, type and colour. */
  className?: string
  placeholderClassName?: string
  /** Submitted with the form when set. */
  name?: string
  ref?: Ref<HTMLButtonElement>
  onBlur?: () => void
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

const GAP = 8
const GUTTER = 12

/**
 * A city picker where every city is shown over a photograph of its river.
 * It follows the WAI-ARIA "select-only combobox" pattern: focus stays on the
 * trigger, arrow keys, Home/End and typing move through the cities, Enter or
 * Space chooses, Escape closes. The list is portalled to <body> so the hero's
 * clipping and parallax never cut it off, and it opens upwards when there is
 * more room above.
 */
export function CityPicker({
  id,
  value,
  onChange,
  placeholder,
  includeAll = false,
  className = '',
  placeholderClassName = '',
  name,
  ref,
  onBlur,
  ...aria
}: CityPickerProps) {
  const choices = includeAll ? [...CITY_CHOICES, ALL_CHOICE] : CITY_CHOICES
  const selectedIndex = choices.findIndex((c) => c.value === value)
  const selected = choices[selectedIndex]

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState<Position | null>(null)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const typed = useRef({ text: '', timer: 0 })
  const opensAbove = useRef(false)
  const listId = `${id}-listbox`
  const optionId = (i: number) => `${id}-option-${choices[i].value}`

  useEffect(() => setMounted(true), [])

  const setButton = useCallback(
    (el: HTMLButtonElement | null) => {
      buttonRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )

  const show = (index: number) => {
    setActive(Math.max(0, Math.min(choices.length - 1, index)))
    if (open) return
    // A first guess at the side it opens on, so the entrance moves the right way.
    const r = buttonRef.current?.getBoundingClientRect()
    if (r) {
      const below = window.innerHeight - r.bottom - GAP - GUTTER
      opensAbove.current = choices.length * 76 + 16 > below && r.top - GAP - GUTTER > below
    }
    setOpen(true)
  }
  // The last position is kept so the list fades out where it was.
  const close = () => setOpen(false)
  const choose = (index: number) => {
    onChange(choices[index].value)
    close()
  }

  // Place the list under (or over) the trigger, and keep it there while the page scrolls.
  const place = useCallback(() => {
    const button = buttonRef.current
    const list = listRef.current
    if (!button || !list) return
    const r = button.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const width = Math.min(Math.max(r.width, 352), vw - GUTTER * 2)
    const left = Math.min(Math.max(r.left, GUTTER), vw - GUTTER - width)
    const natural = list.scrollHeight
    const below = vh - r.bottom - GAP - GUTTER
    const above = r.top - GAP - GUTTER
    if (natural <= below || below >= above) {
      setPosition({ left, width, top: r.bottom + GAP, maxHeight: natural <= below ? undefined : Math.max(below, 160), above: false })
    } else {
      setPosition({ left, width, bottom: vh - r.top + GAP, maxHeight: natural <= above ? undefined : above, above: true })
    }
  }, [])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    let frame = 0
    const onMove = (e: Event) => {
      if (e.target instanceof Node && listRef.current?.contains(e.target)) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return
      close()
    }
    window.addEventListener('scroll', onMove, { capture: true, passive: true })
    window.addEventListener('resize', onMove)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onMove, { capture: true })
      window.removeEventListener('resize', onMove)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, place])

  // Keep the highlighted city in view when the list has to scroll.
  useEffect(() => {
    if (open && position) (listRef.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, position])

  const typeAhead = (key: string) => {
    window.clearTimeout(typed.current.timer)
    typed.current.text += key.toLowerCase()
    typed.current.timer = window.setTimeout(() => (typed.current.text = ''), 600)
    const text = typed.current.text
    const start = open ? active + (text.length === 1 ? 1 : 0) : Math.max(selectedIndex, 0)
    for (let step = 0; step < choices.length; step++) {
      const i = (start + step) % choices.length
      if (choices[i].name.toLowerCase().startsWith(text)) return show(i)
    }
    if (!open) show(Math.max(selectedIndex, 0))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = choices.length - 1
    const current = Math.max(selectedIndex, 0)
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show(current)
      } else if (e.key === 'Home') {
        e.preventDefault()
        show(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        show(last)
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typeAhead(e.key)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive(Math.min(active + 1, last))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (e.altKey) choose(active)
        else setActive(Math.max(active - 1, 0))
        break
      case 'Home':
      case 'PageUp':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
      case 'PageDown':
        e.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (e.key === ' ' && typed.current.text) typeAhead(' ')
        else choose(active)
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        close()
        break
      case 'Tab':
        choose(active)
        break
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key)
    }
  }

  return (
    <>
      <button
        ref={setButton}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && position ? optionId(active) : undefined}
        aria-invalid={aria['aria-invalid']}
        aria-describedby={aria['aria-describedby']}
        onClick={() => (open ? close() : show(Math.max(selectedIndex, 0)))}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (open) close()
          onBlur?.()
        }}
        className={`text-left ${className}`}
      >
        <span className="flex w-full items-center gap-3">
          {selected && <Thumb choice={selected} className="h-8 w-[1.7rem]" />}
          <span className={`min-w-0 flex-1 truncate ${selected ? '' : placeholderClassName}`}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.5}
            className={`h-5 w-5 shrink-0 opacity-70 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value} />}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <m.ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-labelledby={`${id}-label`}
                tabIndex={-1}
                // Keep focus on the trigger when a city is clicked.
                onMouseDown={(e) => e.preventDefault()}
                initial={{ opacity: 0, y: opensAbove.current ? 8 : -8 }}
                animate={{ opacity: position ? 1 : 0, y: 0 }}
                exit={{ opacity: 0, y: position?.above ? 6 : -6, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  left: position?.left ?? 0,
                  width: position?.width ?? 352,
                  top: position?.top,
                  bottom: position?.bottom,
                  maxHeight: position?.maxHeight,
                  visibility: position ? 'visible' : 'hidden',
                }}
                className="fixed z-[60] grid gap-1.5 overflow-y-auto overscroll-contain rounded-[4px] border border-gold/30 bg-night-deep p-1.5 text-ivory shadow-[0_28px_70px_-24px_rgb(0_0_0/0.85)] [scrollbar-width:thin]"
              >
                {choices.map((choice, i) => {
                  const isActive = i === active
                  const isSelected = i === selectedIndex
                  return (
                    <m.li
                      key={choice.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isSelected}
                      data-active={isActive ? '' : undefined}
                      onPointerMove={() => !isActive && setActive(i)}
                      onClick={() => choose(i)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.04 * i + 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative isolate flex min-h-16 cursor-pointer items-center gap-3 overflow-hidden rounded-[2px] px-4 py-3 sm:min-h-[4.5rem]"
                    >
                      <span aria-hidden="true" className={`absolute inset-0 -z-20 grid grid-rows-1 bg-night ${choice.photos.length > 1 ? 'grid-cols-4' : 'grid-cols-1'}`}>
                        {choice.photos.map((p) => (
                          <span key={p.slug} className="relative overflow-hidden">
                            <Photo
                              decorative
                              slug={p.slug}
                              position={p.position}
                              sizes={choice.photos.length > 1 ? '6rem' : '24rem'}
                              className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-data-active:scale-[1.06]"
                            />
                          </span>
                        ))}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(8_12_34/0.94)_0%,rgb(8_12_34/0.72)_42%,rgb(8_12_34/0.3)_100%)] transition-opacity duration-500 group-data-active:opacity-80"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-transparent transition-shadow duration-300 group-data-active:ring-gold-pale/80"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-serif text-[1.25rem] leading-tight">{choice.name}</span>
                        <span className="mt-0.5 truncate text-[0.875rem] text-ivory/80">{choice.detail}</span>
                      </span>
                      {choice.devanagari && (
                        <span lang="hi" aria-hidden="true" className="font-serif text-[1.125rem] text-gold-pale [text-shadow:0_1px_12px_rgb(8_12_34/0.9)]">
                          {choice.devanagari}
                        </span>
                      )}
                      <Check
                        aria-hidden="true"
                        strokeWidth={2}
                        className={`h-5 w-5 shrink-0 text-gold-pale ${isSelected ? '' : 'invisible'}`}
                      />
                    </m.li>
                  )
                })}
              </m.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

/** A small arch-framed photo of the chosen city (a 2×2 grid for all four). */
function Thumb({ choice, className }: { choice: Choice; className: string }) {
  return (
    <span aria-hidden="true" className={`arch-mask grid shrink-0 overflow-hidden bg-night ${choice.photos.length > 1 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1 grid-rows-1'} ${className}`}>
      {choice.photos.map((p) => (
        // Each photo sits in its own cell: a <picture>'s <source> elements must not become grid items.
        <span key={p.slug} className="relative overflow-hidden">
          <Photo decorative slug={p.slug} position={p.position} sizes="48px" className="absolute inset-0" />
        </span>
      ))}
    </span>
  )
}
