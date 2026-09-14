import { getLegalDocument, LEGAL_VERSION } from './documents'

export function leadConsentEvidence(now = new Date()) {
  return {
    accepted: true,
    recordedAt: now.toISOString(),
    version: LEGAL_VERSION,
    documentPath: '/consent',
    method: 'unchecked-checkbox-and-form-submit',
    document: getLegalDocument('consent')!,
  }
}
