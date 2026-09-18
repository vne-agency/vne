// Explicit allowlist: the form cannot inject an external URL into a lead.
export const leadPagePaths = [
  '/',
  '/pricing',
  '/services/kazan/razrabotka-saytov',
  '/services/kazan/telegram-boty',
  '/services/kazan/avtomatizatsiya-biznesa',
  '/services/kazan/videoprodvizhenie',
] as const

export function getLeadPagePath(value: unknown) {
  return leadPagePaths.find((path) => path === value) ?? '/'
}
