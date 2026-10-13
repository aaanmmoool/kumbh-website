import { CalendarDays, Info, Users } from 'lucide-react'
import { cottages } from '../../content/cottages'
import { cottagesSection as copy, places, search as searchCopy } from '../../content/site'
import { useBooking } from '../../hooks/useBooking'
import { formatDate, placeName, type PlaceFilter } from '../../lib/booking'
import { CottageArt } from '../art/CottageArt'
import { ArchOutline } from '../art/ArchOutline'
import { Button } from '../ui/Button'
import { MaskedHeading } from '../ui/Reveal'

const FILTERS: { id: PlaceFilter; label: string }[] = [
  { id: 'all', label: 'All cities' },
  ...places.map((p) => ({ id: p.id as PlaceFilter, label: p.name })),
]

/** The listing: every cottage, narrowed by the city and check-in date chosen in the hero. */
export function Cottages() {
  const { search, setSearch, today, requestCottage } = useBooking()
  const activePlace: PlaceFilter = search.place || 'all'
  const results = activePlace === 'all' ? cottages : cottages.filter((c) => c.place === activePlace)
  const where = activePlace === 'all' ? 'across all four cities' : `in ${placeName(activePlace)}`
  const when = search.checkIn ? `, check-in ${formatDate(search.checkIn)}` : ''

  return (
    <section id="cottages" tabIndex={-1} aria-labelledby="cottages-title" className="grain relative bg-ivory pb-24 pt-14 text-ink md:pb-32 md:pt-20">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <MaskedHeading id="cottages-title" className="t-h2 max-w-[14ch] lg:col-span-7">
            {copy.heading}
          </MaskedHeading>
          <p className="t-lede max-w-[30rem] text-ink-soft lg:col-span-4 lg:col-start-9 lg:pb-2">{copy.intro}</p>
        </div>

        {/* Filters: the same search as the hero, adjustable in place */}
        <div className="mt-10 flex flex-col gap-5 border-y border-ink/15 py-5 md:mt-14 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter cottages by city" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const pressed = activePlace === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setSearch({ ...search, place: f.id })}
                  className={`min-h-11 rounded-full border px-4 text-[0.9375rem] transition-colors ${
                    pressed ? 'border-night bg-night text-ivory' : 'border-ink/25 text-ink hover:border-ink'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <label className="flex items-center gap-3 text-[0.9375rem] text-ink-soft">
            <CalendarDays aria-hidden="true" className="h-5 w-5 text-saffron-deep" strokeWidth={1.5} />
            {searchCopy.dateLabel}
            <input
              type="date"
              name="listing-checkin"
              min={today || undefined}
              value={search.checkIn}
              onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
              className="min-h-11 rounded-[3px] border border-ink/25 bg-transparent px-3 text-ink [color-scheme:light] hover:border-ink focus:border-ink"
            />
          </label>
        </div>

        <p className="mt-6 text-[1.0625rem]" aria-live="polite">
          <span className="font-medium">
            {results.length} {results.length === 1 ? 'cottage' : 'cottages'} {where}
          </span>
          <span className="text-ink-soft">{when}</span>
        </p>
        <p className="mt-2 flex max-w-[44rem] gap-2 text-[0.9375rem] text-ink-soft">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-saffron-deep" strokeWidth={1.6} />
          {copy.notice}
        </p>

        {results.length > 0 ? (
          <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((cottage) => {
              const place = places.find((p) => p.id === cottage.place)!
              return (
                <li key={cottage.id}>
                  <article aria-labelledby={`cottage-${cottage.id}`} className="group flex h-full flex-col">
                    <div className="relative mx-2 mt-2 aspect-[6/5]">
                      <div className="arch-mask absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-hover:-translate-y-1">
                        <CottageArt art={cottage.art} place={cottage.place} className="h-full w-full" />
                      </div>
                      <ArchOutline className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]" />
                    </div>
                    <div className="mt-7 flex items-baseline justify-between gap-4">
                      <p className="text-[0.9375rem] font-medium text-saffron-deep">
                        {place.name}
                        <span className="text-ink-soft"> on the {place.river}</span>
                      </p>
                      <p lang="hi" className="text-[0.9375rem] text-ink-soft/80" aria-hidden="true">
                        {cottage.nameDevanagari}
                      </p>
                    </div>
                    <h3 id={`cottage-${cottage.id}`} className="t-h3 mt-2">
                      {cottage.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-ink-soft">
                      {cottage.kind}
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink/30" />
                      <Users aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
                      Sleeps {cottage.sleeps}
                    </p>
                    <p className="mt-3 flex-1 text-ink-soft">{cottage.summary}</p>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-5">
                      <span className="flex items-center gap-2 text-[0.9375rem] text-teal">
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal" />
                        {copy.status}
                      </span>
                      <Button
                        type="button"
                        variant="night"
                        onClick={() => requestCottage(cottage.id)}
                        aria-label={`${copy.requestLabel}: ${cottage.name}`}
                        className="min-h-11 px-5 text-[1rem]"
                      >
                        {copy.requestLabel}
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-12 rounded-[3px] border border-dashed border-ink/30 px-6 py-12 text-center">
            <h3 className="t-h3">{copy.emptyTitle(placeName(activePlace))}</h3>
            <p className="mx-auto mt-3 max-w-[30rem] text-ink-soft">{copy.emptyBody}</p>
            <Button type="button" variant="outline-dark" className="mt-6" onClick={() => setSearch({ ...search, place: 'all' })}>
              {copy.showAll}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
