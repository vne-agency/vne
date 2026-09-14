export const siteConfig = {
  url: 'https://vne.agency',
  name: 'ВНЕ — дизайн-студия',
  shortName: 'ВНЕ',
  searchName: 'вне',
  description:
    'Студия ВНЕ: сайты и веб-дизайн, боты и CRM, ИИ и автоматизация, видеоконтент для социальных сетей.',
  locale: 'ru_RU',
  language: 'ru',
  email: 'vne.agency@internet.ru',
  legalName: 'ИП Баров Евгений Алексеевич',
} as const

export function getSiteUrl(): URL {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url
  return new URL(value)
}
