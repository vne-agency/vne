import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CookieConsent } from '@/components/legal/CookieConsent'
import { COOKIE_CHOICE_EVENT, saveCookieChoice } from '@/lib/legal/cookie-choice'

vi.mock('next/navigation', () => ({ usePathname: () => '/privacy' }))
vi.mock('@/components/ui/SiteLanguage', () => ({ useSiteLanguage: () => ({ language: 'ru' }) }))

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('does not load analytics before consent, initializes after consent and destroys on withdrawal', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true })),
  )
  vi.stubEnv('NEXT_PUBLIC_YANDEX_METRIKA_ID', '123456')
  render(<CookieConsent />)
  await screen.findByRole('heading', { name: '.cookie-policy' })
  expect(document.querySelector('[data-vne-analytics]')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Отклонить аналитику' }))
  await waitFor(() => expect(screen.queryByRole('heading', { name: '.cookie-policy' })).toBeNull())
  expect(document.querySelector('[data-vne-analytics]')).toBeNull()
  act(() => {
    saveCookieChoice(true)
  })
  const script = await waitFor(() => {
    const element = document.querySelector<HTMLScriptElement>('[data-vne-analytics]')
    expect(element).not.toBeNull()
    return element!
  })
  const ym = vi.fn()
  Object.assign(window, { ym })
  act(() => {
    fireEvent.load(script)
  })
  expect(ym).toHaveBeenCalledWith(
    123456,
    'init',
    expect.objectContaining({ webvisor: false, defer: true }),
  )
  expect(ym).toHaveBeenCalledWith(
    123456,
    'hit',
    expect.not.stringContaining('?'),
    expect.any(Object),
  )
  act(() => {
    saveCookieChoice(false)
    window.dispatchEvent(new Event(COOKIE_CHOICE_EVENT))
  })
  expect(ym).toHaveBeenCalledWith(123456, 'destruct')
  expect(document.querySelector('[data-vne-analytics]')).toBeNull()
})
