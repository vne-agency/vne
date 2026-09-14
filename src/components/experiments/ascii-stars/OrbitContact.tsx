'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { LeadForm } from '@/components/sections/LeadForm'
import { MoscowClock } from '@/components/ui/MoscowClock'
import { LegalLinks } from '@/components/legal/LegalLinks'
import { siteConfig } from '@/lib/site'

import styles from './OrbitContact.module.css'

const footerLinks = [
  { label: 'Наш подход', href: '#approach-full' },
  { label: 'Направления', href: '#directions' },
  { label: 'Проекты', href: '#cases' },
  { label: 'Услуги', href: '#services' },
  { label: 'Прайс и условия', href: '/pricing' },
  { label: 'Этапы работы', href: '#process' },
  { label: 'Вопросы и ответы', href: '#faq' },
] as const

export function OrbitContact({ homeHref = '' }: { homeHref?: string }) {
  const { t } = useSiteLanguage()

  return (
    <>
      <section id="contact" className={styles.contact} aria-labelledby="orbit-contact-title">
        <div className={styles.sectionMeta} data-closing-row data-closing-rule="both">
          <span data-closing-copy="left">{t('07 / НА СВЯЗИ')}</span>
          <span data-closing-copy="right">
            <MoscowClock />
          </span>
        </div>

        <div className={styles.heading} data-closing-row>
          <h2 id="orbit-contact-title" data-closing-copy="left">
            {t('Обсудим')}
            <br />
            {t('ваш проект.')}
          </h2>
          <span className={styles.headingArrow} aria-hidden="true" data-closing-copy="right">
            <ArrowIcon direction="down-left" />
          </span>
        </div>

        <div
          className={styles.contactGrid}
          data-closing-row
          data-closing-rule="top"
          data-closing-split="contact"
        >
          <span data-closing-spine aria-hidden="true" />
          <div className={styles.conversation}>
            <p className={styles.primaryCopy} data-closing-copy="left">
              {t(
                'Расскажите о задаче и бюджете. Предложим компактный запуск, отдельную доработку или проект по этапам.',
              )}
            </p>
            <address className={styles.directContact} data-closing-copy="left">
              <a href={`mailto:${siteConfig.email}`}>
                <span>[mail] {siteConfig.email}</span>
                <span className={styles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
              <a href="https://t.me/vneagency" target="_blank" rel="noopener noreferrer">
                <span>[tg] @vneagency</span>
                <span className={styles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
              <a href="https://t.me/wearevne" target="_blank" rel="noopener noreferrer">
                <span>[tg+channel] @wearevne</span>
                <span className={styles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </address>
            <p className={styles.consultation} data-closing-copy="left">
              {t('Бесплатно проконсультируем и поможем выбрать вектор развития.')}
            </p>
          </div>

          <div className={styles.formPanel} data-closing-form>
            <div data-closing-copy="right">
              <div className={styles.formIntro}>
                <h3>{t('Начнём с разговора')}</h3>
                <span aria-hidden="true">[ + ]</span>
              </div>
              <LeadForm variant="orbit" />
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer} data-closing-footer data-closing-dark>
        <div className={styles.footerTop} data-closing-row data-closing-rule="bottom">
          <p className={styles.motto} data-closing-copy="left">
            Structure.
            <br />
            Order. Intent.
          </p>
          <nav
            className={styles.footerNavigation}
            aria-label={t('Навигация в подвале')}
            data-closing-copy="up"
          >
            {footerLinks.map((link) => (
              <a
                href={link.href.startsWith('/') ? link.href : `${homeHref}${link.href}`}
                key={link.href}
              >
                {t(link.label)}
              </a>
            ))}
          </nav>
          <a href="#top" className={styles.backToTop} data-closing-copy="right">
            <span className={styles.backToTopLabel}>{t('Наверх')}</span>{' '}
            <span aria-hidden="true">↑</span>
          </a>
        </div>

        <div className={styles.footerWordmark} aria-label={t('ВНЕ')} data-closing-row>
          <span data-closing-copy="up">{t('ВНЕ')}</span>
          <span aria-hidden="true" data-closing-copy="up">
            ✳
          </span>
        </div>

        <div className={styles.footerBottom} data-closing-row data-closing-rule="top">
          <div className={styles.legalRow} data-closing-copy="up">
            <LegalLinks />
          </div>
          <span data-closing-copy="up">© {new Date().getFullYear()} [вне,ВНЕ] / [vne,VNE]</span>
        </div>
      </footer>
    </>
  )
}
