'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { DialogCloseButton } from '@/components/ui/DialogCloseButton'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import {
  COOKIE_CHOICE_EVENT,
  COOKIE_CHOICE_KEY,
  COOKIE_SETTINGS_EVENT,
  clearAnalyticsStorage,
  readCookieChoice,
  saveCookieChoice,
} from '@/lib/legal/cookie-choice'
import styles from './CookieConsent.module.css'

type Metrica = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number }
type AnalyticsWindow = Window & { ym?: Metrica }

function useMetrica(allowed: boolean) {
  const pathname = usePathname()
  const initialized = useRef(false)
  const counter = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  useEffect(() => {
    if (!allowed || !counter || !/^\d+$/.test(counter)) return
    const id = Number(counter)
    const target = window as AnalyticsWindow
    const ym: Metrica = (...args) => {
      ;(ym.a ??= []).push(args)
    }
    ym.l = Date.now()
    target.ym = ym
    let cancelled = false
    const script = document.createElement('script')
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`
    script.async = true
    script.dataset.vneAnalytics = 'true'
    script.onload = () => {
      if (cancelled || !readCookieChoice()?.analytics) return
      // Do not send query strings, form values, replay recordings or previous visits.
      target.ym?.(id, 'init', {
        defer: true,
        webvisor: false,
        clickmap: false,
        trackLinks: false,
        accurateTrackBounce: true,
        triggerEvent: false,
      })
      target.ym?.(id, 'hit', window.location.origin + window.location.pathname, {
        referer: '',
        title: document.title,
      })
      initialized.current = true
    }
    document.head.appendChild(script)
    return () => {
      cancelled = true
      target.ym?.(id, 'destruct')
      initialized.current = false
      script.onload = null
      script.remove()
      delete target.ym
      clearAnalyticsStorage()
    }
  }, [allowed, counter])
  useEffect(() => {
    if (allowed && initialized.current && counter) {
      ;(window as AnalyticsWindow).ym?.(Number(counter), 'hit', window.location.origin + pathname, {
        referer: '',
        title: document.title,
      })
    }
  }, [allowed, counter, pathname])
}

export function CookieConsent() {
  const { language } = useSiteLanguage()
  const ru = language === 'ru'
  const [mounted, setMounted] = useState(false)
  const [needsChoice, setNeedsChoice] = useState(false)
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [settings, setSettings] = useState(false)
  const [selection, setSelection] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const banner = useRef<HTMLElement>(null)
  const configureTrigger = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useMetrica(allowed)

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      const choice = readCookieChoice()
      setNeedsChoice(!choice)
      setAllowed(choice?.analytics === true)
      clearTimeout(expiryTimer)
      if (choice) {
        // Browsers cap timers at ~24 days. Re-check long-lived tabs until expiry.
        expiryTimer = setTimeout(sync, Math.min(choice.expiresAt - Date.now() + 10, 2_000_000_000))
      }
      if (!choice?.analytics) clearAnalyticsStorage()
    }
    const storage = (event: StorageEvent) => {
      if (!event.key || event.key === COOKIE_CHOICE_KEY) sync()
    }
    const onVisible = () => {
      if (!document.hidden) sync()
    }
    const open = () => {
      trigger.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      setSelection(readCookieChoice()?.analytics === true)
      setSettings(true)
    }
    const startup = () => {
      if (!document.querySelector('[data-startup-loader]')) {
        setReady(true)
        observer.disconnect()
      }
    }
    const observer = new MutationObserver(startup)
    observer.observe(document.body, { childList: true, subtree: true })
    const frame = requestAnimationFrame(() => {
      setMounted(true)
      sync()
      startup()
    })
    window.addEventListener(COOKIE_CHOICE_EVENT, sync)
    window.addEventListener('storage', storage)
    window.addEventListener(COOKIE_SETTINGS_EVENT, open)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(expiryTimer)
      clearTimeout(closeTimer.current)
      observer.disconnect()
      window.removeEventListener(COOKIE_CHOICE_EVENT, sync)
      window.removeEventListener('storage', storage)
      window.removeEventListener(COOKIE_SETTINGS_EVENT, open)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => {
    if (!settings || !dialog.current) return
    const node = dialog.current
    node.showModal()
    return () => {
      if (node.open) node.close()
    }
  }, [settings])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const resize = () => {
      const node = settings ? dialog.current : banner.current
      if (!node) return
      node.style.setProperty('--cookie-viewport-height', `${viewport.height}px`)
      node.style.setProperty('--cookie-viewport-top', `${viewport.offsetTop}px`)
      node.style.setProperty(
        '--cookie-viewport-bottom',
        `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`,
      )
    }
    resize()
    viewport.addEventListener('resize', resize)
    viewport.addEventListener('scroll', resize)
    return () => {
      viewport.removeEventListener('resize', resize)
      viewport.removeEventListener('scroll', resize)
    }
  }, [settings, ready, needsChoice])

  const dismissSettings = () => {
    dialog.current?.close()
    setSettings(false)
    requestAnimationFrame(() => {
      // Opening preferences replaces the banner, so its original button may
      // have been unmounted. Restore focus to the replacement after render.
      const target = trigger.current?.isConnected ? trigger.current : configureTrigger.current
      target?.focus({ preventScroll: true })
    })
  }
  const choose = (analytics: boolean) => {
    // Animate the panel out before the storage event removes the initial banner.
    setLeaving(true)
    closeTimer.current = setTimeout(
      () => {
        saveCookieChoice(analytics)
        setLeaving(false)
        if (settings) dismissSettings()
      },
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220,
    )
  }
  if (!mounted) return null

  const content = (detailed: boolean) => (
    <>
      <div className={styles.topline}>
        <span>VNE / {detailed ? (ru ? 'НАСТРОЙКИ' : 'PREFERENCES') : 'COOKIES'}</span>
        <span aria-hidden="true">[ {detailed ? '02' : '01'} ]</span>
      </div>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          <h2 id={detailed ? 'cookie-settings-title' : 'cookie-banner-title'}>
            {detailed ? (ru ? 'Ваш выбор.' : 'Your choice.') : '.cookie-policy'}
          </h2>
          {detailed ? (
            <DialogCloseButton
              onClick={dismissSettings}
              aria-label={ru ? 'Закрыть настройки cookie' : 'Close cookie settings'}
              disabled={leaving}
            />
          ) : (
            <Image
              className={styles.mark}
              src="/assets/brand/vne-orbit-mark.svg"
              width={28}
              height={32}
              alt=""
            />
          )}
        </div>
        <p>
          {ru
            ? 'С вашего разрешения используем Яндекс.Метрику, чтобы понимать, как работает сайт, и делать его удобнее. Вы можете отказаться — всё продолжит работать.'
            : 'With your permission, Yandex Metrica helps us understand how the site is used and make it easier to use. You can decline; the site will still work as usual.'}
        </p>
        {detailed && (
          <div className={styles.options}>
            <div className={styles.option}>
              <span>
                <strong>{ru ? 'Настройки сайта' : 'Site preferences'}</strong>
                <small>
                  {ru
                    ? 'Выбранный язык и ваше решение о cookie.'
                    : 'Your chosen language and cookie preferences.'}
                </small>
              </span>
              <span className={styles.fixed}>{ru ? 'Всегда активны' : 'Always active'}</span>
            </div>
            <label className={styles.option}>
              <span>
                <strong>{ru ? 'Аналитика' : 'Analytics'}</strong>
                <small>
                  {ru
                    ? 'Статистика посещений. Без записи полей формы.'
                    : 'Site visit statistics. Form entries are not recorded.'}
                </small>
              </span>
              <input
                type="checkbox"
                checked={selection}
                onChange={(event) => setSelection(event.target.checked)}
              />
            </label>
          </div>
        )}
        <div className={styles.documents}>
          <Link href="/cookies" onClick={detailed ? dismissSettings : undefined}>
            {ru ? 'Политика cookie' : 'Cookie policy'}
          </Link>
          <Link href="/analytics-consent" onClick={detailed ? dismissSettings : undefined}>
            {ru ? 'Согласие на аналитику' : 'Analytics consent'}
          </Link>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => choose(false)} disabled={leaving}>
          {ru ? 'Отклонить аналитику' : 'Decline analytics'}
          <span aria-hidden="true">−</span>
        </button>
        <button
          type="button"
          onClick={() => choose(detailed ? selection : true)}
          disabled={leaving}
        >
          {ru
            ? detailed
              ? 'Сохранить выбор'
              : 'Разрешить аналитику'
            : detailed
              ? 'Save preferences'
              : 'Allow analytics'}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </button>
      </div>
      {!detailed && (
        <button
          ref={configureTrigger}
          className={styles.configure}
          type="button"
          onClick={(event) => {
            trigger.current = event.currentTarget
            setSelection(false)
            setSettings(true)
          }}
        >
          {ru ? 'Настроить' : 'Customize'} <span aria-hidden="true">+</span>
        </button>
      )}
    </>
  )

  return createPortal(
    <>
      {ready && needsChoice && !settings && (
        <aside
          ref={banner}
          className={styles.banner}
          data-cookie-banner
          data-leaving={leaving}
          aria-labelledby="cookie-banner-title"
          data-lenis-prevent
        >
          <div className={styles.panel}>{content(false)}</div>
        </aside>
      )}
      {settings && (
        <dialog
          ref={dialog}
          className={styles.dialog}
          data-cookie-settings
          data-leaving={leaving}
          aria-labelledby="cookie-settings-title"
          onCancel={(event) => {
            event.preventDefault()
            dismissSettings()
          }}
          data-lenis-prevent
        >
          <div className={styles.panel}>{content(true)}</div>
        </dialog>
      )}
    </>,
    document.body,
  )
}
