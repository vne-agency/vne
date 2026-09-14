import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SectionNavigationTransition } from '@/components/ui/SectionNavigationTransition'
import { sectionDestination } from '@/components/ui/section-destination'

const transition = vi.hoisted(() => ({
  pathname: '/',
  commit: undefined as (() => void) | undefined,
  complete: undefined as (() => void) | undefined,
  cancel: vi.fn(),
}))
vi.mock('lenis/react', () => ({ useLenis: () => undefined }))
vi.mock('next/navigation', () => ({ usePathname: () => transition.pathname }))
vi.mock('@/components/ui/section-particles', () => ({
  changeSectionWithParticles: (commit: () => void, complete: () => void) => {
    transition.commit = commit
    transition.complete = complete
    return transition.cancel
  },
}))

beforeEach(() => {
  history.replaceState({}, '', '/')
  transition.pathname = '/'
  transition.commit = undefined
  transition.complete = undefined
  transition.cancel.mockClear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function fixture() {
  document.body.innerHTML =
    '<a href="#contact">Contact</a><section id="contact">Contact section</section>'
  const section = document.getElementById('contact')!
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({ top: 6000 } as DOMRect)
  const view = render(<SectionNavigationTransition />)
  return { view, section, link: document.querySelector('a')! }
}

describe('section navigation', () => {
  it('preserves offer-selection callbacks on pricing pages', () => {
    transition.pathname = '/pricing'
    const { link } = fixture()
    const selectOffer = vi.fn((event: Event) => event.preventDefault())
    link.addEventListener('click', selectOffer)
    fireEvent.click(link)
    expect(selectOffer).toHaveBeenCalledOnce()
    expect(transition.commit).toBeUndefined()
  })

  it('changes position only during the hidden commit and transfers focus on arrival', () => {
    const { link, section } = fixture()
    fireEvent.click(link)
    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(location.hash).toBe('')
    transition.commit!()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 6000, behavior: 'instant' })
    expect(location.hash).toBe('#contact')
    transition.complete!()
    expect(document.activeElement).toBe(section)
    fireEvent.blur(section)
    expect(section.hasAttribute('tabindex')).toBe(false)
  })

  it('lets the menu close at window capture but prevents competing document scrolling', () => {
    const { link } = fixture()
    const closeMenu = vi.fn()
    const oldScroll = vi.fn()
    window.addEventListener('click', closeMenu, true)
    document.addEventListener('click', oldScroll, true)
    fireEvent.click(link)
    expect(closeMenu).toHaveBeenCalledOnce()
    expect(oldScroll).not.toHaveBeenCalled()
    window.removeEventListener('click', closeMenu, true)
    document.removeEventListener('click', oldScroll, true)
  })

  it('preserves modified and new-tab links', () => {
    const { link } = fixture()
    fireEvent.click(link, { ctrlKey: true })
    expect(transition.commit).toBeUndefined()
    link.target = '_blank'
    fireEvent.click(link)
    expect(transition.commit).toBeUndefined()
  })

  it('cancels a pending destination on the next choice and on unmount', () => {
    const { link, view } = fixture()
    fireEvent.click(link)
    fireEvent.click(link)
    expect(transition.cancel).toHaveBeenCalledOnce()
    view.unmount()
    expect(transition.cancel).toHaveBeenCalledTimes(2)
  })

  it('resolves FAQ against the horizontal panel pin and keeps the service arrival marker', () => {
    document.body.innerHTML =
      '<div data-services-transition style="--services-horizontal: 1"><div data-services-outgoing><section id="faq"></section></div><div id="services"></div><section id="services-content"></section></div>'
    const root = document.querySelector<HTMLElement>('[data-services-transition]')!
    const outgoing = root.querySelector<HTMLElement>('[data-services-outgoing]')!
    const faq = document.getElementById('faq')!
    const services = document.getElementById('services')!
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ top: -1500 } as DOMRect)
    vi.spyOn(outgoing, 'getBoundingClientRect').mockReturnValue({
      top: -1000,
      height: 3000,
    } as DOMRect)
    vi.spyOn(faq, 'getBoundingClientRect').mockReturnValue({ top: 1600 } as DOMRect)
    vi.spyOn(services, 'getBoundingClientRect').mockReturnValue({ top: 2500 } as DOMRect)
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(4000)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900)
    expect(sectionDestination('#faq')?.top).toBe(4600)
    expect(sectionDestination('#services')?.top).toBe(6500)
    expect(sectionDestination('#services')?.section.id).toBe('services-content')
  })
})
