import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { LeadForm } from '@/components/sections/LeadForm'

const scriptCallbacks = vi.hoisted(() => ({
  onError: undefined as undefined | (() => void),
}))

type MockScriptProps = React.ScriptHTMLAttributes<HTMLScriptElement> & {
  onReady?: () => void
}

vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))
vi.mock('next/script', () => ({
  default: ({ onReady, onError, ...props }: MockScriptProps) => {
    void onReady
    scriptCallbacks.onError = () => onError?.({} as React.SyntheticEvent<HTMLScriptElement>)
    return <script {...props} />
  },
}))
vi.mock('@/components/ui/SiteLanguage', () => ({
  useSiteLanguage: () => ({ language: 'ru', t: (text: string) => text }),
}))
vi.mock('@/features/leads/submit-lead-action', () => ({
  submitLeadAction: async () => ({ status: 'idle', message: '' }),
}))

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key')
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        void callback
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  scriptCallbacks.onError = undefined
})

it('does not request Turnstile until the form is approached or focused', () => {
  render(<LeadForm />)

  expect(document.querySelector('script[src*="challenges.cloudflare.com"]')).toBeNull()
  expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeDisabled()

  fireEvent.focusIn(screen.getByLabelText('Как к вам обращаться'))

  expect(document.querySelector('script[src*="challenges.cloudflare.com"]')).not.toBeNull()

  act(() => {
    ;(window as Window & { vneTurnstileReady?: () => void }).vneTurnstileReady?.()
  })

  expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeEnabled()
})

it('announces a recoverable error when the Turnstile script cannot load', () => {
  render(<LeadForm />)

  fireEvent.focusIn(screen.getByLabelText('Как к вам обращаться'))
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="challenges.cloudflare.com"]',
  )
  expect(script).not.toBeNull()

  act(() => scriptCallbacks.onError?.())

  expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить защиту формы')
  expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeDisabled()
})
