'use client'

import { ServicePricing } from '@/components/pricing/ServicePricing'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import type { ServiceExperience } from '@/lib/services/catalog'
import { siteConfig } from '@/lib/site'

import { AsciiStarsCanvas } from './AsciiStarsCanvas'
import styles from './OrbitServiceDialog.module.css'
import pageStyles from './OrbitServiceDetail.module.css'
import flow from './OrbitClosingFlow.module.css'
import detailMotion from './OrbitDetailMotion.module.css'
import { serviceConstellations } from './service-constellations'

// Keep the dialog's existing typography while giving a full page its own h1/h2/h3 outline.
const sectionHeading: CSSProperties = {
  marginBlockStart: '1.5rem',
  fontSize: 'clamp(2rem, 3.5vw, 4rem)',
  fontWeight: 450,
  letterSpacing: '-0.06em',
  lineHeight: 1,
}
const stepHeading: CSSProperties = {
  margin: '0 0 1rem',
  fontSize: 'clamp(1.25rem, 2vw, 1.875rem)',
  fontWeight: 450,
  letterSpacing: '-0.035em',
  lineHeight: 1.2,
}

export function OrbitServiceDetail({ service }: { service: ServiceExperience }) {
  const { t } = useSiteLanguage()
  const constellation = serviceConstellations[service.id] ?? serviceConstellations.web

  return (
    <main id="top" className={pageStyles.page}>
      <header className={`${styles.toolbar} ${pageStyles.toolbar}`}>
        <Link className={styles.brand} href="/" aria-label={t('ВНЕ — в начало страницы')}>
          <span className={styles.wordmark}>{t('ВНЕ')}</span>
          <span className={`${styles.eyebrow} ${styles.brandCaption}`}>
            <RotatingSlogan />
          </span>
        </Link>
        <nav className={styles.toolbarRight} aria-label={t('Основная навигация')}>
          <LanguageSwitch />
          <Link className={pageStyles.backLink} href="/#services">
            <span>{t('Услуги')}</span>
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </nav>
      </header>

      <article
        className={`${styles.layout} ${flow.flow} ${detailMotion.motion}`}
        data-detail-flow="service"
        aria-labelledby="service-title"
      >
        <aside
          className={`${styles.visual} ${pageStyles.visual}`}
          style={{
            background: constellation.backgroundColor,
            color: constellation.foregroundColor,
          }}
          aria-hidden="true"
          inert
        >
          <div className={styles.visualLabel} data-detail-enter>
            <span>VNE / CONSTELLATION</span>
            <span>01—04</span>
          </div>
          <div className={styles.artwork} data-detail-enter="title">
            <AsciiStarsCanvas {...constellation} mode="ascii" density={0.72} speed={0} paused />
          </div>
          <div className={styles.visualFooter} data-detail-enter="copy">
            <span>{t(service.label)}</span>
            <span>
              {t('От идеи к результату ↗').replace('↗', '').trim()} <ArrowIcon />
            </span>
          </div>
        </aside>

        <div className={styles.content} data-detail-content>
          <section
            className={styles.introduction}
            aria-labelledby="service-title"
            data-closing-row
            data-detail-segment
            data-detail-intro
          >
            <span data-closing-spine aria-hidden="true" />
            <p className={styles.eyebrow} data-detail-enter>
              {t(service.label)}
            </p>
            <h1 className={styles.title} id="service-title" data-detail-enter="title">
              {t(service.title)}
            </h1>
            <p className={styles.description} data-detail-enter="copy">
              {t(service.description)}
            </p>
            {service.platforms && (
              <p className={styles.platforms} data-detail-enter="copy">
                {t('Платформы:')} {t(service.platforms)}
              </p>
            )}
            <ul className={styles.items} data-closing-row data-closing-rule="bottom">
              {service.items.map((item) => (
                <li key={item} data-closing-row data-closing-rule="top">
                  <span aria-hidden="true" data-closing-copy="up">
                    <ArrowIcon />
                  </span>
                  <span className={styles.itemText} data-closing-copy="up">
                    {t(item)}
                  </span>
                </li>
              ))}
            </ul>
            <Link className={styles.introContact} href="/#contact-form" data-detail-enter="control">
              {t('Обсудить эту услугу')}
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </Link>
          </section>

          <ServicePricing serviceId={service.id} headingLevel={2} />

          <section
            className={styles.process}
            aria-labelledby="service-process"
            data-closing-row
            data-closing-rule="top"
          >
            <header className={styles.processHeader} data-closing-row data-detail-segment>
              <span data-closing-spine aria-hidden="true" />
              <p className={styles.eyebrow} data-closing-copy="up">
                {t('Возможные этапы /')}
                {t(String(service.steps.length).padStart(2, '0'))}{' '}
                {t(service.steps.length === 4 ? 'этапа' : 'этапов')}
              </p>
              <h2 id="service-process" style={sectionHeading} data-closing-copy="up">
                {t('Как строится')}
                <br />
                {t('работа.')}
              </h2>
            </header>
            <ol className={styles.steps}>
              {service.steps.map((step, index) => (
                <li
                  key={step.title}
                  className={styles.step}
                  data-closing-row
                  data-closing-rule="top"
                  data-detail-segment
                >
                  <span data-closing-spine aria-hidden="true" />
                  <span className={styles.stepNumber} aria-hidden="true" data-closing-copy="up">
                    {t(String(index + 1).padStart(2, '0'))}
                  </span>
                  <div data-closing-copy="up">
                    <h3 style={stepHeading}>{t(step.title)}</h3>
                    <p>{t(step.description)}</p>
                    <div className={styles.deliverable} data-closing-row data-closing-rule="top">
                      <span className={styles.eyebrow}>
                        {t(step.items ? 'Что входит' : 'На выходе')}
                      </span>
                      {step.items ? (
                        <ul className={styles.inclusions}>
                          {step.items.map((item) => (
                            <li key={item}>{t(item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{t(step.deliverable)}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className={styles.outcome}
            aria-labelledby="service-outcome"
            data-closing-row
            data-closing-rule="top"
            data-closing-end
            data-detail-segment
          >
            <span data-closing-spine aria-hidden="true" />
            <div data-closing-copy="up">
              <p className={styles.eyebrow}>{t('Результат проекта')}</p>
              <h2 id="service-outcome" style={sectionHeading}>
                {t(service.outcomeTitle) || (
                  <>
                    {t('Что получаете')}
                    <br />
                    {t('вы.')}
                  </>
                )}
              </h2>
              <p className={styles.outcomeDescription}>{t(service.outcome)}</p>
              <Link className={styles.contact} href="/#contact-form">
                {t('Обсудить проект')}
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </Link>
              <a className={styles.introContact} href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
