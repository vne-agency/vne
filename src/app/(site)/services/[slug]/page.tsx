import { notFound } from 'next/navigation'

import { OrbitServiceDetail } from '@/components/experiments/ascii-stars/OrbitServiceDetail'
import { JsonLd } from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/create-metadata'
import { servicePageSchema } from '@/lib/seo/structured-data'
import { getServiceBySlug, getServiceHref, serviceExperiences } from '@/lib/services/catalog'

type ServicePageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return serviceExperiences.map((service) => ({ slug: service.id }))
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  return createMetadata({
    title: service.title,
    description: service.description,
    path: getServiceHref(service.id),
  })
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  return (
    <>
      <JsonLd data={servicePageSchema(service)} />
      <OrbitServiceDetail service={service} />
    </>
  )
}
