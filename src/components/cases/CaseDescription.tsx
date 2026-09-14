'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import styles from './CaseDetail.module.css'

export function CaseDescription({
  children,
  projectName,
}: {
  children: ReactNode
  projectName: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const region = scrollRef.current
    const content = contentRef.current
    if (!region || !content) return
    const update = () => {
      const range = region.scrollHeight - region.clientHeight
      setOverflow(range > 2)
      setProgress(range > 0 ? region.scrollTop / range : 0)
    }
    const observer = new ResizeObserver(update)
    observer.observe(region)
    observer.observe(content)
    region.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      region.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div className={styles.description}>
      <div className={styles.scrollRail}>
        {overflow && (
          <button
            type="button"
            className={styles.scrollButton}
            style={{ top: `calc(${progress * 100}% - ${progress * 2.75}rem)` }}
            aria-label={
              progress > 0.98 ? 'Вернуться к началу описания' : 'Прокрутить описание ниже'
            }
            onClick={() => {
              const region = scrollRef.current
              if (!region) return
              region.scrollBy({
                top: progress > 0.98 ? -region.scrollHeight : region.clientHeight * 0.8,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              })
            }}
          >
            <span aria-hidden="true">{progress > 0.98 ? '↑' : '↓'}</span>
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className={styles.descriptionScroll}
        tabIndex={overflow ? 0 : undefined}
        role="region"
        aria-label={`Описание кейса ${projectName}.${overflow ? ' Прокручивается отдельно.' : ''}`}
        data-lenis-prevent={overflow ? true : undefined}
      >
        <div ref={contentRef} className={styles.descriptionContent}>
          {children}
        </div>
      </div>
    </div>
  )
}
