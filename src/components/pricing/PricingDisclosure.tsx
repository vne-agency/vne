'use client'

import { motion } from 'motion/react'
import { useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { FaqAnswerAnimation } from '@/components/sections/FaqAnswerAnimation'
import styles from './PricingDisclosure.module.css'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches
const getServerReducedMotion = () => true

export function PricingDisclosure({
  title,
  paragraphs,
  variant = 'offer',
  children,
}: {
  title: string
  paragraphs: string[]
  variant?: 'offer' | 'term'
  children?: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  // Like the main FAQ, retain the word animation until closing has finished.
  const [textActive, setTextActive] = useState(false)
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )
  const id = useId()
  const questionId = `${id}-question`
  const answerId = `${id}-answer`
  const Heading = variant === 'term' ? 'h3' : 'div'

  return (
    <div
      className={styles.item}
      data-pricing-disclosure={variant}
      data-expanded={expanded}
      data-closing-row
      data-closing-rule={variant === 'term' ? 'top' : undefined}
      data-pricing-rule={variant === 'term' ? true : undefined}
    >
      <Heading className={styles.heading} data-closing-copy="up">
        <button
          className={styles.question}
          type="button"
          id={questionId}
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => {
            if (!expanded) setTextActive(true)
            setExpanded((current) => !current)
          }}
        >
          <span>{title}</span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </Heading>
      <motion.div
        className={styles.panel}
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        aria-hidden={!expanded}
        inert={!expanded}
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{
          height: { duration: reduceMotion ? 0 : 0.56, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: reduceMotion ? 0 : expanded ? 0.2 : 0.14 },
        }}
        onAnimationComplete={() => {
          if (!expanded) setTextActive(false)
        }}
      >
        <div className={styles.answer}>
          {paragraphs.map((text, index) => (
            <FaqAnswerAnimation
              key={index}
              text={text}
              active={textActive}
              reduceMotion={reduceMotion}
              variant="cut"
              revealDelay={400}
            />
          ))}
          {children}
        </div>
      </motion.div>
    </div>
  )
}
