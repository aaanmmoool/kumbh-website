type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string }
  deviceMemory?: number
}

let cachedWebGL: boolean | undefined

/** `?force3d` skips the GPU checks — handy when testing on machines without a GPU. */
export const forced3D = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('force3d')

export function supportsWebGL(): boolean {
  if (cachedWebGL !== undefined) return cachedWebGL
  try {
    const canvas = document.createElement('canvas')
    // failIfMajorPerformanceCaveat refuses software renderers (no usable GPU),
    // where the scene would block the main thread instead of delighting anyone.
    const options = { failIfMajorPerformanceCaveat: !forced3D() }
    const gl = (canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options)) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null
    let hardware = !!gl
    if (gl) {
      const info = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
      if (/swiftshader|llvmpipe|software|basic render/i.test(renderer) && !forced3D()) hardware = false
    }
    cachedWebGL = hardware
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cachedWebGL = false
  }
  return cachedWebGL
}

/**
 * The 3D centrepiece only loads on roomy screens with WebGL, and never when the
 * visitor has asked to save data or the device reports very little memory.
 * Everyone else gets the hand-drawn SVG emblem, which is the same design.
 */
export function shouldLoad3D(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as NavigatorWithHints
  if (!window.matchMedia('(min-width: 768px)').matches) return false
  if (nav.connection?.saveData) return false
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false
  if (new URLSearchParams(window.location.search).has('no3d')) return false
  return supportsWebGL()
}

/** Run work once the browser is idle after load, so it never competes with first paint. */
export function whenIdle(callback: () => void): () => void {
  let idleId: number | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(callback, { timeout: 2500 })
    else timeoutId = setTimeout(callback, 600)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
  return () => {
    window.removeEventListener('load', schedule)
    if (idleId !== undefined) window.cancelIdleCallback(idleId)
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}
