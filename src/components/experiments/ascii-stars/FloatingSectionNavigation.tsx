'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import styles from './FloatingSectionNavigation.module.css'
import { useNavigationTransfer } from './useNavigationTransfer'

const sections = [
  { id: 'top', region: 'approach-full', number: '01', ru: 'старт', en: 'start' },
  { id: 'cases', region: 'cases', number: '02', ru: 'работы', en: 'work' },
  { id: 'services', region: 'services-content', number: '03', ru: 'услуги', en: 'services' },
  { id: 'contact', region: 'contact', number: '04', ru: 'связаться', en: 'contact' },
] as const

export function FloatingSectionNavigation() {
  const { language } = useSiteLanguage()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('top')
  const widget = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const ru = language === 'ru'
  const close = useCallback(() => setOpen(false), [])
  useNavigationTransfer(toggle, setVisible, close)

  useEffect(() => {
    const boundary = document.querySelector('[data-navigation-boundary]')
    if (!boundary) return
    const anchors = sections.map(({ id }) => document.getElementById(id))
    const update = () => {
      const positions = anchors.map((anchor) => anchor?.getBoundingClientRect().top ?? Infinity)
      let current: string = sections[0].id
      positions.forEach((top, index) => {
        if (top <= window.innerHeight * 0.45) current = sections[index].id
      })
      setActive(current)
    }
    const observer = new IntersectionObserver(update, { rootMargin: '-1px 0px 0px', threshold: 0 })
    observer.observe(boundary)
    let regions: IntersectionObserver
    const resize = () => {
      regions?.disconnect()
      regions = new IntersectionObserver(update, {
        rootMargin: `-1px 0px -${Math.round(window.innerHeight * 0.55)}px 0px`,
        threshold: 0,
      })
      sections.forEach(({ region }) => {
        const node = document.getElementById(region)
        if (node) regions.observe(node)
      })
      anchors.forEach((anchor) => {
        if (anchor) regions.observe(anchor)
      })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      observer.disconnect()
      regions.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    // SectionNavigationTransition owns movement; this listener closes the menu.
    const choose = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!link || !widget.current?.contains(link)) return
      setOpen(false)
      setActive(link.getAttribute('href')!.slice(1))
      toggle.current?.focus({ preventScroll: true })
    }
    window.addEventListener('click', choose, true)
    return () => window.removeEventListener('click', choose, true)
  }, [])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !widget.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <div
      ref={widget}
      className={styles.widget}
      data-floating-navigation
      data-visible={visible}
      inert={!visible}
    >
      <button
        ref={toggle}
        type="button"
        className={styles.toggle}
        aria-label={
          ru
            ? open
              ? 'Скрыть навигацию'
              : 'Открыть навигацию'
            : open
              ? 'Close navigation'
              : 'Open navigation'
        }
        aria-expanded={open}
        aria-controls="floating-section-navigation"
        onClick={() => setOpen(!open)}
      >
        <Image src="/assets/brand/vne-orbit-mark.svg" width={20} height={24} alt="" />
      </button>
      <nav
        id="floating-section-navigation"
        className={styles.panel}
        aria-label={ru ? 'Быстрая навигация' : 'Quick navigation'}
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active === section.id ? 'location' : undefined}
          >
            <span data-language-particle-text>
              [{section.number} {section[language]}]
            </span>
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </a>
        ))}
      </nav>
    </div>
  )
}
