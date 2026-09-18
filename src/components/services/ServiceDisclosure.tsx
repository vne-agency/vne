'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useId, useState, type ReactNode } from 'react'

import styles from './KazanServicePage.module.css'

/** Keep answers in server HTML; animate only the small disclosure panel. */
export function ServiceDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion() !== false

  return (
    <div className={styles.disclosure} data-expanded={expanded}>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        className={styles.disclosureTrigger}
        onClick={() => setExpanded((value) => !value)}
      >
        <span>{title}</span>
        <span className={styles.disclosureIcon} aria-hidden="true">
          +
        </span>
      </button>
      <motion.div
        id={`${id}-panel`}
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={styles.disclosurePanel}
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{
          height: { duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: reduceMotion ? 0 : 0.2 },
        }}
      >
        <div className={styles.disclosureBody}>{children}</div>
      </motion.div>
    </div>
  )
}
