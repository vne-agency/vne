import { LabLibrary } from '@/components/lab/LabLibrary'
import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'

export const metadata = {
  ...createMetadata({
    title: 'vne.lab',
    description:
      'Лаборатория ВНЕ: инструменты для экспериментов с изображением, символами и фактурой.',
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
          'Лаборатория ВНЕ: инструменты для экспериментов с изображением, символами и фактурой.',
        )}
      />
      <LabLibrary />
    </>
  )
}
