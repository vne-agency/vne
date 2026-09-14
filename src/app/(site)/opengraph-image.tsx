import { socialImage } from '@/lib/seo/social-image'

export const alt = 'vne.home — VNE design studio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return socialImage('vne.home')
}
