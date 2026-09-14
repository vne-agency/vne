export type LeadNotification = {
  id: number | string
  name: string
  phone?: string | null
  email?: string | null
  telegramUsername?: string | null
  message: string
  pageUrl?: string | null
  source?: string | null
}

export type TelegramNotificationResult = {
  sent: number
  skipped: boolean
}

export type TelegramReadiness = {
  configured: boolean
  managerChats: number
}

type TelegramApiResponse<T> = {
  ok: boolean
  result?: T
  description?: string
  parameters?: { retry_after?: number }
}

type TelegramBot = {
  id: number
  first_name: string
  username?: string
}

type TelegramUpdate = {
  message?: {
    chat: { id: number; type: string }
  }
}

const MAX_ATTEMPTS = 3

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function formatLeadMessage(lead: LeadNotification): string {
  const contacts = [
    lead.phone && `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
    lead.email && `<b>Email:</b> ${escapeHtml(lead.email)}`,
    lead.telegramUsername && `<b>Telegram:</b> ${escapeHtml(lead.telegramUsername)}`,
  ].filter(Boolean)

  return [
    '<b>Новая заявка ВНЕ</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    ...contacts,
    `<b>Источник:</b> ${escapeHtml(lead.source ?? 'website')}`,
    '',
    '<b>Сообщение:</b>',
    escapeHtml(lead.message),
    lead.pageUrl ? `\n<b>Страница:</b> ${escapeHtml(lead.pageUrl)}` : '',
    `\n<b>ID заявки:</b> ${escapeHtml(String(lead.id))}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function getManagerChatIds(): string[] {
  return (process.env.TELEGRAM_MANAGER_CHAT_IDS ?? '')
    .split(',')
    .map((chatId) => chatId.trim())
    .filter(Boolean)
}

export function isTelegramManagerChat(chatId: string): boolean {
  return getManagerChatIds().includes(chatId)
}

export function getTelegramReadiness(): TelegramReadiness {
  const managerChats = getManagerChatIds().length

  return {
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && managerChats > 0),
    managerChats,
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function telegramRequest<T>(
  token: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const endpoint = `https://api.telegram.org/bot${token}/${method}`
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
      const result = (await response.json().catch(() => null)) as TelegramApiResponse<T> | null

      if (response.ok && result?.ok && result.result !== undefined) {
        return result.result
      }

      const retryable = response.status === 429 || response.status >= 500
      const description = result?.description ?? `HTTP ${response.status}`
      lastError = new Error(`Telegram API ${method} failed: ${description}`)

      if (!retryable || attempt === MAX_ATTEMPTS - 1) break

      const retryAfter = result?.parameters?.retry_after
      await wait(retryAfter ? Math.min(retryAfter * 1000, 5000) : 350 * 2 ** attempt)
    } catch (error) {
      lastError = error
      if (attempt === MAX_ATTEMPTS - 1) break
      await wait(350 * 2 ** attempt)
    }
  }

  const reason = lastError instanceof Error ? lastError.message : 'unknown error'
  throw new Error(`Telegram request failed after ${MAX_ATTEMPTS} attempts: ${reason}`)
}

async function sendMessage(token: string, chatId: string, text: string): Promise<void> {
  await telegramRequest(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  })
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured.')

  await sendMessage(token, chatId, text)
}

export async function notifyManagersOfLead(
  lead: LeadNotification,
): Promise<TelegramNotificationResult> {
  if (process.env.TELEGRAM_NOTIFICATIONS_DISABLED === 'true') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Telegram notifications cannot be disabled in production.')
    }

    return { sent: 0, skipped: true }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = getManagerChatIds()

  if (!token || chatIds.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Telegram notification environment is not configured.')
    }

    return { sent: 0, skipped: true }
  }

  const message = formatLeadMessage(lead)

  const results = await Promise.allSettled(
    chatIds.map((chatId) => sendMessage(token, chatId, message)),
  )

  const rejected = results.filter((result) => result.status === 'rejected')
  if (rejected.length > 0) {
    throw new AggregateError(
      rejected.map((result) => result.reason),
      `Telegram notification failed for ${rejected.length} manager chat(s).`,
    )
  }

  return { sent: results.length, skipped: false }
}

export async function verifyTelegramSetup(options: { sendTest?: boolean } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = getManagerChatIds()

  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured.')
  if (chatIds.length === 0) throw new Error('TELEGRAM_MANAGER_CHAT_IDS is not configured.')

  const bot = await telegramRequest<TelegramBot>(token, 'getMe', {})
  await Promise.all(chatIds.map((chatId) => telegramRequest(token, 'getChat', { chat_id: chatId })))

  if (options.sendTest) {
    await Promise.all(
      chatIds.map((chatId) =>
        sendMessage(token, chatId, '<b>ВНЕ</b>\nTelegram-уведомления настроены и работают.'),
      ),
    )
  }

  return {
    botName: bot.first_name,
    botUsername: bot.username,
    managerChats: chatIds.length,
    testSent: Boolean(options.sendTest),
  }
}

export async function discoverTelegramChatIds() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured.')

  const updates = await telegramRequest<TelegramUpdate[]>(token, 'getUpdates', {
    allowed_updates: ['message'],
    limit: 100,
  })
  const chats = new Map<number, string>()

  for (const update of updates) {
    if (update.message) chats.set(update.message.chat.id, update.message.chat.type)
  }

  return [...chats].map(([id, type]) => ({ id: String(id), type }))
}
