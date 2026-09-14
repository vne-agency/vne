'use client'

import { DialogCloseButton } from '@/components/ui/DialogCloseButton'
import { changeSectionWithParticles } from '@/components/ui/section-particles'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LanguageSwitch } from '@/components/ui/SiteLanguage'

import type { CaseHomeSection } from '@/components/cases/CaseModal'
import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'

import { OrbitCaseDetail } from './OrbitCaseDetail'
import styles from './OrbitCaseDialog.module.css'
import shell from './OrbitServiceDialog.module.css'
import {
  galleryArtwork,
  useCaseArtworkTransfer,
  type CaseArtworkSnapshot,
} from './useCaseArtworkTransfer'
import {
  trapOrbitDialogFocus,
  useOrbitDialogTransition,
  type OrbitDialogOrigin,
  type OrbitDialogMotion,
} from './useOrbitDialogTransition'

export function OrbitCaseDialog({
  initialItem,
  items,
  origin,
  artwork,
  onClose,
}: {
  initialItem: CaseItem
  items: readonly CaseItem[]
  origin?: OrbitDialogOrigin
  artwork?: CaseArtworkSnapshot
  onClose: (section?: CaseHomeSection) => void
}) {
  const { t } = useSiteLanguage()

  const [item, setItem] = useState(initialItem)
  const viewportRef = useRef<HTMLDivElement>(null)
  const previousSlug = useRef(initialItem.slug)
  const caseContentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const motionRef = useRef<OrbitDialogMotion | null>(null)
  const cancelReturn = useRef<() => void>(() => {})
  const { dialogRef, panelRef, contentRef, closeRef, requestClose } =
    useOrbitDialogTransition<CaseHomeSection>({
      origin,
      onClose,
      motion: motionRef,
      translateContent: false,
      getReturnFocus: () =>
        item.slug === initialItem.slug ? undefined : galleryArtwork(item.slug)?.closest('button'),
    })
  useCaseArtworkTransfer({ dialogRef, overlayRef, motionRef, snapshot: artwork, slug: item.slug })

  useEffect(() => () => cancelReturn.current(), [])

  useLayoutEffect(() => {
    if (previousSlug.current === item.slug) return
    previousSlug.current = item.slug
    const viewport = viewportRef.current
    const content = caseContentRef.current
    if (!viewport || !content) return
    viewport.scrollTop = 0
    dialogRef.current
      ?.querySelector<HTMLElement>('#orbit-case-modal-title')
      ?.focus({ preventScroll: true })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      content.style.opacity = ''
      return
    }
    content.style.opacity = '0'
    dialogRef.current!.dataset.caseSwitch = 'arriving'
    let reveal: Animation | undefined
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        reveal = content.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 560,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        })
        void reveal.finished
          .then(() => {
            content.style.opacity = ''
            reveal?.cancel()
            if (dialogRef.current) dialogRef.current.dataset.caseSwitch = 'idle'
          })
          .catch(() => {})
      })
    })
    const cancel = () => {
      cancelAnimationFrame(frame)
      reveal?.cancel()
      content.style.opacity = ''
      if (dialogRef.current) dialogRef.current.dataset.caseSwitch = 'idle'
    }
    cancelReturn.current = cancel
    return cancel
  }, [dialogRef, item.slug])

  // Keep the old DOM until it has reached the top. Only opacity changes during
  // the handoff; scroll anchoring cannot reposition the replacement content.
  const returnToTop = (done: () => void, fade: boolean) => {
    cancelReturn.current()
    const viewport = viewportRef.current
    const content = caseContentRef.current
    if (!viewport || !content) return
    const from = viewport.scrollTop
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || (!fade && from < 1)) {
      viewport.scrollTop = 0
      done()
      return
    }
    let frame = 0
    let stopped = false
    const compact = window.matchMedia('(max-width: 800px), (max-height: 500px)').matches
    const duration = Math.min(compact ? 900 : 1500, Math.max(520, 420 + from * 0.3))
    const started = performance.now()
    const clean = () => {
      viewport.removeEventListener('wheel', cancel)
      viewport.removeEventListener('touchstart', cancel)
      viewport.removeEventListener('pointerdown', cancel)
      viewport.removeEventListener('keydown', keydown)
      window.removeEventListener('resize', cancel)
      document.removeEventListener('visibilitychange', visibility)
    }
    const cancel = () => {
      if (stopped) return
      stopped = true
      cancelAnimationFrame(frame)
      clean()
      content.style.opacity = ''
      if (dialogRef.current) dialogRef.current.dataset.caseSwitch = 'idle'
    }
    const keydown = (event: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(
          event.key,
        )
      )
        cancel()
    }
    const visibility = () => {
      if (document.hidden) cancel()
    }
    const tick = (time: number) => {
      if (stopped) return
      const progress = Math.min(1, (time - started) / duration)
      const eased = (1 - Math.cos(Math.PI * progress)) / 2
      viewport.scrollTop = from * (1 - eased)
      if (fade) content.style.opacity = String(1 - eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else {
        stopped = true
        clean()
        viewport.scrollTop = 0
        cancelReturn.current = () => {
          content.style.opacity = ''
        }
        done()
      }
    }
    dialogRef.current!.dataset.caseSwitch = fade ? 'returning' : 'returning-close'
    viewport.addEventListener('wheel', cancel, { passive: true })
    viewport.addEventListener('touchstart', cancel, { passive: true })
    viewport.addEventListener('pointerdown', cancel, { passive: true })
    viewport.addEventListener('keydown', keydown)
    window.addEventListener('resize', cancel)
    document.addEventListener('visibilitychange', visibility)
    cancelReturn.current = cancel
    frame = requestAnimationFrame(tick)
  }

  const close = (section?: CaseHomeSection) => {
    if (dialogRef.current?.dataset.phase === 'closing') return
    cancelReturn.current()
    if (section) {
      window.dispatchEvent(new Event('vne-section-navigation'))
      cancelReturn.current = changeSectionWithParticles(
        () => {
          // The shared transition continues assembling after this dialog unmounts.
          cancelReturn.current = () => {}
          requestClose(section, true)
        },
        undefined,
        panelRef.current,
      )
      return
    }
    returnToTop(() => {
      const target = galleryArtwork(item.slug)
      const rect = target?.getBoundingClientRect()
      const visibleHeight = window.visualViewport?.height ?? innerHeight
      if (target && rect && (rect.top < 70 || rect.bottom > visibleHeight)) {
        window.scrollTo({
          top: rect.top + scrollY - Math.max(70, (visibleHeight - rect.height) / 2),
          behavior: 'instant',
        })
      }
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => requestClose(section))
      })
      cancelReturn.current = () => cancelAnimationFrame(frame)
    }, false)
  }

  const handleNavigation = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const link = event.target instanceof Element ? event.target.closest('a') : null
    if (!link || link.target === '_blank') return
    const href = link.getAttribute('href')
    const next = items.find((entry) => getCaseHref(entry.slug) === href)
    if (next) {
      event.preventDefault()
      if (next.slug === item.slug || dialogRef.current?.dataset.phase === 'closing') return
      returnToTop(() => setItem(next), true)
      return
    }
    if (href === '#contact') {
      event.preventDefault()
      close('contact')
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={shell.dialog}
      aria-labelledby="orbit-case-modal-title"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onKeyDown={trapOrbitDialogFocus}
    >
      <div className={shell.panel} ref={panelRef}>
        <header className={shell.toolbar}>
          <div className={shell.brand}>
            <span className={shell.wordmark}>{t('ВНЕ')}</span>
            <span className={`${shell.eyebrow} ${shell.brandCaption}`}>
              <RotatingSlogan />
            </span>
          </div>
          <div className={shell.toolbarRight}>
            <LanguageSwitch />
            <span className={shell.eyebrow}>
              {t('Кейс')}{' '}
              {t(String(items.findIndex((entry) => entry.slug === item.slug) + 1).padStart(2, '0'))}
              {' / '}
              {t(item.projectName)}
            </span>
            <DialogCloseButton ref={closeRef} onClick={() => close()} />
          </div>
        </header>
        <div
          ref={viewportRef}
          className={shell.scrollArea}
          onClickCapture={handleNavigation}
          data-lenis-prevent
        >
          <div ref={contentRef}>
            <div ref={caseContentRef} className={styles.caseContent}>
              <OrbitCaseDetail
                key={item.slug}
                item={item}
                items={items}
                idPrefix="orbit-case-modal"
                initiallyAssembled
                initialPose={item.slug === initialItem.slug ? artwork?.pose : undefined}
              />
            </div>
          </div>
        </div>
      </div>
      <canvas ref={overlayRef} className={styles.artworkTransfer} aria-hidden="true" />
    </dialog>
  )
}
