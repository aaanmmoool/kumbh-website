import { AnimatePresence, m } from 'motion/react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { day, type MomentId } from '../../content/site'
import { DayScene } from '../art/DayScene'
import { MaskedHeading } from '../ui/Reveal'

/** Experience preview: one day by the water, moved through by the visitor. */
export function DayOnTheGhat() {
  const [active, setActive] = useState<MomentId>('sunrise')
  const radios = useRef<(HTMLButtonElement | null)[]>([])
  const index = day.moments.findIndex((m) => m.id === active)
  const moment = day.moments[index]

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + day.moments.length) % day.moments.length
    setActive(day.moments[next].id)
    radios.current[next]?.focus()
  }

  return (
    <section id="day" tabIndex={-1} aria-labelledby="day-title" className="grain relative bg-ivory py-24 text-ink md:py-32 lg:py-36">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <MaskedHeading id="day-title" className="t-h2 lg:col-span-7">
            {day.heading}
          </MaskedHeading>
          <p className="t-lede max-w-[30rem] text-ink-soft lg:col-span-4 lg:col-start-9 lg:pb-2">{day.intro}</p>
        </div>

        <figure className="mt-12 md:mt-16">
          <div className="relative aspect-square overflow-hidden rounded-[3px] bg-night sm:aspect-[16/10] lg:aspect-[21/9]">
            <DayScene moment={active} className="absolute inset-0 h-full w-full" />
          </div>

          <div
            role="radiogroup"
            aria-label="Time of day"
            onKeyDown={onKeyDown}
            className="relative mt-6 grid grid-cols-5"
          >
            <span aria-hidden="true" className="absolute inset-x-[10%] top-[1.375rem] h-px bg-ink/20" />
            {day.moments.map((m, i) => {
              const checked = m.id === active
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    radios.current[i] = el
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => setActive(m.id)}
                  className={`group relative flex min-h-[5.25rem] flex-col items-center gap-2 rounded-[3px] px-1 pt-3.5 text-center text-[0.875rem] leading-tight transition-colors sm:text-[0.9375rem] ${
                    checked ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative grid h-4 w-4 place-items-center rounded-full border transition-colors duration-500 ${
                      checked ? 'border-saffron bg-saffron' : 'border-ink/40 bg-ivory group-hover:border-ink'
                    }`}
                  >
                    <span
                      className={`absolute -inset-[5px] rounded-full border border-saffron/60 transition-[opacity,transform] duration-500 ${
                        checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      }`}
                    />
                  </span>
                  {m.label}
                </button>
              )
            })}
          </div>

          <figcaption className="mt-8 grid gap-3 border-t border-ink/15 pt-8 md:grid-cols-12 md:gap-8" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={moment.id}
                className="contents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <m.p
                  className="font-serif text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-tight md:col-span-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {moment.name}
                </m.p>
                <m.p
                  className="t-lede max-w-[36rem] text-ink-soft md:col-span-7 md:col-start-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {moment.text}
                </m.p>
              </m.div>
            </AnimatePresence>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
