import { getKazanServiceHref, type KazanService } from '@/lib/services/kazan'
import { getServiceBySlug } from '@/lib/services/catalog'
import { getSiteUrl } from '@/lib/site'

export function kazanServiceSchema(page: KazanService) {
  const url = new URL(getKazanServiceHref(page.slug), getSiteUrl()).href
  const parent = getServiceBySlug(page.serviceId)!
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title.ru,
        description: page.description.ru,
        inLanguage: 'ru',
        isPartOf: { '@id': new URL('/#website', getSiteUrl()).href },
        mainEntity: { '@id': `${url}#service` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        url,
        name: page.title.ru,
        description: page.introduction.ru,
        areaServed: { '@type': 'City', name: 'Казань' },
        provider: { '@id': new URL('/#organization', getSiteUrl()).href },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ВНЕ', item: getSiteUrl().href },
          {
            '@type': 'ListItem',
            position: 2,
            name: parent.title,
            item: new URL(`/services/${page.serviceId}`, getSiteUrl()).href,
          },
          { '@type': 'ListItem', position: 3, name: 'Казань', item: url },
        ],
      },
    ],
  }
}
