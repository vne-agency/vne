import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LEGAL_VERSION } from '@/lib/legal/documents'
import { turnkeyOffer } from '@/lib/services/turnkey'
import { formatLeadMessage } from '@/features/telegram/notify-managers'

const { save, verify } = vi.hoisted(() => ({ save: vi.fn(), verify: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ create: save }) }))
vi.mock('@/features/leads/verify-turnstile', () => ({ verifyTurnstile: verify }))
import { submitLeadAction } from '@/features/leads/submit-lead-action'

function enquiry(extra: Record<string, string | undefined> = {}) {
  const form = new FormData()
  Object.entries({
    name: 'Проверка',
    phone: '+7 (999) 123-45-67',
    message: 'Идея <сайта> без готового ТЗ',
    service: turnkeyOffer.id,
    pagePath: turnkeyOffer.path,
    consent: 'on',
    consentVersion: LEGAL_VERSION,
    ...extra,
  }).forEach(([key, value]) => {
    if (value !== undefined) form.set(key, value)
  })
  return form
}

beforeEach(() => {
  vi.clearAllMocks()
  save.mockResolvedValue({ id: 1 })
  verify.mockResolvedValue(true)
})

describe('Turnkey package enquiry (mock persistence, no real notifications)', () => {
  it('preserves the fixed package, brief and route in the existing notification pipeline', async () => {
    expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry())).status).toBe(
      'success',
    )
    expect(save).toHaveBeenCalledTimes(1)
    const record = save.mock.calls[0][0].data
    expect(record.message).toContain('Сайт под ключ за 11 999 ₽')
    expect(record.message).toContain('Идея <сайта> без готового ТЗ')
    expect(new URL(record.pageUrl).pathname).toBe(turnkeyOffer.path)
    expect(formatLeadMessage({ id: 1, ...record })).toContain('&lt;сайта&gt;')
  })
  it.each([{ phone: '123' }, { message: 'нет' }, { consent: '' }, { service: 'invented' }])(
    'rejects invalid data before persistence: %j',
    async (extra) => {
      expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry(extra))).status).toBe(
        'error',
      )
      expect(save).not.toHaveBeenCalled()
    },
  )
  it('rejects an unverified challenge and reports failure without saving', async () => {
    verify.mockResolvedValue(false)
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry())).status).toBe(
      'error',
    )
    expect(save).not.toHaveBeenCalled()
    log.mockRestore()
  })
  it('reports a storage failure so the visitor can retry', async () => {
    save.mockRejectedValueOnce(new Error('Test-only database failure'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await submitLeadAction({ status: 'idle', message: '' }, enquiry())).status).toBe(
      'error',
    )
    expect((await submitLeadAction({ status: 'error', message: '' }, enquiry())).status).toBe(
      'success',
    )
    log.mockRestore()
  })
})
