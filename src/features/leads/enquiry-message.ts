import { pricingOffers } from '@/lib/pricing/catalog'
import type { LeadInput } from './schema'

// Keep the brief together in the existing message column. It is also the source
// for manager notifications, so this does not require a database migration.
export function buildEnquiryMessage(data: Pick<LeadInput, 'message' | 'budget' | 'service'>) {
  const offer = pricingOffers.find((entry) => entry.id === data.service)
  return [
    offer ? `Услуга: ${offer.name.ru}` : '',
    data.budget?.trim() ? `Ориентир по бюджету: ${data.budget.trim()}` : '',
    data.message.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')
}
