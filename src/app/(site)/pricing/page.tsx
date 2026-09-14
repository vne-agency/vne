import type { Metadata } from 'next'
import { PricingPage } from '@/components/pricing/PricingPage'

export const metadata: Metadata = {
  title: { absolute: 'Услуги и цены — ВНЕ' },
  description:
    'Прайс студии ВНЕ: компактный запуск за 29 000 ₽, индивидуальный лендинг за 45 000 ₽ в пилотном формате. Сайты, приложения, боты, CRM, ИИ, видео и поддержка. Состав и условия работ.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    siteName: 'вне',
    title: 'Услуги и цены — ВНЕ',
    description: 'От отдельной задачи до целой системы. Стоимость, состав и условия работы.',
    url: '/pricing',
  },
}

export default function Page() {
  return <PricingPage />
}
