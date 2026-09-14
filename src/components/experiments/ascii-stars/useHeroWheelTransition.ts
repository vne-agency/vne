'use client'

import { useLenis } from 'lenis/react'
import { useEffect, type RefObject } from 'react'

type Direction = -1 | 1
type Transition = { token: number; direction: Direction }

const duration = 0.65
const boundaryTolerance = 2
const momentumQuietTime = 140
const momentumMaximumTime = 350
const scrollKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
  'Spacebar',
])
const nativeControlSelector =
  'input, textarea, select, option, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="scrollbar"]'
const nativeScrollSelector =
  'dialog, [data-lenis-prevent], [data-lenis-prevent-wheel], [data-lenis-prevent-vertical], [data-native-scroll]'

function hasNativeScrollTarget(event: WheelEvent) {
  for (const node of event.composedPath()) {
    if (!(node instanceof HTMLElement)) continue
    if (node === document.body || node === document.documentElement) break
    if (node.matches(nativeControlSelector) || node.matches(nativeScrollSelector)) return true

    // Check nested scrolling only on input, before any animation writes.
    const overflow = getComputedStyle(node).overflowY
    if (/^(auto|scroll|overlay)$/.test(overflow) && node.scrollHeight > node.clientHeight + 1) {
      return true
    }
  }
  return false
}

