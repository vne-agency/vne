import { act, cleanup, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OrbitCases } from '@/components/experiments/ascii-stars/OrbitCases'
import { OrbitServiceDetail } from '@/components/experiments/ascii-stars/OrbitServiceDetail'
import { OrbitServices } from '@/components/experiments/ascii-stars/OrbitServices'
import { fallbackCases } from '@/lib/cases/catalog'
import { serviceExperiences } from '@/lib/services/catalog'

vi.mock('next/dynamic', () => ({
  default: () =>
    function DetailDialog() {
      return <div role="dialog">Details</div>
    },
}))
vi.mock('lenis/react', () => ({ useLenis: () => undefined }))
vi.mock('motion/react', () => ({ useReducedMotion: () => true }))
vi.mock('@/components/experiments/ascii-stars/AsciiCaseInterface', () => ({
  AsciiCaseInterface: () => null,
}))
vi.mock('@/components/experiments/ascii-stars/AsciiStarsCanvas', () => ({
  AsciiStarsCanvas: () => null,
}))
vi.mock('@/components/experiments/ascii-stars/useCaseArtworkTransfer', () => ({
  captureCaseArtwork: () => undefined,
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// Observe the React handler, then prevent jsdom from attempting a real navigation.
function clickLink(link: HTMLElement, options: MouseEventInit = {}) {
  let preventedByComponent = false
  const observe = (event: MouseEvent) => {
    preventedByComponent = event.defaultPrevented
    event.preventDefault()
  }
  document.addEventListener('click', observe, { once: true })
  act(() => {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...options }))
  })
  return preventedByComponent
}

describe('crawlable service and case links', () => {
  const surfaces = [
    {
      name: 'service',
      render: () => render(<OrbitServices />),
      link: () => screen.getByRole('link', { name: 'Подробнее: Сайты, дизайн и приложения' }),
      href: '/services/web',
    },
    {
      name: 'case details desktop',
      render: () => render(<OrbitCases items={fallbackCases} />),
      // jsdom does not apply the media queries that hide the other layout.
      link: () => screen.getAllByRole('link', { name: 'Подробнее о проекте КОТОПЕС' })[0],
      href: '/cases/kotopes',
    },
    {
      name: 'case details mobile',
      render: () => render(<OrbitCases items={fallbackCases} />),
      link: () => screen.getAllByRole('link', { name: 'Подробнее о проекте КОТОПЕС' })[1],
      href: '/cases/kotopes',
    },
    {
      name: 'case preview',
      render: () => render(<OrbitCases items={fallbackCases} />),
      link: () => screen.getByRole('link', { name: 'Смотреть кейс КОТОПЕС' }),
      href: '/cases/kotopes',
    },
  ]

  for (const surface of surfaces) {
    it(`${surface.name} keeps its real URL and opens the existing dialog on a plain click`, () => {
      surface.render()
      expect(surface.link()).toHaveAttribute('href', surface.href)
      expect(clickLink(surface.link())).toBe(true)
      expect(screen.getByRole('dialog')).toBeVisible()
    })

    it.each([
      ['Control', { ctrlKey: true }],
      ['Command', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['middle button', { button: 1 }],
    ])(`${surface.name} leaves %s navigation to the browser`, (_name, options) => {
      surface.render()
      expect(clickLink(surface.link(), options as MouseEventInit)).toBe(false)
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  }
})

describe('service page server content', () => {
  it.each(serviceExperiences)(
    'renders the complete $id service with a page heading and links',
    (service) => {
      const document = new DOMParser().parseFromString(
        renderToStaticMarkup(<OrbitServiceDetail service={service} />),
        'text/html',
      )
      expect(document.querySelectorAll('h1')).toHaveLength(1)
      expect(document.querySelector('h1')?.textContent).toBe(service.title)
      expect(document.querySelectorAll('h2')).toHaveLength(3)
      expect(document.querySelector(`#service-prices-${service.id}`)?.textContent).toBe(
        'Форматы и цены',
      )
      expect(document.querySelector(`a[href="/pricing#${service.id}"]`)).not.toBeNull()
      expect(document.querySelectorAll('h3')).toHaveLength(service.steps.length)
      expect(document.querySelector('a[href="/#services"]')).not.toBeNull()
      expect(document.querySelector('a[href="/#contact-form"]')).not.toBeNull()
      expect(document.querySelector('a[href="mailto:vne.agency@internet.ru"]')).not.toBeNull()
      const content = document.body.textContent ?? ''
      for (const text of [service.description, service.outcome, ...service.items]) {
        expect(content).toContain(text)
      }
      for (const step of service.steps) {
        for (const text of [step.title, step.description, ...(step.items ?? [])]) {
          expect(content).toContain(text)
        }
        if (step.deliverable) expect(content).toContain(step.deliverable)
      }
    },
  )
})
