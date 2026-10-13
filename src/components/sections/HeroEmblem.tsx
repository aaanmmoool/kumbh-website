import { useReducedMotion, type MotionValue } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { forced3D, shouldLoad3D, whenIdle } from '../../lib/capabilities'
import { LotusEmblem } from '../art/LotusEmblem'
import { ErrorBoundary } from '../ui/ErrorBoundary'

const LotusCanvas = lazy(() => import('../three/LotusScene'))

type Mode = 'svg' | 'loading' | '3d'

/**
 * The hero centrepiece. The SVG emblem is always rendered first (it is part of
 * the prerendered HTML), then — on capable screens, once the page is idle —
 * the WebGL lotus loads and cross-fades in over it.
 */
export function HeroEmblem({ progress }: { progress: MotionValue<number> }) {
  const reducedMotion = useReducedMotion() ?? false
  const [mode, setMode] = useState<Mode>('svg')
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const host = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!shouldLoad3D()) return
    return whenIdle(() => setMode('loading'))
  }, [])

  // Pause rendering whenever the hero is off screen.
  useEffect(() => {
    const el = host.current
    if (!el || mode === 'svg') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [mode])

  useEffect(() => {
    if (mode === 'svg' || reducedMotion) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mode, reducedMotion])

  const fallBack = () => {
    setReady(false)
    setMode('svg')
  }

  return (
    <div ref={host} className="relative h-full w-full" data-emblem={ready ? '3d' : 'svg'}>
      <LotusEmblem
        className={`absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      {mode !== 'svg' && (
        <ErrorBoundary fallback={null} onError={fallBack}>
          <Suspense fallback={null}>
            <div
              className={`absolute inset-0 transition-opacity duration-[1400ms] ${ready ? 'opacity-100' : 'opacity-0'}`}
            >
              <LotusCanvas
                active={visible}
                reducedMotion={reducedMotion}
                progress={progress}
                pointer={pointer}
                onReady={() => {
                  setReady(true)
                  setMode('3d')
                }}
                onLost={fallBack}
                onTooSlow={forced3D() ? () => {} : fallBack}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}
