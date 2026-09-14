import Image from 'next/image'
import Link from 'next/link'

import styles from './SiteHeader.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink} aria-label="ВНЕ — главная">
        <Image
          src="/assets/brand/vne-wordmark.svg"
          alt="ВНЕ"
          width={122}
          height={44}
          priority
          className={styles.logo}
          data-loader-logo
        />
      </Link>
      <a className={styles.cta} href="#contact">
        <span>get started</span>
      </a>
    </header>
  )
}
