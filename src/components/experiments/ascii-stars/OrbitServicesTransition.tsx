'use client'

import { useLenis } from 'lenis/react'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

import styles from './OrbitServicesTransition.module.css'

export function OrbitServicesTransition({
  children,
  services,
}: {
  children: ReactNode
  services: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const outgoingRef = useRef<HTMLDivElement>(null)
  const incomingRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const releaseRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useLayoutEffect(() => {
    const root = rootRef.current
    const outgoing = outgoingRef.current
    const incoming = incomingRef.current
    const anchor = anchorRef.current
    const release = releaseRef.current
    if (!root || !outgoing || !incoming || !anchor || !release) return

    let previous: { outgoing: number; faq: number; width: number; height: number } | null = null
    let scrollRemainder = 0
    let heldSlides: Animation[] = []
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let holdDeadline: ReturnType<typeof setTimeout> | undefined
    let releaseFrame = 0

    const releaseSlides = () => {
      clearTimeout(settleTimer)
      clearTimeout(holdDeadline)
      cancelAnimationFrame(releaseFrame)
      heldSlides.forEach((animation) => animation.cancel())
      heldSlides = []
    }
    const settleSlides = () => {
      if (!heldSlides.length) return
      clearTimeout(settleTimer)
      cancelAnimationFrame(releaseFrame)
      // ResizeObserver and compositor timelines do not commit in the same
      // phase. Release only after the answer's geometry has stopped changing.
      settleTimer = setTimeout(() => {
        releaseFrame = requestAnimationFrame(() => {
          releaseFrame = requestAnimationFrame(releaseSlides)
        })
      }, 100)
    }
    const holdSlides = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      if (!event.target.closest('[data-faq-item] button')) return
      if (getComputedStyle(root).getPropertyValue('--services-horizontal').trim() !== '1') return
      // Capture before React starts changing the accordion height. A constant
      // WAAPI transform also holds the compositor, unlike scroll compensation.
      const transforms = [outgoing, incoming].map((panel) => getComputedStyle(panel).transform)
      releaseSlides()
      heldSlides = [outgoing, incoming].map((panel, index) =>
        panel.animate([{ transform: transforms[index] }, { transform: transforms[index] }], {
          duration: 1,
          fill: 'both',
        }),
      )
      holdDeadline = setTimeout(releaseSlides, 1600)
    }
    root.addEventListener('click', holdSlides, true)
    // Explicit scrolling takes priority over the brief accordion hold.
    window.addEventListener('wheel', releaseSlides, { passive: true })
    window.addEventListener('touchmove', releaseSlides, { passive: true })
    window.addEventListener('resize', releaseSlides)
    window.addEventListener('vne-section-navigation', releaseSlides)

    // Measure natural sizes only when content changes (including an accordion
    // expansion). CSS owns the entire reversible scroll animation.
    const measure = () => {
      const outgoingHeight = outgoing.getBoundingClientRect().height
      const incomingRect = incoming.getBoundingClientRect()
      const incomingHeight = incomingRect.height
      const serviceSection = incoming.querySelector<HTMLElement>('[data-service-section]')
      const serviceHeader = incoming.querySelector<HTMLElement>('[data-service-header]')
      const serviceHeight = serviceSection?.getBoundingClientRect().height ?? incomingHeight
      const serviceHeaderHeight = serviceHeader?.getBoundingClientRect().height ?? 0
      const faq = outgoing.querySelector<HTMLElement>('#faq')
      const faqHeight = faq?.getBoundingClientRect().height ?? 0
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      let scrollAdjustment = 0
      if (
        previous &&
        previous.width === viewportWidth &&
        previous.height === viewportHeight &&
        previous.faq !== faqHeight &&
        getComputedStyle(root).getPropertyValue('--services-horizontal').trim() === '1'
      ) {
        const rootTop = root.getBoundingClientRect().top + window.scrollY
        const oldPin = rootTop + previous.outgoing - viewportHeight
        const newPin = rootTop + outgoingHeight - viewportHeight
        // Keep the same horizontal progress while a pinned answer changes size.
        // Before pinning, closing an answer must not push the reader into services.
        if (window.scrollY >= oldPin - 1) {
          scrollAdjustment = outgoingHeight - previous.outgoing
        } else if (window.scrollY > newPin) {
          scrollAdjustment = newPin - window.scrollY
        }
      }
      previous = {
        outgoing: outgoingHeight,
        faq: faqHeight,
        width: viewportWidth,
        height: viewportHeight,
      }
      const faqBottom = faq?.getBoundingClientRect().bottom ?? 0
      const tails = Array.from(outgoing.querySelectorAll<HTMLElement>('[data-faq-item]')).map(
        (item) => ({
          item,
          distance: Math.max(1, faqBottom - item.getBoundingClientRect().top - 2),
        }),
      )
      // Static row offsets keep one timeline across the pinned arrival and
      // subsequent vertical reading, without measuring animated text.
      const serviceRows = Array.from(
        incoming.querySelectorAll<HTMLElement>('[data-service-row], [data-service-contact]'),
      ).map((row) => ({ row, offset: row.getBoundingClientRect().top - incomingRect.top }))

      root.style.setProperty('--outgoing-height', `${outgoingHeight}px`)
      root.style.setProperty('--incoming-height', `${incomingHeight}px`)
      root.style.setProperty('--service-height', `${serviceHeight}px`)
      root.style.setProperty('--service-header-height', `${serviceHeaderHeight}px`)
      tails.forEach(({ item, distance }) => item.style.setProperty('--faq-tail', `${distance}px`))
      serviceRows.forEach(({ row, offset }) =>
        row.style.setProperty('--service-offset', `${offset}px`),
      )
      root.dataset.servicesTransition = 'ready'
      settleSlides()
      if (scrollAdjustment !== 0) {
        const exact = window.scrollY + scrollAdjustment + scrollRemainder
        const rounded = Math.round(exact)
        scrollRemainder = exact - rounded
        // Native scroll positions use device pixels; keep the CSS timeline at
        // the same fractional position instead of alternating across a pixel.
        root.style.setProperty('--services-scroll-rounding', `${-scrollRemainder}px`)
        if (lenis) {
          lenis.resize()
          lenis.scrollTo(rounded, { immediate: true, force: true })
        } else window.scrollTo({ top: rounded, behavior: 'instant' })
      }
    }
    measure()
    let measureFrame = 0
    const requestMeasure = () => {
      if (measureFrame) return
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0
        measure()
      })
    }
    // Writing layout inside ResizeObserver delivery can create a resize loop
    // in WebKit. Coalesce the measured updates into the next rendering frame.
    const observer = new ResizeObserver(requestMeasure)
    observer.observe(outgoing)
    observer.observe(incoming)

    const scrollTo = (top: number) => {
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(Math.ceil(top), { immediate: true, force: true })
      } else window.scrollTo({ top: Math.ceil(top), behavior: 'instant' })
    }

    const anchorPosition = (hash: string) => {
      if (hash !== '#services' && hash !== '#cases' && hash !== '#faq') return null
      const target = document.querySelector<HTMLElement>(hash)
      if (!target) return null
      if (
        hash === '#services' ||
        getComputedStyle(root).getPropertyValue('--services-horizontal').trim() !== '1'
      )
        return target.getBoundingClientRect().top + window.scrollY

      const rootTop = root.getBoundingClientRect().top + window.scrollY
      const outgoingRect = outgoing.getBoundingClientRect()
      const localTop = target.getBoundingClientRect().top - outgoingRect.top
      return rootTop + Math.min(localTop, outgoingRect.height - window.innerHeight)
    }

    // Keyboard focus must not get stranded on a panel translated off screen.
    const onFocus = (event: FocusEvent) => {
      if (getComputedStyle(root).getPropertyValue('--services-horizontal').trim() !== '1') return
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('dialog[open]')) return
      // A pointer can reach the visible part of a horizontally shifted row.
      // Only keyboard focus should bring the entire panel back into view.
      if (!target.matches(':focus-visible')) return
      const targetRect = target.getBoundingClientRect()
      if (
        // Ceil-rounded anchors can land a fraction of a pixel above the viewport.
        targetRect.left >= -2 &&
        targetRect.right <= window.innerWidth + 2 &&
        targetRect.top >= -2 &&
        (targetRect.bottom <= window.innerHeight || target.matches('section'))
      )
        return

      if (incoming.contains(target)) {
        const localTop = targetRect.top - incoming.getBoundingClientRect().top
        const offset = Math.max(0, localTop - 160)
        const marker = offset > 0 ? release : anchor
        scrollTo(marker.getBoundingClientRect().top + window.scrollY + offset)
      } else if (outgoing.contains(target)) {
        const localTop = targetRect.top - outgoing.getBoundingClientRect().top
        const rootTop = root.getBoundingClientRect().top + window.scrollY
        scrollTo(rootTop + Math.min(localTop - 160, outgoing.offsetHeight - window.innerHeight))
      }
    }
    root.addEventListener('focusin', onFocus)

    const onHashChange = () => {
      const top = anchorPosition(location.hash)
      if (top !== null) scrollTo(top)
    }
    window.addEventListener('hashchange', onHashChange)

    let frame = 0
    let disposed = false
    void document.fonts.ready.then(() => {
      if (disposed || anchorPosition(location.hash) === null) return
      frame = requestAnimationFrame(() => {
        measure()
        frame = requestAnimationFrame(() => {
          const top = anchorPosition(location.hash)
          if (top !== null) scrollTo(top)
        })
      })
    })

    return () => {
      disposed = true
      releaseSlides()
      root.removeEventListener('click', holdSlides, true)
      window.removeEventListener('wheel', releaseSlides)
      window.removeEventListener('touchmove', releaseSlides)
      window.removeEventListener('resize', releaseSlides)
      window.removeEventListener('vne-section-navigation', releaseSlides)
      observer.disconnect()
      cancelAnimationFrame(measureFrame)
      root.removeEventListener('focusin', onFocus)
      window.removeEventListener('hashchange', onHashChange)
      cancelAnimationFrame(frame)
    }
  }, [lenis])

  return (
    <div className={styles.sequence} ref={rootRef} data-services-transition="pending">
      <div className={styles.outgoing} ref={outgoingRef} data-services-outgoing>
        {children}
      </div>
      <div id="services" className={styles.anchor} ref={anchorRef} aria-hidden="true" />
      <div
        className={styles.releaseAnchor}
        ref={releaseRef}
        data-services-release
        aria-hidden="true"
      />
      <div className={styles.runway}>
        <div className={styles.incoming} ref={incomingRef} data-services-incoming>
          {services}
        </div>
      </div>
    </div>
  )
}
