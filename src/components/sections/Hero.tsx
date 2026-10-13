import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { backdrops, hero, promise } from '../../content/site'
import { FarSkyline, FloatingDiya, GhatBank, GhatReflection, Ripples, Stars, SunTrail } from '../art/HeroScene'
import { StepsEdge } from '../art/Edges'
import { Photo, type PhotoSlug } from '../ui/Photo'
import { HeroEmblem } from './HeroEmblem'
import { HeroSearch } from './HeroSearch'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Parallax: nearer layers travel further as the hero scrolls away.
  const still = reduce ? 0 : 1
  const yFar = useTransform(scrollYProgress, [0, 1], ['0%', `${18 * still}%`])
  const yBanks = useTransform(scrollYProgress, [0, 1], [0, 70 * still])
  const yEmblem = useTransform(scrollYProgress, [0, 1], [0, 140 * still])
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -60 * still])
  const yText = useTransform(scrollYProgress, [0, 1], [0, 110 * still])
  const fadeText = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0])
  const photo = backdrops === 'swapped'

  return (
    <section
      ref={ref}
      id="top"
      tabIndex={-1}
      aria-labelledby="hero-title"
      className={`hero relative isolate flex min-h-[100svh] flex-col overflow-hidden text-ivory ${photo ? 'hero--photo' : ''}`}
    >
      {photo ? (
        <>
          {/* Evening aarti at Har Ki Pauri, drifting slower than the page */}
          <m.div style={{ y: yFar }} className="pointer-events-none absolute inset-x-0 -top-[4%] h-[112%]" aria-hidden="true">
            <Photo slug={promise.photo as PhotoSlug} decorative priority sizes="100vw" position="50% 62%" />
          </m.div>
          <div className="hero-photo-shade pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="hero-glow hero-glow--soft anim-fade" aria-hidden="true" />
        </>
      ) : (
        <>
          {/* Sky, stars and the glow of the coming sunrise */}
          <div className="hero-glow anim-fade" aria-hidden="true" />
          <Stars className="anim-fade pointer-events-none absolute inset-x-0 top-0 h-[var(--horizon)] w-full" />

          <m.div
            style={{ y: yFar }}
            className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-var(--horizon))] h-[clamp(56px,9vw,150px)]"
            aria-hidden="true"
          >
            <FarSkyline className="h-full w-full opacity-90" />
          </m.div>

          {/* The river */}
          <div className="hero-river pointer-events-none absolute inset-x-0 bottom-0 top-[var(--horizon)]" aria-hidden="true">
            <Ripples className="absolute inset-0 h-full w-full" />
          </div>
          <div className="hero-trail pointer-events-none absolute top-[calc(var(--horizon)+2px)]" aria-hidden="true">
            <SunTrail className="h-full w-full" />
          </div>

          {/* Ghats on both banks, with their reflections */}
          <m.div style={{ y: yBanks }} className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="bank bank-left">
              <GhatBank side="left" id="bank-left-tall" className="block h-auto w-full lg:hidden" />
              <GhatBank side="left" id="bank-left-low" low className="hidden h-auto w-full lg:block" />
            </div>
            <div className="bank-reflection bank-left">
              <GhatReflection side="left" of="bank-left-tall" className="block h-auto w-full lg:hidden" />
              <GhatReflection side="left" of="bank-left-low" className="hidden h-auto w-full lg:block" />
            </div>
            <div className="bank bank-right">
              <GhatBank side="right" id="bank-right" className="block h-auto w-full" />
            </div>
            <div className="bank-reflection bank-right">
              <GhatReflection side="right" of="bank-right" className="block h-auto w-full" />
            </div>
          </m.div>
        </>
      )}

      {/* Signature centrepiece: the lotus-kumbh */}
      <m.div style={{ y: yEmblem }} className="hero-emblem pointer-events-none absolute" aria-hidden="true">
        <HeroEmblem progress={scrollYProgress} />
      </m.div>

      {/* Mist sits in front of the emblem's base */}
      <div className="hero-mist anim-drift" aria-hidden="true" />
      <div className="hero-mist hero-mist--low anim-drift" style={{ animationDelay: '-9s' }} aria-hidden="true" />

      <m.div style={{ y: yNear }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FloatingDiya className="absolute left-[12%] top-[calc(var(--horizon)+1.25rem)] w-8 lg:left-[56%] lg:top-[calc(var(--horizon)+7%)] lg:w-12" />
        <FloatingDiya
          delay={1.4}
          className="absolute right-[10%] top-[calc(var(--horizon)+0.6rem)] w-7 lg:right-[9%] lg:top-[calc(var(--horizon)+13%)] lg:w-14"
        />
        <FloatingDiya
          delay={2.6}
          className="absolute left-[64%] top-[calc(var(--horizon)+21%)] hidden w-10 lg:block"
        />
      </m.div>

      <div className="hero-scrim pointer-events-none absolute inset-x-0 bottom-0 top-[var(--horizon)] lg:hidden" aria-hidden="true" />

      {/* Copy */}
      <m.div
        style={{ y: yText, opacity: fadeText }}
        className="wrap relative z-10 flex flex-1 flex-col pb-20 pt-[calc(var(--horizon)+3.25rem)] lg:justify-center-safe lg:pb-[max(4rem,calc(100svh-var(--horizon)+4rem))] lg:pt-[calc(var(--header-h)+2rem)]"
      >
        <div className="max-w-[40rem] lg:max-w-[min(50vw,46rem)]">
          <h1 id="hero-title" className="t-display">
            {hero.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span className="anim-rise block" style={{ animationDelay: `${0.25 + i * 0.14}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="anim-lift t-lede mt-6 max-w-[33rem] text-ivory/85 lg:mt-8"
            style={{ animationDelay: '0.75s' }}
          >
            {hero.body}
          </p>
          <div className="anim-fade-up mt-8 lg:mt-10" style={{ animationDelay: '0.95s' }}>
            <HeroSearch />
          </div>
        </div>
      </m.div>

      <a
        href="#cottages"
        className="anim-fade absolute bottom-[calc(4.4vw+1.25rem)] left-1/2 z-10 hidden h-16 w-11 -translate-x-1/2 items-start justify-center overflow-hidden rounded-sm lg:flex"
        style={{ animationDelay: '1.6s' }}
      >
        <span className="sr-only">{hero.scrollLabel}</span>
        <span className="absolute inset-y-1 w-px bg-ivory/25" aria-hidden="true" />
        <span className="anim-droplet absolute top-1 h-5 w-px bg-gold-pale" aria-hidden="true" />
      </a>

      {/* Ghat steps rising out of the river into the cottage listing */}
      <StepsEdge className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] text-ivory" />
    </section>
  )
}
