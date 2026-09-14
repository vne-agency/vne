'use client'

import { motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './CustomCursor.module.css'

const nativeTarget =
  'iframe, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], [data-cursor-native]'
const interactiveTarget =
  'a, button, summary, [role="button"], [role="slider"], input, [data-renderer], [data-dragging]'

export function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const [visible, setVisible] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [surface, setSurface] = useState<HTMLElement | null>(null)
  const surfaceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(any-pointer: fine)')
    const root = document.documentElement
    const hide = () => {
      delete root.dataset.customCursor
      setVisible(false)
      setPressed(false)
    }
    const onPointerMove = (event: PointerEvent) => {
      const target = event.target
      if (
        !finePointer.matches ||
        event.pointerType === 'touch' ||
        !(target instanceof Element) ||
        target.closest(nativeTarget)
      ) {
        hide()
        return
      }
      // Native dialogs occupy the top layer, above every document z-index.
      // Move the same cursor into that layer while interacting with a dialog.
      const nextSurface = target.closest<HTMLDialogElement>('dialog[open]') ?? document.body
      if (surfaceRef.current !== nextSurface) {
        surfaceRef.current = nextSurface
        setSurface(nextSurface)
      }
      // The arrow's tip stays exactly at the hit point, with no spring lag.
      x.set(event.clientX)
      y.set(event.clientY)
      root.dataset.customCursor = 'true'
      setInteractive(!!target.closest(interactiveTarget))
      setVisible(true)
    }
    const down = (event: PointerEvent) => {
      if (event.pointerType === 'touch') hide()
      else setPressed(true)
    }
    const up = () => setPressed(false)
    const mode = () => {
      if (!finePointer.matches) hide()
    }
    const visibility = () => {
      if (document.hidden) hide()
    }
    const observer = new MutationObserver(() => {
      const current = surfaceRef.current
      if (current instanceof HTMLDialogElement && (!current.open || !current.isConnected)) {
        hide()
        surfaceRef.current = document.body
        setSurface(document.body)
      }
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open'],
    })
    finePointer.addEventListener('change', mode)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', hide)
    window.addEventListener('blur', hide)
    document.addEventListener('visibilitychange', visibility)
    root.addEventListener('pointerleave', hide)
    return () => {
      delete root.dataset.customCursor
      observer.disconnect()
      finePointer.removeEventListener('change', mode)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', hide)
      window.removeEventListener('blur', hide)
      document.removeEventListener('visibilitychange', visibility)
      root.removeEventListener('pointerleave', hide)
    }
  }, [x, y])

  if (!surface) return null
  return createPortal(
    <motion.div
      aria-hidden="true"
      data-orbit-cursor
      data-visible={visible}
      data-interactive={interactive}
      data-pressed={pressed}
      className={styles.cursor}
      style={{ x, y }}
    >
      <span className={styles.halo}>
        <svg className={styles.orbit} viewBox="0 0 64 64" fill="none">
          <ellipse
            className={styles.orbitOutline}
            cx="32"
            cy="32"
            rx="27"
            ry="20"
            transform="rotate(-20 32 32)"
          />
          <ellipse cx="32" cy="32" rx="27" ry="20" transform="rotate(-20 32 32)" />
        </svg>
        {[0, 1, 2, 3].map((index) => (
          <svg
            key={index}
            className={styles.star}
            viewBox="0 0 10 10"
            fill="currentColor"
            style={{ animationDelay: `${index * -6}s` }}
          >
            <path d="M5 0C5.5 3.5 6.5 4.5 10 5 6.5 5.5 5.5 6.5 5 10 4.5 6.5 3.5 5.5 0 5 3.5 4.5 4.5 3.5 5 0Z" />
          </svg>
        ))}
      </span>
      <svg className={styles.arrow} viewBox="0 0 48 48" fill="currentColor">
        <path d="M19 17 20 30 24 26.5 27 33 30 31.5 26.5 25 32 25Z" />
      </svg>
    </motion.div>,
    surface,
  )
}
