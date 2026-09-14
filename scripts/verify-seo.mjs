import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import sharp from 'sharp'

// Read-only HTTP checks against an explicitly chosen server. Never starts/stops a server.
const base = new URL(process.env.SEO_TEST_BASE_URL ?? 'http://127.0.0.1:3187')
const canonicalOrigin = process.env.SEO_CANONICAL_ORIGIN ?? 'https://vne.agency'
const report = {
  base: base.origin,
  checkedAt: new Date().toISOString(),
  pages: [],
  redirects: [],
  images: [],
  checks: 0,
}
function check(condition, message) {
  report.checks++
  assert.ok(condition, message)
}
async function get(path, userAgent = 'Googlebot') {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual',
    headers: { 'user-agent': userAgent },
    signal: AbortSignal.timeout(30000),
  })
  return { response, text: await response.text() }
}
const sitemap = await get('/sitemap.xml')
check(sitemap.response.status === 200, 'Sitemap HTTP 200')
const xml = new JSDOM(sitemap.text, { contentType: 'text/xml' }).window.document
const canonicalUrls = [...xml.querySelectorAll('loc')].map((node) => node.textContent)
check(canonicalUrls.length === new Set(canonicalUrls).size, 'Sitemap URLs unique')
check(!xml.querySelector('lastmod'), 'No fabricated modification dates')
const indexedPaths = canonicalUrls.map((value) => {
  const url = new URL(value)
  check(url.origin === canonicalOrigin, `Sitemap origin: ${value}`)
  return url.pathname
})
const expectedPaths = [
  '/',
  '/lab',
  '/services/web',
  '/services/bots-crm',
  '/services/ai',
  '/services/video-content',
  '/cases/kotopes',
  '/cases/arc-store',
]
check(
  expectedPaths.every((path) => indexedPaths.includes(path)) &&
    expectedPaths.length === indexedPaths.length,
  'Sitemap has exactly all eight indexable pages',
)
const noindexPaths = [
  '/cases/codeam',
  '/privacy',
  '/consent',
  '/cookies',
  '/analytics-consent',
  '/terms',
]
const documents = new Map()
for (const path of [...indexedPaths, ...noindexPaths]) {
  const { response, text } = await get(path)
  check(response.status === 200, `${path}: HTTP 200`)
  const doc = new JSDOM(text).window.document
  documents.set(path, doc)
  const meta = (name) =>
    doc.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.getAttribute('content')
  check(doc.querySelectorAll('title').length === 1, `${path}: one title`)
  check(doc.querySelectorAll('h1').length === 1, `${path}: one server-rendered h1`)
  check(doc.documentElement.lang === 'ru', `${path}: Russian server content language`)
  check(!doc.querySelector('link[hreflang]'), `${path}: no nonexistent locale alternatives`)
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')
  check(
    canonical && new URL(canonical).href === new URL(path, canonicalOrigin).href,
    `${path}: self canonical`,
  )
  const indexable = indexedPaths.includes(path)
  check(
    meta('robots') === (indexable ? 'index, follow' : 'noindex, follow'),
    `${path}: correct index/follow`,
  )
  for (const name of [
    'description',
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'twitter:title',
    'twitter:description',
    'twitter:image',
  ]) {
    check(Boolean(meta(name)), `${path}: ${name}`)
  }
  check(
    new URL(meta('og:url')).href === new URL(canonical).href,
    `${path}: OG URL matches canonical`,
  )
  const title = path === '/' ? 'vne.home' : path === '/lab' ? 'vne.lab' : undefined
  if (title)
    check(
      doc.title === title && meta('og:title') === title && meta('twitter:title') === title,
      `${path}: agreed titles`,
    )
  const graphs = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((node) => {
    const data = JSON.parse(node.textContent)
    check(data['@context'] === 'https://schema.org', `${path}: JSON-LD context`)
    return data['@graph'] ?? [data]
  })
  const organization = graphs.find((node) => node['@type'] === 'Organization')
  check(
    organization?.email === 'vne.agency@internet.ru' &&
      organization?.legalName === 'ИП Баров Евгений Алексеевич',
    `${path}: confirmed organization`,
  )
  if (path.startsWith('/services/')) {
    const service = graphs.find((node) => node['@type'] === 'Service')
    check(
      service && doc.querySelector('main').textContent.includes(service.description),
      `${path}: service schema matches visible HTML`,
    )
    check(doc.querySelectorAll('main h2').length >= 2, `${path}: readable service sections`)
  }
  report.pages.push({
    path,
    status: response.status,
    title: doc.title,
    canonical,
    robots: meta('robots'),
    h1: doc.querySelector('h1')?.textContent,
    htmlBytes: Buffer.byteLength(text),
    schemaTypes: graphs.map((node) => node['@type']),
  })
}
const home = documents.get('/')
for (const path of expectedPaths.filter(
  (path) => path.startsWith('/services/') || path.startsWith('/cases/'),
)) {
  check(Boolean(home.querySelector(`a[href="${path}"]`)), `Home links to ${path}`)
}
for (const [path, doc] of documents) {
  for (const a of doc.querySelectorAll('a[href]')) {
    const raw = a.getAttribute('href')
    if (!raw.startsWith('/') && !raw.startsWith('#')) continue
    const target = new URL(raw, new URL(path, base))
    if (target.origin !== base.origin) continue
    const targetDoc = documents.get(target.pathname)
    check(Boolean(targetDoc), `${path}: internal URL exists: ${raw}`)
    if (target.hash)
      check(
        Boolean(targetDoc.getElementById(decodeURIComponent(target.hash.slice(1)))),
        `${path}: fragment exists: ${raw}`,
      )
  }
}
for (const [path, location] of [
  ['/preview/studio', '/'],
  ['/preview/ascii-stars', '/lab'],
  ['/preview/ascii-stars/hero-light', '/'],
  ['/preview/ascii-stars/hero-dark', '/'],
]) {
  const { response } = await get(path)
  check(
    response.status === 308 && response.headers.get('location') === location,
    `${path}: permanent redirect`,
  )
  report.redirects.push({ path, status: response.status, location })
}
for (const path of ['/services/unknown-service', '/cases/unknown-case', '/unknown-page']) {
  const { response, text } = await get(path)
  check(response.status === 404, `${path}: real HTTP 404`)
  check(/noindex/.test(text), `${path}: noindex error`)
}
const robots = await get('/robots.txt')
check(robots.response.status === 200, 'robots HTTP 200')
check(robots.text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'Robots canonical sitemap')
check(!/^Disallow: \/\s*$/m.test(robots.text), 'Public crawler access allowed')
check(
  robots.text.includes('Disallow: /admin') && robots.text.includes('Allow: /api/media/file/'),
  'Admin excluded and content media accessible',
)
for (const userAgent of ['OAI-SearchBot', 'PerplexityBot', 'bingbot', 'YandexBot']) {
  const { response, text } = await get('/services/web', userAgent)
  check(
    response.status === 200 && text.includes('Карта сайта и согласованный объём работ.'),
    `${userAgent}: full service HTML without JS`,
  )
}
for (const path of ['/og/home', '/og/lab']) {
  const response = await fetch(new URL(path, base))
  const buffer = Buffer.from(await response.arrayBuffer())
  check(
    response.status === 200 && response.headers.get('content-type')?.includes('image/png'),
    `${path}: PNG HTTP 200`,
  )
  const info = await sharp(buffer).metadata()
  check(info.width === 1200 && info.height === 630, `${path}: 1200x630`)
  report.images.push({ path, width: info.width, height: info.height, bytes: buffer.length })
  await mkdir('.runtime/seo', { recursive: true })
  await writeFile(`.runtime/seo/${path.endsWith('home') ? 'home' : 'lab'}.png`, buffer)
}
await mkdir('.runtime/seo', { recursive: true })
await writeFile('.runtime/seo/verification.json', JSON.stringify(report, null, 2))
console.log(
  `${report.checks} SEO checks passed; ${report.pages.length} pages, ${report.redirects.length} redirects, ${report.images.length} previews. Report: .runtime/seo/verification.json`,
)
