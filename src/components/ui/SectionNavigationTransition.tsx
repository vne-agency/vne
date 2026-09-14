'use client'

import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { changeSectionWithParticles } from './section-particles'
import { sectionDestination } from './section-destination'

export function SectionNavigationTransition() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    let cancel = () => {}
    let clearFocus = () => {}
    const choose = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link = event.composedPath().find((node) => node instanceof HTMLAnchorElement)
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self') ||
        link.closest('dialog') ||
        document.querySelector('dialog[open], [data-startup-loader]')
      )
        return
      const url = new URL(link.href)
      if (
        !url.hash ||
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search
      )
        return
      // Other pages have action links (for example, choosing a pricing offer).
      // Preserve their React handlers; only their explicit return-to-top uses this effect.
      if (pathname !== '/' && url.hash !== '#top') return
      const destination = sectionDestination(url.hash)
      if (!destination) return
      event.preventDefault()
      // Stop document/Lenis handlers, while allowing the menu's window capture
      // listener to close and preserve its normal keyboard interaction.
      event.stopPropagation()
      cancel()
      window.dispatchEvent(new Event('vne-section-navigation'))
      if (lenis && !lenis.isStopped && !lenis.isLocked) {
        lenis.stop()
        lenis.start()
      }
      const commit = () => {
        const current = sectionDestination(url.hash)
        if (!current) return
        if (location.hash !== url.hash) history.pushState(history.state, '', url.hash)
        if (lenis) {
          lenis.resize()
          lenis.scrollTo(current.top, { immediate: true, force: true })
        } else window.scrollTo({ top: current.top, behavior: 'instant' })
      }
      const focus = () => {
        clearFocus()
        const section = sectionDestination(url.hash)?.section
        if (!section) return
        const hadTabIndex = section.hasAttribute('tabindex')
        if (!hadTabIndex) section.tabIndex = -1
        section.focus({ preventScroll: true })
        clearFocus = () => {
          if (!hadTabIndex) section.removeAttribute('tabindex')
          section.removeEventListener('blur', clearFocus)
        }
        section.addEventListener('blur', clearFocus, { once: true })
      }
      // Already reached anchors need no decorative delay.
      if (Math.abs(destination.top - window.scrollY) < 2) {
        commit()
        focus()
      } else cancel = changeSectionWithParticles(commit, focus)
    }
    window.addEventListener('click', choose, true)
    return () => {
      cancel()
      clearFocus()
      window.removeEventListener('click', choose, true)
    }
  }, [lenis, pathname])
  return null
}
