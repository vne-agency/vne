import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'

import { NoiseBackground } from '@/components/ui/NoiseBackground'
import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'

import { CaseDescription } from './CaseDescription'
import { CaseWebsite } from './CaseWebsite'
import styles from './CaseDetail.module.css'

export function CaseDetail({
  item,
  items,
  idPrefix = 'case',
}: {
  item: CaseItem
  items: readonly CaseItem[]
  idPrefix?: string
}) {
  const next = items[(items.findIndex((entry) => entry.slug === item.slug) + 1) % items.length]

  return (
    <article
      className={styles.caseDetail}
      id={`${idPrefix}-detail`}
      aria-labelledby={`${idPrefix}-title`}
    >
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <NoiseBackground />
        </div>
        <div className={styles.heroCorners} aria-hidden="true" />
        <nav className={styles.navigation} aria-label="Основная навигация">
          <Link href="/#cases" className={styles.activeNav}>
            Кейсы
          </Link>
          <Link href="/#process">Процесс</Link>
          <a href="#contact">Контакты</a>
          <Link href="/#services">Услуги</Link>
        </nav>
        <a className={styles.start} href="#contact">
          START
        </a>

        <div className={styles.mockup}>
          <div
            className={styles.laptop}
            role="img"
            aria-label={
              item.websiteUrl
                ? `Сайт ${item.projectName} на ноутбуке`
                : `${item.projectName} — скоро`
            }
          >
            <div className={styles.laptopScreen}>
              {item.websiteUrl ? (
                <Image
                  src={item.preview}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 800px) 75vw, 45vw"
                />
              ) : (
                <span className={styles.mockupSoon} aria-hidden="true">
                  {item.projectName}
                  <small>SOON</small>
                </span>
              )}
            </div>
            <Image
              src="/assets/cases/kotopes-mockup.png"
              alt=""
              aria-hidden="true"
              width={2218}
              height={1394}
              priority
              sizes="(max-width: 800px) 90vw, 55vw"
              className={styles.laptopFrame}
            />
          </div>
        </div>
        {item.services.length > 0 && (
          <ul className={styles.tags} aria-label="Услуги в проекте">
            {item.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.copy}>
          <h1 id={`${idPrefix}-title`} className={styles.title} tabIndex={-1}>
            {item.projectName}
          </h1>
          <CaseDescription key={item.slug} projectName={item.projectName}>
            <p>{item.description}</p>
            {item.content?.root.children.length ? (
              <details className={styles.extraDescription}>
                <summary>Подробнее о проекте</summary>
                <RichText data={item.content} />
              </details>
            ) : null}
          </CaseDescription>

          <div className={styles.caseControls}>
            <nav className={styles.caseSwitch} aria-label="Переключение между кейсами">
              {items.map((entry, index) => (
                <Link
                  key={entry.slug}
                  href={getCaseHref(entry.slug)}
                  aria-current={entry.slug === item.slug ? 'page' : undefined}
                  aria-label={`Кейс ${String(index + 1).padStart(2, '0')}: ${entry.projectName}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </Link>
              ))}
            </nav>
            {next && (
              <Link
                href={getCaseHref(next.slug)}
                className={styles.nextCase}
                aria-label={`Следующий кейс: ${next.projectName}`}
              >
                <Image src="/assets/cases/arrow-up-right.svg" alt="" width={50} height={50} />
              </Link>
            )}
          </div>
        </div>
        <CaseWebsite
          key={item.slug}
          projectName={item.projectName}
          websiteUrl={item.websiteUrl}
          allowEmbed={item.allowEmbed}
          preview={item.preview}
          previewAlt={item.previewAlt}
          showDemo={process.env.NODE_ENV === 'development'}
        />
      </div>
    </article>
  )
}
