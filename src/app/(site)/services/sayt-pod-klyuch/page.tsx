import { TurnkeyServicePage } from '@/components/services/TurnkeyServicePage'
import { JsonLd } from '@/components/seo/JsonLd'
import { getHomeCases } from '@/lib/cases/get-home-cases'
import { isIndexableCase } from '@/lib/cases/catalog'
import { createMetadata } from '@/lib/seo/create-metadata'
import { turnkeyOffer } from '@/lib/services/turnkey'
import { turnkeyPageSchema } from '@/lib/seo/structured-data'

// Keep rendering aligned with the shared public case catalogue.
export const dynamic = 'force-dynamic'

export const metadata = createMetadata({
  title: turnkeyOffer.name.ru,
  description: turnkeyOffer.description,
  path: turnkeyOffer.path,
})

export default async function TurnkeyPage() {
  const cases = (await getHomeCases()).filter(isIndexableCase).slice(0, 2)
  return (
    <>
      <JsonLd data={turnkeyPageSchema()} />
      <TurnkeyServicePage cases={cases} />
    </>
  )
}
