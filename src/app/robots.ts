import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    // One shared group also applies to search crawlers such as OAI-SearchBot.
    // Media may be used in indexed pages; private API routes remain excluded.
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/media/file/'],
        disallow: ['/admin', '/api/', '/api$'],
      },
    ],
    sitemap: new URL('/sitemap.xml', getSiteUrl()).toString(),
    host: getSiteUrl().origin,
  }
}
