import { places, type PlaceId } from '../content/site'

/* -------------------------------------------------------------------------- */
/*  Dates                                                                      */
/* -------------------------------------------------------------------------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date as yyyy-mm-dd in the visitor's own time zone. */
export function todayISO(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isValidISODate(value: string) {
  if (!ISO_DATE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/** "Thu, 14 Jan 2027" — parsed as a local date so it never shifts by a day. */
export function formatDate(iso: string) {
  if (!isValidISODate(iso)) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const parts = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .formatToParts(new Date(y, m - 1, d))
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {})
  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`
}

/* -------------------------------------------------------------------------- */
/*  Search                                                                     */
/* -------------------------------------------------------------------------- */

export type PlaceFilter = PlaceId | 'all'

export type Search = {
  /** '' until the visitor has chosen. */
  place: PlaceFilter | ''
  checkIn: string
}

export const isPlaceId = (value: string): value is PlaceId => places.some((p) => p.id === value)
export const isPlaceFilter = (value: string): value is PlaceFilter => value === 'all' || isPlaceId(value)
export const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? ''

export type SearchErrors = Partial<Record<keyof Search, string>>

export function validateSearch(search: Search, today: string, messages: { place: string; date: string; past: string }) {
  const errors: SearchErrors = {}
  if (!search.place) errors.place = messages.place
  if (!search.checkIn || !isValidISODate(search.checkIn)) errors.checkIn = messages.date
  else if (search.checkIn < today) errors.checkIn = messages.past
  return errors
}

/* -------------------------------------------------------------------------- */
/*  Booking request                                                            */
/* -------------------------------------------------------------------------- */

export type BookingRequest = {
  name: string
  email: string
  phone: string
  place: PlaceId | ''
  checkIn: string
  guests: string
  cottage: string
}

export type BookingErrors = Partial<Record<keyof BookingRequest, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateBooking(input: BookingRequest, today: string): BookingErrors {
  const errors: BookingErrors = {}
  const name = input.name.trim()
  const email = input.email.trim()
  const phoneDigits = input.phone.replace(/\D/g, '')

  if (!name) errors.name = 'Enter your name.'
  else if (name.length < 2) errors.name = 'Your name needs at least two characters.'
  else if (name.length > 120) errors.name = 'Keep your name under 120 characters.'

  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter an email address like name@example.com.'

  if (input.phone.trim() && (phoneDigits.length < 7 || phoneDigits.length > 15 || /[^\d\s+()-]/.test(input.phone)))
    errors.phone = 'Enter a phone number with 7 to 15 digits, or leave it empty.'

  if (!input.place || !isPlaceId(input.place)) errors.place = 'Choose the city you want to stay in.'

  if (!input.checkIn || !isValidISODate(input.checkIn)) errors.checkIn = 'Choose your check-in date.'
  else if (input.checkIn < today) errors.checkIn = 'Choose a date from today onwards.'

  const guests = Number(input.guests)
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) errors.guests = 'Choose between 1 and 8 guests.'

  return errors
}

export type SubmitResult = { status: 'success' } | { status: 'unconfigured' } | { status: 'error'; message: string }

type SubmitOptions = {
  endpoint?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

/**
 * Sends the booking request as JSON to VITE_FORM_ENDPOINT. When no endpoint is
 * configured it returns `unconfigured` instead of pretending the request went through.
 */
export async function submitBooking(
  input: BookingRequest,
  {
    endpoint = import.meta.env.VITE_FORM_ENDPOINT,
    fetchImpl = globalThis.fetch,
    timeoutMs = 12000,
  }: SubmitOptions = {},
): Promise<SubmitResult> {
  if (!endpoint || !endpoint.trim()) return { status: 'unconfigured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        type: 'booking-request',
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        place: input.place,
        checkIn: input.checkIn,
        guests: Number(input.guests),
        cottage: input.cottage || null,
      }),
      signal: controller.signal,
    })

    if (response.ok) return { status: 'success' }
    if (response.status === 429)
      return { status: 'error', message: 'Too many requests in a short time. Wait a minute, then try again.' }
    if (response.status >= 500)
      return { status: 'error', message: 'The server could not take your request just now. Try again in a few minutes.' }
    return { status: 'error', message: 'Your request was not accepted. Check your details and try again.' }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      return { status: 'error', message: 'The request took too long. Check your connection and try again.' }
    return { status: 'error', message: 'Your request could not be sent. Check your connection and try again.' }
  } finally {
    clearTimeout(timer)
  }
}
