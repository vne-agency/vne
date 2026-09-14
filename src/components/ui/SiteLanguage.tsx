'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { english } from '@/lib/i18n/english'
import styles from './SiteLanguage.module.css'
import { changeLanguageWithParticles } from './language-particles'

type Language = 'ru' | 'en'
const storageKey = 'vne-language'
const eventName = 'vne-language-change'
const vocabulary = new Set(
  Object.entries(english)
    .filter(([source, translated]) => source !== translated)
    .flatMap(([source, translated]) => [source, translated])
    .map((text) => text.replace(/\s+/g, ' ').trim()),
)

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(eventName, callback)
    window.removeEventListener('storage', callback)
  }
}

let selected: Language | undefined
function getLanguage(): Language {
  try {
    return window.localStorage.getItem(storageKey) === 'en' ? 'en' : 'ru'
  } catch {
    return selected ?? 'ru'
  }
}

export function translate<T>(value: T, language: Language): T {
  if (language !== 'en' || typeof value !== 'string') return value
  const key = value.replace(/\s+/g, ' ').trim()
  const translation = english[key]
  return (translation === undefined ? value : value.replace(value.trim(), translation)) as T
}

export function useSiteLanguage() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => 'ru' as const)
  const t = useCallback(<T,>(value: T): T => translate(value, language), [language])
  return { language, t }
}

export function LanguageSync() {
  const { language } = useSiteLanguage()
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  return null
}

export function LanguageSwitch() {
  const { language } = useSiteLanguage()
  return (
    <div
      className={styles.switch}
      role="group"
      data-language-switch
      aria-label={language === 'ru' ? 'Язык сайта' : 'Site language'}
    >
      {(['ru', 'en'] as const).map((locale, index) => (
        <span key={locale}>
          {index > 0 && <span aria-hidden="true">/</span>}
          <button
            type="button"
            lang={locale}
            aria-label={locale === 'ru' ? 'Русский' : 'English'}
            aria-pressed={language === locale}
            onClick={() => {
              changeLanguageWithParticles(
                () => {
                  selected = locale
                  try {
                    window.localStorage.setItem(storageKey, locale)
                  } catch {
                    /* Session-only preference. */
                  }
                  window.dispatchEvent(new Event(eventName))
                },
                vocabulary,
                getLanguage() === locale,
              )
            }}
          >
            [{locale === 'ru' ? 'ru' : 'eng'}]
          </button>
        </span>
      ))}
    </div>
  )
}
