import { cleanup, fireEvent, render, screen, act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CaseWebsite } from '@/components/cases/CaseWebsite'
import { getCaseWebsiteUrl } from '@/lib/cases/catalog'

const props = {
  projectName: 'Test project',
  websiteUrl: 'https://example.com/',
  allowEmbed: true,
  preview: '/assets/cases/kotopes-preview.png',
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('case website viewer', () => {
  it('loads the iframe only after activation and removes it when the visitor finishes', () => {
    const { container } = render(<CaseWebsite {...props} />)
    expect(container.querySelector('iframe')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Исследовать сайт/ }))
    expect(screen.getByTitle('Интерактивный сайт Test project')).toHaveAttribute(
      'src',
      props.websiteUrl,
    )
    expect(screen.getByRole('button', { name: 'Завершить просмотр' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Завершить просмотр' }))
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('button', { name: /Исследовать сайт/ })).toBeVisible()
  })

  it('offers an external site for blocked embedding and does not create a broken iframe', () => {
    const { container } = render(<CaseWebsite {...props} allowEmbed={false} />)
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.queryByRole('button', { name: /Исследовать сайт/ })).toBeNull()
    expect(screen.getByRole('link', { name: /Перейти на сайт/ })).toHaveAttribute(
      'href',
      props.websiteUrl,
    )
    expect(screen.getByRole('link', { name: /Перейти на сайт/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })

  it('shows SOON with no misleading website action if the address is missing', () => {
    render(<CaseWebsite {...props} websiteUrl={undefined} />)
    expect(screen.getByText('SOON')).toBeVisible()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('runs the opt-in studio demo separately from the case website and restores focus on exit', async () => {
    const { container } = render(<CaseWebsite {...props} allowEmbed={false} showDemo />)
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('link', { name: /Перейти на сайт/ })).toHaveAttribute(
      'href',
      props.websiteUrl,
    )

    fireEvent.click(screen.getByRole('button', { name: /Попробовать демо/ }))
    const frame = screen.getByTitle('Интерактивное демо сайта ВНЕ')
    expect(frame).toHaveAttribute('src', '/preview/studio')
    expect(frame.parentElement).toHaveAttribute('data-lenis-prevent', 'true')
    expect(screen.getByText('ВНЕ · Демо')).toBeVisible()
    expect(screen.getByRole('link', { name: /Открыть демо/ })).toHaveAttribute(
      'href',
      '/preview/studio',
    )
    expect(screen.getByRole('button', { name: 'Завершить просмотр' })).toHaveFocus()

    fireEvent.load(frame)
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Завершить просмотр' }))
    expect(container.querySelector('iframe')).toBeNull()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Попробовать демо/ })).toHaveFocus(),
    )
    expect(screen.getByRole('link', { name: /Перейти на сайт/ })).toHaveAttribute(
      'href',
      props.websiteUrl,
    )
  })

  it('prefers an embeddable case website over the temporary demo', () => {
    render(<CaseWebsite {...props} showDemo />)
    expect(screen.queryByRole('button', { name: /Попробовать демо/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Исследовать сайт/ }))
    expect(screen.getByTitle('Интерактивный сайт Test project')).toHaveAttribute(
      'src',
      props.websiteUrl,
    )
  })

  it('lets Escape close the case from the demo, while respecting dialogs inside the site', () => {
    const cancel = vi.fn()
    render(
      <dialog open onCancel={cancel}>
        <CaseWebsite {...props} allowEmbed={false} showDemo />
      </dialog>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Попробовать демо/ }))
    const frame = screen.getByTitle('Интерактивное демо сайта ВНЕ') as HTMLIFrameElement
    const demoDocument = frame.contentDocument!
    demoDocument.open()
    demoDocument.write('<!doctype html><html><body></body></html>')
    demoDocument.close()
    fireEvent.load(frame)
    const innerDialog = demoDocument.createElement('dialog')
    innerDialog.setAttribute('open', '')
    demoDocument.body.append(innerDialog)
    fireEvent.keyDown(demoDocument, { key: 'Escape' })
    expect(cancel).not.toHaveBeenCalled()

    innerDialog.remove()
    fireEvent.keyDown(demoDocument, { key: 'Escape' })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('keeps an external escape route and allows retry after a slow load', () => {
    vi.useFakeTimers()
    render(<CaseWebsite {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /Исследовать сайт/ }))
    act(() => vi.advanceTimersByTime(12_000))
    expect(screen.getByText('Сайт отвечает дольше обычного')).toBeVisible()
    expect(screen.getByRole('link', { name: /Открыть сайт/ })).toHaveAttribute(
      'href',
      props.websiteUrl,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать ещё раз' }))
    expect(screen.getByText('Загружаем сайт…')).toBeVisible()
    fireEvent.load(screen.getByTitle('Интерактивный сайт Test project'))
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('case website URL', () => {
  it.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    'http://example.com',
    'https://user:password@example.com',
    '/relative',
    'invalid',
  ])('rejects unsafe or invalid address %s', (value) => {
    expect(getCaseWebsiteUrl(value)).toBeUndefined()
  })

  it('accepts the two supplied HTTPS sites', () => {
    expect(getCaseWebsiteUrl('https://arc-store.ru')).toBe('https://arc-store.ru/')
    expect(getCaseWebsiteUrl('https://kotopes-kzn.ru')).toBe('https://kotopes-kzn.ru/')
  })
})
