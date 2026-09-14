'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

import styles from './OrbitPortfolioFlow.module.css'

export function OrbitPortfolioFlow({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const heading = root?.querySelector<HTMLElement>('[data-flow-heading]')
    if (!root || !heading) return

    // Only the header's natural height is measured. The browser owns the
    // scrolling timeline and updates it when FAQ answers change the flow height.
    const measure = () => {
      root.style.setProperty('--flow-header-height', `${heading.getBoundingClientRect().height}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(heading)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.flow} ref={rootRef} data-portfolio-flow>
      {children}
      <div className={styles.spineWindow} aria-hidden="true">
        <span className={styles.spine} data-flow-spine />
      </div>
    </div>
  )
}
