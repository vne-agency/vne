import config from '@payload-config'
import { getPayload } from 'payload'

import { leadSchema, type LeadInput } from '@/features/leads/schema'
import { verifyTurnstile } from '@/features/leads/verify-turnstile'
import { leadConsentEvidence } from '@/lib/legal/consent-evidence'
import { buildEnquiryMessage } from '@/features/leads/enquiry-message'

export async function createLead(input: LeadInput) {
  const data = leadSchema.parse(input)
  const isHuman = await verifyTurnstile(data.turnstileToken)

  if (!isHuman) {
    throw new Error('Не удалось подтвердить отправку формы.')
  }

  const payload = await getPayload({ config })

  return payload.create({
    collection: 'leads',
    data: {
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      telegramUsername: data.telegramUsername || undefined,
      message: buildEnquiryMessage(data),
      pageUrl: data.pageUrl,
      source: 'website',
      status: 'new',
      consentEvidence: leadConsentEvidence(),
      telegramNotificationStatus: 'pending',
      utm: {
        source: data.utmSource || undefined,
        medium: data.utmMedium || undefined,
        campaign: data.utmCampaign || undefined,
      },
    },
  })
}
