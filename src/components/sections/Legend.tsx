import { useEffect, useRef, useState } from 'react'
import { legend } from '../../content/site'
import { RiverEdge } from '../art/Edges'
import { Stars } from '../art/HeroScene'
import { SkyClock } from '../art/SkyClock'
import { MaskedHeading } from '../ui/Reveal'

const NUMERALS = ['१', '२', '३', '४']

/**
 * The legend, told at night. On wide screens the sky-clock diagram stays in
 * view while the four chapters scroll past and change it; on phones each
 * chapter carries its own copy of the diagram instead of pinning anything.
 */
export function Legend() {
  const [step, setStep] = useState(0)
  const chapters = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.step))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    chapters.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="legend"
      tabIndex={-1}
      aria-labelledby="legend-title"
      className="relative overflow-x-clip bg-night text-ivory"
    >
      <RiverEdge className="-translate-y-px rotate-180 text-sand" />
      <Stars className="pointer-events-none absolute inset-x-0 top-0 h-[60%] w-full opacity-60" />

      <div className="wrap relative pb-24 pt-16 md:pb-32 md:pt-24 lg:pb-40">
        <div className="max-w-[44rem]">
          <MaskedHeading id="legend-title" className="t-h2">
            {legend.heading}
          </MaskedHeading>
          <p className="t-lede mt-6 max-w-[32rem] text-ivory/70">{legend.intro}</p>
        </div>

        <div className="mt-14 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[max(6rem,calc(50svh-15rem))]">
              <SkyClock step={step} className="mx-auto aspect-square w-full max-w-[30rem]" idPrefix="legend-sticky" />
            </div>
          </div>

          <ol className="space-y-20 lg:col-span-6 lg:col-start-7 lg:space-y-0">
            {legend.chapters.map((chapter, i) => (
              <li
                key={chapter.title}
                ref={(el) => {
                  chapters.current[i] = el
                }}
                data-step={i}
                className={`group/chapter lg:flex lg:min-h-[62svh] lg:flex-col lg:justify-center ${
                  step === i ? 'is-active' : ''
                }`}
              >
                <SkyClock
                  step={i}
                  className="mb-8 aspect-square w-full max-w-[20rem] lg:hidden"
                  idPrefix={`legend-${i}`}
                />
                <p className="flex items-baseline gap-4">
                  <span
                    lang="hi"
                    aria-hidden="true"
                    className="font-serif text-4xl leading-none text-gold-pale transition-opacity duration-700 lg:opacity-40 lg:group-[.is-active]/chapter:opacity-100"
                  >
                    {NUMERALS[i]}
                  </span>
                  <span className="sr-only">Chapter {i + 1}</span>
                </p>
                <h3 className="t-h3 mt-4 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] transition-colors duration-700 lg:text-ivory/60 lg:group-[.is-active]/chapter:text-ivory">
                  {chapter.title}
                </h3>
                <p className="mt-4 max-w-[34rem] text-ivory/75">{chapter.text}</p>
                {'places' in chapter && (
                  <dl className="mt-8 grid max-w-[34rem] gap-x-8 gap-y-5 sm:grid-cols-2">
                    {chapter.places.map((place) => (
                      <div key={place.city} className="border-t border-gold/30 pt-3">
                        <dt className="font-serif text-xl">{place.city}</dt>
                        <dd className="mt-1 text-[0.9375rem] leading-snug text-ivory/65">{place.river}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
