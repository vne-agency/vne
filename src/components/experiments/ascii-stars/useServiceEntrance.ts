'use client'

import { useEffect, type RefObject } from 'react'

/** Fallback for browsers without native scroll timelines. The primary motion
 * stays on the original parent timeline, including the horizontal arrival. */
export function useServiceEntrance(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current
    if (!section || !('IntersectionObserver' in window)) return
    if (
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline: view()') &&
      CSS.supports('animation-range: contain 0% contain 120svh')
    )
      return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const rows = [
      ...section.querySelectorAll<HTMLElement>('[data-service-row], [data-service-contact]'),
    ]
    const edge = Math.min(80, Math.round(innerHeight * 0.12))
    const initial = rows.map((row) => {
      const rect = row.getBoundingClientRect()
      return {
        row,
        visible:
          rect.top < innerHeight - edge &&
          rect.bottom > edge &&
          rect.left < innerWidth &&
          rect.right > 0,
        above: rect.bottom <= edge,
      }
    })
    const intersections = new Map(initial.map(({ row, visible }) => [row, visible]))
    const update = (row: HTMLElement, focused = row.contains(document.activeElement)) => {
      delete row.dataset.serviceInstant
      row.dataset.serviceVisible = String(reduced.matches || focused || intersections.get(row))
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, boundingClientRect, rootBounds }) => {
          const row = target as HTMLElement
          intersections.set(row, isIntersecting)
          // Keep the exit direction until the row returns to its reading position.
          if (!isIntersecting)
            row.dataset.serviceEdge =
              boundingClientRect.bottom <= (rootBounds?.top ?? edge) ? 'above' : 'below'
          update(row)
        })
      },
      { rootMargin: `-${edge}px 0px -${edge}px 0px`, threshold: 0 },
    )

    initial.forEach(({ row, above }) => {
      row.dataset.serviceEdge = above ? 'above' : 'below'
      update(row)
      observer.observe(row)
    })
    section.dataset.serviceEntrance = 'ready'

    const revealFocused = (event: Event) => {
      if (!(event.target instanceof Element)) return
      const row = event.target.closest<HTMLElement>('[data-service-row], [data-service-contact]')
      if (row && section.contains(row)) {
        row.dataset.serviceInstant = 'true'
        row.dataset.serviceVisible = 'true'
      }
    }
    const releaseFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      const row = event.target.closest<HTMLElement>('[data-service-row], [data-service-contact]')
      if (row && !(event.relatedTarget instanceof Node && row.contains(event.relatedTarget)))
        update(row, false)
    }
    const onPreference = () => {
      rows.forEach((row) => update(row))
    }
    section.addEventListener('focusin', revealFocused)
    section.addEventListener('focusout', releaseFocused)
    section.addEventListener('pointerdown', revealFocused)
    reduced.addEventListener('change', onPreference)

    return () => {
      observer.disconnect()
      section.removeEventListener('focusin', revealFocused)
      section.removeEventListener('focusout', releaseFocused)
      section.removeEventListener('pointerdown', revealFocused)
      reduced.removeEventListener('change', onPreference)
      delete section.dataset.serviceEntrance
      rows.forEach((row) => {
        delete row.dataset.serviceVisible
        delete row.dataset.serviceInstant
        delete row.dataset.serviceEdge
      })
    }
  }, [ref])
}
