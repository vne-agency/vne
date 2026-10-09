import { useRef } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useServiceEntrance } from '@/components/experiments/ascii-stars/useServiceEntrance'

let notify: IntersectionObserverCallback
const observe = vi.fn()
const unobserve = vi.fn()
const disconnect = vi.fn()
const reduced = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

function Fixture() {
  const ref = useRef<HTMLElement>(null)
  useServiceEntrance(ref)
  return (
    <>
      <section ref={ref}>
        <article data-service-row>
          <h3>Websites</h3>
          <a href="#service-details">Service details</a>
          <a href="#service-pricing">Pricing</a>
        </article>
        <div data-service-contact>
          <a href="#contact">Discuss a project</a>
        </div>
      </section>
      <button type="button">Outside services</button>
    </>
  )
}

function intersection(target: Element, isIntersecting: boolean, rect: DOMRect) {
  act(() =>
    notify(
      [
        {
          target,
          isIntersecting,
          boundingClientRect: rect,
          rootBounds: new DOMRect(0, 60, 1024, 640),
        },
      ] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    ),
  )
}

function setReducedMotion(matches: boolean) {
  const onPreference = reduced.addEventListener.mock.calls.find(([event]) => event === 'change')![1]
  act(() => {
    reduced.matches = matches
    onPreference()
  })
}

beforeEach(() => {
  reduced.matches = false
  vi.stubGlobal('CSS', { supports: () => false })
  vi.stubGlobal('innerWidth', 1024)
  vi.stubGlobal('innerHeight', 768)
  vi.stubGlobal('matchMedia', () => reduced)
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback
      }
      observe = observe
      unobserve = unobserve
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 3000, 400, 200),
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

it('leaves service content on native animations when scroll timelines and ranges are supported', () => {
  vi.stubGlobal('CSS', { supports: () => true })
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  expect(row.parentElement).not.toHaveAttribute('data-service-entrance')
  expect(row).not.toHaveAttribute('data-service-visible')
  expect(row).not.toHaveAttribute('data-service-instant')
  expect(row).not.toHaveAttribute('data-service-edge')
  expect(observe).not.toHaveBeenCalled()
  expect(reduced.addEventListener).not.toHaveBeenCalled()
})

it.each(['animation-timeline: view()', 'animation-range: contain 0% contain 120svh'])(
  'retains the fallback when only %s is supported',
  (supportedCapability) => {
    vi.stubGlobal('CSS', { supports: (capability: string) => capability === supportedCapability })
    const view = render(<Fixture />)
    const row = view.getByRole('article')
    expect(row.parentElement).toHaveAttribute('data-service-entrance', 'ready')
    expect(row).toHaveAttribute('data-service-visible', 'false')
    expect(observe).toHaveBeenCalledWith(row)
    intersection(row, true, new DOMRect(0, 80, 400, 200))
    expect(row).toHaveAttribute('data-service-visible', 'true')
  },
)

it('reveals on repeated entry and records whether an exited row is above or below the viewport', () => {
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  expect(row.dataset.serviceVisible).toBe('false')
  intersection(row, true, new DOMRect(0, 80, 400, 200))
  expect(row.dataset.serviceVisible).toBe('true')

  intersection(row, false, new DOMRect(0, -140, 400, 200))
  expect(row.dataset.serviceVisible).toBe('false')
  expect(row.dataset.serviceEdge).toBe('above')

  intersection(row, true, new DOMRect(0, 80, 400, 200))
  expect(row.dataset.serviceVisible).toBe('true')
  intersection(row, false, new DOMRect(0, 1000, 400, 200))
  expect(row.dataset.serviceVisible).toBe('false')
  expect(row.dataset.serviceEdge).toBe('below')
  intersection(row, true, new DOMRect(0, 80, 400, 200))
  expect(row.dataset.serviceVisible).toBe('true')
  expect(observe).toHaveBeenCalledWith(row)
  expect(unobserve).not.toHaveBeenCalled()
})

it.each([
  ['already visible', new DOMRect(0, 80, 400, 200), true],
  ['taller than the viewport', new DOMRect(0, -300, 400, 1500), true],
  ['entirely above', new DOMRect(0, -400, 400, 200), false],
  ['entirely below', new DOMRect(0, 3000, 400, 200), false],
  ['outside the left edge', new DOMRect(-600, 80, 400, 200), false],
  ['outside the right edge', new DOMRect(1500, 80, 400, 200), false],
])('initially handles a row %s and keeps observing it', (_, rect, visible) => {
  vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(rect)
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  expect(row.dataset.serviceVisible).toBe(String(visible))
  expect(observe).toHaveBeenCalledWith(row)
})

