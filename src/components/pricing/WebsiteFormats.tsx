'use client'

import Link from 'next/link'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { pricingOffers, formatPrice } from '@/lib/pricing/catalog'
import { turnkeyLaunch, turnkeyOffer } from '@/lib/services/turnkey'
import styles from './WebsiteFormats.module.css'

export function WebsiteFormats({ onSelectIndividual }: { onSelectIndividual?: () => void }) {
  const { language } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const individual = pricingOffers.find((offer) => offer.id === 'landing')!

  return (
    <div className={styles.formats}>
      <p className={styles.intro}>
        {copy(
          'Для первого запуска — стартовая серия. Для подробной проработки предложения и дизайна — индивидуальный проект.',
          'Choose the launch series for a focused first website, or a custom project for deeper work on your offer and design.',
        )}
      </p>
      <div className={styles.options}>
        <article className={`${styles.option} ${styles.package}`}>
          <p className={styles.label}>{turnkeyLaunch.label[language]}</p>
          <div className={styles.heading}>
            <h3>{copy('Сайт под ключ', 'Turnkey website')}</h3>
            <p className={styles.price}>11 999 ₽</p>
          </div>
          <p>
            {copy(
              'Для одной услуги и понятного пути к заявке. Цена стартовой серии из трёх подходящих проектов: отрабатываем пакет и собираем кейсы.',
              'For one service and a clear enquiry flow. This launch-series price applies to three suitable projects as we refine the package and build case studies.',
            )}
          </p>
          <ul>
            <li>
              {copy(
                'До пяти секций, один язык, индивидуальный дизайн и одна итерация правок.',
                'Up to five sections, one language, custom design and one revision round.',
              )}
            </li>
            <li>
              {copy(
                'Тексты по вашим материалам, редактирование контента в админке, одна форма и Telegram-уведомления.',
                'Copy based on your materials, content editing in the admin panel, one form and Telegram notifications.',
              )}
            </li>
            <li>
              {copy(
                'Метрика, Вебмастер и базовая SEO-настройка.',
                'Metrika, Webmaster and foundational SEO.',
              )}
            </li>
            <li>
              {copy(
                'В подарок: один домен .ru или .рф на год до 300 ₽ и первый месяц хостинга.',
                'Gift: one .ru or .рф domain for a year up to ₽300 and the first month of hosting.',
              )}
            </li>
          </ul>
          <p className={styles.note}>
            {copy(
              'Участие подтверждаем после обсуждения задачи. Оплата 50% до начала и 50% после проверки результата. Срок фиксируем до старта. Новые функции и продление домена и хостинга — отдельно.',
              'Participation is confirmed after scoping. Payment is 50% before work and 50% after review. Timing is agreed before starting. Extra features and domain and hosting renewals are separate.',
            )}
          </p>
          <Link className={styles.cta} href={turnkeyOffer.path}>
            {copy('Посмотреть пакет за 11 999 ₽', 'View the ₽11,999 package')} <ArrowIcon />
          </Link>
        </article>
        <article className={styles.option} id={onSelectIndividual ? 'landing' : undefined}>
          <p className={styles.label}>
            {copy('02 / По индивидуальному заданию', '02 / Individually scoped')}
          </p>
          <div className={styles.heading}>
            <h3>{individual.name[language]}</h3>
            <p className={styles.price}>{formatPrice(individual, language)}</p>
          </div>
          <p>
            {copy(
              'Когда нужно проработать предложение, возражения покупателей и визуальную подачу до разработки. Отдельные этапы исследования, прототипа и согласования дизайна.',
              'For deeper work on your offer, customer objections and visual presentation before development. Research, prototyping and design review are separate stages.',
            )}
          </p>
          <ul>
            <li>
              {copy(
                'Бриф и разбор до трёх конкурентов: фиксируем аудиторию, предложение и возражения.',
                'A brief and review of up to three competitors to define the audience, offer and objections.',
              )}
            </li>
            <li>
              {copy(
                'Отдельный прототип до семи секций, одна дизайн-концепция и две итерации правок.',
                'A separate prototype of up to seven sections, one design concept and two revision rounds.',
              )}
            </li>
            <li>
              {copy(
                'Один язык, адаптивная разработка, форма, аналитика и базовая SEO-подготовка.',
                'One language, responsive development, a form, analytics and basic SEO.',
              )}
            </li>
            <li>{copy('Редактирование предоставленных текстов.', 'Editing of supplied copy.')}</li>
          </ul>
          <p className={styles.note}>
            {copy(
              'Ориентир — 7–20 рабочих дней. Точные даты и состав фиксируем до старта. Контент с нуля, 3D, CMS, сложные подключения, домен и хостинг — отдельно.',
              'Estimated timing: 7–20 working days. Dates and scope are agreed before starting. New content, 3D, CMS, complex integrations, domain and hosting are separate.',
            )}
          </p>
          {onSelectIndividual ? (
            <a className={styles.cta} href="#contact" onClick={onSelectIndividual}>
              {copy('Обсудить индивидуальный проект', 'Discuss a custom project')} <ArrowIcon />
            </a>
          ) : (
            <Link className={styles.cta} href="/pricing#landing">
              {copy('Обсудить индивидуальный проект', 'Discuss a custom project')} <ArrowIcon />
            </Link>
          )}
        </article>
      </div>
      <p className={styles.difference}>
        {copy(
          '11 999 ₽ — временная цена ограниченной стартовой серии. В проекте за 45 000 ₽ дополнительно прорабатываем предложение и конкурентов, согласуем отдельный прототип и дизайн. Индивидуальное оформление есть в обоих вариантах; если задача укладывается в стартовый пакет, переплачивать не нужно.',
          '₽11,999 is the temporary price of a limited launch series. The ₽45,000 project adds work on the offer and competitors, plus a separate prototype and design review. Both include custom styling; if your task fits the launch package, there is no need to pay more.',
        )}
      </p>
    </div>
  )
}
