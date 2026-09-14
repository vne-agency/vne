'use client'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { ApproachSection } from '@/components/sections/ApproachSection'
import { LanguageSwitch } from '@/components/ui/SiteLanguage'
import { MoscowClock } from '@/components/ui/MoscowClock'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'

import { AsciiStarsCanvas } from './AsciiStarsCanvas'
import styles from './AsciiStarsScrollHero.module.css'
import { useDirectionsScrollHold } from './useDirectionsScrollHold'
import { useHeroWheelTransition } from './useHeroWheelTransition'
import { SectionNavigation } from './SectionNavigation'
import { FloatingSectionNavigation } from './FloatingSectionNavigation'

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getMotionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const getServerPreference = () => true

export function AsciiStarsScrollHero({
  children,
  directions,
}: {
  children: ReactNode
  directions: ReactNode
}) {
  const { t } = useSiteLanguage()

  const sequenceRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const directionsRef = useRef<HTMLDivElement>(null)
  const directionsAnchorRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerPreference,
  )
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null)
  const [artworkScale, setArtworkScale] = useState(1.55)
  const paused = motionOverride ?? reducedMotion
  useHeroWheelTransition(sequenceRef, reducedMotion)
  useDirectionsScrollHold(sequenceRef, reducedMotion)

  useEffect(() => {
    const sequence = sequenceRef.current
    const panel = directionsRef.current
    const anchor = directionsAnchorRef.current
    const hero = heroRef.current
    if (!sequence || !panel || !anchor || !hero) return

    // The real anchor stays outside the sticky/translated surfaces. On smaller
    // screens it follows the section's measured normal-flow position instead.
    const measure = () => {
      const top = panel.offsetTop
      anchor.style.setProperty('--directions-flow-y', `${top}px`)
      sequence.style.setProperty('--hero-flow-height', `${hero.offsetHeight}px`)
      const navigation = hero.querySelector<HTMLElement>('[data-section-navigation]')
      const intro = navigation?.parentElement
      if (intro) {
        sequence.style.setProperty(
          '--navigation-flow-height',
          `${intro.offsetTop + intro.offsetHeight}px`,
        )
      }
      setArtworkScale(window.matchMedia('(width <= 700px)').matches ? 1.05 : 1.55)
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
    observer.observe(sequence)
    observer.observe(panel)
    observer.observe(hero)
    let frame = 0
    let disposed = false
    void document.fonts.ready.then(() => {
      if (disposed || location.hash !== '#directions') return
      frame = requestAnimationFrame(() => {
        measure()
        // Let the responsive layout and marker position commit before resolving
        // an initial deep link, including the static reduced-motion layout.
        frame = requestAnimationFrame(() => {
          if (location.hash === '#directions') anchor.scrollIntoView({ block: 'start' })
        })
      })
    })
    return () => {
      disposed = true
      observer.disconnect()
      cancelAnimationFrame(measureFrame)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <main id="top" className={styles.page} data-native-cursor>
      <section ref={sequenceRef} className={styles.sequence} aria-labelledby="scroll-hero-title">
        <span className={styles.navigationBoundary} data-navigation-boundary aria-hidden="true" />
        <div id="approach-full" className={styles.releaseAnchor} />
        <div
          id="directions"
          ref={directionsAnchorRef}
          className={styles.directionsAnchor}
          aria-hidden="true"
        />
        <div id="directions-end" className={styles.directionsEndAnchor} aria-hidden="true" />
        <div className={styles.pin}>
          <div ref={heroRef} className={styles.heroLayers}>
            <header className={styles.header}>
              <div className={styles.brandBar}>
                <a
                  href="#top"
                  className={styles.wordmark}
                  aria-label={t('ВНЕ — в начало страницы')}
                >
                  <span data-startup-wordmark>{t('ВНЕ')}</span>
                </a>
                <span className={styles.brandNote} data-startup-reveal>
                  <RotatingSlogan />
                </span>
              </div>
              <nav
                className={styles.navigation}
                aria-label={t('Основная навигация')}
                data-startup-reveal
              >
                <LanguageSwitch />
                <Link href="/lab" className={styles.labLink}>
                  ./lab
                </Link>
                <a href="#contact" className={styles.contactLink}>
                  {t('Обсудить проект')}
                  <Image
                    src="/assets/brand/vne-orbit-mark.svg"
                    className={styles.contactLogo}
                    width={24}
                    height={28}
                    alt=""
                  />
                </a>
              </nav>
            </header>

            <div className={styles.artwork} data-startup-artwork>
              <AsciiStarsCanvas
                theme="dark"
                mode="ascii"
                density={0.64}
                speed={0.16}
                paused={paused}
                scale={artworkScale}
                rotationZ={0.95}
              />
              <div className={styles.artworkLabel} aria-hidden="true" data-startup-reveal>
                <span>VNE / CONSTELLATION</span>
                <MoscowClock />
              </div>
              <div className={styles.artworkControls} data-startup-reveal>
                <p>{t('Потяните, чтобы повернуть')}</p>
                <button
                  type="button"
                  aria-label={t('Пауза анимации')}
                  aria-pressed={paused}
                  onClick={() => setMotionOverride(!paused)}
                >
                  <span aria-hidden="true">{t(paused ? '▷' : 'Ⅱ')}</span>
                  {t(paused ? 'Продолжить' : 'Пауза')}
                </button>
              </div>
            </div>

            <div className={styles.introBackdrop} aria-hidden="true" />
            <div className={styles.intro}>
              <p className={styles.eyebrow} data-startup-reveal>
                {t('Стратегия · Дизайн · Разработка')}
              </p>
              <h1 id="scroll-hero-title" data-startup-reveal>
                {t('Дизайн, который')}
                <br />
                {t('двигает ваш')}
                <br />
                {t('бизнес вперёд.')}
              </h1>
              <div className={styles.introFooter} data-startup-reveal>
                <p>{t('От первой идеи до работающего проекта.')}</p>
                <a
                  href="#approach-full"
                  className={styles.sectionIndex}
                  aria-label={t('Раздел 1 — Наш подход')}
                >
                  [01]
                </a>
              </div>
              <SectionNavigation />
            </div>
          </div>

          <div className={styles.approachSlide}>
            <div className={styles.approachPanel} data-approach-panel data-startup-reveal>
              <ApproachSection variant="hero" />
            </div>
          </div>
          <div className={styles.scrollCue} aria-hidden="true" data-startup-reveal>
            <span>{t('Листайте вниз')}</span>
            <span className={styles.scrollCueArrow}>↓</span>
          </div>
          <div ref={directionsRef} className={styles.directionsPanel} data-directions-panel>
            {directions}
          </div>
        </div>
      </section>

      <div className={styles.continuation}>{children}</div>
      <FloatingSectionNavigation />
    </main>
  )
}
