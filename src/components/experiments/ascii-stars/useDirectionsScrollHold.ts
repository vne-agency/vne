'use client'

import { useLenis } from 'lenis/react'
import { useEffect, type RefObject } from 'react'

type Direction = -1 | 1
type Transition = {
  token: number
  direction: Direction
  destination: number
  arrival: boolean
}

const duration = 0.65
const boundaryTolerance = 2
const momentumQuietTime = 140
const momentumMaximumTime = 350
const stepCount = 1
const holdMedia =
  '(width > 56rem) and (height >= 650px) and (prefers-reduced-motion: no-preference)'
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

    // Nested overflow is inspected only when a wheel gesture arrives.
    const overflow = getComputedStyle(node).overflowY
    if (/^(auto|scroll|overlay)$/.test(overflow) && node.scrollHeight > node.clientHeight + 1) {
      return true
    }
  }
  return false
}

/** Keep Directions pinned for one deliberate wheel step, independent of its player. */
export function useDirectionsScrollHold(
  sequenceRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
): void {
  const lenis = useLenis()

  useEffect(() => {
    const sequence = sequenceRef.current
    const startAnchor = sequence?.querySelector<HTMLElement>('#directions')
    const endAnchor = sequence?.querySelector<HTMLElement>('#directions-end')
    if (
      !sequence ||
      !startAnchor ||
      !endAnchor ||
      !lenis ||
      reducedMotion ||
      !CSS.supports('animation-timeline: view()') ||
      !CSS.supports('animation-range: entry 100% entry calc(100% + 80svh)')
    ) {
      return
    }

    const media = window.matchMedia(holdMedia)
    let enabled = false
    let startY = 0
    let endY = 0
    let token = 0
    let active: Transition | null = null
    let residual: { direction: Direction; expiresAt: number } | null = null
    let lastWheelAt = -Infinity
    let deadline: ReturnType<typeof setTimeout> | undefined

    const clearDeadline = () => {
      clearTimeout(deadline)
      deadline = undefined
    }

    const ownsTween = () => active !== null && lenis.userData.directionsScrollHold === active.token

    const cancel = () => {
      const shouldFreeze = ownsTween() && !lenis.isStopped && !lenis.isLocked
      active = null
      residual = null
      token += 1
      clearDeadline()
      // Never cancel a newer animation from a slider, anchor or another controller.
      if (shouldFreeze) lenis.scrollTo(lenis.actualScroll, { immediate: true })
    }

    const measure = () => {
      const pageY = window.scrollY
      startY = startAnchor.getBoundingClientRect().top + pageY
      endY = endAnchor.getBoundingClientRect().top + pageY
      lenis.resize()
    }

    const finish = (currentToken: number, direction: Direction) => {
      if (active?.token !== currentToken) return
      active = null
      clearDeadline()
      residual = { direction, expiresAt: performance.now() + momentumMaximumTime }
    }

    const transitionTo = (destination: number, direction: Direction, arrival = false) => {
      if (lenis.isStopped || lenis.isLocked) return
      clearDeadline()
      residual = null
      const currentToken = ++token
      active = { token: currentToken, direction, destination, arrival }

      // A stalled RAF or an external seek must not retain our input gate.
      deadline = setTimeout(
        () => {
          if (active?.token !== currentToken) return
          if (!ownsTween() || !enabled || lenis.isStopped || lenis.isLocked || document.hidden) {
            cancel()
            return
          }
          lenis.scrollTo(destination, { immediate: true })
          finish(currentToken, direction)
        },
        duration * 1000 + 250,
      )

      lenis.scrollTo(destination, {
        duration,
        easing: (value) => (1 - Math.cos(Math.PI * value)) / 2,
        programmatic: false,
        lock: false,
        userData: { directionsScrollHold: currentToken },
        onComplete: () => finish(currentToken, direction),
      })
    }

    const consumeWheel = (event: WheelEvent) => {
      event.preventDefault()
      // Lenis' bubble listener does not inspect defaultPrevented.
      event.stopImmediatePropagation()
    }

    const stepDestination = (position: number, direction: Direction) => {
      const step = (endY - startY) / stepCount
      const progress = (Math.max(startY, Math.min(endY, position)) - startY) / step
      const tolerance = boundaryTolerance / step
      const index =
        direction === 1 ? Math.floor(progress + tolerance) + 1 : Math.ceil(progress - tolerance) - 1
      return startY + Math.max(0, Math.min(stepCount, index)) * step
    }

    const onWheel = (event: WheelEvent) => {
      if (
        document.documentElement.dataset.sectionTransition ||
        !enabled ||
        !event.cancelable ||
        event.ctrlKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ) {
        return
      }
      if (
        lenis.isStopped ||
        lenis.isLocked ||
        document.querySelector('dialog[open]') ||
        hasNativeScrollTarget(event)
      ) {
        cancel()
        return
      }
      if (endY <= startY + boundaryTolerance) return
      if (active && !ownsTween()) cancel()

      const current = lenis.actualScroll
      const direction: Direction = event.deltaY > 0 ? 1 : -1
      const now = performance.now()
      const quiet = now - lastWheelAt >= momentumQuietTime
      lastWheelAt = now
      const withinHold =
        current >= startY - boundaryTolerance && current <= endY + boundaryTolerance

      if (active) {
        if (direction !== active.direction) {
          if (active.arrival && !withinHold) {
            cancel()
            return
          }
          consumeWheel(event)
          transitionTo(stepDestination(current, direction), direction)
          return
        }
        consumeWheel(event)
        // A distinct wheel gesture can queue the next step while the current
        // one eases into place. Trackpad momentum still belongs to one gesture.
        if (quiet && !active.arrival) {
          const destination = stepDestination(active.destination, direction)
          if (destination !== active.destination) transitionTo(destination, direction)
        }
        return
      }

      if (withinHold && residual?.direction === direction && now < residual.expiresAt && !quiet) {
        consumeWheel(event)
        return
      }
      residual = null

      const multiplier = event.deltaMode === 1 ? 100 / 6 : event.deltaMode === 2 ? innerHeight : 1
      const projected =
        lenis.targetScroll + event.deltaY * multiplier * lenis.options.wheelMultiplier
      if (direction === 1 && current < startY - boundaryTolerance && projected >= startY) {
        consumeWheel(event)
        transitionTo(startY, direction, true)
        return
      }
      if (direction === -1 && current > endY + boundaryTolerance && projected <= endY) {
        consumeWheel(event)
        transitionTo(endY, direction, true)
        return
      }
      if (!withinHold) return

      // Outward gestures at either endpoint resume ordinary page scrolling.
      if (direction === 1 && current >= endY - boundaryTolerance) return
      if (direction === -1 && current <= startY + boundaryTolerance) return

      consumeWheel(event)
      transitionTo(stepDestination(current, direction), direction)
    }

    const onPointerDown = () => {
      // Includes range controls, anchor activation and native scrollbar grabs.
      cancel()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        scrollKeys.has(event.key) ||
        event.key === 'Tab' ||
        event.key === 'Enter' ||
        event.key === 'Escape'
      ) {
        cancel()
      }
    }

    const onClick = (event: MouseEvent) => {
      if (event.composedPath().some((node) => node instanceof HTMLAnchorElement)) cancel()
    }

    const onVisibilityChange = () => {
      if (document.hidden) cancel()
    }

    const removeInputListeners = () => {
      window.removeEventListener('wheel', onWheel, true)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('blur', cancel)
      window.removeEventListener('popstate', cancel)
      window.removeEventListener('hashchange', cancel)
      window.removeEventListener('vne-section-navigation', cancel)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }

    const syncMedia = () => {
      cancel()
      removeInputListeners()
      enabled = media.matches
      if (!enabled) return
      measure()
      window.addEventListener('wheel', onWheel, { capture: true, passive: false })
      window.addEventListener('pointerdown', onPointerDown, true)
      window.addEventListener('keydown', onKeyDown, true)
      window.addEventListener('click', onClick, true)
      window.addEventListener('blur', cancel)
      window.addEventListener('popstate', cancel)
      window.addEventListener('hashchange', cancel)
      window.addEventListener('vne-section-navigation', cancel)
      document.addEventListener('visibilitychange', onVisibilityChange)
    }

    const onResize = () => {
      cancel()
      if (enabled && media.matches) measure()
    }

    syncMedia()
    media.addEventListener('change', syncMedia)
    window.addEventListener('resize', onResize)
    return () => {
      enabled = false
      cancel()
      removeInputListeners()
      media.removeEventListener('change', syncMedia)
      window.removeEventListener('resize', onResize)
    }
  }, [lenis, reducedMotion, sequenceRef])
}
