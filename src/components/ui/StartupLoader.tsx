'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSiteLanguage } from './SiteLanguage'
import { startupLoaderEnglish } from './startup-loader-copy'

import styles from './StartupLoader.module.css'
import { animateLoaderScene, INTRO_DURATION, loaderGroups } from './startup-loader-scene'
import { assembleStartupConstellation } from './startup-constellation'

const FORCE_RELEASE_DELAY = 12_000

// Typographic position/scale choreography inspired by Codrops ScrollTextMotion.
// This is a time-driven adaptation using the existing browser animation stack.
export function StartupLoader() {
  const { language, t } = useSiteLanguage()
  const loaderText = (text: string) =>
    language === 'en' ? (startupLoaderEnglish[text] ?? t(text)) : text
  const pathname = usePathname()
  const orbitIntro = pathname === '/'
  const legalPage = /^\/(privacy|consent|cookies|analytics-consent|terms|pricing)\/?$/.test(
    pathname,
  )
  const [visible, setVisible] = useState(
    orbitIntro || (!pathname.startsWith('/preview') && pathname !== '/lab' && !legalPage),
  )
  const overlayRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    if (window.self !== window.top) {
      const frame = requestAnimationFrame(() => setVisible(false))
      return () => cancelAnimationFrame(frame)
    }

    const overlay = overlayRef.current
    const progress = progressRef.current
    const scene = overlay?.querySelector<HTMLElement>(`.${styles.scene}`)
    const content = document.getElementById('site-content')
    if (!overlay || !progress || !content) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const started = performance.now()
    const previousInert = content.inert
    const previousOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const cleanups: (() => void)[] = []
    const dockAnimations: Animation[] = []
    let stopScene = () => {}
    let resourceProgress = 8
    let lastProgress = -1
    let cancelled = false
    let finishing = false
    let finishTimer: ReturnType<typeof setTimeout>
    let exitTimer: ReturnType<typeof setTimeout>
    let settled = 0

    content.inert = true
    document.documentElement.style.overflow = 'hidden'
    // `hidden` on body creates a new scroll container and sends the hero's
    // view timelines to their end state. `clip` locks overflow without doing so.
    document.body.style.overflow = orbitIntro ? 'clip' : 'hidden'
    document.documentElement.dataset.startupLoading = 'true'

    // Resource loading, Web Animations and the constellation callback must all
    // be allowed to fail without leaving the document inert or non-scrollable.
    const forceReleaseTimer = setTimeout(() => setVisible(false), FORCE_RELEASE_DELAY)

    const preventScroll = (event: Event) => event.preventDefault()
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    const pauseWhenHidden = () => {
      overlay.dataset.paused = String(document.hidden)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    pauseWhenHidden()

    const updateProgress = (value: number) => {
      if (value === lastProgress) return
      lastProgress = value
      progress.style.transform = `scaleX(${value / 100})`
      progress.parentElement?.setAttribute('aria-valuenow', String(value))
    }

    const revealPage = () => {
      if (cancelled) return
      stopScene()
      // The text fade has already completed with the progress fill. Remove its
      // composited layer before revealing the page, including blurred glyphs.
      const logo = document.querySelector<HTMLElement>('[data-loader-logo]')
      const wordmark = overlay.querySelector<HTMLElement>(`.${styles.wordmark}`)
      const backdrop = overlay.querySelector<HTMLElement>(`.${styles.backdrop}`)
      if (
        !motion.matches &&
        wordmark &&
        backdrop &&
        document.querySelector('[data-startup-artwork]')
      ) {
        try {
          const stopAssembly = assembleStartupConstellation({
            overlay,
            wordmark,
            backdrop,
            scene: scene ?? undefined,
            complete: () => {
              if (!cancelled) setVisible(false)
            },
          })
          if (stopAssembly) {
            cleanups.push(stopAssembly)
            return
          }
        } catch {
          // A lost WebGL context must still release the page and its fallback artwork.
        }
      }
      if (scene) scene.style.visibility = 'hidden'
      const target = logo?.getBoundingClientRect()
      const source = wordmark?.getBoundingClientRect()
      if (
        !motion.matches &&
        logo &&
        wordmark &&
        target &&
        source &&
        target.top >= 0 &&
        target.bottom <= innerHeight &&
        target.width > 0
      ) {
        const oldOpacity = logo.style.opacity
        const duplicate = logo.cloneNode(true) as HTMLElement
        duplicate.removeAttribute('data-loader-logo')
        duplicate.removeAttribute('id')
        duplicate.setAttribute('aria-hidden', 'true')
        duplicate.className = styles.dockedLogo
        Object.assign(duplicate.style, {
          left: `${target.left}px`,
          top: `${target.top}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
          opacity: '0',
        })
        overlay.appendChild(duplicate)
        logo.style.opacity = '0'
        cleanups.push(() => {
          logo.style.opacity = oldOpacity
          duplicate.remove()
        })
        overlay.dataset.phase = 'docking'
        // Dock the visible text ink to the VNE wordmark bounds, rather than
        // the text's CSS line box.
        const font = getComputedStyle(wordmark)
        const context = document.createElement('canvas').getContext('2d')
        let inkLeft = 0
        let inkTop = 0
        let inkWidth = source.width
        let inkHeight = source.height
        if (context) {
          context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`
          context.letterSpacing = font.letterSpacing
          const metrics = context.measureText(wordmark.textContent || '')
          inkLeft = -metrics.actualBoundingBoxLeft
          inkTop =
            (source.height - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 +
            metrics.fontBoundingBoxAscent -
            metrics.actualBoundingBoxAscent
          inkWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
          inkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        }
        // vne-wordmark.svg's ink fills its 122 × 44 viewBox, with no symbol offset.
        const destinationLeft = target.left
        const scaleX = target.width / inkWidth
        const scaleY = target.height / inkHeight
        const transform = `translate(${destinationLeft - source.left - inkLeft * scaleX}px, ${target.top - source.top - inkTop * scaleY}px) scale(${scaleX}, ${scaleY})`
        dockAnimations.push(
          wordmark.animate(
            [
              { transform: 'none', opacity: 1, offset: 0 },
              { transform, opacity: 1, offset: 0.85 },
              { transform, opacity: 0, offset: 1 },
            ],
            { duration: 1100, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' },
          ),
        )
        dockAnimations.push(
          duplicate.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: 800,
            duration: 300,
            fill: 'forwards',
          }),
        )
        const onResize = () => setVisible(false)
        window.addEventListener('resize', onResize, { once: true })
        cleanups.push(() => window.removeEventListener('resize', onResize))
        exitTimer = setTimeout(() => {
          if (!cancelled) setVisible(false)
        }, 1150)
      } else {
        overlay.dataset.phase = 'leaving'
        exitTimer = setTimeout(
          () => {
            if (!cancelled) setVisible(false)
          },
          motion.matches ? 0 : 400,
        )
      }
    }

    const finish = () => {
      if (cancelled || finishing) return
      finishing = true
      clearTimeout(finishTimer)
      overlay.dataset.phase = 'completing'
      const currentTransform = getComputedStyle(progress).transform
      updateProgress(100)
      if (motion.matches) {
        revealPage()
        return
      }
      if (document.querySelector('[data-startup-artwork]')) {
        // Keep the moving copy visible: its final positions seed the particles.
        revealPage()
        return
      }
      // Rows keep moving during the final fill. Its actual animation completion
      // starts docking, so there is no independent timer or frozen interlude.
      const fill = progress.animate([{ transform: currentTransform }, { transform: 'scaleX(1)' }], {
        duration: 350,
        easing: 'linear',
        fill: 'forwards',
      })
      dockAnimations.push(fill)
      if (scene) {
        dockAnimations.push(
          scene.animate(
            [
              { opacity: 1, offset: 0 },
              { opacity: 1, offset: 0.48 },
              { opacity: 0, offset: 1 },
            ],
            { duration: 350, easing: 'linear', fill: 'forwards' },
          ),
        )
      }
      fill.onfinish = revealPage
    }

    if (!motion.matches) {
      stopScene = animateLoaderScene(overlay, (fraction) => {
        if (finishing) return
        updateProgress(Math.round(Math.min(resourceProgress, 8 + fraction * 87)))
      })
    }

    const imageReady = (image: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        const done = () => {
          image.removeEventListener('load', done)
          image.removeEventListener('error', done)
          resolve()
        }
        if (image.complete) {
          resolve()
          return
        }
        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
        cleanups.push(done)
      })

    // Wait for the streamed document before discovering first-screen images.
    const documentReady = new Promise<void>((resolve) => {
      if (document.readyState !== 'loading') return resolve()
      const done = () => resolve()
      document.addEventListener('DOMContentLoaded', done, { once: true })
      cleanups.push(() => document.removeEventListener('DOMContentLoaded', done))
    })
    // Track critical resources, not lazy content far below the fold.
    const wordmarkReady = document.fonts
      .load('800 120px "Onest Variable"', 'ВНЕ')
      .catch(() => undefined)
      .then(() => {
        // Never paint the fallback font at 0% and swap its width on hydration.
        if (!cancelled) overlay.dataset.fontReady = 'true'
      })
    const resources = [
      wordmarkReady,
      document.fonts.ready,
      documentReady.then(() => {
        if (cancelled || finishing) return
        const images = Array.from(document.images).filter((image) => {
          const bounds = image.getBoundingClientRect()
          return image.loading !== 'lazy' || (bounds.top < window.innerHeight && bounds.bottom > 0)
        })
        return Promise.all(images.map(imageReady))
      }),
    ]
    updateProgress(8)
    resources.forEach((resource) => {
      Promise.resolve(resource)
        .catch(() => undefined)
        .then(() => {
          if (cancelled || finishing) return
          settled += 1
          resourceProgress = Math.round(8 + (settled / resources.length) * 87)
          if (motion.matches) updateProgress(resourceProgress)
          if (settled === resources.length) {
            finishTimer = setTimeout(
              finish,
              Math.max(0, (motion.matches ? 0 : INTRO_DURATION) - (performance.now() - started)),
            )
          }
        })
    })

    // Failed assets must never trap visitors behind an intro.
    const deadline = setTimeout(finish, 8000)
    const onMotionChange = () => {
      if (motion.matches) stopScene()
      if (motion.matches && settled === resources.length) finish()
    }
    motion.addEventListener('change', onMotionChange)

    return () => {
      cancelled = true
      clearTimeout(deadline)
      clearTimeout(forceReleaseTimer)
      clearTimeout(finishTimer)
      clearTimeout(exitTimer)
      dockAnimations.forEach((animation) => animation.cancel())
      stopScene()
      cleanups.forEach((cleanup) => cleanup())
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      motion.removeEventListener('change', onMotionChange)
      content.inert = previousInert
      document.documentElement.style.overflow = previousOverflow
      document.body.style.overflow = previousBodyOverflow
      delete document.documentElement.dataset.startupLoading
      window.dispatchEvent(new Event('vne-startup-complete'))
    }
  }, [visible, orbitIntro])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      className={styles.loader}
      data-startup-loader
      data-orbit-intro={orbitIntro || undefined}
      data-lenis-prevent
      data-native-cursor
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.scene} aria-hidden="true">
        {loaderGroups.map((group, index) => (
          <div key={index} data-loader-group className={group.large ? styles.glyph : styles.group}>
            {group.lines.map((line, row) => (
              <span key={row} data-loader-row data-loader-text={loaderText(line)}>
                {loaderText(line)}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.center}>
        <div className={styles.wordmark} aria-hidden="true">
          ВНЕ
        </div>
        <div
          className={styles.track}
          role="progressbar"
          aria-label={t('Загрузка сайта ВНЕ')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div ref={progressRef} className={styles.progress} />
        </div>
        <span className="srOnly" role="status">
          {t('Загружаем сайт ВНЕ')}
        </span>
      </div>
      <noscript>
        <style>
          {
            '[data-startup-loader] { display: none !important; } html:has([data-startup-loader]), body:has([data-startup-loader]) { overflow: visible !important; }'
          }
        </style>
      </noscript>
    </div>
  )
}
