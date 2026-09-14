import type { Case } from '@/payload-types'

export type CaseItem = {
  slug: string
  title: string
  projectName: string
  description: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
  number?: string
  image?: string
  preview: string
  previewAlt?: string
  mockup?: string
  websiteUrl?: string
  allowEmbed: boolean
  services: string[]
  content?: Case['content']
  seo?: Case['seo']
}

// The current showcase follows the expanded case layouts supplied in Figma.
// Payload overrides these entries by slug; unpublished records are never exposed.
export const fallbackCases: readonly CaseItem[] = [
  {
    slug: 'kotopes',
    projectName: 'КОТОПЕС',
    title: 'Сайт ветеринарной клиники',
    description:
      'Сайт многопрофильной ветеринарной клиники, который знакомит владельцев животных с услугами и помогает записаться на приём. Разработали дизайн и сайт, подключили и настроили Яндекс Вебмастер и Метрику. Создали админ-панель для редактирования услуг и написания статей для сайта, а также бота, который оповещает о новых заявках. Всё реализовано на коде, без сторонних готовых решений.',
    number: '/assets/home/case-number-1.svg',
    preview: '/assets/cases/kotopes-preview.png',
    previewAlt: 'Главная страница ветеринарной клиники «Котопес»',
    mockup: '/assets/cases/kotopes-mockup.png',
    websiteUrl: 'https://kotopes-kzn.ru/',
    // The live site currently sends X-Frame-Options: DENY.
    allowEmbed: false,
    services: ['Web-design', 'Development', 'CRM', 'SEO', 'Producing'],
  },
  {
    slug: 'arc-store',
    projectName: 'ARC STORE',
    logo: '/assets/home/case-arc-logo.svg',
    logoWidth: 171,
    logoHeight: 18,
    title: 'Магазин цифровых товаров',
    description:
      'Магазин игровых предметов и услуг для ARC Raiders. Разработали дизайн и сайт, подключили и настроили Яндекс Вебмастер и Метрику. Создали админ-панель для работы с товарами, общения с клиентами, управления финансами и анализа данных. Подключили эквайринг и создали витрину arc-store.pro для иностранных покупателей. Спродюсировали каналы привлечения трафика через короткие видео.',
    number: '/assets/home/case-number-2.svg',
    preview: '/assets/cases/arc-store-preview.png',
    previewAlt: 'Главная страница магазина игровых предметов ARC Store',
    websiteUrl: 'https://arc-store.ru/',
    // The live site currently sends CSP frame-ancestors 'none' and SAMEORIGIN.
    allowEmbed: false,
    services: ['Web-design', 'Development', 'CRM', 'SEO', 'Producing'],
  },
  {
    slug: 'codeam',
    projectName: 'CODEAM',
    title: 'Новый кейс',
    description:
      'Скоро здесь появится новый проект. Готовим подробности и интерактивный просмотр сайта.',
    number: '/assets/home/case-number-3.svg',
    preview: '/assets/home/services-design.png',
    previewAlt: 'Абстрактная композиция для будущего кейса CODEAM',
    allowEmbed: false,
    services: [],
  },
]

export function getCaseHref(slug: string) {
  return `/cases/${encodeURIComponent(slug)}`
}

// The current catalog uses a public project URL to distinguish ready cases
// from the explicitly labelled "soon" card. Keep metadata and sitemap aligned.
export function isIndexableCase(item: CaseItem) {
  return Boolean(item.websiteUrl) && item.seo?.noIndex !== true
}

export function getCaseWebsiteUrl(value?: string | null) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return undefined
    return url.href
  } catch {
    return undefined
  }
}
