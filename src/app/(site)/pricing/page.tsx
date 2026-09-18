import type { Metadata } from 'next'
import { PricingPage } from '@/components/pricing/PricingPage'
import { createMetadata } from '@/lib/seo/create-metadata'

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Услуги и цены — ВНЕ',
    description:
      'Прайс студии ВНЕ: компактный запуск за 29 000 ₽, индивидуальный лендинг за 45 000 ₽ в пилотном формате. Сайты, приложения, боты, CRM, ИИ, видео и поддержка. Состав и условия работ.',
    path: '/pricing',
  }),
  title: { absolute: 'Услуги и цены — ВНЕ' },
}

export default function Page() {
  return <PricingPage />
}
