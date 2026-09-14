'use server'

import { createLead } from '@/features/leads/create-lead'
import { leadSchema } from '@/features/leads/schema'
import { getSiteUrl } from '@/lib/site'
import { LEGAL_VERSION } from '@/lib/legal/documents'

export type LeadFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: Record<string, string[] | undefined>
}

export async function submitLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  if (formData.get('consentVersion') !== LEGAL_VERSION) {
    return {
      status: 'error',
      message: 'Текст согласия обновлён. Обновите страницу и ознакомьтесь с новой редакцией.',
    }
  }
  const candidate = {
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    telegramUsername: String(formData.get('telegramUsername') ?? ''),
    message: String(formData.get('message') ?? 'Запрос на консультацию с главной страницы'),
    budget: String(formData.get('budget') ?? ''),
    service: String(formData.get('service') ?? ''),
    consent: formData.get('consent') === 'on',
    turnstileToken: String(formData.get('cf-turnstile-response') ?? '') || undefined,
    pageUrl: new URL(
      formData.get('pagePath') === '/pricing' ? '/pricing' : '/',
      getSiteUrl(),
    ).toString(),
    utmSource: String(formData.get('utmSource') ?? ''),
    utmMedium: String(formData.get('utmMedium') ?? ''),
    utmCampaign: String(formData.get('utmCampaign') ?? ''),
  }

  const parsed = leadSchema.safeParse(candidate)
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Проверьте обязательные поля.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await createLead(parsed.data)
    return { status: 'success', message: 'Заявка отправлена. Скоро свяжемся с вами.' }
  } catch (error) {
    console.error('Lead submission failed.', error)

    return {
      status: 'error',
      message: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.',
    }
  }
}
