import { afterEach, describe, expect, it, vi } from 'vitest'

import { verifyTurnstile } from '@/features/leads/verify-turnstile'

describe('verifyTurnstile', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows the explicit bypass on localhost', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
    vi.stubEnv('TURNSTILE_DISABLED', 'true')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(verifyTurnstile()).resolves.toBe(true)
  })

  it('does not allow the localhost bypass on a public URL', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://elda.example')
    vi.stubEnv('TURNSTILE_DISABLED', 'true')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(verifyTurnstile()).rejects.toThrow(
      'TURNSTILE_SECRET_KEY is required in production.',
    )
  })
})
