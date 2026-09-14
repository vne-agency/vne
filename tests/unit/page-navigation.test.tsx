import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PageNavigationTransition } from '@/components/ui/PageNavigationTransition'

const state = vi.hoisted(() => ({
  pathname: '/',
  router: { push: vi.fn(), prefetch: vi.fn() },
  commit: undefined as (() => Promise<void>) | undefined,
  cancel: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => state.router,
  usePathname: () => state.pathname,
}))
vi.mock('lenis/react', () => ({ useLenis: () => undefined }))
vi.mock('@/components/ui/section-particles', () => ({
  changeSectionWithParticles: (commit: () => Promise<void>) => {
    state.commit = commit
    return state.cancel
  },
}))
beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  state.pathname = '/'
  state.commit = undefined
  history.replaceState({}, '', '/')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('waits for the route render before finishing the transition', async () => {
  const view = render(
    <>
      <PageNavigationTransition />
      {/* Plain anchor intentionally exercises the global navigation interceptor. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/privacy">Privacy</a>
      <main>Page</main>
    </>,
  )
  fireEvent.click(view.getByText('Privacy'))
  expect(state.router.push).not.toHaveBeenCalled()
  let ready = false
  const completion = state.commit!().then(() => {
    ready = true
  })
  expect(state.router.push).toHaveBeenCalledWith('/privacy', { scroll: false })
  expect(ready).toBe(false)
  state.pathname = '/privacy'
  view.rerender(
    <>
      <PageNavigationTransition />
      <main>Privacy page</main>
    </>,
  )
  await act(async () => {
    vi.advanceTimersByTime(30)
    await completion
  })
  expect(ready).toBe(true)
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
})

it.each([
  { href: '/cases/demo', popup: 'dialog', ctrl: false },
  { href: '/privacy', popup: undefined, ctrl: true },
  { href: '#contact', popup: undefined, ctrl: false },
  { href: 'https://example.com/privacy', popup: undefined, ctrl: false },
  { href: '/api/file', popup: undefined, ctrl: false },
])('preserves native or modal navigation for $href', ({ href, popup, ctrl }) => {
  const view = render(
    <>
      <PageNavigationTransition />
      <a href={href} aria-haspopup={popup as 'dialog' | undefined}>
        Link
      </a>
    </>,
  )
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: ctrl })
  view.getByText('Link').dispatchEvent(event)
  expect(state.commit).toBeUndefined()
  expect(event.defaultPrevented).toBe(false)
})
