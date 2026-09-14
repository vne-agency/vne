import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { OrbitScrollFallback } from '@/components/experiments/ascii-stars/OrbitScrollFallback'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { PageScrollbar } from '@/components/ui/PageScrollbar'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { SectionNavigationTransition } from '@/components/ui/SectionNavigationTransition'
import { PageNavigationTransition } from '@/components/ui/PageNavigationTransition'
import { StartupLoader } from '@/components/ui/StartupLoader'
import { LanguageSync } from '@/components/ui/SiteLanguage'
import { CookieConsent } from '@/components/legal/CookieConsent'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema } from '@/lib/seo/structured-data'
import { getSiteUrl, siteConfig } from '@/lib/site'
import '@fontsource-variable/onest'
import 'lenis/dist/lenis.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: 'design',
  creator: siteConfig.name,
  publisher: siteConfig.name,
  icons: {
    icon: [{ url: '/favicon.svg?v=orbit-rounded', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=orbit-rounded',
  },
  formatDetection: { address: false, email: false, telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#ffffff',
}

type SiteLayoutProps = Readonly<{ children: ReactNode }>

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <html lang={siteConfig.language}>
      <body id="site-scroll-document">
        <JsonLd data={organizationSchema()} />
        <LanguageSync />
        <CustomCursor />
        <SmoothScroll />
        <SectionNavigationTransition />
        <PageNavigationTransition />
        <PageScrollbar />
        <OrbitScrollFallback />
        <StartupLoader />
        <div id="site-content">{children}</div>
        <CookieConsent />
      </body>
    </html>
  )
}
