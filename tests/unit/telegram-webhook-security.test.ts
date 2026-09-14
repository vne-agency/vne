import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getTelegramWebhookSecret,
  isValidTelegramWebhookSecret,
} from '@/features/telegram/webhook-security'

describe('telegram webhook security', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts only the derived webhook secret', () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-bot-token')
    vi.stubEnv('PAYLOAD_SECRET', 'test-payload-secret')

    const secret = getTelegramWebhookSecret()

    expect(secret).toMatch(/^[a-f0-9]{64}$/)
    expect(isValidTelegramWebhookSecret(secret)).toBe(true)
    expect(isValidTelegramWebhookSecret('incorrect')).toBe(false)
    expect(isValidTelegramWebhookSecret(null)).toBe(false)
  })

  it('fails closed when environment secrets are missing', () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '')
    vi.stubEnv('PAYLOAD_SECRET', '')

    expect(() => getTelegramWebhookSecret()).toThrow(
      'Telegram webhook secrets are not configured.',
    )
  })
})
