'use client'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { AsciiBrowserPrototype } from './AsciiBrowserPrototype'
import { AsciiOrbitMotion } from './AsciiOrbitMotion'
import styles from './OrbitDirections.module.css'

const motionTags = ['video editing', 'motion design']
const designTags = ['promotion', 'ux/ui', 'web design', 'graphic design']

export function OrbitDirections() {
  const { t } = useSiteLanguage()

  return (
    <section className={styles.section} aria-labelledby="orbit-directions-title">
      <header className={styles.header}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>{t('02 / Направления')}</p>
          <p className={styles.note}>{t('Два способа сделать ваш продукт заметным.')}</p>
        </div>
        <h2 className={styles.heading} id="orbit-directions-title">
          <span>{t('Форма.')}</span> <span>{t('Движение.')}</span>
        </h2>
      </header>

      <div className={styles.grid}>
        <article
          className={`${styles.panel} ${styles.design}`}
          aria-labelledby="orbit-design-title"
        >
          <div className={styles.panelHeader}>
            <h3 id="orbit-design-title" className={styles.designTitle}>
              User <span className={styles.designTitleDetail}>[interface, experience]</span>
            </h3>
            <span className={styles.eyebrow}>{t('01 / В деталях')}</span>
          </div>
          <div className={styles.visual}>
            <AsciiBrowserPrototype />
          </div>
          <div className={styles.panelFooter}>
            <p className={styles.caption}>Aesthetics and conversion</p>
            <ul className={styles.tags} aria-label={t('Направления дизайна')}>
              {designTags.map((tag) => (
                <li key={tag}>{t(tag)}</li>
              ))}
            </ul>
          </div>
        </article>

        <article
          className={`${styles.panel} ${styles.motion}`}
          aria-labelledby="orbit-motion-title"
        >
          <div className={styles.panelHeader}>
            <h3 id="orbit-motion-title">Motion</h3>
            <span className={styles.eyebrow}>{t('02 / В движении')}</span>
          </div>
          <div className={styles.visual}>
            <AsciiOrbitMotion />
          </div>
          <div className={styles.panelFooter}>
            <p className={styles.caption}>Your product in motion.</p>
            <ul className={styles.tags} aria-label={t('Направления motion-дизайна')}>
              {motionTags.map((tag) => (
                <li key={tag}>{t(tag)}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}
