'use client'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import styles from './SectionNavigation.module.css'

const sections = [
  { id: 'cases', ru: 'работы', en: 'work' },
  { id: 'services', ru: 'услуги', en: 'services' },
  { id: 'contact', ru: 'связаться', en: 'contact' },
] as const

export function SectionNavigation() {
  const { language } = useSiteLanguage()
  return (
    <nav
      className={styles.navigation}
      data-section-navigation
      data-startup-reveal
      aria-label={language === 'ru' ? 'Разделы страницы' : 'Page sections'}
    >
      {sections.map((section) => (
        <a key={section.id} href={`#${section.id}`} data-language-particle-text>
          [{section[language]}]
        </a>
      ))}
    </nav>
  )
}
