import { AsciiDitherTool } from '@/components/lab/AsciiDitherTool'
import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'

export const metadata = createMetadata({
  title: 'ASCII / Dither — vne.lab',
  description:
    'Загрузите PNG или SVG, настройте ASCII или Dither и скачайте результат. Обработка происходит в браузере.',
  path: '/lab/ascii-dither',
  image: '/og/lab',
})

export default function AsciiDitherPage() {
  return (
    <>
      <JsonLd
        data={pageSchema(
          '/lab/ascii-dither',
          'ASCII / Dither — vne.lab',
          'Инструмент для создания ASCII и Dither графики из PNG или SVG прямо в браузере.',
        )}
      />
      <AsciiDitherTool />
    </>
  )
}
