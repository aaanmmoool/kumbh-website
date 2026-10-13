import { describe, expect, it, vi } from 'vitest'
import { formatDate, isValidISODate, submitBooking, todayISO, validateBooking, validateSearch, type BookingRequest } from '../../src/lib/booking'

const TODAY = '2026-10-13'
const messages = { place: 'place', date: 'date', past: 'past' }
const valid: BookingRequest = {
  name: 'Asha Verma',
  email: 'asha@example.com',
  phone: '+91 98765 43210',
  place: 'haridwar',
  checkIn: '2027-01-14',
  guests: '3',
  cottage: 'ganga-kutir',
}

describe('dates', () => {
  it('formats today in local time and validates real calendar dates', () => {
    expect(todayISO(new Date(2027, 0, 5))).toBe('2027-01-05')
    expect(isValidISODate('2027-02-28')).toBe(true)
    expect(isValidISODate('2027-02-30')).toBe(false)
    expect(isValidISODate('14/01/2027')).toBe(false)
  })

  it('formats a date without shifting it across time zones', () => {
    expect(formatDate('2027-01-14')).toMatch(/14 Jan 2027/)
    expect(formatDate('nonsense')).toBe('')
  })
})

describe('validateSearch', () => {
  it('needs both a place and a check-in date', () => {
    expect(validateSearch({ place: '', checkIn: '' }, TODAY, messages)).toEqual({ place: 'place', checkIn: 'date' })
  })
  it('refuses past dates and accepts today', () => {
    expect(validateSearch({ place: 'ujjain', checkIn: '2026-10-12' }, TODAY, messages)).toEqual({ checkIn: 'past' })
    expect(validateSearch({ place: 'all', checkIn: TODAY }, TODAY, messages)).toEqual({})
  })
})

describe('validateBooking', () => {
  it('accepts a complete request', () => {
    expect(validateBooking(valid, TODAY)).toEqual({})
  })
  it('lets phone stay empty but checks it when given', () => {
    expect(validateBooking({ ...valid, phone: '' }, TODAY)).toEqual({})
    expect(validateBooking({ ...valid, phone: '12ab' }, TODAY).phone).toMatch(/7 to 15 digits/)
  })
  it('reports every missing required field', () => {
    const errors = validateBooking({ ...valid, name: '', email: 'x', place: '', checkIn: '', guests: '0' }, TODAY)
    expect(Object.keys(errors).sort()).toEqual(['checkIn', 'email', 'guests', 'name', 'place'])
  })
})

describe('submitBooking', () => {
  it('reports "unconfigured" instead of pretending to succeed when no endpoint is set', async () => {
    const fetchImpl = vi.fn()
    await expect(submitBooking(valid, { endpoint: '', fetchImpl })).resolves.toEqual({ status: 'unconfigured' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts the request as JSON and reports success on 2xx', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
    const result = await submitBooking({ ...valid, name: '  Asha Verma ' }, { endpoint: 'https://api.test/bookings', fetchImpl })
    expect(result).toEqual({ status: 'success' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.test/bookings')
    expect(JSON.parse(init.body)).toEqual({
      type: 'booking-request',
      name: 'Asha Verma',
      email: 'asha@example.com',
      phone: '+91 98765 43210',
      place: 'haridwar',
      checkIn: '2027-01-14',
      guests: 3,
      cottage: 'ganga-kutir',
    })
  })

  it.each([
    [429, /Too many requests/],
    [503, /could not take your request/],
    [400, /not accepted/],
  ])('explains a %i response', async (status, message) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', { status }))
    const result = await submitBooking(valid, { endpoint: 'https://api.test', fetchImpl })
    expect(result.status === 'error' && result.message).toMatch(message)
  })

  it('handles network failures and timeouts', async () => {
    const offline = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    expect(await submitBooking(valid, { endpoint: 'https://api.test', fetchImpl: offline })).toEqual({
      status: 'error',
      message: expect.stringMatching(/could not be sent/),
    })
    const hang = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) =>
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
        ),
    )
    expect(await submitBooking(valid, { endpoint: 'https://api.test', fetchImpl: hang as typeof fetch, timeoutMs: 20 })).toEqual({
      status: 'error',
      message: expect.stringMatching(/took too long/),
    })
  })
})
