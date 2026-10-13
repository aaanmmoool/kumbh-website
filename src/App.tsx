import { LazyMotion, MotionConfig } from 'motion/react'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Book } from './components/sections/Book'
import { Cottages } from './components/sections/Cottages'
import { DayOnTheGhat } from './components/sections/DayOnTheGhat'
import { Experiences } from './components/sections/Experiences'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Journey } from './components/sections/Journey'
import { Legend } from './components/sections/Legend'
import { ValuePromise } from './components/sections/Promise'
import { Questions } from './components/sections/Questions'
import { BookingProvider } from './hooks/useBooking'

const loadFeatures = () => import('./lib/motion-features').then((mod) => mod.default)

export function App() {
  return (
    // Animation features load in their own small chunk after first paint.
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <BookingProvider>
          <a
            href="#main"
            className="sr-only-focusable fixed left-4 top-4 z-[60] rounded-sm bg-saffron px-4 py-3 font-medium text-night"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1}>
            <Hero />
            <Cottages />
            <Experiences />
            <HowItWorks />
            <ValuePromise />
            <Journey />
            <Legend />
            <DayOnTheGhat />
            <Questions />
            <Book />
          </main>
          <Footer />
        </BookingProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
