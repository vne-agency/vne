'use client'

import { DialogCloseButton } from '@/components/ui/DialogCloseButton'

import { useLenis } from 'lenis/react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'

import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'
import { useModalTextTransition } from '@/components/ui/useModalTextTransition'
import { animateScrollToTop } from '@/components/ui/animateScrollToTop'

import { CaseDetail } from './CaseDetail'
import styles from './CaseModal.module.css'

export type CaseHomeSection = 'cases' | 'process' | 'services' | 'contact'

export function CaseModal({
  initialItem,
  items,
  onClose,
}: {
  initialItem: CaseItem
  items: readonly CaseItem[]
  onClose: (section?: CaseHomeSection) => void
}) {
  const [item, setItem] = useState(initialItem)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousSlug = useRef(initialItem.slug)
  const cancelReturn = useRef<() => void>(() => {})
  const lenis = useLenis()
  const { transitionTo, cancelTransition } = useModalTextTransition(dialogRef, item.slug)

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
      cancelReturn.current()
      dialog.close()
      root.style.overflow = previousOverflow
      root.style.scrollbarGutter = previousGutter
      if (!wasStopped) lenis?.start()
      trigger?.focus({ preventScroll: true })
    }
  }, [lenis])

  useEffect(() => {
    if (previousSlug.current === item.slug) return
    previousSlug.current = item.slug
    dialogRef.current
      ?.querySelector<HTMLElement>('#case-modal-title')
      ?.focus({ preventScroll: true })
  }, [item.slug])

  const handleNavigation = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const link = event.target instanceof Element ? event.target.closest('a') : null
    if (!link || link.target === '_blank') return

    const href = link.getAttribute('href')
    const next = items.find((entry) => getCaseHref(entry.slug) === href)
    if (next) {
      // Capture before Next Link handles the click, keeping case switches inside the dialog.
      event.preventDefault()
      cancelTransition()
      cancelReturn.current()
      if (next.slug === item.slug) return
      // Keep the old content's height during the return, then assemble the next case at the top.
      // Calling transitionTo also replaces a previous pending selection on rapid clicks.
      const viewport = viewportRef.current
      if (viewport) {
        cancelReturn.current = animateScrollToTop(viewport, () => {
          transitionTo(() => setItem(next))
        })
      }
      return
    }

    if (href === '#contact') {
      event.preventDefault()
      onClose('contact')
      return
    }

    const section = (['cases', 'process', 'services'] as const).find((name) => href === `/#${name}`)
    if (section) {
      event.preventDefault()
      onClose(section)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="case-modal-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button, input, select, textarea, summary, iframe, [tabindex]',
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
      data-lenis-prevent
    >
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <span className={styles.caption}>
            Кейс {String(items.findIndex((entry) => entry.slug === item.slug) + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {item.projectName}
          </span>
          <DialogCloseButton ref={closeRef} onClick={() => onClose()} />
        </header>
        <div
          ref={viewportRef}
          className={styles.viewport}
          onClickCapture={handleNavigation}
          data-lenis-prevent
        >
          <CaseDetail item={item} items={items} idPrefix="case-modal" />
        </div>
      </div>
    </dialog>
  )
}
