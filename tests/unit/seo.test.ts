import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from '@/components/seo/JsonLd'
import { fallbackCases, isIndexableCase } from '@/lib/cases/catalog'
import { createMetadata } from '@/lib/seo/create-metadata'
import { organizationSchema, servicePageSchema } from '@/lib/seo/structured-data'
import { serviceExperiences } from '@/lib/services/catalog'
import { getSiteUrl, siteConfig } from '@/lib/site'

describe('public SEO contract', () => {
  it('escapes CMS content without altering the decoded structured data', () => {
    const data = { description: '</script><script>alert("test")</script>' }
    const encoded = serializeJsonLd(data)
    expect(encoded).not.toContain('<')
    expect(JSON.parse(encoded)).toEqual(data)
  })

  it('keeps placeholder cases out of the index, including an explicit CMS false value', () => {
    expect(fallbackCases.filter(isIndexableCase).map(({ slug }) => slug)).toEqual([
      'kotopes',
      'arc-store',
    ])
    expect(isIndexableCase({ ...fallbackCases[2], seo: { noIndex: false } })).toBe(false)
    expect(isIndexableCase({ ...fallbackCases[0], seo: { noIndex: true } })).toBe(false)
  })

  it('uses absolute canonical and social URLs; noindex pages retain follow', () => {
    const metadata = createMetadata({
      title: 'vne.lab',
      path: '/lab',
      image: '/og/lab',
      noIndex: true,
    })
    expect(String(metadata.alternates?.canonical)).toBe(new URL('/lab', getSiteUrl()).href)
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.openGraph).toMatchObject({
      title: 'vne.lab',
      url: new URL('/lab', getSiteUrl()),
    })
    expect(metadata.twitter).toMatchObject({ images: [new URL('/og/lab', getSiteUrl())] })
    expect(metadata.alternates?.languages).toBeUndefined()
  })

  it('publishes only confirmed organization facts and the actual visible service description', () => {
    const organization = organizationSchema()['@graph'][0]
    expect(organization).toMatchObject({
      name: 'ВНЕ',
      legalName: siteConfig.legalName,
      email: siteConfig.email,
    })
    for (const key of ['address', 'aggregateRating', 'review', 'award', 'sameAs']) {
      expect(organization).not.toHaveProperty(key)
    }
    for (const service of serviceExperiences) {
      const schema = servicePageSchema(service)['@graph'].find(
        (node) => node['@type'] === 'Service',
      )
      expect(schema).toMatchObject({
        name: service.title,
        description: service.description,
        serviceType: [...service.items],
      })
      expect(schema).not.toHaveProperty('offers')
    }
  })
})
