import { socialImage } from '@/lib/seo/social-image'

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params
  if (variant !== 'home' && variant !== 'lab') return new Response('Not found', { status: 404 })
  return socialImage(variant === 'home' ? 'vne.home' : 'vne.lab')
}
