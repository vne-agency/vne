import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { LanguageSwitch, translate, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { english } from '@/lib/i18n/english'
import { serviceExperiences } from '@/components/sections/service-experience-data'
import { faqQuestions } from '@/components/sections/faq-data'
import { fallbackCases } from '@/lib/cases/catalog'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('Orbit language selection', () => {
  it('covers every Russian service, FAQ and current case text', () => {
    function check(value: unknown) {
      if (typeof value === 'string' && /[а-яё]/i.test(value)) {
        expect(english[value.replace(/\s+/g, ' ').trim()], value).toBeTruthy()
      } else if (Array.isArray(value)) value.forEach(check)
      else if (value && typeof value === 'object') Object.values(value).forEach(check)
    }
    check(serviceExperiences)
    check(faqQuestions)
    check(fallbackCases)
  })

  it('updates mounted content, remembers the choice and switches back', () => {
    function Copy() {
      const { t } = useSiteLanguage()
      return <h1>{t('Наши услуги')}</h1>
    }
    const view = render(
      <>
        <LanguageSwitch />
        <Copy />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('heading').textContent).toBe('Our services')
    expect(window.localStorage.getItem('vne-language')).toBe('en')
    view.unmount()
    render(
      <>
        <LanguageSwitch />
        <Copy />
      </>,
    )
    expect(screen.getByRole('heading').textContent).toBe('Our services')
    fireEvent.click(screen.getByRole('button', { name: 'Русский' }))
    expect(screen.getByRole('heading').textContent).toBe('Наши услуги')
    act(() => {
      window.localStorage.setItem('vne-language', 'en')
      window.dispatchEvent(new StorageEvent('storage', { key: 'vne-language', newValue: 'en' }))
    })
    expect(screen.getByRole('heading').textContent).toBe('Our services')
  })

  it('preserves Russian copy, whitespace and unknown names', () => {
    expect(translate('Наши услуги', 'ru')).toBe('Наши услуги')
    expect(translate(' Наши услуги ', 'en')).toBe(' Our services ')
    expect(translate('ARC STORE', 'en')).toBe('ARC STORE')
    expect(translate(4, 'en')).toBe(4)
  })
})
