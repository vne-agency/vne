'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LeadForm } from '@/components/sections/LeadForm'
import { LegalLinks } from '@/components/legal/LegalLinks'
import { pricingGroups, pricingOffers, formatPrice } from '@/lib/pricing/catalog'
import { siteConfig } from '@/lib/site'
import flow from '@/components/experiments/ascii-stars/OrbitClosingFlow.module.css'
import detailMotion from '@/components/experiments/ascii-stars/OrbitDetailMotion.module.css'
import contactStyles from '@/components/experiments/ascii-stars/OrbitContact.module.css'
import styles from './PricingPage.module.css'
import motion from './PricingMotion.module.css'
import { PricingDisclosure } from './PricingDisclosure'

export function PricingPage() {
  const { language } = useSiteLanguage()
  const [service, setService] = useState('')
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  return (
    <div
      className={`${styles.page} ${flow.flow} ${detailMotion.motion} ${motion.motion}`}
      data-pricing-motion
      id="top"
    >
      <a className={styles.skip} href="#price-content">
        {copy('К прайсу', 'Skip to pricing')}
      </a>
      <header className={styles.header}>
        <div className={styles.brandPanel}>
          <Link
            href="/"
            className={styles.brand}
            aria-label={copy('ВНЕ — на главную', 'VNE — home')}
            data-loader-logo
          >
            ВНЕ
          </Link>
          <RotatingSlogan />
        </div>
        <nav className={styles.headerActions} aria-label={copy('Навигация', 'Navigation')}>
          <LanguageSwitch />
          <Link
            href="/"
            aria-label={copy('./home — вернуться в студию', './home — back to studio')}
          >
            <span>./home</span>
            <Image
              src="/assets/brand/vne-orbit-mark.svg"
              className={styles.homeLogo}
              width={24}
              height={28}
              alt=""
            />
          </Link>
        </nav>
      </header>
      <main id="price-content">
        <section
          className={styles.hero}
          aria-labelledby="pricing-title"
          data-pricing-hero
          data-closing-row
          data-closing-rule="bottom"
        >
          <span data-closing-spine aria-hidden="true" />
          <div className={styles.heroMeta} data-detail-enter>
            <p className={styles.meta}>VNE / PRICING</p>
            <p>
              {copy(
                'От отдельной задачи до целой системы.',
                'From a single task to a complete system.',
              )}
            </p>
          </div>
          <div className={styles.heroCopy} data-pricing-hero-copy>
            <p className={styles.meta} data-detail-enter>
              {copy('Услуги / Стоимость / Объём', 'Services / Pricing / Scope')}
            </p>
            <h1 id="pricing-title" data-detail-enter="title">
              {copy('Начнём с вашей задачи.', 'Start with your task.')}
            </h1>
            <p className={styles.lead} data-detail-enter="copy">
              {copy(
                'Обсудим любой бюджет. Предложим понятный объём: отдельную доработку, компактный запуск или большой проект по этапам.',
                'We’re open to discussing any budget. We’ll suggest a clear scope: a small update, a compact launch or a larger project in stages.',
              )}
            </p>
            <div className={styles.quickPrices}>
              {pricingOffers
                .filter((offer) => offer.pilot)
                .map((offer) => (
                  <a href={`#${offer.id}`} key={offer.id} data-detail-enter="control">
                    <span>{offer.name[language]}</span>
                    <strong>{formatPrice(offer, language)}</strong>
                    <span className={styles.meta}>
                      {copy('Пилотный формат', 'Pilot offer')} <ArrowIcon />
                    </span>
                  </a>
                ))}
            </div>
            <a href="#contact" className={styles.textLink} data-detail-enter="control">
              {copy('Обсудить задачу', 'Discuss your task')}{' '}
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </section>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav aria-label={copy('Направления прайса', 'Pricing categories')}>
              {pricingGroups.map((group, index) => (
                <a href={`#${group.id}`} key={group.id}>
                  <span className={styles.meta}>0{index + 1}</span>
                  <span>{group.name[language]}</span>
                  <span aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </a>
              ))}
              <a href="#terms">
                <span className={styles.meta}>06</span>
                <span>{copy('Условия работы', 'Working terms')}</span>
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </nav>
            <p className={styles.sideNote}>
              {copy(
                'Все цены — в рублях. Итоговый состав, расходы и сроки согласуем до начала работы.',
                'All prices are in RUB. We agree on scope, expenses and schedule before work begins.',
              )}
            </p>
          </aside>
          <div className={styles.catalog} data-pricing-catalog>
            <div className={styles.pilot} id="pilot" data-closing-row data-pricing-cell>
              <span data-closing-spine aria-hidden="true" />
              <p className={styles.meta} data-closing-copy="up">
                {copy('Стартовые условия / пилот', 'Launch terms / pilot')}
              </p>
              <h2 data-closing-copy="up">
                {copy('Небольшой проект. Понятный результат.', 'A small project. A clear result.')}
              </h2>
              <p data-closing-copy="up">
                {copy(
                  '29 000 ₽ за компактный запуск и 45 000 ₽ за индивидуальный лендинг — условия пилотной серии из трёх подходящих проектов. Участие подтверждаем после обсуждения задачи и доступности студии. Цена принятого объёма фиксируется до старта.',
                  '₽29,000 for a compact launch and ₽45,000 for a custom landing page apply to a pilot series of three suitable projects. Participation is confirmed after reviewing the task and studio availability. The price of the agreed scope is fixed before starting.',
                )}
              </p>
              <p data-closing-copy="up">
                {copy(
                  'Готовые материалы, одно предложение и ограниченный объём помогают сделать запуск доступнее. Домены, хостинг и платные сервисы покажем отдельно в полной смете.',
                  'Ready materials, one offer and a focused scope help keep the launch affordable. Domains, hosting and paid services are listed separately in the full quote.',
                )}
              </p>
            </div>
            {pricingGroups.map((group, index) => (
              <section
                className={styles.group}
                id={group.id}
                key={group.id}
                aria-labelledby={`group-${group.id}`}
              >
                <header
                  className={styles.groupHeader}
                  data-closing-row
                  data-closing-rule="top"
                  data-pricing-cell
                >
                  <span data-closing-spine aria-hidden="true" />
                  <p className={styles.meta} data-closing-copy="up">
                    0{index + 1} / {copy('Направление', 'Category')}
                  </p>
                  <h2 id={`group-${group.id}`} data-closing-copy="up">
                    {group.name[language]}
                  </h2>
                  <p data-closing-copy="up">{group.description[language]}</p>
                </header>
                <div className={styles.offers}>
                  {pricingOffers
                    .filter((offer) => offer.category === group.id)
                    .map((offer) => (
                      <article
                        className={`${styles.offer} ${offer.pilot ? styles.featured : ''}`}
                        id={offer.id}
                        key={offer.id}
                        aria-labelledby={`offer-${offer.id}`}
                        data-closing-row
                        data-closing-rule="top"
                        data-pricing-cell="offer"
                      >
                        <span data-closing-spine aria-hidden="true" />
                        <div className={styles.offerHeading} data-closing-copy="up">
                          <div>
                            {offer.pilot && (
                              <a href="#pilot" className={styles.badge}>
                                {copy('Пилотный формат', 'Pilot offer')}
                              </a>
                            )}
                            <h3 id={`offer-${offer.id}`}>{offer.name[language]}</h3>
                          </div>
                          <p className={styles.price}>{formatPrice(offer, language)}</p>
                        </div>
                        <p className={styles.scope} data-closing-copy="up">
                          {offer.scope[language]}
                        </p>
                        <PricingDisclosure
                          title={copy('Границы и сроки', 'Scope limits and timing')}
                          paragraphs={[
                            offer.limits[language],
                            `${copy('Ориентир по сроку: ', 'Estimated timing: ')}${offer.timing[language]}. ${copy(
                              'Точные даты — после обсуждения задачи.',
                              'Exact dates follow scoping.',
                            )}`,
                          ]}
                        >
                          <a href="#terms">
                            {copy(
                              'Общие условия и дополнительные расходы',
                              'Shared terms and additional expenses',
                            )}
                          </a>
                        </PricingDisclosure>
                        <a
                          href="#contact"
                          className={styles.offerCta}
                          onClick={() => setService(offer.id)}
                          aria-label={`${copy('Обсудить: ', 'Discuss: ')}${offer.name[language]}`}
                          data-closing-row
                          data-closing-rule="top"
                          data-pricing-rule
                        >
                          <span data-closing-copy="up">
                            {copy('Обсудить этот формат', 'Discuss this option')}
                          </span>
                          <span aria-hidden="true" data-closing-copy="up">
                            <ArrowIcon />
                          </span>
                        </a>
                      </article>
                    ))}
                </div>
              </section>
            ))}
            <section
              className={styles.terms}
              id="terms"
              aria-labelledby="terms-title"
              data-closing-row
              data-closing-rule="top"
              data-pricing-cell
            >
              <span data-closing-spine aria-hidden="true" />
              <p className={styles.meta} data-closing-copy="up">
                06 / {copy('Договоримся до старта', 'Agreed before starting')}
              </p>
              <h2 id="terms-title" data-closing-copy="up">
                {copy('Что важно знать.', 'What to know.')}
              </h2>
              {[
                [
                  'Цена и состав',
                  'Price and scope',
                  'Фиксированные цены действуют для описанной комплектации, «от» — для базового объёма. Итоговую цену, включённые работы и применимые налоги фиксируем в предложении до начала. Для цифровых продуктов при меньшем бюджете ищем полезную отдельную задачу. Видеопродвижение предоставляем только единым пакетом от 100 000 ₽; отдельные ролики и этапы не продаются.',
                  'Fixed prices cover the described package; “from” prices cover the base scope. The final price, included work and applicable taxes are set out before starting. For digital products, a smaller budget can cover a useful standalone task. Video marketing is available only as a complete package from ₽100,000; individual videos and stages are not sold separately.',
                ],
                [
                  'Материалы и дополнительные расходы',
                  'Materials and additional costs',
                  'Для стартовых сайтов нужны ваши тексты и изображения. Домен, хостинг, платформа, лицензии, CRM и AI-сервисы — отдельные строки сметы. Согласованные служебные тексты и ссылки разместим; подготовка юридических документов не включена.',
                  'Launch websites use your copy and images. Domains, hosting, platforms, licences, CRM and AI usage are separate quote items. We place agreed legal copy and links; drafting legal documents is not included.',
                ],
                [
                  'Правки и изменение задачи',
                  'Revisions and scope changes',
                  'Итерация — один собранный список замечаний в согласованном объёме. Новая концепция, страница, язык или подключение сначала оцениваются и согласуются. Исправление несоответствий принятому заданию не расходует лимит творческих правок.',
                  'A revision round is one consolidated feedback list within the agreed scope. A new concept, page, language or integration is quoted and approved first. Fixing deviations from the agreed specification does not use up creative revision rounds.',
                ],
                [
                  'Сроки и этапы',
                  'Schedule and stages',
                  'Для коротких проектов указаны рабочие дни, для приложений — календарные месяцы. Отсчёт начинается с согласованного старта после получения материалов и доступов. Ожидание согласований и внешних сервисов учитываем в плане. Каждый этап имеет результат и цену; подготовка или прототип ещё не являются готовым сайтом.',
                  'Short projects use working days; apps use calendar months. Timing starts on the agreed date once materials and access are available. Reviews and external dependencies are accounted for in the plan. Each stage has a deliverable and price; preparation or a prototype is not a finished website.',
                ],
                [
                  'Поддержка без безлимита',
                  'Support with clear limits',
                  'Поддержка — до 10 часов, развитие — до 20 часов на один проект в месяц. Режим: пн–пт, 10:00–18:00 МСК, кроме нерабочих дней. Первая реакция — до одного рабочего дня; срок устранения определяем после диагностики. Диагностика, обсуждения и проверка входят в часы. Учёт — по 15 минут, отчёт по задачам; предупредим при расходовании 80%. Остаток не переносится. Сверх лимита работаем только после согласования; иначе задачи приостанавливаются. Круглосуточное дежурство не включено. Покрытые условиями проекта дефекты не списываются как платные доработки.',
                  'Support includes up to 10 hours, development up to 20 hours for one project per month. Service hours: Mon–Fri, 10:00–18:00 Moscow time, excluding non-working days. Initial response within one working day; resolution is estimated after diagnosis. Diagnosis, discussion and testing count towards the allowance. Time is tracked in 15-minute increments with task reports and an alert at 80%. Unused hours do not roll over. Overage needs approval; otherwise tasks pause. Round-the-clock staffing is not included. Defects covered by the project terms are not billed as new updates.',
                ],
                [
                  'Результат и ограничения',
                  'Deliverables and limitations',
                  'Дизайн отдельно — макеты в Figma; сайт — согласованный запуск; приложение — рабочая сборка и согласованный этап подготовки или подачи в магазин. Базовая SEO-подготовка включает технические настройки, а не продвижение и гарантии позиций. AI проверяем на согласованных примерах; сложные вопросы передаются человеку. Автоматическая работа вне рабочих часов не означает безошибочные ответы или круглосуточную поддержку. Общие компоненты бота и автоматизации оцениваем один раз.',
                  'Design-only work delivers Figma files; a website includes its agreed launch; an app delivers a working build and the agreed store preparation or submission stage. Basic SEO covers technical setup, not ongoing promotion or ranking guarantees. AI is tested on agreed examples, with difficult cases handed to a person. Automated out-of-hours operation does not imply error-free answers or round-the-clock support. Shared bot and automation components are quoted once.',
                ],
              ].map(([ruTitle, enTitle, ru, en]) => (
                <PricingDisclosure
                  key={ruTitle}
                  variant="term"
                  title={copy(ruTitle, enTitle)}
                  paragraphs={[copy(ru, en)]}
                />
              ))}
            </section>
          </div>
        </div>
        <section
          className={styles.contact}
          id="contact"
          aria-labelledby="price-contact-title"
          data-closing-row
          data-closing-rule="top"
          data-pricing-contact
        >
          <div data-closing-row data-closing-end>
            <p className={styles.meta} data-closing-copy="up">
              {copy('Начнём с разговора', 'Let’s talk')}
            </p>
            <h2 id="price-contact-title" data-closing-copy="up">
              {copy('Есть задача и другой бюджет?', 'A different task or budget?')}
            </h2>
            <p data-closing-copy="up">
              {copy(
                'Опишите, что нужно сделать. Подберём подходящий объём или полезный первый этап. Для разовой задачи не нужен абонемент.',
                'Tell us what you need. We’ll suggest a suitable scope or useful first stage. One-off tasks do not need a monthly plan.',
              )}
            </p>
            <address className={contactStyles.directContact} data-closing-copy="up">
              <a href={`mailto:${siteConfig.email}`}>
                <span>[mail] {siteConfig.email}</span>
                <span className={contactStyles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
              <a href="https://t.me/vneagency" target="_blank" rel="noopener noreferrer">
                <span>[tg] @vneagency</span>
                <span className={contactStyles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
              <a href="https://t.me/wearevne" target="_blank" rel="noopener noreferrer">
                <span>[tg+channel] @wearevne</span>
                <span className={contactStyles.emailArrow} aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </address>
          </div>
          <div data-pricing-form>
            <LeadForm
              variant="orbit"
              selectedService={service}
              onServiceChange={setService}
              pagePath="/pricing"
            />
          </div>
        </section>
      </main>
      <footer className={styles.footer} data-closing-row data-closing-end>
        <Link href="/" data-closing-copy="up">
          © 2026 / ВНЕ
        </Link>
        <div data-closing-copy="up">
          <LegalLinks />
        </div>
        <a href="#top" data-closing-copy="up">
          {copy('Наверх ↑', 'Back to top ↑')}
        </a>
      </footer>
    </div>
  )
}
