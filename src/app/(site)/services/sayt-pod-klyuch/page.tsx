import { TurnkeyServicePage } from '@/components/services/TurnkeyServicePage'
import { JsonLd } from '@/components/seo/JsonLd'
import { getHomeCases } from '@/lib/cases/get-home-cases'
import { isIndexableCase } from '@/lib/cases/catalog'
import { createMetadata } from '@/lib/seo/create-metadata'
import { turnkeyOffer } from '@/lib/services/turnkey'
import { getSiteUrl } from '@/lib/site'

// Follow current CMS case visibility without waiting for the next deployment.
export const dynamic = 'force-dynamic'

export const metadata = createMetadata({
  title: turnkeyOffer.name.ru,
  description: turnkeyOffer.description,
  path: turnkeyOffer.path,
})

export default async function TurnkeyPage() {
  const cases = (await getHomeCases()).filter(isIndexableCase).slice(0, 2)
  const url = new URL(turnkeyOffer.path, getSiteUrl()).href
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: turnkeyOffer.name.ru,
          description: turnkeyOffer.introduction,
          url,
          provider: { '@id': new URL('/#organization', getSiteUrl()).href },
          offers: { '@type': 'Offer', price: turnkeyOffer.amount, priceCurrency: 'RUB', url },
        }}
      />
      <TurnkeyServicePage cases={cases} />
    </>
  )
}
