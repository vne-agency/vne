'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  hideCursor?: boolean
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  amount?: number
  scale?: number
}

const offsets = {
  up: (distance: number) => ({ x: 0, y: distance }),
  down: (distance: number) => ({ x: 0, y: -distance }),
  left: (distance: number) => ({ x: distance, y: 0 }),
  right: (distance: number) => ({ x: -distance, y: 0 }),
}

export function Reveal({
  children,
  className,
  hideCursor = false,
  delay = 0,
  direction = 'up',
  distance = 28,
  amount = 0.15,
  scale = 1,
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const offset = offsets[direction](distance)

  return (
    <motion.div
      className={className}
      data-cursor-hide={hideCursor || undefined}
      initial={reduceMotion ? false : { opacity: 0, ...offset, scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.78, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
