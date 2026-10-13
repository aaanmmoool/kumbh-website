import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cottages } from '../content/cottages'
import { isPlaceFilter, isValidISODate, todayISO, type Search } from '../lib/booking'

type BookingContextValue = {
  search: Search
  /** Today in the visitor's time zone; '' during prerender so markup stays stable. */
  today: string
  setSearch: (next: Search) => void
  cottageId: string
  /** Picks a cottage for the booking form and moves the visitor there. */
  requestCottage: (id: string) => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

/** Keeps the search in the URL (?place=…&checkin=…) so results can be shared and survive a reload. */
function writeSearchToUrl(search: Search) {
  try {
    const url = new URL(window.location.href)
    if (search.place) url.searchParams.set('place', search.place)
    else url.searchParams.delete('place')
    if (search.checkIn) url.searchParams.set('checkin', search.checkIn)
    else url.searchParams.delete('checkin')
    window.history.replaceState(window.history.state, '', url)
  } catch {
    // Some embedded contexts do not allow history changes; the search still works without it.
  }
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView()
  target.focus({ preventScroll: true })
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [search, setSearchState] = useState<Search>({ place: '', checkIn: '' })
  const [today, setToday] = useState('')
  const [cottageId, setCottageId] = useState('')

  useEffect(() => {
    setToday(todayISO())
    const params = new URLSearchParams(window.location.search)
    const place = params.get('place') ?? ''
    const checkIn = params.get('checkin') ?? ''
    if (isPlaceFilter(place) || isValidISODate(checkIn)) {
      setSearchState({ place: isPlaceFilter(place) ? place : '', checkIn: isValidISODate(checkIn) ? checkIn : '' })
    }
  }, [])

  const setSearch = useCallback((next: Search) => {
    setSearchState(next)
    writeSearchToUrl(next)
  }, [])

  const requestCottage = useCallback(
    (id: string) => {
      const cottage = cottages.find((c) => c.id === id)
      setCottageId(id)
      if (cottage && search.place !== cottage.place) setSearch({ ...search, place: cottage.place })
      requestAnimationFrame(() => scrollToSection('book'))
    },
    [search, setSearch],
  )

  const value = useMemo(
    () => ({ search, today, setSearch, cottageId, requestCottage }),
    [search, today, setSearch, cottageId, requestCottage],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const value = useContext(BookingContext)
  if (!value) throw new Error('useBooking must be used inside <BookingProvider>')
  return value
}
