import { SiteHeader } from '@/components/layout/SiteHeader'
import { LegalLinks } from '@/components/legal/LegalLinks'
import { ApproachSection } from '@/components/sections/ApproachSection'
import { CasesSection } from '@/components/sections/CasesSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ServicesPlaceholderSection } from '@/components/sections/ServicesPlaceholderSection'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { getHomeCases } from '@/lib/cases/get-home-cases'
import { createMetadata } from '@/lib/seo/create-metadata'

import styles from './page.module.css'

export const metadata = createMetadata()
export const dynamic = 'force-dynamic'

// Archived composition; no public route imports the previous design.
export default async function LegacyHomePage() {
  const cases = await getHomeCases()

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <ApproachSection />
        <CasesSection items={cases} />
        <FaqSection />
        <ServicesPlaceholderSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <footer className={styles.legalFooter}>
        <LegalLinks />
      </footer>
      <ScrollToTop showAfter="directions" />
    </div>
  )
}
