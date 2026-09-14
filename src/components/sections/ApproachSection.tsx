'use client'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import Image from 'next/image'

import styles from './ApproachSection.module.css'

type ApproachSectionProps = {
  variant?: 'scroll' | 'static' | 'hero'
}

export function ApproachSection({ variant = 'scroll' }: ApproachSectionProps = {}) {
  const { t } = useSiteLanguage()

  const imageLoading = variant === 'scroll' ? 'lazy' : 'eager'
  return (
    <section
      className={`${styles.section}${variant !== 'scroll' ? ` ${styles[variant]}` : ''}`}
      aria-labelledby="approach-title"
    >
      {variant !== 'hero' && (
        <h2 id="approach-title" className="srOnly">
          {t('Наш подход')}
        </h2>
      )}

      <div className={styles.sticky}>
        <div className={styles.layout}>
          <span
            className={`${styles.gridLine} ${styles.gridLineTop} ${styles.lineForward}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.gridLine} ${styles.gridLineMiddle} ${styles.lineBackward}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.gridLine} ${styles.gridLineBottom} ${styles.lineForward}`}
            aria-hidden="true"
          />
          <span className={`${styles.gridLine} ${styles.gridLineVertical}`} aria-hidden="true" />

          <div className={`${styles.cell} ${styles.cellTopLeft}`} aria-hidden="true" />
          <div className={`${styles.cell} ${styles.cellTopRight}`} aria-hidden="true" />
          <div className={`${styles.cell} ${styles.cellBottomLeft}`} aria-hidden="true" />
          <div className={`${styles.cell} ${styles.cellBottomRight}`} aria-hidden="true" />
          <div className={`${styles.cellHitbox} ${styles.cellTopLeft}`} aria-hidden="true" />
          <div className={`${styles.cellHitbox} ${styles.cellTopRight}`} aria-hidden="true" />
          <div className={`${styles.cellHitbox} ${styles.cellBottomLeft}`} aria-hidden="true" />
          <div className={`${styles.cellHitbox} ${styles.cellBottomRight}`} aria-hidden="true" />

          <div className={styles.titleGraphic}>
            {variant === 'hero' ? (
              <h2 id="approach-title" className={styles.heroTitle}>
                {t('Наш подход')}
              </h2>
            ) : (
              <Image
                src="/assets/home/approach-title.svg"
                alt=""
                aria-hidden="true"
                width={855}
                height={105}
                loading={imageLoading}
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </div>

          <div className={styles.topLead}>
            <p>{t('Наша команда всегда с вами на связи')}</p>
            <p>
              {t(
                'Нас ровно столько, чтобы закрывать задачи быстро. Никаких менеджеров среднего звена',
              )}
            </p>
          </div>

          <div className={styles.topRight}>
            <p>
              {t(
                'Работа без посредников. Общаетесь напрямую с тем, кто двигает пиксели и пишет код. Мы сами отвечаем за результат своей головой.',
              )}
            </p>
          </div>

          <div className={`${styles.card} ${styles.cardDesign}`}>
            <div className={`${styles.cardContent} ${styles.cardContentDesign}`}>
              <Image
                src="/assets/home/approach-card-design.svg"
                loading={imageLoading}
                alt="No bullshit. Just design."
                width={411}
                height={238}
                className={`${styles.cardGraphic} ${styles.cardGraphicDefault}`}
              />
              <Image
                src="/assets/home/approach-card-design-inverted.svg"
                loading={imageLoading}
                alt=""
                aria-hidden="true"
                width={411}
                height={238}
                className={`${styles.cardGraphic} ${styles.cardGraphicInverted}`}
              />
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardProcess}`}>
            <div className={`${styles.cardContent} ${styles.cardContentProcess}`}>
              <Image
                src="/assets/home/approach-card-process.svg"
                loading={imageLoading}
                alt="Process and principles"
                width={411}
                height={238}
                className={`${styles.cardGraphic} ${styles.cardGraphicDefault}`}
              />
              <Image
                src="/assets/home/approach-card-process-inverted.svg"
                loading={imageLoading}
                alt=""
                aria-hidden="true"
                width={411}
                height={238}
                className={`${styles.cardGraphic} ${styles.cardGraphicInverted}`}
              />
            </div>
          </div>

          <div className={styles.bottomLead}>
            <p>{t('Мы используем только рабочие решения.')}</p>
            <p>
              {t(
                'Нам важно, чтобы сайт не просто красиво выглядел, а реально приносил заявки и работал на бизнес.',
              )}
            </p>
          </div>

          <div className={styles.bottomGroup}>
            <div className={styles.bottomCenter}>
              <p>{t('От прототипа до релиза. Сами проектируем логику.')}</p>
            </div>

            <div className={styles.bottomRight}>
              <p>
                {t(
                  'Собираем интерфейсы и запускаем готовые проекты без боли и затягивания сроков.',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
