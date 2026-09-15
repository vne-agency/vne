import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { StartupLoader } from '@/components/ui/StartupLoader'

const constellation = vi.hoisted(() => ({
  assemble: vi.fn(() => () => undefined),
}))

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/components/ui/SiteLanguage', () => ({
  useSiteLanguage: () => ({ language: 'ru', t: (text: string) => text }),
}))
vi.mock('@/components/ui/startup-loader-scene', () => ({
  INTRO_DURATION: 5_600,
  loaderGroups: [],
  animateLoaderScene: () => () => undefined,
}))
vi.mock('@/components/ui/startup-constellation', () => ({
  assembleStartupConstellation: constellation.assemble,
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16),
  )
  vi.stubGlobal('cancelAnimationFrame', (timer: number) => window.clearTimeout(timer))
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      load: vi.fn().mockResolvedValue([]),
      ready: Promise.resolve(),
      status: 'loaded',
    },
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  delete document.documentElement.dataset.startupLoading
})

it('releases the page even when startup work never settles', async () => {
  render(
    <>
      <StartupLoader />
      <div id="site-content">
        <div data-startup-artwork data-renderer="webgl" />
        <div data-loader-logo />
      </div>
    </>,
  )

  await act(async () => {
    document.dispatchEvent(new Event('DOMContentLoaded'))
    await Promise.resolve()
    vi.advanceTimersByTime(6_000)
    await Promise.resolve()
  })

  expect(document.getElementById('site-content')?.inert).toBe(true)

  await act(async () => {
    vi.advanceTimersByTime(6_500)
    await Promise.resolve()
  })

  expect(document.querySelector('[data-startup-loader]')).toBeNull()
  expect(document.getElementById('site-content')?.inert).toBeFalsy()
  expect(document.documentElement.style.overflow).toBe('')
  expect(document.body.style.overflow).toBe('')
})
