import { afterEach, describe, expect, it } from 'vitest'
import {
  COOKIE_CHOICE_KEY,
  clearAnalyticsStorage,
  createCookieChoice,
  parseCookieChoice,
  readCookieChoice,
  saveCookieChoice,
} from '@/lib/legal/cookie-choice'
import { leadConsentEvidence } from '@/lib/legal/consent-evidence'
import { LEGAL_VERSION } from '@/lib/legal/documents'

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('analytics consent', () => {
  it('defaults to no permission and rejects expired, corrupt or stale consent', () => {
    const now = Date.UTC(2026, 8, 12)
    const choice = createCookieChoice(true, now)
    expect(parseCookieChoice(null, now)).toBeNull()
    expect(parseCookieChoice('{', now)).toBeNull()
    expect(parseCookieChoice(JSON.stringify({ ...choice, version: 'old' }), now)).toBeNull()
    expect(parseCookieChoice(JSON.stringify({ ...choice, analytics: 'true' }), now)).toBeNull()
    expect(parseCookieChoice(JSON.stringify(choice), choice.expiresAt)).toBeNull()
    expect(parseCookieChoice(JSON.stringify(choice), now - 1)).toBeNull()
  })
  it('remembers refusal independently from the language choice', () => {
    localStorage.setItem('vne-language', 'en')
    saveCookieChoice(false)
    expect(readCookieChoice()?.analytics).toBe(false)
    expect(localStorage.getItem('vne-language')).toBe('en')
    expect(JSON.parse(localStorage.getItem(COOKIE_CHOICE_KEY)!).version).toBe(LEGAL_VERSION)
  })
  it('withdrawal removes analytics records but preserves functional choices', () => {
    saveCookieChoice(true)
    localStorage.setItem('_ym_uid', 'visitor')
    sessionStorage.setItem('_ym_debugger_state', 'debug')
    localStorage.setItem('vne-language', 'ru')
    document.cookie = '_ym_uid=visitor; path=/'
    saveCookieChoice(false)
    clearAnalyticsStorage()
    expect(localStorage.getItem('_ym_uid')).toBeNull()
    expect(sessionStorage.getItem('_ym_debugger_state')).toBeNull()
    expect(document.cookie).not.toContain('_ym_uid=')
    expect(localStorage.getItem('vne-language')).toBe('ru')
    expect(readCookieChoice()?.analytics).toBe(false)
  })
  it('stores the server version and full consent document as evidence', () => {
    const evidence = leadConsentEvidence(new Date('2026-09-12T12:00:00Z'))
    expect(evidence.recordedAt).toBe('2026-09-12T12:00:00.000Z')
    expect(evidence.version).toBe(LEGAL_VERSION)
    expect(evidence.document.slug).toBe('consent')
    expect(evidence.document.sections.length).toBeGreaterThan(0)
  })
})
