import { animate } from 'motion'

export const scrollReturnEase = (progress: number) => (1 - Math.cos(Math.PI * progress)) / 2
export const scrollReturnDuration = (distance: number) =>
  Math.min(3.2, Math.max(0.6, 0.5 + distance / 3000))

/** One bounded return; direct user input takes control and cancels the pending completion. */
export function animateScrollToTop(target: HTMLElement | Window, onComplete?: () => void) {
  const from = target === window ? window.scrollY : (target as HTMLElement).scrollTop
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const write = (top: number) => target.scrollTo({ top, behavior: 'instant' })
  if (from < 1 || media.matches) {
    write(0)
    onComplete?.()
    return () => {}
  }

  const events: EventTarget = target
  let stopped = false
  const cleanup = () => {
    events.removeEventListener('wheel', cancel)
    events.removeEventListener('touchstart', cancel)
    events.removeEventListener('pointerdown', cancel)
    events.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    media.removeEventListener('change', onMotionChange)
  }
  const cancel = () => {
    if (stopped) return
    stopped = true
    animation.stop()
    cleanup()
  }
  const finish = () => {
    if (stopped) return
    stopped = true
    cleanup()
    onComplete?.()
  }
  const onKeyDown = (event: Event) => {
    if (
      event instanceof KeyboardEvent &&
      ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
    )
      cancel()
  }
  const onVisibilityChange = () => {
    if (document.hidden) cancel()
  }
  const onMotionChange = () => {
    if (!media.matches) return
    animation.stop()
    write(0)
    finish()
  }
  const animation = animate(from, 0, {
    duration: scrollReturnDuration(from),
    ease: scrollReturnEase,
    onUpdate: write,
    onComplete: finish,
  })
  events.addEventListener('wheel', cancel, { passive: true })
  events.addEventListener('touchstart', cancel, { passive: true })
  events.addEventListener('pointerdown', cancel, { passive: true })
  events.addEventListener('keydown', onKeyDown)
  document.addEventListener('visibilitychange', onVisibilityChange)
  media.addEventListener('change', onMotionChange)
  return cancel
}
