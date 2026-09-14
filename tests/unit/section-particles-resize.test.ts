import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { changeSectionWithParticles } from '@/components/ui/section-particles'

vi.mock('@/components/ui/language-particles', () => ({
  cancelLanguageParticles: vi.fn(),
  drawTextParticles: vi.fn(),
  captureTextParticles: (scope: HTMLElement) => ({ parents: [scope], image: { particles: [] } }),
}))
const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate')
beforeEach(() => {
  document.body.innerHTML = '<div id="site-content"><main>Content</main></div>'
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.stubGlobal('CanvasRenderingContext2D', class {})
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  )
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as CanvasRenderingContext2D,
  )
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: vi.fn(() => ({ cancel: vi.fn() })),
  })
})
afterEach(() => {
  document.body.replaceChildren()
  if (originalAnimate) Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate)
  else Reflect.deleteProperty(HTMLElement.prototype, 'animate')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('completes the chosen navigation on rotation and releases every mask', () => {
  const commit = vi.fn(),
    done = vi.fn()
  changeSectionWithParticles(commit, done)
  expect(commit).not.toHaveBeenCalled()
  expect(document.querySelector('[data-language-ink-hidden]')).not.toBeNull()
  window.dispatchEvent(new Event('resize'))
  window.dispatchEvent(new Event('resize'))
  expect(commit).toHaveBeenCalledTimes(1)
  expect(done).toHaveBeenCalledTimes(1)
  expect(document.querySelector('[data-language-ink-hidden], [data-section-particles]')).toBeNull()
  expect(document.documentElement.dataset.sectionTransition).toBeUndefined()
})
it('still waits for an asynchronous route commit after rotation', async () => {
  let ready!: () => void
  const work = new Promise<void>((resolve) => {
    ready = resolve
  })
  const done = vi.fn()
  changeSectionWithParticles(() => work, done)
  window.dispatchEvent(new Event('resize'))
  expect(done).not.toHaveBeenCalled()
  ready()
  await work
  expect(done).toHaveBeenCalledTimes(1)
})
