import { ChevronDown, CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cottages } from '../../content/cottages'
import { book, brand } from '../../content/site'
import { useBooking } from '../../hooks/useBooking'
import {
  formatDate,
  isPlaceId,
  placeName,
  submitBooking,
  validateBooking,
  type BookingErrors,
  type BookingRequest,
} from '../../lib/booking'
import { FloatingDiya, Ripples } from '../art/HeroScene'
import { Button } from '../ui/Button'
import { CityPicker } from '../ui/CityPicker'
import { MaskedHeading } from '../ui/Reveal'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'unconfigured'
type Field = keyof BookingRequest

const endpointMissing = !import.meta.env.VITE_FORM_ENDPOINT
// Same order as the fields appear, so the first problem on screen gets focus.
const FIELD_ORDER: Field[] = ['place', 'checkIn', 'guests', 'name', 'email', 'phone']

/** The booking request form, at night by the water. Pre-filled from the search and the chosen cottage. */
export function Book() {
  return (
    <section id="book" tabIndex={-1} aria-labelledby="book-title" className="relative overflow-hidden bg-night text-ivory">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true">
        <Ripples className="h-full w-full opacity-70" />
        <FloatingDiya className="absolute bottom-[18%] left-[6%] w-10" />
        <FloatingDiya className="absolute bottom-[34%] left-[30%] w-6 opacity-70" delay={1.2} />
        <FloatingDiya className="absolute bottom-[10%] right-[8%] w-12" delay={2.1} />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(214_139_56/0.22),transparent)]"
        aria-hidden="true"
      />

      <div className="wrap relative grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-8 lg:py-36">
        <div className="lg:col-span-5">
          <MaskedHeading id="book-title" className="t-h2 max-w-[12ch]">
            {book.heading}
          </MaskedHeading>
          <p className="t-lede mt-6 max-w-[28rem] text-ivory/75">{book.body}</p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <BookingForm />
        </div>
      </div>
    </section>
  )
}

