'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { motion } from 'motion/react'
import { useId, useState, useSyncExternalStore } from 'react'

import { FaqAnswerAnimation } from '@/components/sections/FaqAnswerAnimation'
import { faqQuestions } from '@/components/sections/faq-data'

import styles from './OrbitFaq.module.css'

const expansionDuration = 0.56
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches
const getServerReducedMotion = () => true

function OrbitFaqItem({
  question,
  answer,
  index,
  expanded,
  reduceMotion,
  onToggle,
}: {
  question: string
  answer: string
  index: number
  expanded: boolean
  reduceMotion: boolean
  onToggle: () => void
}) {
  const { t } = useSiteLanguage()

  const id = useId()
  const questionId = `${id}-question`
  const answerId = `${id}-answer`
  // Keep the word reveal alive while closing. Its cleanup restores plain text,
  // so defer that cleanup until the collapsing panel is completely hidden.
  const [textActive, setTextActive] = useState(expanded)

  return (
    <div className={styles.item} data-expanded={expanded} data-faq-item>
      <h3 className={styles.questionHeading}>
        <button
          className={styles.question}
          type="button"
          id={questionId}
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => {
            if (!expanded) setTextActive(true)
            onToggle()
          }}
        >
          <span className={styles.number} aria-hidden="true">
            {t(String(index + 1).padStart(2, '0'))}
          </span>
          <span>{t(question)}</span>
          <span className={styles.icon} aria-hidden="true" />
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
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{
          height: {
            duration: reduceMotion ? 0 : expansionDuration,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: { duration: reduceMotion ? 0 : expanded ? 0.2 : 0.14 },
        }}
        onAnimationComplete={() => {
          if (!expanded) setTextActive(false)
        }}
      >
        <div className={styles.answer}>
          <FaqAnswerAnimation
            text={t(answer)}
            active={textActive}
            reduceMotion={reduceMotion}
            variant="cut"
            revealDelay={400}
          />
        </div>
      </motion.div>
    </div>
  )
}

export function OrbitFaq() {
  const { t } = useSiteLanguage()

  const [interacted, setInteracted] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )

  return (
    <section
      className={styles.section}
      id="faq"
      aria-labelledby="orbit-faq-title"
      data-interacted={interacted}
    >
      <span className={`${styles.boundary} ${styles.boundaryTop}`} aria-hidden="true" />
      <div className={styles.heading}>
        <div className={styles.headingContent}>
          <p className={styles.eyebrow}>{t('04 / Вопросы')}</p>
          <h2 id="orbit-faq-title">
            {t('Частые')}
            <br />
            {t('вопросы.')}
          </h2>
          <a className={styles.contact} href="#contact">
            {t('Обсудить вашу задачу')}
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </a>
        </div>
      </div>

      <div className={styles.list}>
        {faqQuestions.map(({ question, answer }, index) => (
          <OrbitFaqItem
            key={question}
            question={question}
            answer={answer}
            index={index}
            expanded={expandedIndex === index}
            reduceMotion={reduceMotion}
            onToggle={() => {
              // Once the reader opens a question, layout changes must not replay
              // the section's scroll entrance (the answer has its own reveal).
              setInteracted(true)
              setExpandedIndex((current) => (current === index ? null : index))
            }}
          />
        ))}
      </div>
      <span className={`${styles.boundary} ${styles.boundaryBottom}`} aria-hidden="true" />
    </section>
  )
}
