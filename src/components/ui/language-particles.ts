type Particle = { x: number; y: number; color: string; dx: number; dy: number; size: number }
export type TextParticleSnapshot = { bitmap: HTMLCanvasElement; particles: Particle[] }
type Snapshot = TextParticleSnapshot

let stopTransition: ((finish?: boolean) => void) | undefined
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number) => 1 - (1 - clamp(value)) ** 3
const noise = (index: number) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

function visibleTextParents(scope: Element, vocabulary?: Set<string>) {
  const parents = new Set<HTMLElement>()
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const parent = node.parentElement
    const text = node.textContent?.replace(/\s+/g, ' ').trim()
    if (!parent || !text) continue
    // Structured labels may be translated by their component rather than the
    // shared dictionary (for example, numbered navigation links).
    if (vocabulary && !vocabulary.has(text) && !parent.closest('[data-language-particle-text]'))
      continue
    if (
      parent.closest(
        'script, style, canvas, svg, time, [aria-hidden="true"], [data-rotating-slogan], [data-language-switch]',
      )
    )
      continue
    if (!vocabulary && parent.closest('[data-floating-navigation]')) continue
    const rect = parent.getBoundingClientRect()
    if (
      !rect.width ||
      !rect.height ||
      rect.bottom < 0 ||
      rect.top > innerHeight ||
      rect.right < 0 ||
      rect.left > innerWidth
    )
      continue
    let visible = true
    for (
      let ancestor: Element | null = parent;
      ancestor && ancestor !== scope.parentElement;
      ancestor = ancestor.parentElement
    ) {
      const style = getComputedStyle(ancestor)
      if (
        style.visibility === 'hidden' ||
        style.display === 'none' ||
        Number(style.opacity) < 0.05
      ) {
        visible = false
        break
      }
    }
    if (visible) parents.add(parent)
  }
  // Only the outermost selected text container needs a snapshot and an ink mask.
  return [...parents].filter(
    (parent) => ![...parents].some((other) => other !== parent && other.contains(parent)),
  )
}

