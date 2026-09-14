'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'

import { AsciiStarsCanvas } from './AsciiStarsCanvas'
import styles from './AsciiStarsHero.module.css'

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getServerReducedMotion() {
  return true
}

type AsciiStarsHeroProps = {
  variant: 'light' | 'dark'
}

export function AsciiStarsHero({ variant }: AsciiStarsHeroProps) {
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )
  const paused = motionOverride ?? reducedMotion
  const isLight = variant === 'light'

  return (
    <main className={styles.hero} data-theme={variant} data-native-cursor>
      <header className={styles.header}>
        <Link href="/" className={styles.identity} aria-label="ВНЕ — на главную">
          <span className={styles.wordmark}>ВНЕ</span>
          <span className={styles.identityCaption}>
            Независимая
            <br />
            дизайн-студия
          </span>
        </Link>

        <nav className={styles.mainNav} aria-label="Основная навигация">
          <Link href="/#cases" className={styles.navLink}>
            Проекты
          </Link>
          <Link href="/#directions" className={`${styles.navLink} ${styles.servicesLink}`}>
            Что делаем
          </Link>
          <Link href="/#contact" className={styles.headerContact}>
            На связи{' '}
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </nav>
      </header>

      <section className={styles.stage} aria-labelledby="hero-title">
        <div className={styles.stageEyebrow}>
          <span className={styles.tinyStar} aria-hidden="true">
            ✳
          </span>
          <span>{isLight ? 'Соединяем смыслы и эстетику' : 'Новые формы. Новые связи.'}</span>
        </div>

        <AsciiStarsCanvas
          className={styles.canvas}
          theme={variant}
          mode="ascii"
          density={isLight ? 0.44 : 0.51}
          speed={isLight ? 0.2 : 0.15}
          paused={paused}
          scale={isLight ? 1.35 : 1.42}
        />

        <div className={styles.content}>
          <h1 id="hero-title" className={styles.title}>
            {isLight ? (
              <>
                <span>Придаём</span>
                <span>смыслу</span>
                <span>форму.</span>
              </>
            ) : (
              <>
                <span>Идеи вне</span>
                <span>притяжения.</span>
              </>
            )}
          </h1>
          <p className={styles.description}>
            {isLight
              ? 'Айдентика, сайты и цифровой опыт. Находим характер вашего бренда и делаем его видимым.'
              : 'Создаём бренды и цифровые миры, к которым хочется прикоснуться.'}
          </p>
          <Link href="/#contact" className={styles.cta}>
            <span>Обсудить проект</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </div>

        <div className={styles.orbitCaption} aria-hidden="true">
          <span>VNE ORBIT</span>
          <span>{isLight ? '01 — Форма' : '02 — Притяжение'}</span>
        </div>

        <div className={styles.interactionBar}>
          <p className={styles.dragHint}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12h16M12 4v16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3M12 4l-3 3M12 4l3 3M12 20l-3-3M12 20l3-3" />
            </svg>
            <span>Потяните, чтобы повернуть</span>
          </p>
          <button
            type="button"
            className={styles.motionButton}
            aria-label="Пауза анимации"
            aria-pressed={paused}
            onClick={() => setMotionOverride(!paused)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {paused ? (
                <path d="m7 4 9 6-9 6Z" fill="currentColor" />
              ) : (
                <path d="M6 4h3v12H6zm5 0h3v12h-3z" fill="currentColor" />
              )}
            </svg>
            <span>{paused ? 'Продолжить' : 'Пауза'}</span>
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerCaption}>
          <span className={styles.statusDot} aria-hidden="true" />
          Дизайн начинается с любопытства.
        </p>
        <Link href="/lab" className={styles.experimentLink}>
          К элементу{' '}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
      </footer>
    </main>
  )
}
