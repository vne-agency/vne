import { AsciiStarsExperiment } from '@/components/experiments/ascii-stars/AsciiStarsExperiment'
import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'

export const metadata = {
  ...createMetadata({
    title: 'vne.lab',
    description: 'Лаборатория ВНЕ. Интерактивные эксперименты с формой, символами и движением.',
    path: '/lab',
    image: '/og/lab',
  }),
  title: { absolute: 'vne.lab' },
}

export default function LabPage() {
  return (
    <>
      <JsonLd
        data={pageSchema(
          '/lab',
          'vne.lab',
          'Лаборатория ВНЕ. Интерактивные эксперименты с формой, символами и движением.',
        )}
      />
      <AsciiStarsExperiment />
    </>
  )
}
