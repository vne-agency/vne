import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LeadForm } from '@/components/sections/LeadForm'
import { turnkeyOffer } from '@/lib/services/turnkey'
import type { LeadFormState } from '@/features/leads/submit-lead-action'

const { submit } = vi.hoisted(() => ({ submit: vi.fn() }))
vi.mock('@/features/leads/submit-lead-action', () => ({ submitLeadAction: submit }))
vi.mock('@/components/ui/SiteLanguage', () => ({
  useSiteLanguage: () => ({ language: 'ru', t: (value: string) => value }),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('blocks repeated submits while pending and replaces the form with focused success', async () => {
  let finish!: (value: LeadFormState) => void
  submit.mockImplementation(
    () =>
      new Promise<LeadFormState>((resolve) => {
        finish = resolve
      }),
  )
  const { container } = render(
    <LeadForm variant="orbit" fixedOffer={turnkeyOffer.id} pagePath={turnkeyOffer.path} />,
  )
  expect(screen.queryByRole('combobox')).toBeNull()
  expect(screen.queryByLabelText('Ориентир по бюджету — необязательно')).toBeNull()
  const form = container.querySelector('form')!
  fireEvent.change(screen.getByLabelText('Как к вам обращаться'), { target: { value: 'Проверка' } })
  fireEvent.change(screen.getByLabelText('Телефон'), { target: { value: '89991234567' } })
  fireEvent.change(screen.getByLabelText('Что нужно сделать?'), {
    target: { value: 'Нужен сайт для моей услуги' },
  })
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.submit(form)
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
  expect(screen.getByRole('button', { name: 'Отправляем…' })).toBeDisabled()
  fireEvent.submit(form)
  expect(submit).toHaveBeenCalledTimes(1)
  await act(async () => finish({ status: 'success', message: 'Готово' }))
  expect(await screen.findByRole('status')).toHaveFocus()
  expect(screen.queryByRole('button', { name: 'Отправить заявку' })).toBeNull()
})

it('announces errors, focuses the invalid field and allows a corrected retry', async () => {
  submit.mockResolvedValueOnce({
    status: 'error',
    message: 'Проверьте обязательные поля.',
    fieldErrors: { message: ['Опишите задачу: не менее 5 символов.'] },
  })
  submit.mockResolvedValueOnce({ status: 'success', message: 'Готово' })
  const { container } = render(
    <LeadForm fixedOffer={turnkeyOffer.id} pagePath={turnkeyOffer.path} />,
  )
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('Проверьте обязательные поля.')
  expect(screen.getByLabelText('Что нужно сделать?')).toHaveFocus()
  expect(screen.getByLabelText('Что нужно сделать?')).toHaveAttribute('aria-invalid', 'true')
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('status')).toBeInTheDocument()
  expect(submit).toHaveBeenCalledTimes(2)
})
