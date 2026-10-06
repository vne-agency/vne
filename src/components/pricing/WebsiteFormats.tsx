'use client'

import Link from 'next/link'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { pricingOffers, formatPrice } from '@/lib/pricing/catalog'
import { turnkeyOffer } from '@/lib/services/turnkey'
import styles from './WebsiteFormats.module.css'

export function WebsiteFormats({ onSelectIndividual }: { onSelectIndividual?: () => void }) {
  const { language } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const individual = pricingOffers.find((offer) => offer.id === 'landing')!

  return (
    <div className={styles.formats}>
      <p className={styles.intro}>
        {copy(
          'Два способа запустить лендинг. Выберите по задаче и составу работ.',
          'Two ways to launch a landing page. Choose by your task and scope.',
        )}
      </p>
      <div className={styles.options}>
        <article className={`${styles.option} ${styles.package}`}>
          <p className={styles.label}>{copy('01 / Пакет для запуска', '01 / Launch package')}</p>
          <div className={styles.heading}>
            <h3>{copy('Сайт под ключ', 'Turnkey website')}</h3>
            <p className={styles.price}>11 999 ₽</p>
          </div>
          <p>
            {copy(
              'Когда нужен лендинг с готовым набором подключений. Можно прийти с идеей — поможем со структурой и текстами.',
              'For a landing page with a defined set of integrations. Start with an idea — we help with structure and copy.',
            )}
          </p>
          <ul>
            <li>
              {copy(
                'Индивидуальный дизайн и адаптивная разработка.',
                'Custom design and responsive development.',
              )}
            </li>
            <li>
              {copy(
                'Тексты, админка, форма и Telegram-уведомления.',
                'Copy, content admin, enquiry form and Telegram notifications.',
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
              'Структуру и срок согласуем до старта. Функции вне пакета и дальнейшее продление домена и хостинга оплачиваются отдельно.',
              'Structure and timing are agreed before starting. Extra features and later domain and hosting renewals are paid separately.',
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
              'Когда есть свои требования к структуре, подаче и объёму. Проектируем лендинг по согласованному заданию и отдельно согласуем концепцию.',
              'For specific requirements for structure, presentation and scope. We design the landing page to an agreed brief and review the concept as a separate stage.',
            )}
          </p>
          <ul>
            <li>
              {copy(
                'До семи секций под вашу задачу, один язык.',
                'Up to seven sections for your task, one language.',
              )}
            </li>
            <li>
              {copy(
                'Одна визуальная концепция и две итерации правок.',
                'One visual concept and two revision rounds.',
              )}
            </li>
            <li>
              {copy(
                'Адаптивная разработка, форма, аналитика и базовая SEO-подготовка.',
                'Responsive development, a form, analytics and basic SEO.',
              )}
            </li>
            <li>{copy('Редактирование предоставленных текстов.', 'Editing of supplied copy.')}</li>
          </ul>
          <p className={styles.note}>
            {copy(
              'Ориентир — 7–20 рабочих дней. Точные даты и состав фиксируем до старта. Контент с нуля, 3D, сложные подключения, домен и хостинг — отдельно.',
              'Estimated timing: 7–20 working days. Dates and scope are agreed before starting. New content, 3D, complex integrations, domain and hosting are separate.',
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
          'За что доплата: за работу по индивидуальному заданию, отдельное согласование концепции и две итерации правок в объёме до семи секций. Индивидуальный дизайн есть в обоих вариантах. Если вам подходит состав пакета за 11 999 ₽, выбирайте его.',
          'The higher price covers work to an individual brief, a separate concept review and two revision rounds for up to seven sections. Both options include custom design. If the ₽11,999 package meets your needs, choose it.',
        )}
      </p>
    </div>
  )
}
