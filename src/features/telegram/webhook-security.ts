import { createHash, timingSafeEqual } from 'node:crypto'

export function getTelegramWebhookSecret(): string {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const payloadSecret = process.env.PAYLOAD_SECRET

  if (!botToken || !payloadSecret) {
    throw new Error('Telegram webhook secrets are not configured.')
  }

  return createHash('sha256')
    .update(`elda-telegram-webhook:${botToken}:${payloadSecret}`)
    .digest('hex')
}

export function isValidTelegramWebhookSecret(candidate: string | null): boolean {
  if (!candidate) return false

  const expected = getTelegramWebhookSecret()
  const actualBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}
