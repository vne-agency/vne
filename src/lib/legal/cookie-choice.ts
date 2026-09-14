import { LEGAL_VERSION } from './documents'

export const COOKIE_CHOICE_KEY = 'vne-cookie-choice'
export const COOKIE_CHOICE_EVENT = 'vne-cookie-choice-change'
export const COOKIE_SETTINGS_EVENT = 'vne-cookie-settings-open'
export type CookieChoice = {
  version: string
  analytics: boolean
  updatedAt: number
  expiresAt: number
}

export function parseCookieChoice(raw: string | null, now = Date.now()): CookieChoice | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (
      value?.version !== LEGAL_VERSION ||
      typeof value.analytics !== 'boolean' ||
      !Number.isFinite(value.updatedAt) ||
      !Number.isFinite(value.expiresAt) ||
      value.updatedAt > now ||
      value.expiresAt <= now ||
      value.expiresAt <= value.updatedAt
    )
      return null
    return value
  } catch {
    return null
  }
}

export function createCookieChoice(analytics: boolean, now = Date.now()): CookieChoice {
  const expiry = new Date(now)
  expiry.setUTCMonth(expiry.getUTCMonth() + 6)
  return { version: LEGAL_VERSION, analytics, updatedAt: now, expiresAt: expiry.getTime() }
}

let sessionChoice: CookieChoice | null = null
export function readCookieChoice(): CookieChoice | null {
  try {
    return parseCookieChoice(window.localStorage.getItem(COOKIE_CHOICE_KEY))
  } catch {
    return parseCookieChoice(JSON.stringify(sessionChoice))
  }
}
export function saveCookieChoice(analytics: boolean): CookieChoice {
  const choice = createCookieChoice(analytics)
  sessionChoice = choice
  try {
    window.localStorage.setItem(COOKIE_CHOICE_KEY, JSON.stringify(choice))
  } catch {
    /* Tab-only choice. */
  }
  window.dispatchEvent(new Event(COOKIE_CHOICE_EVENT))
  return choice
}

export function clearAnalyticsStorage() {
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (let i = storage.length - 1; i >= 0; i--) {
        const key = storage.key(i)
        if (key?.startsWith('_ym')) storage.removeItem(key)
      }
    }
  } catch {
    /* Browser storage may be disabled. */
  }
  const domains = window.location.hostname
    .split('.')
    .map((_, index, parts) => parts.slice(index).join('.'))
  for (const pair of document.cookie.split(';')) {
    const key = pair.split('=')[0].trim()
    if (!key.startsWith('_ym')) continue
    document.cookie = `${key}=; Max-Age=0; path=/`
    for (const domain of domains) document.cookie = `${key}=; Max-Age=0; path=/; domain=${domain}`
  }
}
