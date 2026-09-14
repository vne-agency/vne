'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import dynamic from 'next/dynamic'
import { useLenis } from 'lenis/react'
import { useCallback, useState, type MouseEvent } from 'react'

import type { CaseHomeSection } from '@/components/cases/CaseModal'
import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'

import { AsciiCaseInterface } from './AsciiCaseInterface'
import styles from './OrbitCases.module.css'
import type { OrbitDialogOrigin } from './useOrbitDialogTransition'
import { captureCaseArtwork, type CaseArtworkSnapshot } from './useCaseArtworkTransfer'

const CaseModal = dynamic(() =>
  import('./OrbitCaseDialog').then((module) => module.OrbitCaseDialog),
)

export function OrbitCases({ items }: { items: readonly CaseItem[] }) {
  const { t } = useSiteLanguage()

  const [activeCase, setActiveCase] = useState<{
    item: CaseItem
    origin: OrbitDialogOrigin
    artwork?: CaseArtworkSnapshot
  } | null>(null)
  const [replays, setReplays] = useState<Record<string, number>>({})
  const lenis = useLenis()
  const openCase = (item: CaseItem, event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    const trigger = event.currentTarget
    const artwork = captureCaseArtwork(
      trigger.closest('article')?.querySelector<HTMLElement>('[data-case-interface]') ?? null,
    )
    const source =
      artwork?.host ?? trigger.closest('[data-case-preview], [data-case-details]') ?? trigger
    const { top, left, width, height } = source.getBoundingClientRect()
    setActiveCase({ item, origin: { top, left, width, height }, artwork })
  }
  const closeCase = useCallback(
    (section?: CaseHomeSection) => {
      setActiveCase(null)
      if (!section) return
      requestAnimationFrame(() => {
        const target = document.getElementById(section)
        if (!target) return
        const scrollTarget =
          section === 'contact' ? (document.getElementById('contact-form') ?? target) : target
        const hadTabIndex = scrollTarget.hasAttribute('tabindex')
        if (!hadTabIndex) scrollTarget.tabIndex = -1
        scrollTarget.focus({ preventScroll: true })
        if (!hadTabIndex)
          scrollTarget.addEventListener(
            'blur',
            () => {
              scrollTarget.removeAttribute('tabindex')
            },
            { once: true },
          )
        if (lenis) {
          lenis.resize()
          lenis.scrollTo(scrollTarget, {
            offset: section === 'contact' ? -24 : 0,
            immediate: true,
            force: true,
          })
        } else {
          window.scrollTo({
            top:
              window.scrollY +
              scrollTarget.getBoundingClientRect().top -
              (section === 'contact' ? 24 : 0),
            behavior: 'instant',
          })
        }
      })
    },
    [lenis],
  )

  return (
    <>
      <section className={styles.section} id="cases" aria-labelledby="orbit-cases-title">
        <header className={styles.heading} data-flow-heading>
          <p className={styles.eyebrow}>{t('03 / Избранные проекты')}</p>
          <h2 id="orbit-cases-title">
            {t('Наши кейсы')}
            <span aria-hidden="true">
              <ArrowIcon direction="down-right" />
            </span>
          </h2>
        </header>

        <div className={styles.list}>
          {items.map((item, index) => (
            <article className={styles.project} key={item.slug}>
              <div className={styles.details} data-case-details>
                <div className={styles.projectLabel}>
                  <span className={styles.eyebrow}>
                    {t('Проект /')} {t(String(index + 1).padStart(2, '0'))}
                  </span>
                </div>
                <div>
                  <p className={styles.projectName}>{t(item.projectName)}</p>
                  <h3>{t(item.title)}</h3>
                </div>
                <p className={styles.description}>{t(item.description)}</p>
                {item.services.length > 0 && (
                  <ul className={styles.tags} aria-label={t('Услуги в проекте')}>
                    {item.services.map((service) => (
                      <li key={service}>{t(service)}</li>
                    ))}
                  </ul>
                )}
                <a
                  href={getCaseHref(item.slug)}
                  className={`${styles.action} ${styles.desktopAction}`}
                  onClick={(event) => openCase(item, event)}
                  aria-label={`${t('Подробнее о проекте')} ${t(item.projectName)}`}
                  aria-haspopup="dialog"
                >
                  {t('Подробнее о проекте')}
                  <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
                    <ArrowIcon />
                  </span>
                </a>
              </div>
              <div className={styles.media}>
                <a
                  href={getCaseHref(item.slug)}
                  className={styles.mediaButton}
                  data-case-preview
                  onClick={(event) => openCase(item, event)}
                  aria-label={`${t('Смотреть кейс')} ${t(item.projectName)}`}
                  aria-haspopup="dialog"
                >
                  <div className={styles.browserBar} aria-hidden="true">
                    <span className={styles.dots}>● ● ●</span>
                    <span>{t(item.projectName)} / DIGITAL EXPERIENCE</span>
                    <span>
                      <ArrowIcon />
                    </span>
                  </div>
                  <div className={styles.imageFrame}>
                    <AsciiCaseInterface
                      title={t(item.projectName)}
                      slug={item.slug}
                      replayKey={replays[item.slug] ?? 0}
                    />
                  </div>
                </a>
                <div className={styles.mediaFooter}>
                  <span>VNE — {t(String(index + 1).padStart(2, '0'))}</span>
                  <button
                    type="button"
                    className={styles.replay}
                    aria-label={`${t('Повторить сборку интерфейса')} ${t(item.projectName)}`}
                    title={t('Повторить сборку')}
                    onClick={() =>
                      setReplays((current) => ({
                        ...current,
                        [item.slug]: (current[item.slug] ?? 0) + 1,
                      }))
                    }
                  >
                    <span className={styles.replayIcon} aria-hidden="true">
                      ↻
                    </span>
                  </button>
                </div>
              </div>
              <a
                href={getCaseHref(item.slug)}
                className={`${styles.action} ${styles.mobileAction}`}
                onClick={(event) => openCase(item, event)}
                aria-label={`${t('Подробнее о проекте')} ${t(item.projectName)}`}
                aria-haspopup="dialog"
              >
                {t('Подробнее о проекте')}
                <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
                  <ArrowIcon />
                </span>
              </a>
            </article>
          ))}
        </div>
      </section>
      {activeCase && (
        <CaseModal
          initialItem={activeCase.item}
          origin={activeCase.origin}
          artwork={activeCase.artwork}
          items={items}
          onClose={closeCase}
        />
      )}
    </>
  )
}
