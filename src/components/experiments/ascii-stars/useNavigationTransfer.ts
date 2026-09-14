'use client'

import { useEffect, type RefObject } from 'react'
import styles from './FloatingSectionNavigation.module.css'

export function useNavigationTransfer(
  toggle: RefObject<HTMLButtonElement | null>,
  setVisible: (visible: boolean) => void,
  close: () => void,
) {
  useEffect(() => {
    const boundary = document.querySelector<HTMLElement>('[data-navigation-boundary]')
    const navigation = document.querySelector<HTMLElement>('[data-section-navigation]')
    const button = toggle.current
    if (!boundary || !navigation || !button) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let docked: boolean | undefined
    let animations: Animation[] = []
    let copies: HTMLElement[] = []
    let observer: IntersectionObserver
    let generation = 0
    const departureInset = () => window.innerHeight * 0.12

    const cancel = () => {
      generation += 1
      animations.forEach((animation) => animation.cancel())
      copies.forEach((copy) => copy.remove())
      animations = []
      copies = []
    }

    const update = (immediate = false) => {
      // Start before the hero's scroll timeline hides its entire layer.
      const next = boundary.getBoundingClientRect().bottom <= departureInset() + 1
      if (next === docked && !immediate) return
      const initial = docked === undefined
      const links = Array.from(navigation.querySelectorAll('a'))
      const destination = button.getBoundingClientRect()
      const measurements = links.map((link) => {
        const rect = link.getBoundingClientRect()
        const style = getComputedStyle(link)
        return {
          link,
          rect,
          font: style.font,
          color: style.color,
          padding: style.paddingInlineStart,
        }
      })
      const heroVisible = getComputedStyle(navigation).visibility !== 'hidden'
      const canFly =
        !initial &&
        !immediate &&
        !reducedMotion.matches &&
        !document.documentElement.dataset.sectionTransition &&
        heroVisible &&
        measurements.every(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight)

      cancel()
      const run = generation
      docked = next
      close()
      setVisible(next || canFly)
      navigation.dataset.docked = String(next)
      navigation.inert = next
      if (!canFly) return

      const centerX = destination.left + destination.width / 2
      const centerY = destination.top + destination.height / 2
      const mobile = window.matchMedia(
        '(max-width: 896px), (hover: none) and (pointer: coarse)',
      ).matches
      const flights = measurements.map(({ link, rect, font, color, padding }, index) => {
        const dx = centerX - rect.left - rect.width / 2
        const dy = centerY - rect.top - rect.height / 2
        let animation: Animation
        if (next) {
          // Fixed copies survive the hero layer becoming invisible and keep scrolling smooth.
          const copy = document.createElement('span')
          copy.className = styles.transferringLink
          copy.setAttribute('aria-hidden', 'true')
          copy.textContent = link.textContent
          Object.assign(copy.style, {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            font,
            color,
            paddingInlineStart: padding,
          })
          document.body.appendChild(copy)
          copies.push(copy)
          animation = copy.animate(
            [
              { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
              {
                transform: `translate(${dx * (mobile ? 0.8 : 0.6)}px, ${dy * (mobile ? 0.15 : 0.45)}px) scale(.92)`,
                opacity: 1,
                offset: 0.5,
              },
              { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0, offset: 1 },
            ],
            {
              duration: mobile ? 640 : 880,
              delay: (links.length - index - 1) * (mobile ? 50 : 75),
              easing: 'cubic-bezier(.4, 0, .2, 1)',
              fill: 'both',
            },
          )
        } else {
          // Animate the real links on return so their destination follows the hero layout.
          animation = link.animate(
            [
              { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0 },
              { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            ],
            {
              duration: mobile ? 560 : 720,
              delay: (links.length - index - 1) * (mobile ? 40 : 60),
              easing: 'cubic-bezier(.2, .7, .2, 1)',
              fill: 'both',
            },
          )
        }
        animations.push(animation)
        return animation.finished.catch(() => undefined)
      })

      if (next) {
        const arrival = button.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
          { duration: 300, delay: mobile ? 480 : 720, easing: 'ease-in-out' },
        )
        animations.push(arrival)
      }

      void Promise.all(flights).then(() => {
        if (generation !== run) return
        cancel()
        setVisible(next)
      })
    }

    const resize = () => {
      observer?.disconnect()
      update(true)
      observer = new IntersectionObserver(() => update(), {
        rootMargin: `-${Math.round(departureInset())}px 0px 0px`,
        threshold: 0,
      })
      observer.observe(boundary)
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('vne-section-navigation', cancel)
    reducedMotion.addEventListener('change', resize)
    return () => {
      cancel()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('vne-section-navigation', cancel)
      reducedMotion.removeEventListener('change', resize)
      delete navigation.dataset.docked
      navigation.inert = false
    }
  }, [toggle, setVisible, close])
}
