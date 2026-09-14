import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/legal/LegalPage'
import { getLegalDocument, legalDocuments } from '@/lib/legal/documents'
import { createMetadata } from '@/lib/seo/create-metadata'

export function generateStaticParams() {
  return legalDocuments.map(({ slug }) => ({ legal: slug }))
}
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legal: string }>
}): Promise<Metadata> {
  const doc = getLegalDocument((await params).legal)
  if (!doc) notFound()
  return createMetadata({
    title: doc.title.ru,
    description: doc.summary.ru,
    path: `/${doc.slug}`,
    noIndex: true,
  })
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ legal: string }>
}) {
  const doc = getLegalDocument((await params).legal)
  if (!doc) notFound()
  return <LegalPage document={doc} />
}