/** Let one wheel gesture traverse the hero's existing CSS view timeline. */
export function useHeroWheelTransition(
  sequenceRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
): void {
  const lenis = useLenis()

  useEffect(() => {
    const sequence = sequenceRef.current
    const release = sequence?.querySelector<HTMLElement>('#approach-full')
    if (
      !sequence ||
      !release ||
      !lenis ||
      reducedMotion ||
      !CSS.supports('animation-timeline: view()') ||
      !CSS.supports('animation-range: entry 100% entry calc(100% + 80svh)')
    ) {
      return
    }

    let startY = 0
    const cinematicLayout = window.matchMedia('(width > 56rem) and (height >= 650px)')
    let releaseY = 0
    let token = 0
    let active: Transition | null = null
    let residual: { direction: Direction; expiresAt: number } | null = null
    let lastWheelAt = -Infinity
    let deadline: ReturnType<typeof setTimeout> | undefined

    const clearDeadline = () => {
      clearTimeout(deadline)
      deadline = undefined
    }

    const freezeScroll = () => {
      if (lenis.isStopped || lenis.isLocked) return
      const current = lenis.actualScroll
      if (lenis.targetScroll === current && lenis.isScrolling === 'smooth') {
        // Lenis 1.3.26 returns early for an equal target, even with immediate.
        // A synchronous stop/start resets that edge case without retaining a lock.
        lenis.stop()
        lenis.start()
      } else {
        lenis.scrollTo(current, { immediate: true, force: true })
      }
    }

    const cancel = () => {
      const wasActive = active !== null
      active = null
      residual = null
      token += 1
      clearDeadline()
      if (wasActive) freezeScroll()
    }

    const measure = () => {
      // The two untransformed anchors are the only geometry needed by the controller.
      const pageY = window.scrollY
      startY = sequence.getBoundingClientRect().top + pageY
      releaseY = release.getBoundingClientRect().top + pageY
      lenis.resize()
    }

    const finish = (currentToken: number, direction: Direction) => {
      if (active?.token !== currentToken) return
      active = null
      clearDeadline()
      residual = { direction, expiresAt: performance.now() + momentumMaximumTime }
    }

    const transitionTo = (destination: number, direction: Direction) => {
      if (lenis.isStopped || lenis.isLocked) return
      const reversing = active !== null
      clearDeadline()
      residual = null
      if (!reversing) freezeScroll()
      const currentToken = ++token
      const fraction = Math.abs(destination - lenis.animatedScroll) / Math.max(1, releaseY - startY)
      const seconds = reversing ? Math.min(duration, Math.max(0.22, duration * fraction)) : duration
      active = { token: currentToken, direction }

      // An interrupted/delayed RAF must never leave the input gate active forever.
      deadline = setTimeout(
        () => {
          if (active?.token !== currentToken) return
          if (lenis.isStopped || lenis.isLocked || document.hidden) {
            cancel()
            return
          }
          lenis.scrollTo(destination, { immediate: true, force: true })
          finish(currentToken, direction)
        },
        seconds * 1000 + 250,
      )

      lenis.scrollTo(destination, {
        duration: seconds,
        easing: (value) => value,
        lock: false,
        force: true,
        onComplete: () => finish(currentToken, direction),
      })
    }

    const consumeWheel = (event: WheelEvent) => {
      event.preventDefault()
      // Lenis ignores defaultPrevented; stop its window bubble listener too.
      event.stopImmediatePropagation()
    }

    const onWheel = (event: WheelEvent) => {
      if (
        document.documentElement.dataset.sectionTransition ||
        !cinematicLayout.matches ||
        !event.cancelable ||
        event.ctrlKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ) {
        return
      }
      if (
        document.documentElement.dataset.startupLoading ||
        lenis.isStopped ||
        lenis.isLocked ||
        document.querySelector('dialog[open]') ||
        hasNativeScrollTarget(event)
      ) {
        cancel()
        return
      }
      if (releaseY <= startY + boundaryTolerance) return

      const direction: Direction = event.deltaY > 0 ? 1 : -1
      const now = performance.now()
      const quiet = now - lastWheelAt >= momentumQuietTime
      lastWheelAt = now
      if (residual && residual.direction === direction && now < residual.expiresAt && !quiet) {
        consumeWheel(event)
        return
      }
      residual = null

      const current = lenis.actualScroll
      if (active) {
        // A footer anchor may start outside the hero. Scrolling there stays ordinary.
        if (current > releaseY + boundaryTolerance || current < startY - boundaryTolerance) {
          cancel()
          return
        }
        consumeWheel(event)
        if (direction !== active.direction) {
          transitionTo(direction === 1 ? releaseY : startY, direction)
        }
        return
      }

      const multiplier = event.deltaMode === 1 ? 100 / 6 : event.deltaMode === 2 ? innerHeight : 1
      const projected =
        lenis.targetScroll + event.deltaY * multiplier * lenis.options.wheelMultiplier
      const downWithinHero =
        direction === 1 &&
        current >= startY - boundaryTolerance &&
        current < releaseY - boundaryTolerance
      const upAtHero =
        direction === -1 &&
        current > startY + boundaryTolerance &&
        (current <= releaseY + boundaryTolerance || projected <= releaseY)

      if (downWithinHero || upAtHero) {
        consumeWheel(event)
        transitionTo(direction === 1 ? releaseY : startY, direction)
      }
    }

    const onClick = (event: MouseEvent) => {
      // SectionNavigationTransition owns anchors; release only our wheel tween.
      if (event.composedPath().some((node) => node instanceof HTMLAnchorElement)) cancel()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        event
          .composedPath()
          .some(
            (node) =>
              node instanceof HTMLElement && node.hasAttribute('data-page-scrollbar-control'),
          )
      ) {
        cancel()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!scrollKeys.has(event.key)) return
      const target = event.target
      if (target instanceof HTMLElement) {
        if (target.closest('[data-page-scrollbar-control]')) {
          cancel()
          return
        }
        if (target.closest(nativeControlSelector)) return
        if ((event.key === ' ' || event.key === 'Spacebar') && target.closest('button')) return
      }
      cancel()
    }

    const onResize = () => {
      cancel()
      measure()
    }
    const onVisibilityChange = () => {
      if (document.hidden) cancel()
    }

    measure()
    window.addEventListener('wheel', onWheel, { capture: true, passive: false })
    window.addEventListener('click', onClick, true)
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', onResize)
    window.addEventListener('blur', cancel)
    window.addEventListener('popstate', cancel)
    window.addEventListener('hashchange', cancel)
    window.addEventListener('vne-section-navigation', cancel)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancel()
      window.removeEventListener('wheel', onWheel, true)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('blur', cancel)
      window.removeEventListener('popstate', cancel)
      window.removeEventListener('hashchange', cancel)
      window.removeEventListener('vne-section-navigation', cancel)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [lenis, reducedMotion, sequenceRef])
}
