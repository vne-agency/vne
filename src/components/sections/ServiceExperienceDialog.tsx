'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { DialogCloseButton } from '@/components/ui/DialogCloseButton'

import { useLenis } from 'lenis/react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

import type { ServiceExperience } from './service-experience-data'
import { useModalTextTransition } from '@/components/ui/useModalTextTransition'
import styles from './ServiceExperienceDialog.module.css'

const ServiceSphereScene = dynamic(() => import('./ServiceSphereScene'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Открываем пространство…</div>,
})

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

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

export function ServiceExperienceDialog({
  service,
  onClose,
}: {
  service: ServiceExperience
  onClose: (contact?: boolean) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lenis = useLenis()
  const id = useId()
  const [motionDisabled, setMotionDisabled] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [viewRequest, setViewRequest] = useState({ panel: 0 })
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )
  const staticMode = reduceMotion || motionDisabled || unavailable
  const { transitionTo } = useModalTextTransition(dialogRef, `${service.id}-${staticMode}`)
  const handleUnavailable = useCallback(() => setUnavailable(true), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousGutter = root.style.scrollbarGutter
    const wasStopped = lenis?.isStopped

    lenis?.stop()
    root.style.overflow = 'hidden'
    root.style.scrollbarGutter = 'stable'
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })

    return () => {
      dialog.close()
      root.style.overflow = previousOverflow
      root.style.scrollbarGutter = previousGutter
      if (!wasStopped) lenis?.start()
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [lenis])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-motion={staticMode ? 'static' : 'interactive'}
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button, input, select, textarea, summary, [tabindex]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            element.getClientRects().length > 0,
        )
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <span className={styles.brand}>
            ВНЕ <span className={styles.sectionLabel}>/ НАШИ УСЛУГИ</span>
          </span>
          <DialogCloseButton ref={closeRef} onClick={() => onClose()} />
        </header>

        <div className={styles.viewport} data-lenis-prevent>
          <div className={styles.stage}>
            <div className={styles.sceneCaption} aria-hidden="true">
              <span>{service.label}</span>
              <span>{staticMode ? 'VNE DESIGN' : '360°'}</span>
            </div>
            {staticMode ? (
              <div className={styles.staticScene} aria-hidden="true">
                <span className={styles.staticIndex}>✳</span>
                <span className={styles.staticTitle}>{service.title}</span>
                <span className={styles.staticWords}>
                  {service.wallWords.slice(1, 4).join(' / ')}
                </span>
              </div>
            ) : (
              <div className={styles.scene}>
                <ServiceSphereScene
                  service={service}
                  onUnavailable={handleUnavailable}
                  viewRequest={viewRequest}
                />
              </div>
            )}
          </div>

          <div className={styles.sceneControls}>
            <p id={`${id}-guidance`} className={styles.guidance} aria-live="polite">
              {unavailable
                ? 'Все детали услуги — ниже'
                : staticMode
                  ? 'Пространство без движения'
                  : 'Двигайте курсор или потяните, чтобы осмотреться'}
            </p>
            <button
              type="button"
              className={styles.motionToggle}
              aria-pressed={staticMode}
              aria-describedby={`${id}-guidance`}
              disabled={reduceMotion || unavailable}
              onClick={() => transitionTo(() => setMotionDisabled((disabled) => !disabled))}
            >
              <span className={styles.toggleIndicator} aria-hidden="true" />
              Без движения
            </button>
          </div>

          {!staticMode && (
            <nav className={styles.panelNavigation} aria-label="Панели сферы">
              <button type="button" onClick={() => setViewRequest({ panel: 0 })}>
                Обзор
              </button>
              {service.steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setViewRequest({ panel: index + 1 })}
                >
                  <span>0{index + 1}</span> {step.title}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setViewRequest({ panel: service.steps.length + 1 })}
              >
                Результат <ArrowIcon />
              </button>
            </nav>
          )}

          <section className={styles.details} aria-labelledby={`${id}-title`}>
            <div className={styles.headingGroup}>
              <span className={styles.eyebrow}>ДЕЛАЕМ ДЛЯ ВАС</span>
              <h2 id={`${id}-title`} className={styles.title}>
                {service.title}
              </h2>
            </div>
            <div className={styles.information}>
              <p id={`${id}-description`} className={styles.description}>
                {service.description}
              </p>
              {service.platforms && <p>Платформы: {service.platforms}</p>}
              <ul className={styles.items}>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button type="button" className={styles.contact} onClick={() => onClose(true)}>
                Обсудить проект{' '}
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </button>
            </div>
          </section>
          <section className={styles.process} aria-labelledby={`${id}-process`}>
            <h3 id={`${id}-process`} className={styles.processTitle}>
              Как строится работа
            </h3>
            <ol className={styles.steps}>
              {service.steps.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>0{index + 1}</span>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  <div className={styles.deliverable}>
                    <span>{step.items ? 'Что входит' : 'На выходе'}</span>
                    {step.items ? (
                      <ul>
                        {step.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{step.deliverable}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.outcome}>
              <span className={styles.eyebrow}>{service.outcomeTitle ?? 'РЕЗУЛЬТАТ ПРОЕКТА'}</span>
              <p>{service.outcome}</p>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  )
}
