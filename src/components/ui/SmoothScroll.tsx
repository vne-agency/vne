'use client'

import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'

export function SmoothScroll() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return null

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        anchors: true,
        gestureOrientation: 'vertical',
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
      }}
    />
  )
}
