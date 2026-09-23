'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import styles from './LabHeader.module.css'

export function LabHeader({ section }: { section?: 'tool' }) {
  const { language } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)

  return (
    <header className={styles.header}>
      <Link
        href="/lab"
        className={styles.brand}
        aria-label={copy('ВНЕ.lab — библиотека', 'VNE.lab — library')}
      >
        ВНЕ<span>.lab</span>
      </Link>
      <nav className={styles.actions} aria-label={copy('Навигация лаборатории', 'Lab navigation')}>
        <LanguageSwitch />
        {section === 'tool' && (
          <Link href="/lab" className={styles.back}>
            <span aria-hidden="true">←</span> {copy('Все инструменты', 'All tools')}
          </Link>
        )}
        <Link
          href="/"
          className={styles.home}
          aria-label={copy('Вернуться в студию ВНЕ', 'Back to VNE studio')}
        >
          <span>./home</span>
          <Image src="/assets/brand/vne-orbit-mark.svg" width={24} height={28} alt="" />
        </Link>
      </nav>
    </header>
  )
}
