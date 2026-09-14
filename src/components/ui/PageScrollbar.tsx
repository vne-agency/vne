'use client'

import { useLenis } from 'lenis/react'
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useSiteLanguage } from './SiteLanguage'

import styles from './PageScrollbar.module.css'

export function PageScrollbar() {
  const { language, t } = useSiteLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const maxScroll = useRef(0)
  const lenis = useLenis()

  useEffect(() => {
    const input = inputRef.current
    if (!input || window.self !== window.top) return
    const root = document.documentElement
    const media = window.matchMedia(
      '(pointer: fine) and (min-width: 48rem) and (forced-colors: none)',
    )

    const sync = () => {
      const progress =
        maxScroll.current > 0
          ? Math.min(100, Math.max(0, (window.scrollY / maxScroll.current) * 100))
          : 0
      input.value = String(progress)
      input.setAttribute('aria-valuenow', String(Math.round(progress)))
      input.setAttribute(
        'aria-valuetext',
        `${Math.round(progress)}% ${language === 'ru' ? 'страницы' : 'of page'}`,
      )
    }
    const measure = () => {
      maxScroll.current = Math.max(0, root.scrollHeight - window.innerHeight)
      if (media.matches && maxScroll.current > 0) root.dataset.pageScrollbar = 'true'
      else delete root.dataset.pageScrollbar
      sync()
    }

    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    observer.observe(root)
    media.addEventListener('change', measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', sync, { passive: true })
    measure()
    return () => {
      observer.disconnect()
      media.removeEventListener('change', measure)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', sync)
      delete root.dataset.pageScrollbar
    }
  }, [language])

  const measureForInteraction = () => {
    lenis?.resize()
    maxScroll.current = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  }

  const scrollTo = (top: number) => {
    if (document.querySelector('dialog[open]') || lenis?.isStopped) return
    // Direct manipulation must stay under the pointer and cancel any wheel inertia.
    if (lenis) lenis.scrollTo(top, { immediate: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }
  const onInput = (event: FormEvent<HTMLInputElement>) => {
    scrollTo((Number(event.currentTarget.value) / 100) * maxScroll.current)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    measureForInteraction()
    const targets: Record<string, number> = {
      ArrowDown: window.scrollY + 80,
      ArrowUp: window.scrollY - 80,
      PageDown: window.scrollY + window.innerHeight * 0.9,
      PageUp: window.scrollY - window.innerHeight * 0.9,
      Home: 0,
      End: maxScroll.current,
    }
    if (event.key in targets) {
      event.preventDefault()
      scrollTo(Math.max(0, Math.min(maxScroll.current, targets[event.key])))
    }
  }

  return (
    <div className={styles.rail} data-native-cursor data-page-scrollbar-control>
      <input
        ref={inputRef}
        className={styles.control}
        type="range"
        role="scrollbar"
        aria-label={t('Прокрутка страницы')}
        aria-controls="site-scroll-document"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        min={0}
        max={100}
        step="0.01"
        defaultValue={0}
        onInput={onInput}
        onPointerDown={measureForInteraction}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
