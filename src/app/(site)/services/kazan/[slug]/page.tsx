import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/JsonLd'
import { KazanServicePage } from '@/components/services/KazanServicePage'
import { createMetadata } from '@/lib/seo/create-metadata'
import { kazanServiceSchema } from '@/lib/seo/kazan-schema'
import { getKazanService, getKazanServiceHref, kazanServices } from '@/lib/services/kazan'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return kazanServices.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getKazanService(slug)
  if (!page) notFound()
  return createMetadata({
    title: page.title.ru,
    description: page.description.ru,
    path: getKazanServiceHref(slug),
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const page = getKazanService(slug)
  if (!page) notFound()
  return (
    <>
      <JsonLd data={kazanServiceSchema(page)} />
      <KazanServicePage key={page.slug} page={page} />
    </>
  )
}
