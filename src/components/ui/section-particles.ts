import {
  cancelLanguageParticles,
  captureTextParticles,
  drawTextParticles,
  type TextParticleSnapshot,
} from './language-particles'

let stopTransition: (() => void) | undefined

/** Change position only behind a fully faded surface. Scroll never drives the effect. */
export function changeSectionWithParticles(
  commit: () => void | Promise<void>,
  onComplete?: () => void,
  source?: HTMLElement | null,
) {
  stopTransition?.()
  cancelLanguageParticles()
  const surface = document.getElementById('site-content')
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const withoutMotion = () => {
    const ready = commit()
    if (ready) void ready.then(onComplete).catch(() => {})
    else onComplete?.()
    return () => {}
  }
  if (
    !surface ||
    !surface.animate ||
    media.matches ||
    typeof CanvasRenderingContext2D === 'undefined'
  ) {
    return withoutMotion()
  }

  const width = innerWidth
  const height = innerHeight
  // Children are the capture scope so the surface's own fade does not hide
  // destination text from the visibility check.
  const capture = (scope = surface) => {
    const parents: HTMLElement[] = []
    const images: TextParticleSnapshot[] = []
    for (const child of scope.children) {
      if (child.matches('script, style, link')) continue
      const result = captureTextParticles(child, width, height)
      parents.push(...result.parents)
      images.push(result.image)
    }
    return { parents, images }
  }
  let old: ReturnType<typeof capture>
  try {
    old = capture(source ?? surface)
  } catch {
    return withoutMotion()
  }

  const overlay = document.createElement('canvas')
  overlay.width = width
  overlay.height = height
  overlay.setAttribute('aria-hidden', 'true')
  overlay.dataset.sectionParticles = 'leaving'
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '2147482999',
  })
  const context = overlay.getContext('2d')
  if (!context) {
    return withoutMotion()
  }

  let frame = 0
  let finished = false
  let committed = false
  let committedWork: void | Promise<void>
  let fade: Animation | undefined
  const masked = new Set<HTMLElement>()
  const unmask = () => {
    masked.forEach((element) => element.removeAttribute('data-language-ink-hidden'))
    masked.clear()
  }
  const mask = (parents: HTMLElement[]) =>
    parents.forEach((parent) => {
      parent.setAttribute('data-language-ink-hidden', '')
      masked.add(parent)
    })
  const apply = () => {
    if (committed) return committedWork
    committed = true
    unmask()
    if (source) {
      // Leave the dialog's top layer before closing it, keeping the destination hidden.
      document.body.append(overlay)
      fade?.cancel()
      fade = surface.animate([{ opacity: 0 }, { opacity: 0 }], { fill: 'both' })
    }
    committedWork = commit()
    return committedWork
  }
  const finish = (complete = false) => {
    if (finished) return
    finished = true
    cancelAnimationFrame(frame)
    clearTimeout(deadline)
    try {
      if (complete) apply()
    } finally {
      fade?.cancel()
      unmask()
      overlay.remove()
      delete document.documentElement.dataset.sectionTransition
      window.removeEventListener('wheel', cancel, true)
      window.removeEventListener('touchstart', cancel, true)
      window.removeEventListener('pointerdown', cancel, true)
      window.removeEventListener('keydown', cancel, true)
      window.removeEventListener('resize', motionChanged)
      window.removeEventListener('popstate', cancel)
      window.removeEventListener('hashchange', cancel)
      document.removeEventListener('visibilitychange', cancel)
      media.removeEventListener('change', motionChanged)
      if (stopTransition === cancel) stopTransition = undefined
    }
    if (complete) {
      if (committedWork) void committedWork.then(onComplete).catch(() => {})
      else onComplete?.()
    }
  }
  const cancel = () => finish()
  const motionChanged = () => finish(true)
  const run = (captured: ReturnType<typeof capture>, assembling: boolean, done: () => void) => {
    const duration = assembling ? 680 : 380
    fade?.cancel()
    fade = (assembling ? surface : (source ?? surface)).animate(
      [{ opacity: assembling ? 0 : 1 }, { opacity: assembling ? 1 : 0 }],
      {
        duration,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'both',
      },
    )
    const start = performance.now()
    const tick = (now: number) => {
      if (finished) return
      if (!surface.isConnected) {
        cancel()
        return
      }
      const progress = Math.min(1, (now - start) / duration)
      // SiteLayout has a single page child; empty/non-page siblings need no overlay.
      const image = captured.images.find((candidate) => candidate.particles.length)
      if (image) drawTextParticles(context, image, progress, assembling)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else done()
    }
    frame = requestAnimationFrame(tick)
  }

  stopTransition = cancel
  document.documentElement.dataset.sectionTransition = 'true'
  ;(source?.closest('dialog[open]') ?? document.body).append(overlay)
  mask(old.parents)
  window.addEventListener('wheel', cancel, { capture: true, passive: true })
  window.addEventListener('touchstart', cancel, { capture: true, passive: true })
  window.addEventListener('pointerdown', cancel, true)
  window.addEventListener('keydown', cancel, true)
  // Orientation and browser-chrome resizes must complete the requested navigation.
  window.addEventListener('resize', motionChanged)
  window.addEventListener('popstate', cancel)
  window.addEventListener('hashchange', cancel)
  document.addEventListener('visibilitychange', cancel)
  media.addEventListener('change', motionChanged)
  // A stalled animation frame must never retain an invisible page.
  let deadline = setTimeout(() => finish(true), 2200)
  const reveal = () => {
    if (finished) return
    overlay.dataset.sectionParticles = 'arriving'
    // Let the browser resolve the new scroll timelines and React observers while hidden.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (finished) return
        try {
          const next = capture()
          mask(next.parents)
          run(next, true, () => finish(true))
        } catch {
          finish(true)
        }
      })
    })
  }
  run(old, false, () => {
    const ready = apply()
    if (ready) {
      // App Router must commit the destination before its text can be captured.
      // A failed or stalled route must still release the faded surface.
      clearTimeout(deadline)
      deadline = setTimeout(() => finish(), 6000)
      void ready.then(reveal).catch(() => finish())
    } else reveal()
  })
  return cancel
}
