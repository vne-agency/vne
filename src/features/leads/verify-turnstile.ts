type TurnstileResponse = {
  success: boolean
  hostname?: string
  'error-codes'?: string[]
}

export async function verifyTurnstile(token?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  let isLocalSite = false

  if (siteUrl) {
    try {
      const hostname = new URL(siteUrl).hostname
      isLocalSite = hostname === 'localhost' || hostname === '127.0.0.1'
    } catch {
      isLocalSite = false
    }
  }

  if (process.env.TURNSTILE_DISABLED === 'true' && isLocalSite) return true

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TURNSTILE_SECRET_KEY is required in production.')
    }

    return true
  }

  if (!token) return false

  const body = new URLSearchParams({ secret, response: token })
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) return false

  const result = (await response.json()) as TurnstileResponse
  if (!result.success) return false
  if (!siteUrl) return false
  return result.hostname === new URL(siteUrl).hostname
}
