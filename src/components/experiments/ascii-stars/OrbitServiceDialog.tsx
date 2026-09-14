'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { DialogCloseButton } from '@/components/ui/DialogCloseButton'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useId } from 'react'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LanguageSwitch } from '@/components/ui/SiteLanguage'

import type { ServiceExperience } from '@/components/sections/service-experience-data'
import { ServicePricing } from '@/components/pricing/ServicePricing'

import { AsciiStarsCanvas } from './AsciiStarsCanvas'
import styles from './OrbitServiceDialog.module.css'
import flow from './OrbitClosingFlow.module.css'
import detailMotion from './OrbitDetailMotion.module.css'
import { serviceConstellations } from './service-constellations'
import {
  trapOrbitDialogFocus,
  useOrbitDialogTransition,
  type OrbitDialogOrigin,
} from './useOrbitDialogTransition'

export type OrbitServiceDialogOrigin = OrbitDialogOrigin

export function OrbitServiceDialog({
  service,
  onClose,
  origin,
}: {
  service: ServiceExperience
  onClose: (contact?: boolean) => void
  origin?: OrbitServiceDialogOrigin
}) {
  const { t } = useSiteLanguage()

  const id = useId()
  const constellation = serviceConstellations[service.id] ?? serviceConstellations.web
  const { dialogRef, panelRef, contentRef, closeRef, requestClose } =
    useOrbitDialogTransition<boolean>({ origin, onClose })
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onKeyDown={trapOrbitDialogFocus}
    >
      <div className={styles.panel} ref={panelRef}>
        <header className={styles.toolbar}>
          <div className={styles.brand}>
            <span className={styles.wordmark}>{t('ВНЕ')}</span>
            <span className={`${styles.eyebrow} ${styles.brandCaption}`}>
              <RotatingSlogan />
            </span>
          </div>
          <div className={styles.toolbarRight}>
            <LanguageSwitch />
            <span className={styles.eyebrow}>{t('05 / Услуги')}</span>
            <DialogCloseButton ref={closeRef} onClick={() => requestClose()} />
          </div>
        </header>

        <div className={styles.scrollArea} data-lenis-prevent>
          <div
            className={`${styles.layout} ${flow.flow} ${detailMotion.motion}`}
            data-detail-flow="service"
          >
            <aside
              className={styles.visual}
              style={{
                background: constellation.backgroundColor,
                color: constellation.foregroundColor,
              }}
              data-service-constellation={service.id}
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

            <div className={styles.content} ref={contentRef} data-detail-content>
              <section
                className={styles.introduction}
                aria-labelledby={`${id}-title`}
                data-closing-row
                data-detail-segment
                data-detail-intro
              >
                <span data-closing-spine aria-hidden="true" />
                <p className={styles.eyebrow} data-detail-enter>
                  {t(service.label)}
                </p>
                <h2 className={styles.title} id={`${id}-title`} data-detail-enter="title">
                  {t(service.title)}
                </h2>
                <p className={styles.description} id={`${id}-description`} data-detail-enter="copy">
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
                <button
                  className={styles.introContact}
                  data-detail-enter="control"
                  type="button"
                  onClick={() => requestClose(true)}
                >
                  {t('Обсудить эту услугу')}
                  <span aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </button>
              </section>

              <ServicePricing serviceId={service.id} />

              <section
                className={styles.process}
                aria-labelledby={`${id}-process`}
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
                  <h3 id={`${id}-process`} data-closing-copy="up">
                    {t('Как строится')}
                    <br />
                    {t('работа.')}
                  </h3>
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
                        <h4>{t(step.title)}</h4>
                        <p>{t(step.description)}</p>
                        <div
                          className={styles.deliverable}
                          data-closing-row
                          data-closing-rule="top"
                        >
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
                aria-labelledby={`${id}-outcome`}
                data-closing-row
                data-closing-rule="top"
                data-closing-end
                data-detail-segment
              >
                <span data-closing-spine aria-hidden="true" />
                <div data-closing-copy="up">
                  <p className={styles.eyebrow}>{t('Результат проекта')}</p>
                  <h3 id={`${id}-outcome`}>
                    {t(service.outcomeTitle) || (
                      <>
                        {t('Что получаете')}
                        <br />
                        {t('вы.')}
                      </>
                    )}
                  </h3>
                  <p className={styles.outcomeDescription}>{t(service.outcome)}</p>
                  <button
                    className={styles.contact}
                    type="button"
                    onClick={() => requestClose(true)}
                  >
                    {t('Обсудить проект')}
                    <span aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}
