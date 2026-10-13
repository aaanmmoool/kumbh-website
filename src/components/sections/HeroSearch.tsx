import { CalendarDays, CircleAlert, MapPin } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { search as copy } from '../../content/site'
import { scrollToSection, useBooking } from '../../hooks/useBooking'
import { validateSearch, type Search, type SearchErrors } from '../../lib/booking'
import { CityPicker } from '../ui/CityPicker'

/**
 * The hero's booking search: a place and a check-in date, nothing more.
 * Submitting filters the cottage listing and scrolls to it.
 */
export function HeroSearch() {
  const { search, setSearch, today } = useBooking()
  const [draft, setDraft] = useState<Search>(search)
  const [errors, setErrors] = useState<SearchErrors>({})
  const placeRef = useRef<HTMLButtonElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  // Follow changes made elsewhere (the URL on load, or the listing's own filters).
  useEffect(() => setDraft(search), [search])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validateSearch(draft, today || '0000-00-00', copy.errors)
    setErrors(found)
    if (found.place) return placeRef.current?.focus()
    if (found.checkIn) return dateRef.current?.focus()
    setSearch(draft)
    requestAnimationFrame(() => scrollToSection('cottages'))
  }

  const describedBy = [errors.place && 'hero-place-error', errors.checkIn && 'hero-date-error'].filter(Boolean).join(' ')

  return (
    <form role="search" aria-label="Find a cottage" noValidate onSubmit={onSubmit} className="w-full max-w-[40rem]">
      <div className="grid overflow-hidden rounded-[3px] bg-ivory text-ink shadow-[0_24px_60px_-28px_rgb(0_0_0/0.7)] [color-scheme:light] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="relative border-b border-ink/12 transition-shadow focus-within:shadow-[inset_0_-3px_0_var(--color-saffron)] sm:border-b-0 sm:border-r">
          <label id="hero-place-label" htmlFor="hero-place" className="flex items-center gap-2 px-5 pt-3.5 text-[0.875rem] text-ink-soft">
            <MapPin aria-hidden="true" className="h-4 w-4 text-saffron-deep" strokeWidth={1.6} />
            {copy.placeLabel}
          </label>
          <CityPicker
            ref={placeRef}
            id="hero-place"
            name="place"
            includeAll
            value={draft.place}
            placeholder={copy.placePrompt}
            onChange={(place) => {
              setDraft({ ...draft, place })
              if (errors.place) setErrors({ ...errors, place: undefined })
            }}
            aria-invalid={!!errors.place}
            aria-describedby={describedBy || undefined}
            className="block min-h-12 w-full bg-transparent pb-3 pl-5 pr-4 pt-1 font-serif text-[1.25rem] leading-tight text-ink focus:outline-none"
            placeholderClassName="text-ink-soft"
          />
        </div>

        <div className="relative border-b border-ink/12 transition-shadow focus-within:shadow-[inset_0_-3px_0_var(--color-saffron)] sm:border-b-0">
          <label htmlFor="hero-date" className="flex items-center gap-2 px-5 pt-3.5 text-[0.875rem] text-ink-soft">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-saffron-deep" strokeWidth={1.6} />
            {copy.dateLabel}
          </label>
          <input
            ref={dateRef}
            id="hero-date"
            name="checkin"
            type="date"
            min={today || undefined}
            value={draft.checkIn}
            onChange={(e) => {
              setDraft({ ...draft, checkIn: e.target.value })
              if (errors.checkIn) setErrors({ ...errors, checkIn: undefined })
            }}
            aria-invalid={!!errors.checkIn}
            aria-describedby={describedBy || undefined}
            className="block min-h-12 w-full bg-transparent pb-3 pl-5 pr-4 pt-1 font-serif text-[1.25rem] leading-tight text-ink focus:outline-none"
          />
        </div>

        <div className="p-2">
          <button
            type="submit"
            className="inline-flex h-full min-h-12 w-full items-center justify-center rounded-[2px] bg-saffron px-6 text-[1.0625rem] font-medium text-night transition-colors hover:bg-night hover:text-ivory"
          >
            {copy.submitLabel}
          </button>
        </div>
      </div>

      {(errors.place || errors.checkIn) && (
        <div className="mt-3 space-y-1 text-[0.9375rem] text-[#f6c08a]">
          {errors.place && (
            <p id="hero-place-error" className="flex items-center gap-2">
              <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              {errors.place}
            </p>
          )}
          {errors.checkIn && (
            <p id="hero-date-error" className="flex items-center gap-2">
              <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              {errors.checkIn}
            </p>
          )}
        </div>
      )}
    </form>
  )
}
