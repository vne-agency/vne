import { describe, expect, it } from 'vitest'

import { getLeadPagePath } from '@/features/leads/page-path'
import { kazanServiceSchema } from '@/lib/seo/kazan-schema'
import { getKazanService, getKazanServiceHref, kazanServices } from '@/lib/services/kazan'
import { pricingOffers } from '@/lib/pricing/catalog'

describe('Kazan service landing pages', () => {
  it('uses real pricing entries and complete bilingual copy', () => {
    function checkCopy(value: unknown) {
      if (!value || typeof value !== 'object') return
      if ('ru' in value) {
        expect(value.ru).toBeTruthy()
        expect(value).toHaveProperty('en')
        expect('en' in value && value.en).toBeTruthy()
      }
      for (const nested of Object.values(value)) checkCopy(nested)
    }
    for (const page of kazanServices) {
      checkCopy(page)
      expect(page.offerIds.every((id) => pricingOffers.some((offer) => offer.id === id))).toBe(true)
      expect(page.proof.length).toBeGreaterThan(0)
      expect(page.proof.every((proof) => ['kotopes', 'arc-store'].includes(proof.slug))).toBe(true)
    }
    expect(getKazanService('invented-city-page')).toBeUndefined()
  })

  it('offers video promotion only as a complete package', () => {
    const page = getKazanService('videoprodvizhenie')!
    expect(page.offerIds).toEqual(['video-marketing'])
    expect(pricingOffers.find((offer) => offer.id === page.offerIds[0])?.amount).toBe(100000)
    expect(page.faq.some((item) => item.answer.ru.includes('не предоставляются'))).toBe(true)
  })

  it('describes a service area without inventing a physical office or reviews', () => {
    for (const page of kazanServices) {
      const graph = kazanServiceSchema(page)['@graph']
      const service = graph.find((node) => node['@type'] === 'Service')
      expect(service).toMatchObject({
        name: page.title.ru,
        areaServed: { '@type': 'City', name: 'Казань' },
      })
      expect(service).not.toHaveProperty('address')
      expect(service).not.toHaveProperty('aggregateRating')
      expect(service?.url).toContain(getKazanServiceHref(page.slug))
    }
  })

  it('preserves local lead attribution and rejects arbitrary paths', () => {
    for (const page of kazanServices) {
      const path = getKazanServiceHref(page.slug)
      expect(getLeadPagePath(path)).toBe(path)
    }
    expect(getLeadPagePath('https://untrusted.example')).toBe('/')
    expect(getLeadPagePath('//untrusted.example')).toBe('/')
    expect(getLeadPagePath('/services/kazan/unknown')).toBe('/')
  })
})
