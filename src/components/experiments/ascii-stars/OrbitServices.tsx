'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import Link from 'next/link'
import { ServicePricing } from '@/components/pricing/ServicePricing'

import { useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import {
  serviceExperiences,
  type ServiceExperience,
} from '@/components/sections/service-experience-data'
import { getServiceHref } from '@/lib/services/catalog'

import styles from './OrbitServices.module.css'
import type { OrbitServiceDialogOrigin } from './OrbitServiceDialog'

const OrbitServiceDialog = dynamic(() =>
  import('./OrbitServiceDialog').then((module) => module.OrbitServiceDialog),
)

export function OrbitServices({ id = 'services' }: { id?: string }) {
  const { t } = useSiteLanguage()

  const [selection, setService] = useState<{
    service: ServiceExperience
    origin?: OrbitServiceDialogOrigin
  } | null>(null)
  const lenis = useLenis()
  const reducedMotion = useReducedMotion()

  const closeExperience = (contact = false) => {
    setService(null)
    if (!contact) return

    // The dialog first restores scrolling and focus, then hands off to the form.
    requestAnimationFrame(() => {
      const target = document.getElementById('contact-form') ?? document.getElementById('contact')
      if (!target) return
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      if (lenis && !reducedMotion) {
        lenis.resize()
        lenis.scrollTo(target, { offset: -24, force: true })
      } else target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
    })
  }

  return (
    <section
      className={styles.section}
      id={id}
      aria-labelledby="orbit-services-title"
      data-service-section
    >
      <span className={styles.spine} aria-hidden="true" data-service-spine />
      <header className={styles.header} data-service-header>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>{t('05 / Услуги')}</p>
          <p className={styles.note}>{t('От отдельной задачи до целой системы.')}</p>
          <Link href="/pricing" className={styles.pricingLink}>
            {t('Прайс и условия')} <ArrowIcon />
          </Link>
        </div>
        <h2 id="orbit-services-title" className={styles.heading}>
          {t('Наши услуги')}
        </h2>
      </header>

      <div className={styles.list}>
        {serviceExperiences.map((entry, index) => (
          <article
            className={styles.row}
            key={entry.id}
            aria-labelledby={`orbit-service-${entry.id}`}
            data-service-row
          >
            <div className={styles.serviceHeading}>
              <span className={styles.number} aria-hidden="true">
                0{t(index + 1)}
              </span>
              <div>
                <p className={styles.eyebrow}>{t(entry.label)}</p>
                <h3 id={`orbit-service-${entry.id}`}>{t(entry.title)}</h3>
              </div>
            </div>
            <div className={styles.details} data-service-details>
              <p className={styles.description}>{t(entry.description)}</p>
              {entry.platforms && (
                <p className={styles.platforms}>
                  {t('Платформы:')} {t(entry.platforms)}
                </p>
              )}
              <ul className={styles.items}>
                {entry.items.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
              <ServicePricing serviceId={entry.id} compact />
              <a
                className={styles.more}
                href={getServiceHref(entry.id)}
                aria-label={`${t('Подробнее:')} ${t(entry.title)}`}
                aria-haspopup="dialog"
                onClick={(event) => {
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
                  const rect = event.currentTarget
                    .closest<HTMLElement>('[data-service-details]')
                    ?.getBoundingClientRect()
                  setService({
                    service: entry,
                    origin: rect
                      ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                      : undefined,
                  })
                }}
              >
                {t('Подробнее об услуге')}
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.contactStrip} data-service-contact>
        <p>{t('Обсудим любой бюджет и подходящий объём.')}</p>
        <a href="#contact">
          {t('Разберём задачу вместе')}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </a>
      </div>
      {selection && (
        <OrbitServiceDialog
          service={selection.service}
          origin={selection.origin}
          onClose={closeExperience}
        />
      )}
    </section>
  )
}
