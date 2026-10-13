import { m, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { how } from '../../content/site'
import { RiverEdge } from '../art/Edges'
import { MaskedHeading, Reveal } from '../ui/Reveal'
import { LinkButton } from '../ui/Button'

/** How booking works — four steps strung along a river line that draws as you scroll. */
export function HowItWorks() {
  const list = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 85%', 'end 55%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })

  return (
    <section
      id="how"
      tabIndex={-1}
      aria-labelledby="how-title"
      className="grain grain-dark relative overflow-hidden bg-[linear-gradient(to_bottom,#0b1030,#161b48_70%,#2a2a5c)] text-ivory"
    >
      <RiverEdge className="-translate-y-px rotate-180 text-sand" />
      <span
        lang="hi"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] select-none font-serif text-[clamp(9rem,34vw,30rem)] leading-none text-ivory/[0.035]"
      >
        कुटीर
      </span>

      <div className="wrap relative grid gap-14 pb-24 pt-16 md:pb-32 md:pt-24 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-28">
        <div className="lg:col-span-6">
          <MaskedHeading id="how-title" className="t-h2 max-w-[14ch]">
            {how.heading}
          </MaskedHeading>
          <Reveal delay={0.15}>
            <p className="t-lede measure mt-8 text-ivory/75">{how.body}</p>
            <LinkButton href="#cottages" variant="outline-light" className="mt-10">
              Browse the cottages
            </LinkButton>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:col-start-8 lg:pt-3">
          <svg
            className="pointer-events-none absolute -top-2 bottom-0 left-[5px] h-[calc(100%+0.5rem)] w-6"
            viewBox="0 0 24 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M12 0c-9 40 9 80 0 120s9 80 0 120 9 80 0 120c-3 14-2 28 0 40"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            <m.path
              d="M12 0c-9 40 9 80 0 120s9 80 0 120 9 80 0 120c-3 14-2 28 0 40"
              fill="none"
              stroke="#e2c98f"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: draw }}
            />
          </svg>

          <ol ref={list} className="relative space-y-12 md:space-y-14">
            {how.steps.map((step, i) => (
              <li key={step.title} className="relative pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-0 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border border-gold-pale bg-night font-serif text-[1rem] text-gold-pale"
                >
                  {i + 1}
                </span>
                <h3 className="t-h3">{step.title}</h3>
                <p className="mt-2 max-w-[30rem] text-ivory/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
