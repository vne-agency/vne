import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'
import { PricingPage } from '@/components/pricing/PricingPage'
import { createMetadata } from '@/lib/seo/create-metadata'

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Услуги и цены — ВНЕ',
    description:
      'Прайс студии ВНЕ: стартовая серия сайтов за 11 999 ₽ для трёх проектов и индивидуальный проект за 45 000 ₽. Сайты, приложения, боты, CRM, ИИ, видео и поддержка. Состав и условия работ.',
    path: '/pricing',
  }),
  title: { absolute: 'Услуги и цены — ВНЕ' },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={pageSchema(
          '/pricing',
          'Услуги и цены ВНЕ',
          'Стоимость, состав и условия разработки сайтов, ботов, автоматизации и других услуг ВНЕ.',
        )}
      />
      <PricingPage />
    </>
  )
}
