import { afterEach, describe, expect, it, vi } from 'vitest'

import { verifyTurnstile } from '@/features/leads/verify-turnstile'

describe('verifyTurnstile', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
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
  it.each([
    ['vne.agency', true],
    ['another.example', false],
    [undefined, false],
  ])('checks verified hostname %s', async (hostname, expected) => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vne.agency')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
    vi.stubEnv('TURNSTILE_DISABLED', 'false')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, hostname }),
      }),
    )
    await expect(verifyTurnstile('test-token')).resolves.toBe(expected)
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })
})
