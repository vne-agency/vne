'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LegalLinks } from '@/components/legal/LegalLinks'
import { LeadForm } from '@/components/sections/LeadForm'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { AsciiStarsCanvas } from '@/components/experiments/ascii-stars/AsciiStarsCanvas'
import { serviceConstellations } from '@/components/experiments/ascii-stars/service-constellations'
import shell from '@/components/experiments/ascii-stars/OrbitServiceDialog.module.css'
import page from '@/components/experiments/ascii-stars/OrbitServiceDetail.module.css'
import flow from '@/components/experiments/ascii-stars/OrbitClosingFlow.module.css'
import motion from '@/components/experiments/ascii-stars/OrbitDetailMotion.module.css'
import { type CaseItem, getCaseHref } from '@/lib/cases/catalog'
import { turnkeyFaq, turnkeyLaunch, turnkeyOffer, turnkeyPackage } from '@/lib/services/turnkey'
import { siteConfig } from '@/lib/site'
import { ServiceDisclosure } from './ServiceDisclosure'
import styles from './TurnkeyServicePage.module.css'

export function TurnkeyServicePage({ cases }: { cases: readonly CaseItem[] }) {
  const { language, t } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const constellation = serviceConstellations.web
  const steps = [
    [
      copy('Расскажите об идее', 'Share your idea'),
      copy(
        'Проверяем, подходит ли задача под стартовую серию. Фиксируем структуру, материалы, цену и срок; затем вносится предоплата 50%.',
        'We confirm whether your task fits the launch series, agree on structure, materials, price and timing, then take a 50% advance.',
      ),
    ],
    [
      copy('Согласуем дизайн', 'Review the design'),
      copy(
        'Готовим содержание по вашим материалам и одну версию индивидуального дизайна. Включена одна собранная итерация правок.',
        'We prepare content from your materials and one custom design proposal. One consolidated revision round is included.',
      ),
    ],
    [
      copy('Соберём и подключим', 'Build and connect'),
      copy(
        'Разрабатываем сайт, админку и форму. Подключаем бота, аналитику и инструменты индексации.',
        'We develop the site, admin panel and form, and connect the bot, analytics and indexing tools.',
      ),
    ],
    [
      copy('Проверим и передадим', 'Check and hand over'),
      copy(
        'Проверяем мобильную версию, форму и уведомления. После согласования результата и оплаты оставшихся 50% публикуем сайт и передаём доступы.',
        'We check mobile layout, the form and notifications. After result approval and the remaining 50% payment, we publish the site and hand over access.',
      ),
    ],
  ]

  return (
    <div id="top" className={`${page.page} ${styles.page}`}>
      <a className={styles.skip} href="#turnkey-title">
        {copy('К содержанию', 'Skip to content')}
      </a>
      <header className={`${shell.toolbar} ${page.toolbar}`}>
        <Link className={shell.brand} href="/" aria-label={copy('ВНЕ — главная', 'VNE — home')}>
          <span className={shell.wordmark}>ВНЕ</span>
          <span className={`${shell.eyebrow} ${shell.brandCaption}`}>
            <RotatingSlogan />
          </span>
        </Link>
        <nav
          className={shell.toolbarRight}
          aria-label={copy('Основная навигация', 'Main navigation')}
        >
          <LanguageSwitch />
          <Link className={page.backLink} href="/#services">
            {copy('Услуги', 'Services')} <ArrowIcon />
          </Link>
        </nav>
      </header>
      <main className={`${shell.layout} ${flow.flow} ${motion.motion}`} data-detail-flow="service">
        <aside
          className={`${shell.visual} ${page.visual} ${styles.visual}`}
          style={{
            background: constellation.backgroundColor,
            color: constellation.foregroundColor,
          }}
          aria-hidden="true"
          inert
        >
          <div className={shell.visualLabel} data-detail-enter>
            <span>VNE / WEB START</span>
            <span>01—04</span>
          </div>
          <div className={shell.artwork} data-detail-enter="title">
            <AsciiStarsCanvas {...constellation} mode="ascii" density={0.72} speed={0} paused />
          </div>
          <div className={shell.visualFooter}>
            <span>DESIGN / CODE / LAUNCH</span>
            <span>
              {copy('От идеи к результату', 'From idea to delivery')} <ArrowIcon />
            </span>
          </div>
        </aside>
        <div className={shell.content} data-detail-content>
          <section
            className={`${shell.introduction} ${styles.hero}`}
            aria-labelledby="turnkey-title"
            data-closing-row
            data-detail-segment
            data-detail-intro
          >
            <span data-closing-spine aria-hidden="true" />
            <nav
              className={styles.breadcrumbs}
              aria-label={copy('Хлебные крошки', 'Breadcrumbs')}
              data-detail-enter
            >
              <Link href="/">ВНЕ</Link>
              <span>/</span>
              <Link href="/services/web">{copy('Сайты', 'Websites')}</Link>
              <span>/</span>
              <span>{copy('Под ключ', 'Turnkey')}</span>
            </nav>
            <p className={shell.eyebrow} data-detail-enter>
              {turnkeyLaunch.label[language]}
            </p>
            <h1 id="turnkey-title" className={shell.title} data-detail-enter="title">
              {copy('Сайт под ключ', 'A turnkey website')}
              <br />
              <span className={styles.price}>{copy('за 11 999 ₽', 'for ₽11,999')}</span>
            </h1>
            <p className={shell.description} data-detail-enter="copy">
              {copy(
                turnkeyOffer.introduction,
                'VNE is launching a series of three projects: a landing page for one service for ₽11,999. Custom design, copy based on your materials, content admin and Telegram enquiry notifications.',
              )}
            </p>
            <a
              className={`${shell.contact} ${styles.cta}`}
              href="#contact-form"
              data-detail-enter="control"
            >
              {copy('Обсудить сайт за 11 999 ₽', 'Discuss a website for ₽11,999')} <ArrowIcon />
            </a>
            <p className={styles.small} data-detail-enter="copy">
              {copy(
                'Без готового ТЗ. Расскажите об идее своими словами.',
                'No specification needed. Describe your idea in your own words.',
              )}
            </p>
            <a className={shell.introContact} href="#package">
              {copy('Что входит в стоимость', 'What the package includes')}{' '}
              <span aria-hidden="true">↓</span>
            </a>
            <p className={styles.giftNote}>{turnkeyLaunch.terms[language]}</p>
            <p className={styles.giftNote}>
              {copy(
                'В подарок: один домен .ru или .рф на год до 300 ₽ и первый месяц хостинга.',
                'Gift: one .ru or .рф domain for a year, costing up to ₽300, and the first month of hosting.',
              )}{' '}
              <a href="#gifts">{copy('Условия', 'Terms')}</a>
            </p>
          </section>

          <section
            id="package"
            className={shell.process}
            aria-labelledby="package-title"
            data-closing-row
            data-closing-rule="top"
          >
            <header className={shell.processHeader} data-closing-copy="up">
              <p className={shell.eyebrow}>01 / {copy('Состав пакета', 'The package')}</p>
              <h2 id="package-title" className={styles.heading}>
                {copy(
                  'Создание лендинга: что входит.',
                  'Building your landing page: what’s included.',
                )}
              </h2>
              <p className={styles.copy}>
                {copy(
                  'Чтобы заказать лендинг, не нужно собирать команду из разных специалистов. Берём на себя дизайн, разработку, наполнение и подключения.',
                  'No need to coordinate separate specialists. We handle design, development, content and integrations.',
                )}
              </p>
            </header>
            <ol className={shell.steps}>
              {turnkeyPackage.map((item, i) => (
                <li
                  key={item.title}
                  className={shell.step}
                  data-closing-row
                  data-closing-rule="top"
                  data-detail-segment
                >
                  <span data-closing-spine aria-hidden="true" />
                  <span className={shell.stepNumber} aria-hidden="true" data-closing-copy="up">
                    0{i + 1}
                  </span>
                  <div data-closing-copy="up">
                    <h3 className={styles.subheading}>{copy(item.title, item.enTitle)}</h3>
                    <p>{copy(item.text, item.enText)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            id="gifts"
            className={shell.outcome}
            aria-labelledby="gifts-title"
            data-closing-row
            data-closing-rule="top"
            data-detail-segment
          >
            <span data-closing-spine aria-hidden="true" />
            <div data-closing-copy="up">
              <p className={shell.eyebrow}>+ / {copy('Подарки на старт', 'Launch gifts')}</p>
              <h2 id="gifts-title" className={styles.heading}>
                {copy(
                  'Домен на год.\nХостинг на месяц.',
                  'A domain for a year.\nHosting for a month.',
                )}
              </h2>
              <p className={styles.copy}>
                {copy(
                  'Зарегистрируем один домен в зоне .ru или .рф стоимостью до 300 ₽ на один год. Хостинг подарим на первый месяц.',
                  'We register one .ru or .рф domain for one year, costing up to ₽300. The first month of hosting is also included as a gift.',
                )}
              </p>
              <p className={styles.small}>
                {copy(
                  'Далее домен и хостинг продлеваются отдельно по тарифам выбранных провайдеров. Стоимость продления уточняем до регистрации и подключения.',
                  'After these periods, the domain and hosting are renewed separately at the selected providers’ rates. We clarify renewal costs before registration and setup.',
                )}
              </p>
            </div>
          </section>

          <section
            className={styles.section}
            aria-labelledby="proof-title"
            data-closing-row
            data-closing-rule="top"
            data-detail-segment
          >
            <span data-closing-spine aria-hidden="true" />
            <div data-closing-copy="up">
              <p className={shell.eyebrow}>02 / {copy('Работы студии', 'Studio projects')}</p>
              <h2 id="proof-title" className={styles.heading}>
                {copy('Посмотрите,\nкак мы делаем.', 'See how\nwe build.')}
              </h2>
              <p className={styles.copy}>
                {copy(
                  'Реальные проекты из нашего портфолио. Их состав отличается от этого пакета: показываем подход к дизайну и разработке.',
                  'Real projects from our portfolio. Their scope differs from this package; they show our approach to design and development.',
                )}
              </p>
            </div>
            <div className={styles.cases}>
              {cases.map((item) => (
                <article key={item.slug} data-closing-copy="up">
                  <Link href={getCaseHref(item.slug)}>
                    <Image
                      src={item.preview}
                      alt={item.previewAlt ?? item.title}
                      width={1440}
                      height={1000}
                      sizes="(max-width: 600px) 100vw, (max-width: 800px) 50vw, 28vw"
                    />
                    <h3 className={styles.subheading}>
                      {item.projectName} <ArrowIcon />
                    </h3>
                    <p>{t(item.title)}</p>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section
            className={shell.process}
            aria-labelledby="process-title"
            data-closing-row
            data-closing-rule="top"
          >
            <header className={shell.processHeader} data-closing-copy="up">
              <p className={shell.eyebrow}>
                03 / {copy('От идеи до запуска', 'From idea to launch')}
              </p>
              <h2 id="process-title" className={styles.heading}>
                {copy('Понятно\nна каждом шаге.', 'Clear at\nevery step.')}
              </h2>
            </header>
            <ol className={shell.steps}>
              {steps.map(([title, text], i) => (
                <li
                  key={title}
                  className={shell.step}
                  data-closing-row
                  data-closing-rule="top"
                  data-detail-segment
                >
                  <span data-closing-spine aria-hidden="true" />
                  <span className={shell.stepNumber} aria-hidden="true" data-closing-copy="up">
                    0{i + 1}
                  </span>
                  <div data-closing-copy="up">
                    <h3 className={styles.subheading}>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className={styles.section}
            aria-labelledby="faq-title"
            data-closing-row
            data-closing-rule="top"
            data-detail-segment
          >
            <span data-closing-spine aria-hidden="true" />
            <p className={shell.eyebrow}>04 / FAQ</p>
            <h2 id="faq-title" className={styles.heading}>
              {copy('До начала работы.', 'Before we start.')}
            </h2>
            <div className={styles.faq}>
              {turnkeyFaq.map((item) => (
                <ServiceDisclosure key={item.question} title={copy(item.question, item.enQuestion)}>
                  <p>{copy(item.answer, item.enAnswer)}</p>
                </ServiceDisclosure>
              ))}
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.contact}`}
            aria-labelledby="contact-title"
            data-closing-row
            data-closing-rule="top"
            data-detail-segment
            data-closing-end
          >
            <span data-closing-spine aria-hidden="true" />
            <div data-closing-copy="up">
              <p className={shell.eyebrow}>{copy('Ваш следующий шаг', 'Your next step')}</p>
              <h2 id="contact-title" className={styles.heading}>
                {copy('Начнём\nс вашей идеи.', 'Let’s start\nwith your idea.')}
              </h2>
              <p className={styles.copy}>
                {copy(
                  'Чем вы занимаетесь, для кого нужен сайт и что хотите на нём показать? Этого достаточно для первого разговора. Работаем онлайн с бизнесом в Казани и Татарстане.',
                  'What do you do, who is the website for and what should it show? That is enough for a first conversation. We work online with businesses in Kazan and Tatarstan.',
                )}
              </p>
            </div>
            <LeadForm variant="orbit" fixedOffer={turnkeyOffer.id} pagePath={turnkeyOffer.path} />
            <a className={shell.introContact} href="https://t.me/vneagency">
              [tg] @vneagency <ArrowIcon />
            </a>
            <a className={shell.introContact} href={`mailto:${siteConfig.email}`}>
              [mail] {siteConfig.email} <ArrowIcon />
            </a>
          </section>
          <nav className={styles.related} aria-label={copy('Другие форматы', 'Other options')}>
            <Link href="/services/web">
              {copy('Все форматы разработки сайтов', 'All website development services')}{' '}
              <ArrowIcon />
            </Link>
            <Link href="/services/kazan/razrabotka-saytov">
              {copy('Разработка сайтов в Казани', 'Website development in Kazan')} <ArrowIcon />
            </Link>
          </nav>
        </div>
      </main>
      <footer className={styles.footer}>
        <LegalLinks />
        <p>© 2026 [вне,ВНЕ] / [vne,VNE]</p>
      </footer>
    </div>
  )
}
