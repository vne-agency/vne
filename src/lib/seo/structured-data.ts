import { getCaseHref, type CaseItem } from '@/lib/cases/catalog'
import { getServiceHref, type ServiceExperience } from '@/lib/services/catalog'
import { getSiteUrl, siteConfig } from '@/lib/site'
import { turnkeyLaunch, turnkeyOffer } from '@/lib/services/turnkey'

const url = (path: string) => new URL(path, getSiteUrl()).href
const reference = (path: string) => ({ '@id': url(path) })

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': url('/#organization'),
        name: siteConfig.shortName,
        alternateName: 'VNE',
        legalName: siteConfig.legalName,
        url: url('/'),
        email: siteConfig.email,
        sameAs: [...siteConfig.socialProfiles],
        logo: url('/assets/brand/vne-wordmark.svg'),
      },
      {
        '@type': 'WebSite',
        '@id': url('/#website'),
        name: siteConfig.searchName,
        alternateName: 'VNE',
        url: url('/'),
        inLanguage: 'ru',
        publisher: reference('/#organization'),
      },
    ],
  }
}

function webPage(path: string, name: string, description: string) {
  return {
    '@type': 'WebPage',
    '@id': url(`${path}#webpage`),
    url: url(path),
    name,
    description,
    inLanguage: 'ru',
    isPartOf: reference('/#website'),
    publisher: reference('/#organization'),
  }
}

function breadcrumbs(path: string, name: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': url(`${path}#breadcrumb`),
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ВНЕ', item: url('/') },
      { '@type': 'ListItem', position: 2, name, item: url(path) },
    ],
  }
}

export function pageSchema(path: string, name: string, description: string) {
  return { '@context': 'https://schema.org', ...webPage(path, name, description) }
}

export function servicePageSchema(service: ServiceExperience) {
  const path = getServiceHref(service.id)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...webPage(path, service.title, service.description),
        mainEntity: reference(`${path}#service`),
        breadcrumb: reference(`${path}#breadcrumb`),
      },
      {
        '@type': 'Service',
        '@id': url(`${path}#service`),
        name: service.title,
        description: service.description,
        serviceType: [...service.items],
        url: url(path),
        provider: reference('/#organization'),
        mainEntityOfPage: reference(`${path}#webpage`),
      },
      breadcrumbs(path, service.title),
    ],
  }
}

export function turnkeyPageSchema() {
  const path = turnkeyOffer.path
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...webPage(path, turnkeyOffer.name.ru, turnkeyOffer.introduction),
        mainEntity: reference(`${path}#service`),
        breadcrumb: reference(`${path}#breadcrumb`),
      },
      {
        '@type': 'Service',
        '@id': url(`${path}#service`),
        name: turnkeyOffer.name.ru,
        description: turnkeyOffer.introduction,
        url: url(path),
        provider: reference('/#organization'),
        mainEntityOfPage: reference(`${path}#webpage`),
        offers: {
          '@type': 'Offer',
          price: turnkeyOffer.amount,
          priceCurrency: 'RUB',
          description: turnkeyLaunch.terms.ru,
          url: url(path),
        },
      },
      {
        ...breadcrumbs(path, turnkeyOffer.name.ru),
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ВНЕ', item: url('/') },
          { '@type': 'ListItem', position: 2, name: 'Сайты', item: url('/services/web') },
          { '@type': 'ListItem', position: 3, name: 'Сайт под ключ', item: url(path) },
        ],
      },
    ],
  }
}

export function casePageSchema(item: CaseItem) {
  const path = getCaseHref(item.slug)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...webPage(path, `${item.projectName} — ${item.title}`, item.description),
        breadcrumb: reference(`${path}#breadcrumb`),
      },
      breadcrumbs(path, item.projectName),
    ],
  }
}
