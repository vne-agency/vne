'use client'

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import { useRef, type ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

type StaggerProps = {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  amount?: number
  as?: 'div' | 'ul' | 'address'
}

export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.09,
  amount = 0.18,
  as = 'div',
}: StaggerProps) {
  const reduceMotion = useReducedMotion()
  const Component = as === 'ul' ? motion.ul : as === 'address' ? motion.address : motion.div

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { delayChildren: 0, staggerChildren: 0 }
        : { delayChildren: delay, staggerChildren: stagger },
    },
  }

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
    >
      {children}
    </Component>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'span' | 'li' | 'article' | 'p'
  x?: number
  y?: number
  scale?: number
}

export function StaggerItem({
  children,
  className,
  as = 'div',
  x = 0,
  y = 24,
  scale = 1,
}: StaggerItemProps) {
  const Component =
    as === 'span'
      ? motion.span
      : as === 'li'
        ? motion.li
        : as === 'article'
          ? motion.article
          : as === 'p'
            ? motion.p
            : motion.div
  const variants: Variants = {
    hidden: { opacity: 0, x, y, scale },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.76, ease },
    },
  }

  return (
    <Component className={className} variants={variants}>
      {children}
    </Component>
  )
}

type ParallaxMediaProps = {
  children: ReactNode
  className?: string
  distance?: number
}

export function ParallaxMedia({ children, className, distance = 28 }: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <motion.div ref={ref} className={className} style={{ y: reduceMotion ? 0 : y }}>
      {children}
    </motion.div>
  )
}
