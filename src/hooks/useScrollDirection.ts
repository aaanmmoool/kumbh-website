import { useEffect, useState } from 'react'

/** Tracks whether the page has scrolled past `threshold` and whether the header should hide. */
export function useHeaderState(threshold = 24) {
  const [state, setState] = useState({ scrolled: false, hidden: false })

  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - last
      setState((prev) => {
        const scrolled = y > threshold
        let hidden = prev.hidden
        if (y < 120) hidden = false
        else if (delta > 6) hidden = true
        else if (delta < -6) hidden = false
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden }
      })
      last = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold])

  return state
}
