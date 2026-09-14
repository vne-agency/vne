'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { legalDocuments } from '@/lib/legal/documents'
import { COOKIE_SETTINGS_EVENT } from '@/lib/legal/cookie-choice'
import styles from './LegalPage.module.css'

export function CookieSettingsButton({ className }: { className?: string }) {
  const { language } = useSiteLanguage()
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      {language === 'ru' ? 'Настройки cookie' : 'Cookie settings'}
    </button>
  )
}

export function LegalLinks() {
  const { language } = useSiteLanguage()
  return (
    <nav
      className={styles.links}
      aria-label={language === 'ru' ? 'Правовая информация' : 'Legal information'}
    >
      {legalDocuments
        .filter(({ slug }) => ['privacy', 'cookies', 'terms'].includes(slug))
        .map((doc) => (
          <Link key={doc.slug} href={`/${doc.slug}`}>
            {doc.title[language]}
          </Link>
        ))}
      <CookieSettingsButton />
    </nav>
  )
}