function snapshot(parents: HTMLElement[], width: number, height: number): Snapshot {
  const bitmap = document.createElement('canvas')
  bitmap.width = width
  bitmap.height = height
  const context = bitmap.getContext('2d', { willReadFrequently: true })!
  const range = document.createRange()
  let characters = 0
  // All DOM measurements happen here, before hiding text or starting animation.
  for (const parent of parents) {
    context.save()
    for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor)
      if (/(auto|scroll|hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`)) {
        const clip = ancestor.getBoundingClientRect()
        context.beginPath()
        context.rect(clip.left, clip.top, clip.width, clip.height)
        context.clip()
      }
    }
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT)
    while (walker.nextNode() && characters < 4500) {
      const node = walker.currentNode
      const element = node.parentElement!
      if (element.closest('[aria-hidden="true"], svg, canvas')) continue
      const style = getComputedStyle(element)
      if (style.visibility === 'hidden' || Number(style.opacity) < 0.05) continue
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      context.fillStyle = style.color
      const metrics = context.measureText('Hg')
      const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8
      const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.2
      let offset = 0
      for (const character of node.textContent ?? '') {
        const start = offset
        offset += character.length
        if (/\s/.test(character)) continue
        range.setStart(node, start)
        range.setEnd(node, offset)
        const rect = range.getBoundingClientRect()
        if (
          !rect.width ||
          !rect.height ||
          rect.bottom < 0 ||
          rect.top > height ||
          rect.right < 0 ||
          rect.left > width
        )
          continue
        const glyph =
          style.textTransform === 'uppercase' ? character.toLocaleUpperCase() : character
        const scale = rect.height / (ascent + descent)
        context.font = `${style.fontStyle} ${style.fontWeight} ${parseFloat(style.fontSize) * scale}px ${style.fontFamily}`
        context.fillText(glyph, rect.left, rect.top + ascent * scale)
        characters++
      }
    }
    context.restore()
  }
  const pixels = context.getImageData(0, 0, width, height).data
  const particles: Particle[] = []
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const index = (y * width + x) * 4
      if (pixels[index + 3] > 65)
        particles.push({
          x,
          y,
          color: `rgb(${pixels[index]} ${pixels[index + 1]} ${pixels[index + 2]})`,
          dx: (noise(index) - 0.5) * 150,
          dy: (noise(index + 9701) - 0.5) * 85 - 14,
          size: 1.2 + noise(index + 401) * 1.5,
        })
    }
  }
  const stride = Math.max(1, Math.ceil(particles.length / 9000))
  return { bitmap, particles: particles.filter((_, index) => index % stride === 0) }
}

export function captureTextParticles(scope: Element, width: number, height: number) {
  const parents = visibleTextParents(scope)
  return { parents, image: snapshot(parents, width, height) }
}

export function cancelLanguageParticles() {
  stopTransition?.()
}

export function drawTextParticles(
  context: CanvasRenderingContext2D,
  image: TextParticleSnapshot,
  progress: number,
  assembling: boolean,
) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  const spread = assembling ? 1 - ease(progress) : ease(progress)
  const solid = assembling ? clamp((progress - 0.75) / 0.25) : clamp(1 - progress * 3)
  context.globalAlpha = solid
  context.drawImage(image.bitmap, 0, 0)
  context.globalAlpha = assembling
    ? (1 - solid) * clamp(progress * 5)
    : (1 - solid) * (1 - progress)
  image.particles.forEach((particle) => {
    context.fillStyle = particle.color
    context.fillRect(
      particle.x + particle.dx * spread,
      particle.y + particle.dy * spread,
      particle.size,
      particle.size,
    )
  })
  context.globalAlpha = 1
}

/** A bounded, interruptible text-only overlay. Real React text remains accessible;
 * only its painted ink is masked while the two glyph snapshots exchange particles. */
export function changeLanguageWithParticles(
  commit: () => void,
  vocabulary: Set<string>,
  unchanged: boolean,
) {
  stopTransition?.(false)
  if (unchanged) return
  if (
    typeof CanvasRenderingContext2D === 'undefined' ||
    !window.matchMedia ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    commit()
    return
  }
  const dialog = document.querySelector<HTMLDialogElement>('dialog[open]')
  const scope = dialog ?? document.querySelector('main')
  if (!scope) {
    commit()
    return
  }
  const width = innerWidth
  const height = innerHeight
  const oldParents = visibleTextParents(scope, vocabulary)
  if (!oldParents.length) {
    commit()
    return
  }
  let old: Snapshot
  try {
    old = snapshot(oldParents, width, height)
  } catch {
    commit()
    return
  }
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const overlay = document.createElement('canvas')
  overlay.width = width
  overlay.height = height
  overlay.setAttribute('aria-hidden', 'true')
  overlay.dataset.languageParticles = ''
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '2147483000',
  })
  const context = overlay.getContext('2d')
  if (!context) {
    commit()
    return
  }
  let committed = false
  let finished = false
  let frame = 0
  const masked = new Set<HTMLElement>()
  const mask = (elements: HTMLElement[]) =>
    elements.forEach((element) => {
      element.setAttribute('data-language-ink-hidden', '')
      masked.add(element)
    })
  const apply = () => {
    if (!committed) {
      committed = true
      commit()
    }
  }
  const finish = (complete = true) => {
    if (finished) return
    finished = true
    cancelAnimationFrame(frame)
    if (complete) apply()
    masked.forEach((element) => element.removeAttribute('data-language-ink-hidden'))
    overlay.remove()
    window.removeEventListener('resize', interrupt)
    window.removeEventListener('wheel', interrupt, true)
    window.removeEventListener('touchstart', interrupt, true)
    window.removeEventListener('scroll', interrupt, true)
    document.removeEventListener('visibilitychange', interrupt)
    document.removeEventListener('cancel', interrupt, true)
    document.removeEventListener('pointerdown', onPointer, true)
    document.removeEventListener('keydown', interrupt, true)
    motionPreference.removeEventListener('change', interrupt)
    if (stopTransition === finish) stopTransition = undefined
  }
  const interrupt = () => finish()
  const onPointer = (event: Event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-language-switch]'))
      finish()
  }
  stopTransition = finish
  window.addEventListener('resize', interrupt)
  window.addEventListener('wheel', interrupt, { passive: true, capture: true })
  window.addEventListener('touchstart', interrupt, { passive: true, capture: true })
  // Also catch scroll generated by the hero's wheel handler, which consumes
  // the original input event. This only cancels; it never drives frame progress.
  window.addEventListener('scroll', interrupt, { passive: true, capture: true })
  document.addEventListener('visibilitychange', interrupt)
  document.addEventListener('cancel', interrupt, true)
  document.addEventListener('pointerdown', onPointer, true)
  document.addEventListener('keydown', interrupt, true)
  motionPreference.addEventListener('change', interrupt)
  ;(dialog ?? document.body).append(overlay)
  mask(oldParents)
  const run = (image: Snapshot, assembling: boolean, done: () => void) => {
    const start = performance.now()
    const duration = assembling ? 700 : 380
    const tick = (now: number) => {
      if (finished) return
      if (!scope.isConnected || (dialog && !dialog.open)) {
        finish()
        return
      }
      const progress = clamp((now - start) / duration)
      drawTextParticles(context, image, progress, assembling)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else done()
    }
    frame = requestAnimationFrame(tick)
  }
  run(old, false, () => {
    apply()
    // React commits the new words before the second batch of measurements.
    frame = requestAnimationFrame(() => {
      if (finished) return
      try {
        const nextParents = visibleTextParents(scope, vocabulary)
        const next = snapshot(nextParents, width, height)
        mask(nextParents)
        run(next, true, () => finish())
      } catch {
        finish()
      }
    })
  })
}
