import { cache } from 'react'

import { fallbackCases, type CaseItem } from '@/lib/cases/catalog'

// Launch cases are maintained in code. Payload remains available for leads.
// CMS availability must not change public case content or indexing directives.
export const getHomeCases = cache(async (): Promise<readonly CaseItem[]> => fallbackCases)
