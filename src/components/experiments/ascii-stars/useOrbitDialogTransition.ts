'use client'

import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'

export type OrbitDialogOrigin = {
  top: number
  left: number
  width: number
  height: number
}

export type OrbitDialogMotion = {
  opening: (duration: number) => void
  opened: () => void
  closing: (duration: number) => void
  closed: () => void
  closeOrigin: () => OrbitDialogOrigin | undefined
}

const expansionDuration = 720
const expansionEasing = 'cubic-bezier(0.59, 0, 0.38, 1)'
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function originInset(origin: OrbitDialogOrigin | undefined, viewport: DOMRect) {
  const valid =
    origin && Object.values(origin).every(Number.isFinite) && origin.width > 0 && origin.height > 0
  const rect = valid
    ? origin
    : {
        top: viewport.height * 0.6,
        left: viewport.width * 0.41,
        width: viewport.width * 0.59,
        height: viewport.height * 0.4,
      }
  const top = clamp(rect.top - viewport.top, 0, Math.max(0, viewport.height - 12))
  const left = clamp(rect.left - viewport.left, 0, Math.max(0, viewport.width - 12))
  const right = clamp(rect.left + rect.width - viewport.left, left + 12, viewport.width)
  const bottom = clamp(rect.top + rect.height - viewport.top, top + 12, viewport.height)
  return `inset(${top}px ${viewport.width - right}px ${viewport.height - bottom}px ${left}px)`
}