it('keeps keyboard-focused content readable until focus leaves that row', () => {
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  act(() => view.getByRole('link', { name: 'Service details' }).focus())
  expect(row.dataset.serviceVisible).toBe('true')
  expect(row.dataset.serviceInstant).toBe('true')

  intersection(row, false, new DOMRect(0, 3000, 400, 200))
  expect(row.dataset.serviceVisible).toBe('true')
  act(() => view.getByRole('link', { name: 'Pricing' }).focus())
  expect(row.dataset.serviceVisible).toBe('true')

  act(() => view.getByRole('button', { name: 'Outside services' }).focus())
  expect(row.dataset.serviceVisible).toBe('false')
  expect(row).not.toHaveAttribute('data-service-instant')
})

it('reveals pointer-interacted content immediately and resumes tracking on the next observation', () => {
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  fireEvent.pointerDown(view.getByRole('link', { name: 'Service details' }))
  expect(row.dataset.serviceVisible).toBe('true')
  expect(row.dataset.serviceInstant).toBe('true')
  expect(view.getByRole('link', { name: 'Discuss a project' }).parentElement).toHaveAttribute(
    'data-service-visible',
    'false',
  )
  intersection(row, false, new DOMRect(0, 3000, 400, 200))
  expect(row.dataset.serviceVisible).toBe('false')
  expect(row).not.toHaveAttribute('data-service-instant')
})

it('keeps all content visible with reduced motion while tracking later preference changes', () => {
  reduced.matches = true
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  const contact = view.getByRole('link', { name: 'Discuss a project' }).parentElement!
  expect(row.dataset.serviceVisible).toBe('true')
  expect(contact.dataset.serviceVisible).toBe('true')
  expect(observe).toHaveBeenCalledWith(row)
  expect(observe).toHaveBeenCalledWith(contact)

  intersection(row, true, new DOMRect(0, 80, 400, 200))
  intersection(contact, false, new DOMRect(0, 3000, 400, 200))
  expect(contact.dataset.serviceVisible).toBe('true')
  setReducedMotion(false)
  expect(row.dataset.serviceVisible).toBe('true')
  expect(contact.dataset.serviceVisible).toBe('false')
})

it('reveals all rows when reduced motion is enabled and restores latest visibility when disabled', () => {
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  const contact = view.getByRole('link', { name: 'Discuss a project' }).parentElement!
  setReducedMotion(true)
  expect(row.dataset.serviceVisible).toBe('true')
  expect(contact.dataset.serviceVisible).toBe('true')
  intersection(row, false, new DOMRect(0, -400, 400, 200))
  intersection(contact, true, new DOMRect(0, 80, 400, 200))
  expect(row.dataset.serviceVisible).toBe('true')
  setReducedMotion(false)
  expect(row.dataset.serviceVisible).toBe('false')
  expect(contact.dataset.serviceVisible).toBe('true')
})

it('removes observers, listeners and enhancement state on unmount', () => {
  const view = render(<Fixture />)
  const row = view.getByRole('article')
  const section = row.parentElement!
  const removeListener = vi.spyOn(section, 'removeEventListener')
  intersection(row, false, new DOMRect(0, -400, 400, 200))
  fireEvent.pointerDown(view.getByRole('link', { name: 'Service details' }))
  view.unmount()
  expect(disconnect).toHaveBeenCalledOnce()
  expect(removeListener).toHaveBeenCalledWith('focusin', expect.any(Function))
  expect(removeListener).toHaveBeenCalledWith('focusout', expect.any(Function))
  expect(removeListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
  expect(reduced.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  expect(section).not.toHaveAttribute('data-service-entrance')
  expect(row).not.toHaveAttribute('data-service-visible')
  expect(row).not.toHaveAttribute('data-service-instant')
  expect(row).not.toHaveAttribute('data-service-edge')
})

it('leaves static content unhidden when IntersectionObserver is unavailable', () => {
  Reflect.deleteProperty(window, 'IntersectionObserver')
  const view = render(<Fixture />)
  expect(view.getByRole('article').parentElement).not.toHaveAttribute('data-service-entrance')
  expect(view.getByRole('article')).not.toHaveAttribute('data-service-visible')
})
