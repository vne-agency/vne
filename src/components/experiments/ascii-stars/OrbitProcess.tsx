'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import styles from './OrbitProcess.module.css'

const stages = ['Аудит и бриф', 'Прототип и UX', 'Дизайн и верстка', 'Поддержка и рост']

export function OrbitProcess() {
  const { t } = useSiteLanguage()

  return (
    <section className={styles.section} id="process" aria-labelledby="orbit-process-title">
      <div className={styles.banner} data-closing-row data-closing-rule="both">
        <p className={styles.eyebrow} data-closing-copy="up">
          {t('06 / Процесс')}
        </p>
        <p className={styles.slogan} lang="en" data-closing-copy="up">
          From concept
          <br />
          to launch
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </p>
      </div>

      <div
        className={styles.intro}
        data-closing-row
        data-closing-rule="bottom"
        data-closing-split="process"
      >
        <span data-closing-spine aria-hidden="true" />
        <h2 id="orbit-process-title">
          <span data-closing-copy="left">
            {t('Этапы')}
            <br />
            {t('и поддержка')}
          </span>
        </h2>
        <p data-closing-copy="right">
          {t(
            'Прозрачный пайплайн: фиксируем сроки на старте, берем на себя всю техническую рутину и остаемся на связи после релиза.',
          )}
        </p>
      </div>

      <ol className={styles.stages} aria-label={t('Этапы работы')}>
        {stages.map((stage, index) => (
          <li className={styles.stage} key={stage} data-closing-row data-closing-stage>
            <span className={styles.step} aria-hidden="true" data-closing-copy="up">
              {t(String(index + 1).padStart(2, '0'))}
            </span>
            <h3 data-closing-copy="up">{t(stage)}</h3>
            <span className={styles.arrow} aria-hidden="true" data-closing-copy="up">
              <ArrowIcon direction={index === stages.length - 1 ? 'up-right' : 'right'} />
            </span>
          </li>
        ))}
      </ol>

      <div
        className={styles.support}
        data-closing-row
        data-closing-rule="top"
        data-closing-split="process"
        data-closing-dark
      >
        <span data-closing-spine aria-hidden="true" />
        <div className={styles.supportHeading}>
          <p className={styles.eyebrow} data-closing-copy="left">
            {t('После запуска')}
          </p>
          <h3 data-closing-copy="left">
            {t('Остаёмся')}
            <br />
            {t('на связи.')}
          </h3>
        </div>
        <p className={styles.description} data-closing-copy="right">
          {t(
            'Постоянное сопровождение и развитие проекта. После запуска мы не оставляем вас один на один с сайтом. Контролируем стабильность работы, оперативно вносим правки, добавляем новые разделы и помогаем масштабировать функционал по мере роста бизнеса.',
          )}
        </p>
      </div>
    </section>
  )
}
