'use client'

import { useLayoutEffect, useRef } from 'react'

import styles from './FaqAnswerAnimation.module.css'

export type FaqAnimation = 'scramble' | 'blur' | 'cut' | 'sweep' | 'fold' | 'type'

const effects: Record<Exclude<FaqAnimation, 'scramble'>, Keyframe[]> = {
  blur: [
    { opacity: 0.25, filter: 'blur(6px)', transform: 'translateY(5px)' },
    { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
  ],
  cut: [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
  sweep: [{ opacity: 0.2 }, { opacity: 1 }],
  fold: [
    { opacity: 0, transform: 'perspective(400px) rotateX(-85deg) translateY(8px)' },
    { opacity: 1, transform: 'perspective(400px) rotateX(0deg) translateY(0)' },
  ],
  type: [{ opacity: 0.15 }, { opacity: 1 }],
}

export function FaqAnswerAnimation({
  text,
  active,
  reduceMotion,
  variant,
  revealDelay,
}: {
  text: string
  active: boolean
  reduceMotion: boolean
  variant: Exclude<FaqAnimation, 'scramble'>
  revealDelay: number
}) {
  const visualRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const visual = visualRef.current
    if (!visual || !active || reduceMotion || document.hidden) return

    const pieces = Array.from(visual.querySelectorAll<HTMLElement>('[data-piece]'))
    // Reserve the complete paragraph's layout; animate only its visual copy.
    // The paused first frame is applied before the accordion becomes visible.
    const animations = pieces.map((piece, index) => {
      const animation = piece.animate(effects[variant], {
        duration: variant === 'type' ? 1 : variant === 'sweep' ? 320 : 650,
        delay: revealDelay + (index / Math.max(1, pieces.length - 1)) * 1400,
        easing: variant === 'type' ? 'linear' : 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      })
      animation.pause()
      animation.currentTime = 0
      return animation
    })

    let started = false
    let finished = false
    const finish = () => {
      finished = true
      animations.forEach((animation) => animation.cancel())
    }
    // Cancel completed effects too, releasing their layers and restoring plain text.
    void Promise.all(animations.map((animation) => animation.finished)).then(finish, () => {})

    const observer = new IntersectionObserver((entries) => {
      // A fast panel expansion can queue hidden and visible entries together.
      // Use its latest state so the initial hidden entry cannot stall the reveal.
      const entry = entries[entries.length - 1]
      if (!entry) return
      if (entry.isIntersecting && !started && !finished) {
        started = true
        animations.forEach((animation) => animation.play())
      } else if (!entry.isIntersecting && started) {
        finish()
      }
    })
    observer.observe(visual)
    const onVisibilityChange = () => {
      if (document.hidden) finish()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      finish()
    }
  }, [active, reduceMotion, revealDelay, text, variant])

  return (
    <p>
      <span className="srOnly">{text}</span>
      <span ref={visualRef} className={styles.visual} data-variant={variant} aria-hidden="true">
        {text.split(/(\s+)/).map((word, index) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className={styles.word} key={index}>
              {variant === 'type' ? (
                Array.from(word).map((letter, letterIndex) => (
                  <span className={styles.piece} data-piece key={letterIndex}>
                    {letter}
                  </span>
                ))
              ) : (
                <span className={styles.piece} data-piece>
                  {word}
                </span>
              )}
            </span>
          ),
        )}
      </span>
    </p>
  )
}
