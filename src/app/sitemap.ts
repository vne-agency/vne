import type { MetadataRoute } from 'next'

import { getCaseHref, isIndexableCase } from '@/lib/cases/catalog'
import { getHomeCases } from '@/lib/cases/get-home-cases'
import { turnkeyOffer } from '@/lib/services/turnkey'
import { labTools } from '@/lib/lab/catalog'
import { getSiteUrl } from '@/lib/site'
import { getServiceHref, serviceExperiences } from '@/lib/services/catalog'
import { getKazanServiceHref, kazanServices } from '@/lib/services/kazan'

// CMS noIndex changes must be reflected just as they are on the case routes.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await getHomeCases()
  return [
    {
      url: getSiteUrl().toString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/pricing', getSiteUrl()).toString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: new URL(turnkeyOffer.path, getSiteUrl()).toString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: new URL('/lab', getSiteUrl()).toString() },
    ...labTools.map((tool) => ({
      url: new URL(tool.href, getSiteUrl()).toString(),
    })),
    { url: new URL('/lab/orbit', getSiteUrl()).toString() },
    ...kazanServices.map((page) => ({
      url: new URL(getKazanServiceHref(page.slug), getSiteUrl()).toString(),
    })),
    ...serviceExperiences.map((service) => ({
      url: new URL(getServiceHref(service.id), getSiteUrl()).toString(),
    })),
    ...cases.filter(isIndexableCase).map((item) => ({
      url: new URL(getCaseHref(item.slug), getSiteUrl()).toString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
