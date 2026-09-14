'use client'

import { motion } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

import { FaqAnswerAnimation, type FaqAnimation } from './FaqAnswerAnimation'
import styles from './FaqSection.module.css'

const cyrillic = 'абвгдежзиклмнопрстуфхцчшэюя'
const latin = 'abcdefghijklmnopqrstuvwxyz'
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const revealDuration = 0.4

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

function getServerReducedMotion() {
  return true
}

function ScrambledAnswer({
  text,
  active,
  reduceMotion,
}: {
  text: string
  active: boolean
  reduceMotion: boolean
}) {
  const visualRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const visual = visualRef.current
    if (!visual || !active || reduceMotion) return

    const letters = Array.from(visual.querySelectorAll<HTMLElement>('[data-letter]')).map(
      (letter) => {
        const original = letter.dataset.letter!
        const alphabet = /[a-z]/i.test(original) ? latin : cyrillic
        return {
          original,
          alphabet: original === original.toUpperCase() ? alphabet.toUpperCase() : alphabet,
          glyph: letter.querySelector<HTMLElement>('[data-scramble-glyph]')!,
        }
      },
    )
    if (!letters.length) return

    let frame = 0
    let started = false
    let finished = false
    let startTime = 0
    let lastUpdate = -Infinity
    let settled = 0
    const settleDelay = revealDuration * 1000
    const duration = Math.min(1800, Math.max(1200, letters.length * 7))

    const paintLetters = (nextSettled: number) => {
      for (let index = settled; index < letters.length; index++) {
        const { glyph, original, alphabet } = letters[index]
        if (index < nextSettled) {
          glyph.textContent = original
        } else {
          const randomIndex = Math.floor(Math.random() * alphabet.length)
          glyph.textContent =
            alphabet[randomIndex] === original
              ? alphabet[(randomIndex + 1) % alphabet.length]
              : alphabet[randomIndex]
        }
      }
      settled = nextSettled
    }

    const finish = () => {
      finished = true
      cancelAnimationFrame(frame)
      delete visual.dataset.scrambling
      for (const { glyph } of letters) glyph.textContent = ''
    }

    const tick = (now: number) => {
      if (finished) return
      const progress = Math.min(Math.max((now - startTime - settleDelay) / duration, 0), 1)
      if (progress === 1) {
        finish()
        return
      }

      // Paint only the unsettled suffix, at a restrained cadence; no layout reads per frame.
      if (now - lastUpdate >= 45) {
        paintLetters(Math.floor(progress * letters.length))
        lastUpdate = now
      }
      frame = requestAnimationFrame(tick)
    }

    // Fill the entire text before the expanding panel can paint its first visible frame.
    paintLetters(0)
    visual.dataset.scrambling = 'true'

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started && !finished) {
        started = true
        startTime = performance.now()
        tick(startTime)
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
  }, [active, reduceMotion, text])

  return (
    <p>
      <span className="srOnly">{text}</span>
      <span ref={visualRef} className={styles.scrambleText} aria-hidden="true">
        {text.split(/(\s+)/).map((word, wordIndex) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className={styles.word} key={wordIndex}>
              {Array.from(word).map((letter, letterIndex) =>
                /\p{L}/u.test(letter) ? (
                  <span className={styles.letter} data-letter={letter} key={letterIndex}>
                    <span className={styles.letterBase}>{letter}</span>
                    <span className={styles.glyph} data-scramble-glyph />
                  </span>
                ) : (
                  letter
                ),
              )}
            </span>
          ),
        )}
      </span>
    </p>
  )
}

export function FaqItem({
  question,
  answer,
  animation = 'scramble',
}: {
  question: string
  answer: string
  animation?: FaqAnimation
}) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )
  const id = useId()
  const questionId = `${id}-question`
  const answerId = `${id}-answer`

  return (
    <div className={styles.item}>
      <h3 className={styles.questionHeading}>
        <button
          className={styles.question}
          type="button"
          id={questionId}
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded((current) => !current)}
        >
          <span>{question}</span>
          <span className={styles.arrow} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16m-6-6 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h3>
      <motion.div
        className={styles.answerPanel}
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        aria-hidden={!expanded}
        inert={!expanded}
        initial={false}
        animate={{ height: expanded ? 'auto' : 0 }}
        transition={{ duration: reduceMotion ? 0 : revealDuration, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.answer}>
          {animation === 'scramble' ? (
            <ScrambledAnswer text={answer} active={expanded} reduceMotion={reduceMotion} />
          ) : (
            <FaqAnswerAnimation
              text={answer}
              active={expanded}
              reduceMotion={reduceMotion}
              variant={animation}
              revealDelay={revealDuration * 1000}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
