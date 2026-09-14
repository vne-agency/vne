'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { useState } from 'react'

import { CaseWebsite } from '@/components/cases/CaseWebsite'
import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'

import { AsciiCaseInterface } from './AsciiCaseInterface'
import styles from './OrbitCaseDetail.module.css'
import flow from './OrbitClosingFlow.module.css'
import detailMotion from './OrbitDetailMotion.module.css'
import type { CaseInterfacePose } from './case-interface-state'

export function OrbitCaseDetail({
  item,
  items,
  idPrefix = 'case',
  initiallyAssembled = false,
  initialPose,
}: {
  item: CaseItem
  items: readonly CaseItem[]
  idPrefix?: string
  initiallyAssembled?: boolean
  initialPose?: CaseInterfacePose
}) {
  const { t } = useSiteLanguage()

  const index = Math.max(
    0,
    items.findIndex((entry) => entry.slug === item.slug),
  )
  const next = items.length > 1 ? items[(index + 1) % items.length] : undefined
  const [replay, setReplay] = useState(0)

  return (
    <article
      className={`${styles.detail} ${flow.flow} ${detailMotion.motion}`}
      data-detail-flow="case"
      id={`${idPrefix}-detail`}
      aria-labelledby={`${idPrefix}-title`}
    >
      <header
        className={styles.hero}
        data-closing-row
        data-closing-rule="bottom"
        data-closing-split="contact"
        data-detail-hero
      >
        <span data-closing-spine aria-hidden="true" />
        <div className={styles.cover} data-theme={item.slug === 'arc-store' ? 'dark' : 'light'}>
          <div className={styles.artwork}>
            <AsciiCaseInterface
              title={t(item.projectName)}
              slug={item.slug}
              replayKey={replay}
              initiallyAssembled={initiallyAssembled}
              initialPose={initialPose}
            />
          </div>
          <div
            className={styles.coverFooter}
            data-closing-row
            data-closing-rule="top"
            data-detail-first-rule
          >
            <button
              type="button"
              className={styles.replay}
              data-detail-enter="control"
              onClick={() => setReplay((value) => value + 1)}
              aria-label={`${t('Повторить сборку интерфейса')} ${t(item.projectName)}`}
              title={t('Повторить сборку')}
            >
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>

        <div className={styles.introduction}>
          <p className={styles.projectLabel} data-detail-enter>
            <span>{t('Избранный проект')}</span>
            <span>{t(String(index + 1).padStart(2, '0'))}</span>
          </p>
          <div className={styles.projectTitle}>
            <h1 id={`${idPrefix}-title`} tabIndex={-1} data-detail-enter="title">
              {t(item.projectName)}
            </h1>
            <p data-detail-enter="copy">{t(item.title)}</p>
          </div>
          {item.services.length > 0 && (
            <div className={styles.services} data-detail-enter="control">
              <p className={styles.caption}>{t('В проекте')}</p>
              <ul aria-label={t('Услуги в проекте')}>
                {item.services.map((service) => (
                  <li key={service}>{t(service)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      <section
        className={styles.overview}
        aria-labelledby={`${idPrefix}-overview-title`}
        data-closing-row
        data-closing-rule="bottom"
        data-closing-split="contact"
      >
        <span data-closing-spine aria-hidden="true" />
        <div className={styles.sectionLabel} data-closing-copy="left">
          <p className={styles.caption}>{t('01 / Контекст')}</p>
          <h2 id={`${idPrefix}-overview-title`}>{t('О проекте')}</h2>
        </div>
        <div className={styles.copy}>
          <div data-closing-copy="right">
            <p className={styles.description}>{t(item.description)}</p>
            {item.content?.root.children.length ? (
              <div className={styles.richText} data-closing-row data-closing-rule="top">
                <RichText data={item.content} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.website} aria-labelledby={`${idPrefix}-website-title`}>
        <div
          className={styles.websiteHeading}
          data-closing-row
          data-closing-rule="bottom"
          data-closing-split="contact"
        >
          <span data-closing-spine aria-hidden="true" />
          <p className={styles.caption} data-closing-copy="left">
            {t('02 / Интерфейс')}
          </p>
          <h2 id={`${idPrefix}-website-title`} data-closing-copy="right">
            {t('Проект в браузере')}
          </h2>
        </div>
        <div className={styles.websiteCanvas} data-closing-row>
          <div data-closing-copy="up">
            <CaseWebsite
              key={item.slug}
              projectName={item.projectName}
              websiteUrl={item.websiteUrl}
              allowEmbed={item.allowEmbed}
              preview={item.preview}
              previewAlt={item.previewAlt}
              variant="orbit"
            />
          </div>
        </div>
      </section>

      <div
        className={styles.contact}
        data-closing-row
        data-closing-rule="both"
        data-closing-split="contact"
      >
        <span data-closing-spine aria-hidden="true" />
        <p data-closing-copy="left">{t('Есть похожая задача?')}</p>
        <a href="#contact" data-closing-copy="right">
          <span className={styles.linkLabel}>{t('Обсудить проект')}</span>
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </a>
      </div>

      <footer
        className={styles.pagination}
        data-closing-row
        data-closing-rule="bottom"
        data-closing-split="contact"
        data-closing-end
      >
        <span data-closing-spine aria-hidden="true" />
        <nav
          className={styles.caseNavigation}
          aria-label={t('Переключение между кейсами')}
          data-closing-copy="left"
        >
          <p className={styles.caption}>{t('Все проекты')}</p>
          <ol>
            {items.map((entry, entryIndex) => (
              <li key={entry.slug}>
                <Link
                  href={getCaseHref(entry.slug)}
                  aria-current={entry.slug === item.slug ? 'page' : undefined}
                  aria-label={`${t('Кейс')} ${String(entryIndex + 1).padStart(2, '0')}: ${t(entry.projectName)}`}
                >
                  {t(String(entryIndex + 1).padStart(2, '0'))}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        {next && (
          <Link
            href={getCaseHref(next.slug)}
            className={styles.next}
            data-closing-mobile-rule
            data-closing-copy="right"
          >
            <span className={styles.caption}>{t('Следующий проект')}</span>
            <span className={styles.nextTitle}>
              <span className={styles.linkLabel}>{t(next.projectName)}</span>
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </span>
          </Link>
        )}
      </footer>
    </article>
  )
}
