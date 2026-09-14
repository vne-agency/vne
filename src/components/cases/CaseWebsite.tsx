'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { getCaseWebsiteUrl, type CaseItem } from '@/lib/cases/catalog'

import defaultStyles from './CaseDetail.module.css'
import orbitStyles from './CaseWebsiteOrbit.module.css'

type CaseWebsiteProps = Pick<
  CaseItem,
  'projectName' | 'websiteUrl' | 'allowEmbed' | 'preview' | 'previewAlt'
> & { showDemo?: boolean; variant?: 'default' | 'orbit' }

const subscribeToWindow = () => () => {}
const isTopLevelWindow = () => window.self === window.top
const serverWindowSnapshot = () => false

export function CaseWebsite({
  projectName,
  websiteUrl,
  allowEmbed,
  preview,
  previewAlt,
  showDemo = false,
  variant = 'default',
}: CaseWebsiteProps) {
  const { t } = useSiteLanguage()

  const styles = variant === 'orbit' ? orbitStyles : defaultStyles
  const url = getCaseWebsiteUrl(websiteUrl)
  const [mode, setMode] = useState<'website' | 'demo' | null>(null)
  const active = mode !== null
  const demoActive = mode === 'demo'
  const topLevelWindow = useSyncExternalStore(
    subscribeToWindow,
    isTopLevelWindow,
    serverWindowSnapshot,
  )
  const canShowDemo = showDemo && topLevelWindow && !allowEmbed
  const frameUrl = demoActive ? '/preview/studio' : url
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const activationRef = useRef<HTMLButtonElement>(null)
  const demoRef = useRef<HTMLButtonElement>(null)
  const pauseRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!active || loaded) return
    const timeout = window.setTimeout(() => setSlow(true), 12_000)
    return () => window.clearTimeout(timeout)
  }, [active, loaded, attempt])

  useEffect(() => {
    if (active) pauseRef.current?.focus({ preventScroll: true })
  }, [active])

  useEffect(() => {
    if (!demoActive || !loaded) return
    const frame = frameRef.current
    const demoDocument = frame?.contentDocument
    if (!demoDocument) return

    function handleEscape(event: KeyboardEvent) {
      if (
        event.key !== 'Escape' ||
        event.defaultPrevented ||
        demoDocument?.querySelector('dialog[open]')
      )
        return

      event.preventDefault()
      const dialog = frame?.closest('dialog')
      if (dialog) {
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      } else {
        pauseRef.current?.click()
      }
    }

    demoDocument.addEventListener('keydown', handleEscape)
    return () => demoDocument.removeEventListener('keydown', handleEscape)
  }, [demoActive, loaded, attempt])

  function pause() {
    const trigger = demoActive ? demoRef : activationRef
    setMode(null)
    setLoaded(false)
    setSlow(false)
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }))
  }

  if (!url) {
    return (
      <section
        className={`${styles.website} ${styles.comingSoon}`}
        aria-label={`${t('Сайт')} ${t(projectName)}`}
      >
        <strong>SOON</strong>
        <p>{t('Скоро покажем этот проект')}</p>
      </section>
    )
  }

  return (
    <section className={styles.website} aria-label={`${t('Сайт')} ${t(projectName)}`}>
      <div className={styles.websiteToolbar}>
        <span className={styles.websiteAddress}>
          {t(demoActive ? 'ВНЕ · Демо' : new URL(url).hostname)}
        </span>
        <div className={styles.websiteActions}>
          {active && (
            <button ref={pauseRef} type="button" onClick={pause} className={styles.textButton}>
              {t('Завершить просмотр')}
            </button>
          )}
          <a
            href={frameUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(
              demoActive
                ? 'Открыть демо сайта ВНЕ в новой вкладке'
                : `${t('Открыть сайт')} ${t(projectName)} ${t('в новой вкладке')}`,
            )}
          >
            {t('Открыть отдельно')}
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </a>
        </div>
      </div>

      <div
        className={styles.websiteViewport}
        data-active={active ? true : undefined}
        data-lenis-prevent={active ? true : undefined}
      >
        {active ? (
          <>
            <iframe
              ref={frameRef}
              key={attempt}
              src={frameUrl}
              title={t(
                demoActive
                  ? 'Интерактивное демо сайта ВНЕ'
                  : `${t('Интерактивный сайт')} ${t(projectName)}`,
              )}
              className={styles.websiteFrame}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => {
                setLoaded(true)
                setSlow(false)
              }}
            />
            {!loaded && (
              <div className={styles.loadingNotice} role="status">
                <p>{t(slow ? 'Сайт отвечает дольше обычного' : 'Загружаем сайт…')}</p>
                {slow && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => {
                      setSlow(false)
                      setAttempt((value) => value + 1)
                    }}
                  >
                    {t('Попробовать ещё раз')}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {variant === 'orbit' ? (
              <div className={orbitStyles.previewSurface}>
                <Image
                  src={preview}
                  alt={t(previewAlt || `${t('Превью сайта')} ${t(projectName)}`)}
                  fill
                  loading="eager"
                  sizes="(max-width: 800px) 100vw, 60vw"
                  className={styles.blurredPreview}
                />
              </div>
            ) : (
              <Image
                src={preview}
                alt={t(previewAlt || `Превью сайта ${projectName}`)}
                fill
                loading="eager"
                sizes="(max-width: 800px) 100vw, 60vw"
                className={styles.blurredPreview}
              />
            )}
            <div className={styles.websiteCover}>
              <span className={styles.liveLabel}>{t('Живой сайт')}</span>
              <h2>
                {t(
                  allowEmbed
                    ? 'Можно нажимать.\nМожно прокручивать.'
                    : 'Посмотрите,\nкак всё работает.',
                )}
              </h2>
              <p>
                {t(
                  allowEmbed
                    ? 'Исследуйте сайт прямо здесь — как в обычном браузере.'
                    : 'Откройте сайт в новой вкладке: листайте страницы и пробуйте всё сами.',
                )}
              </p>
              {allowEmbed ? (
                <button
                  ref={activationRef}
                  type="button"
                  className={styles.exploreButton}
                  onClick={() => setMode('website')}
                >
                  {t('Исследовать сайт')}
                  <span aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </button>
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.exploreButton}
                >
                  {t('Перейти на сайт')}
                  <span aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </a>
              )}
              {canShowDemo && (
                <div className={styles.demoActions}>
                  <span>{t('Пример превью на сайте ВНЕ')}</span>
                  <button
                    ref={demoRef}
                    type="button"
                    className={styles.textButton}
                    onClick={() => setMode('demo')}
                  >
                    {t('Попробовать демо')}
                    <span aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {active && (
        <p className={styles.websiteHelp}>
          {t(
            demoActive
              ? 'Демо сайта ВНЕ: прокручивайте страницу и нажимайте на её элементы.'
              : 'Прокручивайте и нажимайте внутри сайта. Не отображается? Откройте отдельно ↑',
          )}
        </p>
      )}
    </section>
  )
}
