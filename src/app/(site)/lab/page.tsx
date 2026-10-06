import { LabLibrary } from '@/components/lab/LabLibrary'
import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'

export const metadata = {
  ...createMetadata({
    title: 'vne.lab — инструменты для визуальных экспериментов',
    description:
      'Лаборатория ВНЕ: инструменты для экспериментов с изображением, символами и фактурой.',
    path: '/lab',
    image: '/og/lab',
  }),
  title: { absolute: 'vne.lab — инструменты для визуальных экспериментов' },
}

export default function LabPage() {
  return (
    <>
      <JsonLd
        data={pageSchema(
          '/lab',
          'vne.lab — инструменты для визуальных экспериментов',
          'Лаборатория ВНЕ: инструменты для экспериментов с изображением, символами и фактурой.',
        )}
      />
      <LabLibrary />
    </>
  )
}
