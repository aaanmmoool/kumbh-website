import { m } from 'motion/react'
import { experiences } from '../../content/site'
import { Photo, type PhotoSlug } from '../ui/Photo'
import { MaskedHeading } from '../ui/Reveal'

/**
 * After the listing: an editorial mosaic of real Kumbh photographs.
 * Desktop: one large photo with two beside it, then a row of three.
 * Phones: a single column. Each photo is unmasked upward as it arrives.
 */
const LAYOUT = [
  { tile: 'lg:col-span-7 lg:row-span-2', frame: 'aspect-[4/3] lg:aspect-auto lg:min-h-[30rem] lg:flex-1', sizes: '(min-width: 1024px) 56vw, 100vw' },
  { tile: 'lg:col-span-5', frame: 'aspect-[16/10]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  { tile: 'lg:col-span-5', frame: 'aspect-[16/10]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  { tile: 'lg:col-span-4', frame: 'aspect-[4/3] lg:aspect-[4/5]', sizes: '(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw' },
  { tile: 'lg:col-span-4', frame: 'aspect-[4/3] lg:aspect-[4/5]', sizes: '(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw' },
  { tile: 'lg:col-span-4', frame: 'aspect-[4/3] lg:aspect-[4/5]', sizes: '(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw' },
]

export function Experiences() {
  return (
    <section id="experiences" tabIndex={-1} aria-labelledby="experiences-title" className="grain relative bg-sand py-24 text-ink md:py-32">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <MaskedHeading id="experiences-title" className="t-h2 max-w-[13ch] lg:col-span-7">
            {experiences.heading}
          </MaskedHeading>
          <p className="t-lede max-w-[30rem] text-ink-soft lg:col-span-4 lg:col-start-9 lg:pb-2">{experiences.intro}</p>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-12 lg:gap-y-14">
          {experiences.items.map((item, i) => {
            const layout = LAYOUT[i % LAYOUT.length]
            return (
              <li
                key={item.title}
                className={`${i === 0 || i === experiences.items.length - 1 ? 'sm:col-span-2' : ''} ${layout.tile} flex flex-col`}
              >
                <figure className="group flex flex-1 flex-col">
                  <m.div
                    className={`relative overflow-hidden rounded-[2px] bg-night ${layout.frame}`}
                    initial={{ clipPath: 'inset(18% 0% 0% 0%)' }}
                    whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    data-reveal=""
                  >
                    <Photo
                      slug={item.photo as PhotoSlug}
                      sizes={layout.sizes}
                      className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                    />
                  </m.div>
                  <figcaption className="mt-5">
                    <p className="text-[0.9375rem] font-medium text-saffron-deep">{item.place}</p>
                    <h3 className="t-h3 mt-1">{item.title}</h3>
                    <p className="mt-2 max-w-[34rem] text-ink-soft">{item.text}</p>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
