'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { pricingGroups, pricingOffers, formatPrice } from '@/lib/pricing/catalog'
import styles from './ServicePricing.module.css'

export function ServicePricing({
  serviceId,
  compact = false,
  headingLevel = 3,
}: {
  serviceId: string
  compact?: boolean
  headingLevel?: 2 | 3
}) {
  const { language } = useSiteLanguage()
  const group = pricingGroups.find((entry) => entry.id === serviceId)
  if (!group) return null
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const summaryItems = group.summary[language].split(' · ')
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  if (compact)
    return (
      <div className={styles.compact}>
        <Link href={`/pricing#${group.id}`}>
          {summaryItems.map((item, index) => (
            <span className={styles.summaryItem} key={item}>
              {item.replace(/(\d) (?=\d{3}|₽)/g, '$1\u00a0')}
              {index === summaryItems.length - 1 && (
                <>
                  {' '}
                  <span aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </>
              )}
            </span>
          ))}
        </Link>
        {group.id === 'web' && (
          <p>
            {copy(
              'Стартовые условия пилота. Состав и участие согласуем до начала.',
              'Pilot launch terms. Scope and participation are confirmed before starting.',
            )}
          </p>
        )}
      </div>
    )
  return (
    <section className={styles.section} aria-labelledby={`service-prices-${group.id}`}>
      <Heading id={`service-prices-${group.id}`}>
        {copy('Форматы и цены', 'Options and pricing')}
      </Heading>
      <p>{group.description[language]}</p>
      {group.id === 'web' && (
        <p className={styles.note}>
          {copy(
            '29 000 ₽ и 45 000 ₽ — условия пилотной серии из трёх подходящих проектов. Участие подтверждаем после обсуждения задачи и доступности студии.',
            '₽29,000 and ₽45,000 apply to a pilot series of three suitable projects. Participation depends on the task and studio availability.',
          )}
        </p>
      )}
      <ul className={styles.list}>
        {pricingOffers
          .filter((offer) => offer.category === group.id)
          .map((offer) => (
            <li key={offer.id}>
              <Link href={`/pricing#${offer.id}`}>
                <span>{offer.name[language]}</span>
                <strong>{formatPrice(offer, language)}</strong>
              </Link>
              <p>{offer.scope[language]}</p>
              <details>
                <summary>{copy('Ограничения и срок', 'Limits and timing')}</summary>
                <p>{offer.limits[language]}</p>
                <p>
                  {offer.timing[language]}.{' '}
                  {copy(
                    'Точные даты согласуем до старта.',
                    'Exact dates are agreed before starting.',
                  )}
                </p>
              </details>
            </li>
          ))}
      </ul>
      <p className={styles.note}>
        {group.id === 'video-content'
          ? copy(
              'Видеопродвижение — единый пакет от 100 000 ₽. Индивидуально согласуем состав, объём, сроки и итоговую стоимость. Каждый этап работает на общую задачу продвижения и отдельно не продаётся.',
              'Video marketing is offered as one package from ₽100,000. Scope, volume, timing and the final price are agreed individually. Each stage supports the overall marketing goal and is not sold separately.',
            )
          : copy(
              'Нужные этапы выбираем под задачу. Цена «от» относится к базовому объёму; правки, материалы, подключения и расходы на сервисы фиксируем в смете. Допработы — после согласования. Поддержка отдельно, разовые задачи без подписки.',
              'We choose the stages your task needs. Starting prices cover the base scope; revisions, materials, integrations and service costs are set out in the quote. Extra work needs approval. Support is separate; one-off work needs no subscription.',
            )}
      </p>
      <Link className={styles.all} href={`/pricing#${group.id}`}>
        {copy('Полный прайс и условия', 'Full pricing and terms')}{' '}
        <span aria-hidden="true">
          <ArrowIcon />
        </span>
      </Link>
    </section>
  )
}
