import type { Metadata } from 'next'
import { PricingPage } from '@/components/pricing/PricingPage'
import { createMetadata } from '@/lib/seo/create-metadata'

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Услуги и цены — ВНЕ',
    description:
      'Прайс студии ВНЕ: сайт под ключ за 11 999 ₽ и проект по индивидуальному заданию за 45 000 ₽. Сайты, приложения, боты, CRM, ИИ, видео и поддержка. Состав и условия работ.',
    path: '/pricing',
  }),
  title: { absolute: 'Услуги и цены — ВНЕ' },
}

export default function Page() {
  return <PricingPage />
}
