import { ArrowUp } from 'lucide-react'
import { brand, cta, footer, nav } from '../../content/site'
import { FarSkyline } from '../art/HeroScene'
import { LogoMark } from '../art/Logo'
import { photoCredits } from '../ui/Photo'

const year = new Date().getFullYear()

export function Footer() {
  const linkClass = 'inline-flex min-h-11 items-center text-ivory/75 transition-colors hover:text-ivory'
  return (
    <footer className="relative overflow-hidden bg-night-deep text-ivory">
      <FarSkyline className="pointer-events-none block h-[clamp(48px,7vw,110px)] w-full opacity-60" />
      <div className="h-px w-full bg-gold/25" aria-hidden="true" />

      <div className="wrap grid gap-12 pb-10 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <a href="#top" className="inline-flex items-center gap-4 rounded-sm">
            <LogoMark className="h-14 w-14 text-gold-pale" strokeWidth={1.2} />
            <span className="font-serif text-[clamp(2.6rem,2rem+3vw,4.5rem)] font-medium leading-none tracking-[-0.02em]">
              {brand.name}
            </span>
            <span lang="sa" aria-hidden="true" className="font-serif text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] leading-none text-gold-pale/70">
              {brand.nameDevanagari}
            </span>
            <span className="sr-only">, back to the top</span>
          </a>
          <p className="mt-6 max-w-[26rem] text-ivory/65">{brand.tagline}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
          <div>
            <h2 className="font-sans text-sm font-medium tracking-normal text-gold-pale">Explore</h2>
            <ul className="mt-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-sm font-medium tracking-normal text-gold-pale">Stay with us</h2>
            <ul className="mt-3">
              <li>
                <a href={cta.nav.href} className={linkClass}>
                  {cta.nav.label}
                </a>
              </li>
              {brand.contactEmail && (
                <li>
                  <a href={`mailto:${brand.contactEmail}`} className={linkClass}>
                    {brand.contactEmail}
                  </a>
                </li>
              )}
              {brand.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className={linkClass} rel="noopener noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="wrap pb-8 text-sm text-ivory/55">
        <details className="group border-t border-ivory/10 py-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-ivory/75 hover:text-ivory [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">›</span>
            Photo credits
          </summary>
          <p className="mt-3 max-w-[48rem]">
            Photographs from Wikimedia Commons, resized and cropped for this site. Illustrations and 3D were drawn for
            this site.
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2">
            {photoCredits.map((c) => (
              <li key={c.slug} className="min-w-0">
                <a href={c.source} className="underline decoration-ivory/25 underline-offset-4 hover:text-ivory" rel="noopener noreferrer" target="_blank">
                  {c.title.replace(/\.(jpe?g|JPE?G)$/, '')}
                </a>{' '}
                by {c.author},{' '}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} className="underline decoration-ivory/25 underline-offset-4 hover:text-ivory" rel="noopener noreferrer license" target="_blank">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="wrap pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-ivory/50">
        <div className="flex flex-col gap-4 border-t border-ivory/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <span suppressHydrationWarning>{year}</span> {brand.name}. {footer.closing}
        </p>
        <div className="flex items-center gap-6">
          <a href="#top" className="inline-flex min-h-11 items-center gap-2 text-ivory/75 hover:text-ivory">
            <ArrowUp aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
            Back to the top
          </a>
        </div>
        </div>
      </div>
    </footer>
  )
}
