import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { notifyManagersOfLead } from '@/features/telegram/notify-managers'

const notifyManagers: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  try {
    const result = await notifyManagersOfLead({
      id: doc.id,
      name: doc.name,
      phone: doc.phone,
      email: doc.email,
      telegramUsername: doc.telegramUsername,
      message: doc.message,
      pageUrl: doc.pageUrl,
      source: doc.source,
    })

    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      req,
      data: {
        telegramNotificationStatus: result.skipped ? 'skipped' : 'sent',
        telegramNotifiedAt: result.skipped ? undefined : new Date().toISOString(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Telegram error'

    req.payload.logger.error({ err: error, leadId: doc.id }, 'Telegram lead notification failed')
    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      req,
      data: {
        telegramNotificationStatus: 'failed',
        telegramNotificationError: message.slice(0, 500),
      },
    })
  }

  return doc
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'createdAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  hooks: { afterChange: [notifyManagers] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'telegramUsername', type: 'text' },
    {
      name: 'telegramUpdateId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        condition: (_, data) => data.source === 'telegram_bot',
      },
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'pageUrl', type: 'text' },
    {
      name: 'consentEvidence',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Server-recorded consent version, time and complete document text.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      index: true,
      options: [
        { label: 'Сайт', value: 'website' },
        { label: 'Telegram-бот', value: 'telegram_bot' },
        { label: 'Вручную', value: 'manual' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Закрыта', value: 'closed' },
        { label: 'Спам', value: 'spam' },
      ],
    },
    {
      name: 'utm',
      type: 'group',
      fields: [
        { name: 'source', type: 'text' },
        { name: 'medium', type: 'text' },
        { name: 'campaign', type: 'text' },
      ],
    },
    {
      name: 'telegramNotificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      admin: { readOnly: true },
      options: [
        { label: 'Ожидает', value: 'pending' },
        { label: 'Отправлено', value: 'sent' },
        { label: 'Пропущено в dev', value: 'skipped' },
        { label: 'Ошибка', value: 'failed' },
      ],
    },
    { name: 'telegramNotifiedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'telegramNotificationError',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (_, data) => data.telegramNotificationStatus === 'failed',
      },
    },
  ],
}
