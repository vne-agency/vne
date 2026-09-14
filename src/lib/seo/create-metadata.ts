import type { Metadata } from 'next'

import { getSiteUrl, siteConfig } from '@/lib/site'

type CreateMetadataInput = {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function createMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  image = '/og/home',
  noIndex = false,
}: CreateMetadataInput = {}): Metadata {
  const canonical = new URL(path, getSiteUrl())

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      siteName: siteConfig.searchName,
      title: title ?? siteConfig.name,
      description,
      url: canonical,
      images: [{ url: new URL(image, getSiteUrl()), alt: title ?? siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? siteConfig.name,
      description,
      images: [new URL(image, getSiteUrl())],
    },
  }
}
