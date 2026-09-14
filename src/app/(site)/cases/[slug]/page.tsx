import { notFound } from 'next/navigation'

import { OrbitCaseHeader } from '@/components/experiments/ascii-stars/OrbitCaseHeader'

import { OrbitCaseDetail } from '@/components/experiments/ascii-stars/OrbitCaseDetail'
import { OrbitContact } from '@/components/experiments/ascii-stars/OrbitContact'
import flow from '@/components/experiments/ascii-stars/OrbitClosingFlow.module.css'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { getCaseHref, isIndexableCase } from '@/lib/cases/catalog'
import { getHomeCases } from '@/lib/cases/get-home-cases'
import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { casePageSchema } from '@/lib/seo/structured-data'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type CasePageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: CasePageProps) {
  const { slug } = await params
  const item = (await getHomeCases()).find((entry) => entry.slug === slug)
  if (!item) return { title: 'Кейс не найден', robots: { index: false } }
  return createMetadata({
    title: item.seo?.title || `${item.projectName} — ${item.title}`,
    description: item.seo?.description || item.description,
    path: getCaseHref(item.slug),
    image: item.preview,
    noIndex: !isIndexableCase(item),
  })
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params
  const items = await getHomeCases()
  const item = items.find((entry) => entry.slug === slug)
  if (!item) notFound()

  return (
    <main className={styles.page} id="top">
      <JsonLd data={casePageSchema(item)} />
      <OrbitCaseHeader />
      <OrbitCaseDetail item={item} items={items} />
      <div className={flow.flow}>
        <OrbitContact homeHref="/" />
      </div>
      <ScrollToTop showAfter="case-detail" />
    </main>
  )
}
