import { AnimatePresence, m } from 'motion/react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { journey, type StageId } from '../../content/site'
import { ArchOutline } from '../art/ArchOutline'
import { Photo, type PhotoSlug } from '../ui/Photo'
import { MaskedHeading } from '../ui/Reveal'

/** The four movements of a pilgrimage — a real sequence, so it is numbered. */
export function Journey() {
  const [active, setActive] = useState<StageId>(journey.stages[0].id)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const index = journey.stages.findIndex((s) => s.id === active)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = journey.stages.length
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: count - 1,
    }
    if (!(e.key in moves)) return
    e.preventDefault()
    const next = (moves[e.key] + count) % count
    setActive(journey.stages[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <section
      id="journey"
      tabIndex={-1}
      aria-labelledby="journey-title"
      className="grain relative bg-sand py-24 text-ink md:py-32 lg:py-36"
    >
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <MaskedHeading id="journey-title" className="t-h2 max-w-[14ch] lg:col-span-7">
            {journey.heading}
          </MaskedHeading>
          <p className="t-lede max-w-[30rem] text-ink-soft lg:col-span-4 lg:col-start-9 lg:pb-2">{journey.intro}</p>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:gap-8">
          <div
            role="tablist"
            aria-label="Movements of the pilgrimage"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] bg-ink/15 lg:col-span-4 lg:grid-cols-1 lg:gap-0 lg:self-start lg:overflow-visible lg:rounded-none lg:bg-transparent"
          >
            {journey.stages.map((stage, i) => {
              const selected = stage.id === active
              return (
                <button
                  key={stage.id}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  id={`tab-${stage.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${stage.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(stage.id)}
                  className={`group relative flex min-h-[4.5rem] flex-col items-start justify-center px-4 py-3 text-left transition-colors duration-300 lg:min-h-0 lg:flex-row lg:items-baseline lg:gap-5 lg:border-t lg:border-ink/15 lg:px-0 lg:py-6 lg:pl-6 ${
                    selected ? 'bg-ivory text-ink lg:bg-transparent' : 'bg-sand text-ink-soft hover:text-ink lg:bg-transparent'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-saffron transition-transform duration-500 ease-[var(--ease-soft)] lg:inset-x-auto lg:inset-y-4 lg:left-0 lg:h-auto lg:w-0.5 lg:origin-center ${
                      selected ? 'scale-x-100 lg:scale-y-100' : 'scale-x-0 lg:scale-x-100 lg:scale-y-0'
                    }`}
                  />
                  <span className="text-sm tabular-nums text-saffron-deep lg:w-6 lg:shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-[1.35rem] leading-tight lg:text-[1.75rem]">{stage.title}</span>
                  <span lang="hi" className="hidden text-lg text-ink-soft/80 lg:ml-auto lg:inline">
                    {stage.word}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            {journey.stages.map((stage, i) => (
              <div
                key={stage.id}
                id={`panel-${stage.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${stage.id}`}
                hidden={stage.id !== active}
                tabIndex={0}
                className="rounded-[3px] focus-visible:outline-offset-8"
              >
                <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12">
                  <div className="relative mx-auto aspect-[5/6] w-full max-w-[22rem] md:max-w-none">
                    <AnimatePresence initial={false} mode="popLayout">
                      {stage.id === active && (
                        <m.div
                          key={stage.id}
                          className="arch-mask absolute inset-0"
                          initial={{ clipPath: 'inset(100% 0 0 0)' }}
                          animate={{ clipPath: 'inset(0% 0 0 0)' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                        >
                          <Photo
                            slug={stage.photo as PhotoSlug}
                            sizes="(min-width: 1024px) 26vw, (min-width: 768px) 40vw, 88vw"
                            className="absolute inset-0"
                          />
                        </m.div>
                      )}
                    </AnimatePresence>
                    <ArchOutline className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]" />
                  </div>

                  <div>
                    <p className="flex items-baseline gap-3 text-saffron-deep">
                      <span lang="hi" className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-none">
                        {stage.word}
                      </span>
                      <span className="text-lg text-ink-soft">{stage.translit}</span>
                    </p>
                    <h3 className="t-h3 mt-6">
                      <span className="sr-only">
                        {i + 1}. {stage.title}:{' '}
                      </span>
                      {stage.subtitle}
                    </h3>
                    <p className="mt-3 max-w-[28rem] text-ink-soft">{stage.text}</p>
                    <p className="mt-8 text-sm text-ink-soft/80" aria-hidden="true">
                      {i + 1} of {journey.stages.length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
