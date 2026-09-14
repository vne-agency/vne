import config from '@payload-config'
import { getPayload } from 'payload'

import {
  isTelegramManagerChat,
  sendTelegramMessage,
} from '@/features/telegram/notify-managers'
import { isValidTelegramWebhookSecret } from '@/features/telegram/webhook-security'

export const runtime = 'nodejs'

type TelegramMessage = {
  message_id: number
  chat: { id: number; type: string }
  from?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
  text?: string
  contact?: { phone_number: string }
}

type TelegramUpdate = {
  update_id: number
  message?: TelegramMessage
}

const welcomeMessage =
  'Здравствуйте! Расскажите коротко о задаче или оставьте контакт — команда EL\'DA получит сообщение и свяжется с вами.'

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status })
}

export async function POST(request: Request) {
  if (
    !isValidTelegramWebhookSecret(
      request.headers.get('x-telegram-bot-api-secret-token'),
    )
  ) {
    return json(401, { ok: false })
  }

  let update: TelegramUpdate

  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    return json(400, { ok: false })
  }

  const message = update.message
  if (!message || message.chat.type !== 'private') return json(200, { ok: true })

  const chatId = String(message.chat.id)
  const text = message.text?.trim()

  if (text?.startsWith('/start')) {
    await sendTelegramMessage(chatId, welcomeMessage)
    return json(200, { ok: true })
  }

  if (isTelegramManagerChat(chatId)) return json(200, { ok: true })
  if (!text && !message.contact?.phone_number) return json(200, { ok: true })

  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'leads',
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: { telegramUpdateId: { equals: update.update_id } },
  })

  if (existing.docs.length === 0) {
    const sender = message.from
    const name = [sender?.first_name, sender?.last_name].filter(Boolean).join(' ') || 'Telegram'
    const telegramUsername = sender?.username ? `@${sender.username}` : `tg:${sender?.id ?? chatId}`

    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name,
        phone: message.contact?.phone_number,
        telegramUsername,
        telegramUpdateId: update.update_id,
        message: text || 'Пользователь поделился номером телефона.',
        source: 'telegram_bot',
        status: 'new',
        telegramNotificationStatus: 'pending',
      },
    })
  }

  await sendTelegramMessage(
    chatId,
    'Спасибо! Сообщение получено. Команда EL\'DA скоро свяжется с вами.',
  )

  return json(200, { ok: true })
}
