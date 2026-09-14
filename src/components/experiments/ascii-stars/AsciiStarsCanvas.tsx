'use client'

import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import type { AsciiStarsExportOptions, AsciiStarsSettings } from './ascii-stars-scene'
import styles from './AsciiStarsCanvas.module.css'

export type AsciiStarsCanvasStatus = 'loading' | 'ready' | 'unavailable'

export type AsciiStarsCanvasHandle = {
  exportPng: (options: AsciiStarsExportOptions) => Promise<Blob>
}

type AsciiStarsCanvasProps = AsciiStarsSettings & {
  className?: string
  ref?: Ref<AsciiStarsCanvasHandle>
  onStatusChange?: (status: AsciiStarsCanvasStatus) => void
}

export function AsciiStarsCanvas({
  className = '',
  ref,
  onStatusChange,
  theme,
  mode,
  density,
  speed,
  paused,
  scale = 1,
  rotationZ = 0,
  rotationX = 0,
  rotationY = 0,
  backgroundColor,
  foregroundColor,
}: AsciiStarsCanvasProps) {
  const { t } = useSiteLanguage()
  const id = useId().replaceAll(':', '')
  const patternId = `ascii-stars-pattern-${id}`
  const instructionsId = `ascii-stars-instructions-${id}`
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ReturnType<
    typeof import('./ascii-stars-scene').createAsciiStarsScene
  > | null>(null)
  const settingsRef = useRef({
    theme,
    mode,
    density,
    speed,
    paused,
    scale,
    rotationZ,
    rotationX,
    rotationY,
    backgroundColor,
    foregroundColor,
  })
  const [status, setStatus] = useState<AsciiStarsCanvasStatus>('loading')
  const unavailable = status === 'unavailable'

  useImperativeHandle(
    ref,
    () => ({
      exportPng(options) {
        if (!sceneRef.current) return Promise.reject(new Error('Изображение ещё загружается.'))
        return sceneRef.current.exportPng(options)
      },
    }),
    [],
  )

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    const settings = {
      theme,
      mode,
      density,
      speed,
      paused,
      scale,
      rotationZ,
      rotationX,
      rotationY,
      backgroundColor,
      foregroundColor,
    }
    settingsRef.current = settings
    sceneRef.current?.update(settings)
  }, [
    theme,
    mode,
    density,
    speed,
    paused,
    scale,
    rotationZ,
    rotationX,
    rotationY,
    backgroundColor,
    foregroundColor,
  ])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    const fail = () => {
      if (!cancelled) setStatus('unavailable')
    }
    void import('./ascii-stars-scene')
      .then(({ createAsciiStarsScene }) => {
        if (!cancelled) {
          sceneRef.current = createAsciiStarsScene(host, settingsRef.current, fail, () => {
            if (!cancelled) setStatus('ready')
          })
        }
      })
      .catch(fail)

    return () => {
      cancelled = true
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  return (
    <div
      className={`${styles.host} ${className}`}
      style={{ backgroundColor, color: foregroundColor }}
      ref={hostRef}
      role="region"
      aria-label={t('Интерактивная орбита из четырёх звёзд')}
      aria-describedby={instructionsId}
      tabIndex={unavailable ? undefined : 0}
      data-renderer={unavailable ? 'fallback' : 'webgl'}
      data-native-cursor
      data-lenis-prevent-touch
    >
      <span id={instructionsId} className={styles.instructions}>
        {t(
          'Перетаскивайте мышью или пальцем, чтобы вращать орбиту. Стрелки — поворот, Home — исходный ракурс.',
        )}
      </span>
      <svg className={styles.fallback} viewBox="0 0 760 500" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="9" height="12" patternUnits="userSpaceOnUse">
            <text x="0" y="9" fill="currentColor" fontSize="10" fontFamily="monospace">
              *
            </text>
          </pattern>
        </defs>
        <g fill={`url(#${patternId})`}>
          <path d="M300 52Q290 139 184 172Q279 157 264 242Q303 166 399 183Q319 149 300 52Z" />
          <path d="M465 265Q451 346 331 422Q437 382 420 463Q463 379 567 396Q478 357 465 265Z" />
          <path d="M97 140Q76 240 53 267Q77 299 137 363Q95 284 144 272Q97 261 97 140Z" />
          <path d="M645 107Q676 218 619 236Q658 242 618 395Q693 298 699 236Q678 154 645 107Z" />
          <path d="M88 255C78 131 555 85 682 232L677 236C548 93 87 139 92 255ZM88 268C130 405 552 414 680 253L677 266C546 423 126 412 88 268Z" />
        </g>
      </svg>
      {unavailable && <p className={styles.notice}>{t('Статичный эскиз · WebGL недоступен')}</p>}
    </div>
  )
}
