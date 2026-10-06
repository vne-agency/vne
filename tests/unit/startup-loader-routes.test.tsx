import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { StartupLoader } from '@/components/ui/StartupLoader'

const route = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }))
vi.mock('@/components/ui/SiteLanguage', () => ({
  useSiteLanguage: () => ({ language: 'ru', t: (value: string) => value }),
}))

describe('entry-page content access', () => {
  it.each([
    '/services/web',
    '/services/sayt-pod-klyuch',
    '/cases/kotopes',
    '/pricing',
    '/lab/ascii-dither',
  ])('does not block %s with the home introduction', (pathname) => {
    route.pathname = pathname
    expect(renderToStaticMarkup(<StartupLoader />)).toBe('')
  })
  it('retains the home introduction while excluding decorative text from snippets', () => {
    route.pathname = '/'
    const markup = renderToStaticMarkup(<StartupLoader />)
    expect(markup).toContain('data-startup-loader')
    expect(markup).toContain('data-nosnippet')
  })
})
