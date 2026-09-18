'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { LegalLinks } from '@/components/legal/LegalLinks'
import { LeadForm } from '@/components/sections/LeadForm'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { AsciiStarsCanvas } from '@/components/experiments/ascii-stars/AsciiStarsCanvas'
import { serviceConstellations } from '@/components/experiments/ascii-stars/service-constellations'
import flow from '@/components/experiments/ascii-stars/OrbitClosingFlow.module.css'
import motion from '@/components/experiments/ascii-stars/OrbitDetailMotion.module.css'
import { formatPrice, pricingOffers } from '@/lib/pricing/catalog'
import { getServiceBySlug } from '@/lib/services/catalog'
import { getKazanServiceHref, kazanServices, type KazanService } from '@/lib/services/kazan'
import { siteConfig } from '@/lib/site'

import styles from './KazanServicePage.module.css'
import { ServiceDisclosure } from './ServiceDisclosure'

export function KazanServicePage({ page }: { page: KazanService }) {
  const { language, t } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const [service, setService] = useState(
    page.serviceId === 'video-content' ? 'video-marketing' : '',
  )
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion() !== false
  const parent = getServiceBySlug(page.serviceId)!
  const constellation = serviceConstellations[page.serviceId]
  const related = kazanServices.filter((entry) => entry.slug !== page.slug)
  const visualLabel = {
    web: 'WEB',
    'bots-crm': 'TELEGRAM',
    ai: 'AUTOMATION',
    'video-content': 'MOTION',
  }[page.serviceId]

  return (
    <div
      className={`${styles.page} ${flow.flow} ${motion.motion}`}
      id="top"
      data-detail-flow="service"
    >
      <a className={styles.skip} href="#local-main">
        {copy('К содержанию', 'Skip to content')}
      </a>
      <header className={styles.toolbar}>
        <Link href="/" className={styles.brand} aria-label={copy('ВНЕ — главная', 'VNE — home')}>
          ВНЕ<span>KAZAN / DIGITAL STUDIO</span>
        </Link>
        <nav aria-label={copy('Основная навигация', 'Main navigation')}>
          <LanguageSwitch />
          <Link href="/" className={styles.home}>
            ./home
            <Image src="/assets/brand/vne-orbit-mark.svg" width={28} height={32} alt="" />
          </Link>
        </nav>
      </header>
      <main id="local-main">
        <section className={styles.hero} aria-labelledby="local-title">
          <div className={styles.visual}>
            <span>KAZAN / {visualLabel}</span>
            <div className={styles.canvas} aria-hidden="true" inert>
              <AsciiStarsCanvas
                {...constellation}
                theme="dark"
                backgroundColor="#22231f"
                foregroundColor="#ceb4f5"
                mode="ascii"
                density={0.65}
                speed={0.18}
                paused={paused || reduceMotion}
              />
            </div>
            <span>VNE / FROM IDEA TO DELIVERY</span>
            <button
              type="button"
              className={styles.pause}
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={copy('Приостановить анимацию', 'Pause animation')}
            >
              {paused ? copy('▶ продолжить', '▶ resume') : copy('Ⅱ пауза', 'Ⅱ pause')}
            </button>
          </div>
          <div className={styles.heroCopy} data-detail-content>
            <nav
              className={styles.breadcrumbs}
              aria-label={copy('Хлебные крошки', 'Breadcrumbs')}
              data-detail-enter
            >
              <Link href="/">ВНЕ</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/services/${page.serviceId}`}>{t(parent.title)}</Link>
              <span aria-hidden="true">/</span>
              <span>{copy('Казань', 'Kazan')}</span>
            </nav>
            <h1 id="local-title" data-detail-enter="title">
              {page.title[language]}
            </h1>
            <p data-detail-enter="copy">{page.introduction[language]}</p>
            <div className={styles.actions} data-detail-enter="control">
              <a href="#contact-form">
                {copy('Обсудить задачу', 'Discuss your project')} <ArrowIcon />
              </a>
              <a href="#local-pricing">{copy('Форматы и цены', 'Options and pricing')} ↓</a>
            </div>
            <p className={styles.small} data-detail-enter="copy">
              {copy(
                'Для бизнеса в Казани и Татарстане. Работаем онлайн, по согласованным этапам.',
                'For businesses in Kazan and Tatarstan. Online collaboration with agreed milestones.',
              )}
            </p>
          </div>
        </section>
        <section
          className={styles.section}
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="tasks-title"
        >
          <h2 id="tasks-title" data-closing-copy="up">
            {copy('Начинаем с вашей задачи.', 'Start with the task.')}
          </h2>
          <div className={styles.grid}>
            {page.scenarios.map((item, i) => (
              <article key={item.title.ru} data-closing-copy="up">
                <span className={styles.label}>[ 0{i + 1} ]</span>
                <h3>{item.title[language]}</h3>
                <p>{item.description[language]}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          id="local-pricing"
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="price-title"
        >
          <h2 id="price-title" data-closing-copy="up">
            {copy('Форматы и стоимость.', 'Options and pricing.')}
          </h2>
          {page.serviceId === 'web' && (
            <p>
              {copy(
                '29 000 ₽ и 45 000 ₽ — условия пилотной серии из трёх подходящих проектов. Участие подтверждаем после обсуждения задачи и доступности студии.',
                '₽29,000 and ₽45,000 apply to a pilot series of three suitable projects. Participation depends on the task and studio availability.',
              )}
            </p>
          )}
          <ul className={styles.prices}>
            {pricingOffers
              .filter((offer) => page.offerIds.includes(offer.id))
              .map((offer) => (
                <li key={offer.id} data-closing-row data-closing-rule="top">
                  <div data-closing-copy="up">
                    <h3>{offer.name[language]}</h3>
                    <p>{offer.scope[language]}</p>
                    <ServiceDisclosure
                      title={copy('Сроки и ограничения', 'Timing and scope limits')}
                    >
                      <p>{offer.timing[language]}</p>
                      <p>{offer.limits[language]}</p>
                    </ServiceDisclosure>
                  </div>
                  <Link href={`/pricing#${offer.id}`} className={styles.price}>
                    {formatPrice(offer, language)} <ArrowIcon />
                  </Link>
                </li>
              ))}
          </ul>
          <Link href={`/pricing#${page.serviceId}`} className={styles.textLink}>
            {copy('Полный прайс и условия', 'Full pricing and terms')} <ArrowIcon />
          </Link>
        </section>
        <section
          className={styles.section}
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="proof-title"
        >
          <h2 id="proof-title" data-closing-copy="up">
            {copy('Посмотрите на практике.', 'See it in practice.')}
          </h2>
          <div className={styles.cases}>
            {page.proof.map((item) => (
              <article key={item.slug} data-closing-copy="up">
                <Link href={`/cases/${item.slug}`}>
                  <Image
                    src={`/assets/cases/${item.slug}-preview.png`}
                    width={1440}
                    height={1000}
                    sizes="(max-width: 700px) 100vw, 50vw"
                    alt={item.title[language]}
                  />
                  <h3>
                    {item.title[language]} <ArrowIcon />
                  </h3>
                </Link>
                <p>{item.description[language]}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="process-title"
        >
          <h2 id="process-title" data-closing-copy="up">
            {copy('От первого разговора до запуска.', 'From the first conversation to launch.')}
          </h2>
          <ol className={styles.process}>
            {parent.steps.map((step, i) => (
              <li key={step.title} data-closing-copy="up">
                <span className={styles.label}>0{i + 1}</span>
                <h3>{t(step.title)}</h3>
                <p>{t(step.description)}</p>
                <p className={styles.small}>{t(step.deliverable)}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className={styles.section}
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title" data-closing-copy="up">
            {copy('До начала работы.', 'Before we start.')}
          </h2>
          <div className={styles.faq}>
            {page.faq.map((item) => (
              <ServiceDisclosure key={item.question.ru} title={item.question[language]}>
                <p>{item.answer[language]}</p>
              </ServiceDisclosure>
            ))}
          </div>
        </section>
        <section
          className={`${styles.section} ${styles.contact}`}
          data-closing-row
          data-closing-rule="top"
          aria-labelledby="contact-title"
        >
          <div data-closing-copy="up">
            <h2 id="contact-title">{copy('Расскажите о задаче.', 'Tell us what you need.')}</h2>
            <p>
              {page.serviceId === 'video-content'
                ? copy(
                    'Расскажите о продукте, аудитории и целях. Подготовим индивидуальную программу видеопродвижения от 100 000 ₽: состав, этапы и бюджет согласуем до старта.',
                    'Tell us about the product, audience and goals. Build a tailored video marketing programme from ₽100,000, with scope, stages and budget agreed before starting.',
                  )
                : copy(
                    'Опишите результат, сроки и бюджет. Предложим подходящий объём: отдельный сценарий, компактный запуск или работу по этапам.',
                    'Share the outcome, timeline and budget. Start with a single workflow, a compact launch or a phased project.',
                  )}
            </p>
            <a className={styles.textLink} href="https://t.me/vneagency">
              [tg] @vneagency <ArrowIcon />
            </a>
            <a className={styles.textLink} href={`mailto:${siteConfig.email}`}>
              [mail] {siteConfig.email}
            </a>
          </div>
          <LeadForm
            variant="orbit"
            selectedService={service}
            onServiceChange={setService}
            pagePath={getKazanServiceHref(page.slug)}
          />
        </section>
        <nav className={styles.related} aria-label={copy('Другие услуги', 'Related services')}>
          {related.map((entry) => (
            <Link key={entry.slug} href={getKazanServiceHref(entry.slug)}>
              {entry.title[language]} <ArrowIcon />
            </Link>
          ))}
          <Link href={`/services/${page.serviceId}`}>
            {copy('Все возможности направления', 'Explore the full service')} <ArrowIcon />
          </Link>
        </nav>
      </main>
      <footer className={styles.footer}>
        <LegalLinks />
        <p>© 2026 [вне,ВНЕ] / [vne,VNE]</p>
      </footer>
    </div>
  )
}
