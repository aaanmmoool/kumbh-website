import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { backdrops, brand, promise } from '../../content/site'
import { StepsEdge } from '../art/Edges'
import { FarSkyline, FloatingDiya, GhatBank, GhatReflection, Ripples, Stars, SunTrail } from '../art/HeroScene'
import { Photo, type PhotoSlug } from '../ui/Photo'
import { Reveal } from '../ui/Reveal'

const markPaths = [
  'M20 3.5c2.8 3.2 2.8 6.1 0 8.4-2.8-2.3-2.8-5.2 0-8.4Z',
  'M13.5 14h13',
  'M16 14c0 2.2-4 3.6-4.9 8C10.2 26.8 14 30 20 30s9.8-3.2 8.9-8c-.9-4.4-4.9-5.8-4.9-8',
  'M11.6 21.2h16.8',
  'M7 35c2.2-1.4 4.4-1.4 6.6 0s4.4 1.4 6.4 0 4.4-1.4 6.6 0 4.4 1.4 6.4 0',
]

/**
 * The value statement, over evening aarti at Har Ki Pauri or (when the
 * backdrops are swapped) over the illustrated night river from the hero.
 * The backdrop drifts a little slower than the page and the mark draws itself.
 */
export function ValuePromise() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%'])
  const scene = backdrops === 'swapped'

  return (
    <section
      ref={ref}
      id="promise"
      aria-labelledby="promise-title"
      className="relative isolate overflow-hidden bg-night-deep text-ivory"
    >
      {scene ? (
        <NightRiver />
      ) : (
        <>
          <m.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0 -z-10">
            <Photo slug={promise.photo as PhotoSlug} sizes="100vw" className="absolute inset-0" />
          </m.div>
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(8_12_34/0.88),rgb(8_12_34/0.55)_35%,rgb(8_12_34/0.6)_70%,rgb(8_12_34/0.9))]"
            aria-hidden="true"
          />
        </>
      )}

      <div
        className={`wrap flex min-h-[36rem] flex-col items-center justify-center pt-28 text-center md:min-h-[42rem] md:pt-36 ${
          scene ? 'pb-[15rem] md:pb-[17rem]' : 'pb-28 md:pb-36'
        }`}
      >
        <svg viewBox="0 0 40 40" className="h-20 w-20 text-gold-pale md:h-24 md:w-24" fill="none" aria-hidden="true">
          {markPaths.map((d, i) => (
            <m.path
              key={d}
              d={d}
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ duration: 1.6, delay: 0.15 * i, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}
          <circle cx="20" cy="25" r="1" fill="currentColor" />
        </svg>

        <Reveal delay={0.2}>
          <h2 id="promise-title" className="t-statement mt-10 max-w-[24ch] [text-shadow:0_2px_24px_rgb(8_12_34/0.6)]">
            {promise.statement}
          </h2>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="mt-10 flex max-w-[36rem] flex-col items-center gap-3 text-ivory/80">
            <span lang="sa" className="font-serif text-3xl text-gold-pale">
              {brand.nameDevanagari}
            </span>
            <span>{promise.note}</span>
          </p>
        </Reveal>
      </div>

      <StepsEdge className="relative text-sand" />
    </section>
  )
}

/** The hero's night river, ghats and floating diyas, with the waterline low in the section. */
function NightRiver() {
  return (
    <div className="statement-scene pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="hero-glow" />
      <Stars className="absolute inset-x-0 top-0 h-[var(--horizon)] w-full" />
      <div className="absolute inset-x-0 bottom-[calc(100%-var(--horizon))] h-[clamp(56px,9vw,150px)]">
        <FarSkyline className="h-full w-full opacity-90" />
      </div>
      <div className="hero-river absolute inset-x-0 bottom-0 top-[var(--horizon)]">
        <Ripples className="absolute inset-0 h-full w-full" />
      </div>
      <div className="hero-trail absolute top-[calc(var(--horizon)+2px)]">
        <SunTrail className="h-full w-full" />
      </div>
      <div className="bank bank-left">
        <GhatBank side="left" id="statement-bank-left" low className="block h-auto w-full" />
      </div>
      <div className="bank-reflection bank-left">
        <GhatReflection side="left" of="statement-bank-left" className="block h-auto w-full" />
      </div>
      <div className="bank bank-right">
        <GhatBank side="right" id="statement-bank-right" className="block h-auto w-full" />
      </div>
      <div className="bank-reflection bank-right">
        <GhatReflection side="right" of="statement-bank-right" className="block h-auto w-full" />
      </div>
      <div className="hero-mist anim-drift" />
      <FloatingDiya className="absolute left-[18%] top-[calc(var(--horizon)+3rem)] w-8 md:w-10" />
      <FloatingDiya delay={1.3} className="absolute right-[16%] top-[calc(var(--horizon)+5.5rem)] w-7 md:w-12" />
      <FloatingDiya delay={2.4} className="absolute left-[58%] top-[calc(var(--horizon)+8.5rem)] hidden w-9 md:block" />
    </div>
  )
}
