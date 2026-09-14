import { getTelegramWebhookSecret } from '../src/features/telegram/webhook-security'

type TelegramApiResponse<T> = {
  ok: boolean
  result?: T
  description?: string
}

type WebhookInfo = {
  url: string
  pending_update_count: number
  last_error_message?: string
  allowed_updates?: string[]
}

const token = process.env.TELEGRAM_BOT_TOKEN
const baseUrl = process.argv[2] ?? process.env.TELEGRAM_WEBHOOK_BASE_URL

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured.')
if (!baseUrl) throw new Error('Pass the Cloudflare base URL or configure TELEGRAM_WEBHOOK_BASE_URL.')

const webhookUrl = new URL('/api/telegram/webhook', baseUrl).toString()
const apiBase = `https://api.telegram.org/bot${token}`
const webhookSecret = getTelegramWebhookSecret()

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${apiBase}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = (await response.json()) as TelegramApiResponse<T>

  if (!response.ok || !result.ok || result.result === undefined) {
    throw new Error(result.description ?? `Telegram ${method} failed with HTTP ${response.status}.`)
  }

  return result.result
}

await call<boolean>('setWebhook', {
  url: webhookUrl,
  secret_token: webhookSecret,
  allowed_updates: ['message'],
  drop_pending_updates: false,
  max_connections: 10,
})

const info = await call<WebhookInfo>('getWebhookInfo', {})
const healthResponse = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Telegram-Bot-Api-Secret-Token': webhookSecret,
  },
  body: JSON.stringify({ update_id: Date.now() }),
})

if (!healthResponse.ok) {
  throw new Error(`Webhook health check failed with HTTP ${healthResponse.status}.`)
}

console.log(`Telegram webhook: ${info.url}`)
console.log('Signed webhook health check: OK')
console.log(`Pending updates: ${info.pending_update_count}`)
console.log(`Allowed updates: ${(info.allowed_updates ?? []).join(', ') || 'default'}`)
if (info.last_error_message) console.log(`Last delivery error: ${info.last_error_message}`)
