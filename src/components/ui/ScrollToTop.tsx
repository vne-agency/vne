'use client'

import { useLenis } from 'lenis/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { changeSectionWithParticles } from './section-particles'

import styles from './ScrollToTop.module.css'
import { useSiteLanguage } from './SiteLanguage'

type ScrollToTopProps = {
  showAfter: string
}

export function ScrollToTop({ showAfter }: ScrollToTopProps) {
  const { t } = useSiteLanguage()
  const lenis = useLenis()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const cancelReturn = useRef<() => void>(() => {})

  useEffect(() => () => cancelReturn.current(), [])

  useEffect(() => {
    let frame = 0

    const updateVisibility = () => {
      const trigger = document.getElementById(showAfter)
      if (!trigger) return

      const triggerBottom = trigger.offsetTop + trigger.offsetHeight
      setVisible(window.scrollY >= triggerBottom)
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateVisibility)
    }

    updateVisibility()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [showAfter])

  const scrollToTop = () => {
    cancelReturn.current()
    window.dispatchEvent(new Event('vne-section-navigation'))
    if (lenis && !lenis.isStopped && !lenis.isLocked) {
      lenis.stop()
      lenis.start()
    }
    cancelReturn.current = changeSectionWithParticles(() => {
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(0, { immediate: true, force: true })
      } else window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          className={styles.button}
          aria-label={t('Наверх')}
          onClick={scrollToTop}
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.label}>{t('Наверх')}</span>
          <span className={styles.arrow} aria-hidden="true">
            ↑
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}
