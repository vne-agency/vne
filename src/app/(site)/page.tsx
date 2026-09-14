import { createMetadata } from '@/lib/seo/create-metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageSchema } from '@/lib/seo/structured-data'
import { siteConfig } from '@/lib/site'

import { AsciiStarsScrollHero } from '@/components/experiments/ascii-stars/AsciiStarsScrollHero'
import { OrbitCases } from '@/components/experiments/ascii-stars/OrbitCases'
import { OrbitContact } from '@/components/experiments/ascii-stars/OrbitContact'
import { OrbitDirections } from '@/components/experiments/ascii-stars/OrbitDirections'
import { OrbitFaq } from '@/components/experiments/ascii-stars/OrbitFaq'
import { OrbitProcess } from '@/components/experiments/ascii-stars/OrbitProcess'
import { OrbitPortfolioFlow } from '@/components/experiments/ascii-stars/OrbitPortfolioFlow'
import { OrbitServices } from '@/components/experiments/ascii-stars/OrbitServices'
import { OrbitServicesTransition } from '@/components/experiments/ascii-stars/OrbitServicesTransition'
import closingFlow from '@/components/experiments/ascii-stars/OrbitClosingFlow.module.css'
import { getHomeCases } from '@/lib/cases/get-home-cases'

export const dynamic = 'force-dynamic'

export const metadata = {
  ...createMetadata({
    title: 'vne.home',
    description: siteConfig.description,
  }),
  title: { absolute: 'vne.home' },
}

export default async function HomePage() {
  const cases = await getHomeCases()

  return (
    <>
      <JsonLd data={pageSchema('/', 'vne.home', siteConfig.description)} />
      <AsciiStarsScrollHero directions={<OrbitDirections />}>
        <OrbitServicesTransition services={<OrbitServices id="services-content" />}>
          <OrbitPortfolioFlow>
            <OrbitCases items={cases} />
            <OrbitFaq />
          </OrbitPortfolioFlow>
        </OrbitServicesTransition>
        <div className={closingFlow.flow} data-closing-flow>
          <OrbitProcess />
          <OrbitContact />
        </div>
      </AsciiStarsScrollHero>
    </>
  )
}
