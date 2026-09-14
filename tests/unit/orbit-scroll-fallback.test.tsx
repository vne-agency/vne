import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OrbitScrollFallback } from '@/components/experiments/ascii-stars/OrbitScrollFallback'
import styles from '@/components/experiments/ascii-stars/OrbitScrollFallback.module.css'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
let intersect: IntersectionObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()
beforeEach(() => {
  vi.stubGlobal('CSS', { supports: () => false })
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback
      }
      observe = observe
      unobserve = vi.fn()
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 } as DOMRect)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
const Page = () => (
  <>
    <div id="site-content">
      <section data-closing-rule="both">
        <a href="#target" data-closing-copy="up">
          Read
        </a>
      </section>
    </div>
    <OrbitScrollFallback />
  </>
)

it('reveals unsupported-browser content once and removes enhancement on unmount', () => {
  const view = render(<Page />)
  const link = view.getByText('Read')
  const section = link.parentElement!
  expect(link.classList.contains(styles.copy)).toBe(true)
  expect(section.classList.contains(styles.rule)).toBe(true)
  expect(link.dataset.fallbackVisible).toBeUndefined()
  act(() =>
    intersect(
      [{ target: link, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    ),
  )
  expect(link.dataset.fallbackVisible).toBe('true')
  view.unmount()
  expect(link.classList.contains(styles.copy)).toBe(false)
  expect(disconnect).toHaveBeenCalled()
})
it('reveals content when reached by keyboard focus', () => {
  const view = render(<Page />)
  fireEvent.focusIn(view.getByText('Read'))
  expect(view.getByText('Read').dataset.fallbackVisible).toBe('true')
})
it('leaves supported browsers on their native animations', () => {
  vi.stubGlobal('CSS', { supports: () => true })
  const view = render(<Page />)
  expect(view.getByText('Read').classList.contains(styles.copy)).toBe(false)
  expect(observe).not.toHaveBeenCalled()
})
it('respects reduced motion without hiding content', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const view = render(<Page />)
  expect(view.getByText('Read').classList.contains(styles.copy)).toBe(false)
  expect(observe).not.toHaveBeenCalled()
})

it('enhances late dialog content and restores it after removal', async () => {
  render(<Page />)
  const dialog = document.createElement('dialog')
  const copy = document.createElement('p')
  copy.dataset.closingCopy = 'up'
  copy.textContent = 'Late dialog content'
  dialog.append(copy)
  act(() => document.getElementById('site-content')!.append(dialog))
  await waitFor(() => expect(copy.classList.contains(styles.copy)).toBe(true))
  act(() => dialog.remove())
  await waitFor(() => expect(copy.classList.contains(styles.copy)).toBe(false))
})
