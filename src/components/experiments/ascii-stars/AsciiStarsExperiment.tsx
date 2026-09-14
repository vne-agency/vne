'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useSyncExternalStore } from 'react'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { AsciiStarsCanvas, type AsciiStarsCanvasHandle } from './AsciiStarsCanvas'
import styles from './AsciiStarsExperiment.module.css'

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getServerReducedMotion() {
  return true
}

export function AsciiStarsExperiment() {
  const { language, t } = useSiteLanguage()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mode, setMode] = useState<'ascii' | 'dither'>('ascii')
  const [density, setDensity] = useState(0.58)
  const [speed, setSpeed] = useState(0.35)
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null)
  const canvasRef = useRef<AsciiStarsCanvasHandle>(null)
  const [rendererStatus, setRendererStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  )
  const [exportSize, setExportSize] = useState<1024 | 2048 | 4096>(2048)
  const [exportBackground, setExportBackground] = useState<'transparent' | 'theme'>('transparent')
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<{ ru: string; en: string } | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  )
  const paused = motionOverride ?? reducedMotion

  async function downloadImage() {
    if (!canvasRef.current || rendererStatus !== 'ready' || exporting) return
    setExporting(true)
    setExportMessage(null)
    try {
      const blob = await canvasRef.current.exportPng({
        size: exportSize,
        background: exportBackground,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `elda-orbit-${mode}-${theme}-${exportBackground}-${exportSize}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
      setExportMessage({
        ru: `PNG ${exportSize} × ${exportSize} готов. Скачивание началось.`,
        en: `Your ${exportSize} × ${exportSize} PNG is ready. Download started.`,
      })
    } catch {
      setExportMessage({
        ru: 'Не удалось сохранить PNG. Попробуйте ещё раз или выберите меньший размер.',
        en: 'The PNG could not be saved. Try again or choose a smaller size.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className={styles.experiment} data-theme={theme} data-native-cursor>
      <header className={styles.header}>
        <Link href="/lab" className={styles.identity} aria-label={t('ВНЕ.lab — лаборатория')}>
          <span className={styles.wordmark}>{t('ВНЕ')}.lab</span>
        </Link>
        <nav className={styles.headerLinks} aria-label={t('Навигация лаборатории')}>
          <Link href="/" className={styles.backLink} aria-label={t('./home — вернуться в студию')}>
            <span>./home</span>
            <Image
              src="/assets/brand/vne-orbit-mark.svg"
              className={styles.homeLogo}
              width={24}
              height={28}
              alt=""
            />
          </Link>
        </nav>
      </header>

      <section className={styles.stage} aria-labelledby="orbit-title">
        <div className={styles.stageHeading}>
          <h1 id="orbit-title" className={styles.orbitTitle}>
            Orbit <span className={styles.titleSlash}>/</span> 01
          </h1>
          <p className={styles.stageSubtitle}>{t('Исследование формы')}</p>
        </div>

        <AsciiStarsCanvas
          ref={canvasRef}
          onStatusChange={setRendererStatus}
          className={styles.canvas}
          theme={theme}
          mode={mode}
          density={density}
          speed={speed}
          paused={paused}
          scale={1.12}
        />

        <div className={styles.stageMeta}>
          <p>{t('Потяните, чтобы повернуть · Home — сброс')}</p>
          <span className={styles.renderLabel} aria-hidden="true">
            <span className={styles.statusDot} />
            {paused || speed === 0 ? 'Still frame' : 'In motion'}
          </span>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.modeControl}>
          <span id="render-mode-label" className={styles.controlLabel}>
            {t('Рендер')}
          </span>
          <div className={styles.segments} role="group" aria-labelledby="render-mode-label">
            <button
              type="button"
              className={styles.segment}
              aria-pressed={mode === 'ascii'}
              onClick={() => setMode('ascii')}
            >
              ASCII
            </button>
            <button
              type="button"
              className={styles.segment}
              aria-pressed={mode === 'dither'}
              onClick={() => setMode('dither')}
            >
              Dither
            </button>
          </div>
        </div>

        <div className={styles.rangeControl}>
          <div className={styles.rangeHeading}>
            <label htmlFor="orbit-density" className={styles.controlLabel}>
              {t('Плотность')}
            </label>
            <output htmlFor="orbit-density" className={styles.rangeValue}>
              {Math.round(density * 100)}
              <span>%</span>
            </output>
          </div>
          <input
            id="orbit-density"
            className={styles.range}
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(density * 100)}
            aria-valuetext={`${Math.round(density * 100)} ${t('процентов')}`}
            onChange={(event) => setDensity(Number(event.target.value) / 100)}
          />
        </div>

        <div className={styles.rangeControl}>
          <div className={styles.rangeHeading}>
            <label htmlFor="orbit-speed" className={styles.controlLabel}>
              {t('Скорость')}
            </label>
            <output htmlFor="orbit-speed" className={styles.rangeValue}>
              {Math.round(speed * 100)}
              <span>%</span>
            </output>
          </div>
          <input
            id="orbit-speed"
            className={styles.range}
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(speed * 100)}
            aria-valuetext={`${Math.round(speed * 100)} ${t('процентов')}`}
            onChange={(event) => setSpeed(Number(event.target.value) / 100)}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            aria-label={t('Тёмная тема')}
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.actionIcon}>
              <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" />
              <path d="M10 3.5a6.5 6.5 0 0 1 0 13Z" fill="currentColor" />
            </svg>
            <span>{t(theme === 'light' ? 'Светлая' : 'Тёмная')}</span>
          </button>
          <button
            type="button"
            className={styles.action}
            aria-label={t('Пауза анимации')}
            aria-pressed={paused}
            onClick={() => setMotionOverride(!paused)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.actionIcon}>
              {paused ? (
                <path d="m7 4 9 6-9 6Z" fill="currentColor" />
              ) : (
                <path d="M6 4h3v12H6zm5 0h3v12h-3z" fill="currentColor" />
              )}
            </svg>
            <span>{t(paused ? 'Продолжить' : 'Пауза')}</span>
          </button>
        </div>

        <section className={styles.exportPanel} aria-labelledby="orbit-export-title">
          <div className={styles.exportCopy}>
            <h2 id="orbit-export-title" className={styles.exportTitle}>
              {t('Сохранить форму')}
            </h2>
            <p id="orbit-export-description" className={styles.exportDescription}>
              {t('PNG без надписей, в текущем ракурсе. Цвет — по выбранной теме.')}
            </p>
          </div>
          <div className={styles.exportField}>
            <label htmlFor="orbit-export-background" className={styles.controlLabel}>
              {t('Фон')}
            </label>
            <select
              id="orbit-export-background"
              className={styles.exportSelect}
              value={exportBackground}
              disabled={exporting}
              onChange={(event) =>
                setExportBackground(event.target.value as 'transparent' | 'theme')
              }
            >
              <option value="transparent">{t('Прозрачный')}</option>
              <option value="theme">{t('Как на странице')}</option>
            </select>
          </div>
          <div className={styles.exportField}>
            <label htmlFor="orbit-export-size" className={styles.controlLabel}>
              {t('Размер')}
            </label>
            <select
              id="orbit-export-size"
              className={styles.exportSelect}
              value={exportSize}
              disabled={exporting}
              onChange={(event) => setExportSize(Number(event.target.value) as 1024 | 2048 | 4096)}
            >
              <option value="1024">1024 × 1024</option>
              <option value="2048">2048 × 2048</option>
              <option value="4096">4096 × 4096</option>
            </select>
          </div>
          <button
            type="button"
            className={styles.downloadButton}
            disabled={rendererStatus !== 'ready' || exporting}
            aria-busy={exporting}
            aria-describedby="orbit-export-description orbit-export-status"
            onClick={() => void downloadImage()}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.actionIcon}>
              <path
                d="M10 2v10m-4-4 4 4 4-4M3 12v5h14v-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t(exporting ? 'Сохраняем…' : 'Скачать PNG')}
          </button>
          <p id="orbit-export-status" className={styles.exportStatus} role="status">
            {rendererStatus === 'unavailable'
              ? t('Скачивание недоступно: включите WebGL в браузере и обновите страницу.')
              : rendererStatus === 'loading'
                ? t('Готовим форму для экспорта…')
                : exporting
                  ? t('Подготавливаем изображение…')
                  : exportMessage?.[language] ||
                    t(
                      'Поставьте на паузу, чтобы выбрать кадр. Прозрачный фон — для логотипов и макетов.',
                    )}
          </p>
        </section>
      </footer>
    </main>
  )
}
