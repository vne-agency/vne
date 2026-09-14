import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1', '*.trycloudflare.com'],
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/assets/**' }],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
