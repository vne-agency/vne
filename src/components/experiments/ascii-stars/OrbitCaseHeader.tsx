'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Link from 'next/link'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import styles from '@/app/(site)/cases/[slug]/page.module.css'

export function OrbitCaseHeader() {
  const { t } = useSiteLanguage()
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label={t('ВНЕ — в начало страницы')}>
        <span className={styles.wordmark}>ВНЕ</span>
        <span className={styles.caption}>
          <RotatingSlogan />
        </span>
      </Link>
      <nav className={styles.navigation} aria-label={t('Основная навигация')}>
        <LanguageSwitch />
        <Link href="/#cases">
          {t('Все проекты')}{' '}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
        <Link href="/#services">
          {t('Услуги')}{' '}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
        <a href="#contact">
          {t('Обсудить проект')} <span aria-hidden="true">+</span>
        </a>
      </nav>
    </header>
  )
}
