import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LEGAL_VERSION } from '@/lib/legal/documents'
import { formatLeadMessage } from '@/features/telegram/notify-managers'

const { save } = vi.hoisted(() => ({ save: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ create: save }) }))
vi.mock('@/features/leads/verify-turnstile', () => ({ verifyTurnstile: async () => true }))

import { submitLeadAction } from '@/features/leads/submit-lead-action'

function enquiry(extra: Record<string, string | undefined> = {}) {
  const form = new FormData()
  Object.entries({
    name: 'Тест',
    phone: '+7 (999) 123-45-67',
    message: 'Нужна страница услуги',
    consent: 'on',
    consentVersion: LEGAL_VERSION,
    ...extra,
  }).forEach(([key, value]) => {
    if (value !== undefined) form.set(key, value)
  })
  return form
}

beforeEach(() => {
  save.mockReset()
  save.mockResolvedValue({ id: 1 })
})

describe('Pricing enquiry through validation and persistence', () => {
  it('saves the selected offer and free-text budget in the message used by manager notifications', async () => {
    const result = await submitLeadAction(
      { status: 'idle', message: '' },
      enquiry({ service: 'compact', budget: ' до 20 000 ₽ <обсудим> ', pagePath: '/pricing' }),
    )
    expect(result.status).toBe('success')
    const saved = save.mock.calls[0][0].data
    expect(saved.message).toContain('Услуга: Компактный запуск')
    expect(saved.message).toContain('Ориентир по бюджету: до 20 000 ₽ <обсудим>')
    expect(saved.message).toContain('Нужна страница услуги')
    expect(new URL(saved.pageUrl).pathname).toBe('/pricing')
    expect(formatLeadMessage({ id: 1, ...saved })).toContain('&lt;обсудим&gt;')
  })

  it('accepts an omitted budget and service without inventing a zero budget', async () => {
    expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry())).status).toBe(
      'success',
    )
    expect(save.mock.calls[0][0].data.message).toBe('Нужна страница услуги')
  })

  it('accepts an undecided budget and bounds the request origin', async () => {
    await submitLeadAction(
      { status: 'idle', message: '' },
      enquiry({ budget: 'Нужна помощь с оценкой', pagePath: 'https://example.com' }),
    )
    expect(save.mock.calls[0][0].data.message).toContain('Нужна помощь с оценкой')
    expect(new URL(save.mock.calls[0][0].data.pageUrl).pathname).toBe('/')
  })

  it.each([{ budget: 'a'.repeat(121) }, { service: 'unknown' }, { message: 'нет' }])(
    'rejects invalid enquiry fields before persistence: %j',
    async (extra) => {
      expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry(extra))).status).toBe(
        'error',
      )
      expect(save).not.toHaveBeenCalled()
    },
  )

  it('keeps the existing consent check', async () => {
    expect(
      (await submitLeadAction({ status: 'idle', message: '' }, enquiry({ consentVersion: 'old' })))
        .status,
    ).toBe('error')
    expect(save).not.toHaveBeenCalled()
  })
})