export function trapOrbitDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, summary, iframe, [tabindex]',
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[inert], [hidden]') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  )
  const first = controls[0]
  const last = controls.at(-1)
  if (!first) {
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

export function useOrbitDialogTransition<T = void>({
  origin,
  onClose,
  motion,
  translateContent = true,
  getReturnFocus,
}: {
  origin?: OrbitDialogOrigin
  onClose: (value?: T) => void
  motion?: RefObject<OrbitDialogMotion | null>
  translateContent?: boolean
  getReturnFocus?: () => HTMLElement | null | undefined
}) {
  const lenis = useLenis()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const requestCloseRef = useRef<(value?: T, immediate?: boolean) => void>(() => {})
  const onCloseRef = useRef(onClose)
  const originRef = useRef(origin)
  const getReturnFocusRef = useRef(getReturnFocus)

  useEffect(() => {
    onCloseRef.current = onClose
    getReturnFocusRef.current = getReturnFocus
  }, [onClose, getReturnFocus])

  useEffect(() => {
    const dialog = dialogRef.current
    const panel = panelRef.current
    const content = contentRef.current
    if (!dialog || !panel || !content) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const visualViewport = window.visualViewport
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousGutter = root.style.scrollbarGutter
    const wasStopped = lenis?.isStopped
    let phase: 'opening' | 'open' | 'closing' | 'closed' = 'opening'
    let disposed = false
    let released = false
    let closeValue: T | undefined
    let expansion: Animation | undefined
    let settling: Animation | undefined
    let closeDeadline: ReturnType<typeof setTimeout> | undefined
    let viewportFrame = 0
    const duration = window.matchMedia('(max-width: 800px), (max-height: 500px)').matches
      ? 580
      : expansionDuration

    triggerRef.current ??=
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    lenis?.stop()
    root.style.overflow = 'hidden'
    root.style.scrollbarGutter = 'stable'
    updateViewport()
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })

    function release() {
      if (released) return
      released = true
      if (dialog!.open) dialog!.close()
      root.style.overflow = previousOverflow
      root.style.scrollbarGutter = previousGutter
      if (!wasStopped) lenis?.start()
      const returnTarget = getReturnFocusRef.current?.() ?? triggerRef.current
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true })
    }

    function finishClose() {
      if (disposed || phase === 'closed') return
      phase = 'closed'
      clearTimeout(closeDeadline)
      motion?.current?.closed()
      release()
      onCloseRef.current(closeValue)
    }

    function close(value?: T, immediate = false) {
      if (disposed || phase === 'closing' || phase === 'closed') return
      closeValue = value
      const wasOpen = phase === 'open'
      phase = 'closing'
      dialog!.dataset.phase = phase

      if (immediate || media.matches || !expansion) {
        finishClose()
        return
      }

      const closeOrigin = motion?.current?.closeOrigin()
      if (wasOpen && closeOrigin) {
        ;(expansion.effect as KeyframeEffect).setKeyframes([
          { clipPath: originInset(closeOrigin, dialog!.getBoundingClientRect()) },
          { clipPath: 'inset(0px 0px 0px 0px)' },
        ])
      }
      motion?.current?.closing(Number(expansion.currentTime ?? duration))

      // Reverse the existing reveal, even when Escape interrupts its opening.
      // The dialog stays modal and scrolling stays locked until the mask lands.
      expansion.reverse()
      settling?.reverse()
      void expansion.finished.then(finishClose).catch(() => {})
      closeDeadline = setTimeout(finishClose, duration + 160)
    }

    requestCloseRef.current = close
    dialog.dataset.phase = phase
    if (media.matches || typeof panel.animate !== 'function') {
      phase = 'open'
      dialog.dataset.phase = phase
      motion?.current?.opened()
    } else {
      // One geometry read at opening; neither text nor the grid is scaled.
      const inset = originInset(originRef.current, dialog.getBoundingClientRect())
      motion?.current?.opening(duration)
      expansion = panel.animate([{ clipPath: inset }, { clipPath: 'inset(0px 0px 0px 0px)' }], {
        duration,
        easing: expansionEasing,
        fill: 'both',
      })
      settling = content.animate(
        [
          { opacity: 0, transform: `translateY(${translateContent ? 24 : 0}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: duration - 200,
          delay: 140,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      )
      void expansion.finished
        .then(() => {
          if (disposed || phase !== 'opening') return
          phase = 'open'
          dialog.dataset.phase = phase
          motion?.current?.opened()
        })
        .catch(() => {})
    }

    function reduceMotionChanged() {
      if (!media.matches) return
      if (phase === 'closing') finishClose()
      else {
        expansion?.finish()
        settling?.finish()
      }
    }

    function resized() {
      // Finish an in-flight expansion after a viewport change; a later close
      // reuses the captured trigger location without resizing content per frame.
      if (phase === 'opening') {
        expansion?.finish()
        settling?.finish()
      } else if (phase === 'closing') {
        finishClose()
      }
      queueViewportUpdate()
    }

    function updateViewport() {
      // The visual viewport shrinks and may pan when a mobile keyboard opens.
      // Keep the toolbar inside it, while leaving native pinch zoom untouched.
      if (visualViewport && Math.abs(visualViewport.scale - 1) < 0.01) {
        dialog!.style.setProperty('--dialog-viewport-height', `${visualViewport.height}px`)
        dialog!.style.setProperty('--dialog-viewport-top', `${visualViewport.offsetTop}px`)
      } else {
        dialog!.style.removeProperty('--dialog-viewport-height')
        dialog!.style.removeProperty('--dialog-viewport-top')
      }
    }

    function queueViewportUpdate() {
      cancelAnimationFrame(viewportFrame)
      viewportFrame = requestAnimationFrame(updateViewport)
    }

    media.addEventListener('change', reduceMotionChanged)
    window.addEventListener('resize', resized)
    visualViewport?.addEventListener('resize', resized)
    visualViewport?.addEventListener('scroll', queueViewportUpdate)
    return () => {
      disposed = true
      clearTimeout(closeDeadline)
      cancelAnimationFrame(viewportFrame)
      expansion?.cancel()
      settling?.cancel()
      media.removeEventListener('change', reduceMotionChanged)
      window.removeEventListener('resize', resized)
      visualViewport?.removeEventListener('resize', resized)
      visualViewport?.removeEventListener('scroll', queueViewportUpdate)
      requestCloseRef.current = () => {}
      release()
    }
  }, [lenis, motion, translateContent])

  const requestClose = useCallback(
    (value?: T, immediate?: boolean) => requestCloseRef.current(value, immediate),
    [],
  )
  return { dialogRef, panelRef, contentRef, closeRef, requestClose }
}
