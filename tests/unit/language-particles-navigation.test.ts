import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  cancelLanguageParticles,
  changeLanguageWithParticles,
} from '@/components/ui/language-particles'

beforeEach(() => {
  document.body.innerHTML = `<main>
    <a id="hero" data-language-particle-text>[работы]</a>
    <nav data-floating-navigation><span id="floating" data-language-particle-text>[02 работы]</span></nav>
    <nav aria-hidden="true"><span id="hidden" data-language-particle-text>[03 услуги]</span></nav>
    <p id="brand">ARC STORE</p>
  </main>`
  vi.stubGlobal('innerWidth', 100)
  vi.stubGlobal('innerHeight', 100)
  vi.stubGlobal('CanvasRenderingContext2D', class {})
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  )
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  const rect = new DOMRect(10, 10, 60, 20)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    visibility: 'visible',
    display: 'block',
    opacity: '1',
    overflowX: 'visible',
    overflowY: 'visible',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '16px',
    fontFamily: 'monospace',
    color: '#222',
  } as CSSStyleDeclaration)
  vi.spyOn(document, 'createRange').mockReturnValue({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    getBoundingClientRect: () => rect,
  } as unknown as Range)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    save: vi.fn(),
    restore: vi.fn(),
    fillText: vi.fn(),
    measureText: () => ({ fontBoundingBoxAscent: 12, fontBoundingBoxDescent: 4 }),
    getImageData: () => ({ data: new Uint8ClampedArray(100 * 100 * 4) }),
  } as unknown as CanvasRenderingContext2D)
})

afterEach(() => {
  cancelLanguageParticles()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('animates explicitly translated navigation outside the dictionary, excluding hidden and unchanged text', () => {
  const commit = vi.fn()
  changeLanguageWithParticles(commit, new Set(['Наш подход', 'Our approach']), false)
  expect(commit).not.toHaveBeenCalled()
  expect(document.querySelector('#hero')?.hasAttribute('data-language-ink-hidden')).toBe(true)
  expect(document.querySelector('#floating')?.hasAttribute('data-language-ink-hidden')).toBe(true)
  expect(document.querySelector('#hidden')?.hasAttribute('data-language-ink-hidden')).toBe(false)
  expect(document.querySelector('#brand')?.hasAttribute('data-language-ink-hidden')).toBe(false)
  expect(document.querySelector('[data-language-particles]')).not.toBeNull()
  cancelLanguageParticles()
  expect(commit).toHaveBeenCalledOnce()
  expect(document.querySelector('[data-language-ink-hidden], [data-language-particles]')).toBeNull()
})

it('commits without masks when reduced motion is enabled', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const commit = vi.fn()
  changeLanguageWithParticles(commit, new Set(), false)
  expect(commit).toHaveBeenCalledOnce()
  expect(document.querySelector('[data-language-ink-hidden], [data-language-particles]')).toBeNull()
})
