import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { brand, questions } from '../../content/site'
import { MaskedHeading } from '../ui/Reveal'

export function Questions() {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  return (
    <section id="questions" tabIndex={-1} aria-labelledby="questions-title" className="grain relative bg-sand py-24 text-ink md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <MaskedHeading id="questions-title" className="t-h2 max-w-[12ch]">
            {questions.heading}
          </MaskedHeading>
          {brand.contactEmail && (
            <p className="mt-6 text-ink-soft">
              Something else on your mind?{' '}
              <a className="text-ink underline decoration-gold underline-offset-4 hover:decoration-2" href={`mailto:${brand.contactEmail}`}>
                Write to {brand.contactEmail}
              </a>
            </p>
          )}
        </div>

        <ul className="border-t border-ink/15 lg:col-span-7 lg:col-start-6">
          {questions.items.map((item, i) => {
            const expanded = open === i
            const buttonId = `q-${uid}-${i}`
            const panelId = `a-${uid}-${i}`
            return (
              <li key={item.q} className="border-b border-ink/15">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="flex min-h-[4.5rem] w-full items-center justify-between gap-6 py-5 text-left font-serif text-[clamp(1.2rem,1.05rem+0.5vw,1.45rem)] leading-snug"
                  >
                    {item.q}
                    <Plus
                      aria-hidden="true"
                      strokeWidth={1.4}
                      className={`h-6 w-6 shrink-0 text-saffron-deep transition-transform duration-500 ease-[var(--ease-soft)] ${expanded ? 'rotate-45' : ''}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!expanded}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-soft)] ${
                    expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={`max-w-[40rem] pb-7 pr-10 text-ink-soft transition-opacity duration-500 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
