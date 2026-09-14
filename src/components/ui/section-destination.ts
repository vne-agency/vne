/** Resolve anchors against normal-flow markers, never a translated panel. */
export function sectionDestination(hash: string) {
  let id: string
  try {
    id = decodeURIComponent(hash.slice(1))
  } catch {
    return null
  }
  const target = document.getElementById(id)
  if (!target) return null
  let top = target.getBoundingClientRect().top + window.scrollY
  const root = target.closest<HTMLElement>('[data-services-transition]')
  if (root && getComputedStyle(root).getPropertyValue('--services-horizontal').trim() === '1') {
    const outgoing = root.querySelector<HTMLElement>('[data-services-outgoing]')
    if (outgoing?.contains(target)) {
      const outgoingRect = outgoing.getBoundingClientRect()
      const localTop = target.getBoundingClientRect().top - outgoingRect.top
      top =
        root.getBoundingClientRect().top +
        window.scrollY +
        Math.min(localTop, outgoingRect.height - window.innerHeight)
    }
  }
  const section =
    id === 'services' ? (document.getElementById('services-content') ?? target) : target
  return { top: Math.max(0, Math.ceil(top)), section }
}
