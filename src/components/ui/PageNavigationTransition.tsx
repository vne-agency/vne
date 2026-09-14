'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLenis } from 'lenis/react'
import { changeSectionWithParticles } from './section-particles'
import { sectionDestination } from './section-destination'

export function PageNavigationTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const lenis = useLenis()
  const pending = useRef<{ path: string; hash: string; resolve: () => void } | null>(null)

  useEffect(() => {
    const navigation = pending.current
    if (!navigation || navigation.path !== pathname) return
    const frame = requestAnimationFrame(() => {
      const destination = navigation.hash ? sectionDestination(navigation.hash) : null
      const target =
        destination?.section ?? document.querySelector<HTMLElement>('#site-content main')
      if (target) {
        const hadTabIndex = target.hasAttribute('tabindex')
        if (!hadTabIndex) target.tabIndex = -1
        target.focus({ preventScroll: true })
        if (!hadTabIndex)
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
      }
      const top = destination?.top ?? 0
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(top, { immediate: true, force: true })
      } else window.scrollTo({ top, behavior: 'instant' })
      pending.current = null
      navigation.resolve()
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, lenis])

  useEffect(() => {
    let cancel = () => {}
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
        (link.target && link.target !== '_self')
      )
        return
      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      if (
        link.getAttribute('aria-haspopup') === 'dialog' ||
        (link.closest('dialog') && /^\/(cases|services)\//.test(url.pathname))
      )
        return
      // Only public site routes share this persistent layout and transition surface.
      if (
        !/^\/(?:pricing|lab|privacy|cookies|consent|analytics-consent|terms|services\/[^/]+|cases\/[^/]+)?\/?$/.test(
          url.pathname,
        )
      )
        return
      event.preventDefault()
      event.stopPropagation()
      cancel()
      window.dispatchEvent(new Event('vne-section-navigation'))
      router.prefetch(url.pathname + url.search)
      const source = link.closest('dialog[open]')?.firstElementChild
      cancel = changeSectionWithParticles(
        () =>
          new Promise<void>((resolve) => {
            pending.current?.resolve()
            pending.current = {
              path: url.pathname.replace(/\/$/, '') || '/',
              hash: url.hash,
              resolve,
            }
            router.push(url.pathname + url.search + url.hash, { scroll: false })
          }),
        undefined,
        source instanceof HTMLElement ? source : undefined,
      )
    }
    // Capture before Next Link starts navigation; modal triggers are excluded above.
    window.addEventListener('click', choose, true)
    return () => {
      window.removeEventListener('click', choose, true)
      cancel()
      pending.current?.resolve()
      pending.current = null
    }
  }, [router])

  return null
}