function BookingForm() {
  const { search, today, cottageId } = useBooking()
  const [values, setValues] = useState<BookingRequest>({
    name: '',
    email: '',
    phone: '',
    place: '',
    checkIn: '',
    guests: '2',
    cottage: '',
  })
  const [errors, setErrors] = useState<BookingErrors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const refs = useRef<Partial<Record<Field, HTMLElement | null>>>({})
  const resultRef = useRef<HTMLDivElement>(null)

  // Carry the hero search and the chosen cottage into the form.
  useEffect(() => {
    setValues((v) => ({
      ...v,
      place: isPlaceId(search.place) ? search.place : v.place,
      checkIn: search.checkIn || v.checkIn,
    }))
  }, [search.place, search.checkIn])

  useEffect(() => {
    const chosen = cottages.find((c) => c.id === cottageId)
    if (chosen) setValues((v) => ({ ...v, cottage: chosen.id, place: chosen.place }))
  }, [cottageId])

  const check = (next: BookingRequest) => validateBooking(next, today || '0000-00-00')

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value }
    // A cottage belongs to one city; changing city clears a cottage from elsewhere.
    if (field === 'place' && next.cottage && cottages.find((c) => c.id === next.cottage)?.place !== value) next.cottage = ''
    setValues(next)
    if (touched[field]) setErrors(check(next))
  }

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(check(values))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return
    const found = check(values)
    setErrors(found)
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])))
    const first = FIELD_ORDER.find((f) => found[f])
    if (first) return refs.current[first]?.focus()

    setStatus('submitting')
    setMessage('')
    const result = await submitBooking(values)
    setStatus(result.status)
    if (result.status === 'error') setMessage(result.message)
    requestAnimationFrame(() => resultRef.current?.focus())
  }

  if (status === 'success') {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-[3px] border border-gold/30 bg-night-deep/90 p-8 md:p-10">
        <CircleCheck aria-hidden="true" className="h-9 w-9 text-gold-pale" strokeWidth={1.3} />
        <h3 className="t-h3 mt-5">{book.successTitle}</h3>
        <p className="mt-3 max-w-[30rem] text-ivory/75">{book.successBody}</p>
        <p className="mt-6 text-sm text-ivory/60">
          {placeName(values.place)}, check-in {formatDate(values.checkIn)}, {values.guests}{' '}
          {values.guests === '1' ? 'guest' : 'guests'}
        </p>
      </div>
    )
  }

  const error = (field: Field) => (touched[field] ? errors[field] : undefined)
  const control = (invalid: boolean) =>
    `block h-13 w-full rounded-[3px] border bg-night-deep/70 px-4 text-[1.0625rem] text-ivory placeholder:text-ivory/35 [color-scheme:dark] transition-colors focus:border-gold-pale focus:outline-none ${
      invalid ? 'border-[#f0a173]' : 'border-ivory/25 hover:border-ivory/45'
    }`
  const a11y = (field: Field, id: string) => ({
    id,
    'aria-invalid': !!error(field),
    'aria-describedby': error(field) ? `${id}-error` : undefined,
    onBlur: () => blur(field),
    ref: (el: HTMLElement | null) => {
      refs.current[field] = el
    },
  })
  const cottageChoices = values.place ? cottages.filter((c) => c.place === values.place) : cottages

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-describedby="book-privacy"
      className="rounded-[3px] border border-gold/25 bg-night-deep/90 p-6 sm:p-8 md:p-10"
    >
      {import.meta.env.DEV && endpointMissing && (
        <p className="mb-6 rounded-[3px] border border-dashed border-gold/50 px-4 py-3 text-sm text-gold-pale">
          Development note: set <code>VITE_FORM_ENDPOINT</code> in <code>.env</code> to receive booking requests. Until
          then, submitting shows the “not connected” state.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="City" htmlFor="book-place" error={error('place')}>
          <CityPicker
            {...a11y('place', 'book-place')}
            name="place"
            value={values.place}
            placeholder="Choose a city"
            onChange={(v) => update('place', v)}
            className={`${control(!!error('place'))} pr-4 text-left`}
            placeholderClassName="text-ivory/70"
          />
        </Field>

        <Field label="Check-in" htmlFor="book-checkin" error={error('checkIn')}>
          <input
            {...a11y('checkIn', 'book-checkin')}
            type="date"
            name="checkin"
            min={today || undefined}
            value={values.checkIn}
            onChange={(e) => update('checkIn', e.target.value)}
            className={control(!!error('checkIn'))}
          />
        </Field>

        <Field label="Cottage" htmlFor="book-cottage" optional>
          <Select id="book-cottage" value={values.cottage} onChange={(v) => update('cottage', v)} className={control(false)}>
            <option value="">{values.place ? book.anyCottage : 'Any cottage'}</option>
            {cottageChoices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {values.place ? '' : ` — ${placeName(c.place)}`}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Guests" htmlFor="book-guests" error={error('guests')}>
          <Select {...a11y('guests', 'book-guests')} value={values.guests} onChange={(v) => update('guests', v)} className={control(!!error('guests'))}>
            {book.guestOptions.map((n) => (
              <option key={n} value={String(n)}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Your name" htmlFor="book-name" error={error('name')} wide>
          <input
            {...a11y('name', 'book-name')}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            className={control(!!error('name'))}
          />
        </Field>

        <Field label="Email address" htmlFor="book-email" error={error('email')}>
          <input
            {...a11y('email', 'book-email')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@example.com"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            className={control(!!error('email'))}
          />
        </Field>

        <Field label="Phone" htmlFor="book-phone" error={error('phone')} optional>
          <input
            {...a11y('phone', 'book-phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={control(!!error('phone'))}
          />
        </Field>
      </div>

      {(status === 'error' || status === 'unconfigured') && (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 flex gap-3 rounded-[3px] border border-[#f0a173]/60 bg-[#f0a173]/10 px-4 py-3.5 text-[0.9375rem] text-ivory"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#f3b38a]" strokeWidth={1.5} />
          {status === 'error' ? (
            <p>{message}</p>
          ) : (
            <p>
              Online booking requests are not connected yet, so nothing was sent.
              {brand.contactEmail ? (
                <>
                  {' '}
                  Write to{' '}
                  <a className="underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>
                    {brand.contactEmail}
                  </a>{' '}
                  to book instead.
                </>
              ) : (
                ' Please check back soon.'
              )}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' ? (
            <>
              <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" strokeWidth={1.6} />
              {book.submittingLabel}
            </>
          ) : (
            book.submitLabel
          )}
        </Button>
        <p id="book-privacy" className="max-w-[18rem] text-sm text-ivory/55">
          {book.privacyNote}
        </p>
      </div>
    </form>
  )
}

function Select({
  value,
  onChange,
  className,
  children,
  ref,
  ...rest
}: {
  id: string
  value: string
  onChange: (value: string) => void
  className: string
  children: ReactNode
  ref?: (el: HTMLSelectElement | null) => void
  onBlur?: () => void
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}) {
  return (
    <div className="relative">
      <select ref={ref} value={value} onChange={(e) => onChange(e.target.value)} className={`${className} appearance-none pr-12`} {...rest}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ivory/60"
      />
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  optional,
  wide,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  optional?: boolean
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label id={`${htmlFor}-label`} htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-4 text-[0.9375rem] text-ivory/80">
        {label}
        {optional && <span className="text-sm text-ivory/65">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-2 flex items-center gap-2 text-[0.9375rem] text-[#f3b38a]">
          <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      )}
    </div>
  )
}
