import { z } from 'zod'

import { normalizeRussianPhone } from '@/lib/format-russian-phone'
import { pricingOffers } from '@/lib/pricing/catalog'

const optionalText = z.string().trim().max(500).optional().or(z.literal(''))
const russianPhone = z
  .string()
  .trim()
  .max(30)
  .refine((value) => value === '' || normalizeRussianPhone(value) !== null, {
    message: 'Введите российский номер в формате +7 (999) 999-99-99.',
  })
  .transform((value) => (value === '' ? '' : normalizeRussianPhone(value)!))

export const leadSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone: russianPhone,
    email: z.email().optional().or(z.literal('')),
    telegramUsername: optionalText,
    message: z
      .string()
      .trim()
      .min(5, 'Опишите задачу: не менее 5 символов.')
      .max(3000, 'Описание должно быть не длиннее 3000 символов.'),
    budget: z.string().trim().max(120, 'Укажите бюджет короче: до 120 символов.').optional(),
    service: z
      .string()
      .refine(
        (value) => value === '' || pricingOffers.some((offer) => offer.id === value),
        'Выберите услугу из списка.',
      )
      .optional(),
    consent: z.literal(true),
    turnstileToken: z.string().trim().optional(),
    pageUrl: z.url().optional(),
    utmSource: optionalText,
    utmMedium: optionalText,
    utmCampaign: optionalText,
  })
  .refine((value) => Boolean(value.phone || value.email || value.telegramUsername), {
    message: 'Укажите телефон, email или Telegram.',
    path: ['phone'],
  })

export type LeadInput = z.infer<typeof leadSchema>
