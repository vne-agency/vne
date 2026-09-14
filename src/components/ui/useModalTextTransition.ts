'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

const motionQuery = '(prefers-reduced-motion: reduce)'
const alphabet = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Paint a temporary, inaccessible copy. React's text and accessible names stay intact.
function scramble(root: HTMLElement, exit = false) {
  if (window.matchMedia(motionQuery).matches || document.hidden) return () => {}
  const bounds = root.getBoundingClientRect()
  const scrollPositions = new Map<Element, number>()
  scrollPositions.set(root, root.scrollTop)
  const clipCache = new Map<Element, { top: number; bottom: number }>()
  const clipFor = (element: HTMLElement): { top: number; bottom: number } => {
    const cached = clipCache.get(element)
    if (cached) return cached
    const parent = element.parentElement
    const clip =
      parent && parent !== root
        ? { ...clipFor(parent) }
        : { top: Math.max(0, bounds.top), bottom: Math.min(innerHeight, bounds.bottom) }
    const css = getComputedStyle(element)
    if (/(auto|scroll|hidden|clip)/.test(css.overflowY)) {
      const box = element.getBoundingClientRect()
      clip.top = Math.max(clip.top, box.top)
      clip.bottom = Math.min(clip.bottom, box.bottom)
      scrollPositions.set(element, element.scrollTop)
    }
    clipCache.set(element, clip)
    return clip
  }
  const records: { element: HTMLElement; color: string; priority: string }[] = []
  const glyphs: { text: string; rect: DOMRect; font: string; transform: string; color: string }[] =
    []
  const segmenter = new Intl.Segmenter('ru', { granularity: 'grapheme' })

  // All geometry reads precede DOM writes; no measurements in the animation loop.
  for (const element of root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,li,a,span')) {
    if (element.childElementCount || element.closest('[aria-live], [data-text-transition-overlay]'))
      continue
    const node = element.firstChild
    if (!node || node.nodeType !== Node.TEXT_NODE || !/[\p{L}\p{N}]/u.test(node.textContent ?? ''))
      continue
    const box = element.getBoundingClientRect()
    const css = getComputedStyle(element)
    if (
      !box.width ||
      !box.height ||
      box.bottom <= 0 ||
      box.top >= innerHeight ||
      css.visibility === 'hidden'
    )
      continue
    const segments = [...segmenter.segment(node.textContent ?? '')]
    const clip = clipFor(element)
    if (box.bottom <= clip.top || box.top >= clip.bottom) continue
    if (glyphs.length + segments.length > 1600) continue
    records.push({
      element,
      color: element.style.getPropertyValue('color'),
      priority: element.style.getPropertyPriority('color'),
    })
    for (const { segment, index } of segments) {
      if (/\s/u.test(segment)) continue
      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + segment.length)
      const rect = range.getBoundingClientRect()
      if (rect.bottom <= clip.top || rect.top >= clip.bottom) continue
      glyphs.push({
        text: segment,
        rect,
        font: `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`,
        transform: css.textTransform,
        color: css.color,
      })
    }
  }
  if (!glyphs.length) return () => {}
  const overlay = document.createElement('div')
  const measureContext = document.createElement('canvas').getContext('2d')
  const widths = new Map<string, number>()
  overlay.dataset.textTransitionOverlay = ''
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.cssText =
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:10;'
  const pieces = glyphs.map(({ text, rect, font, transform, color }) => {
    const span = document.createElement('span')
    Object.assign(span.style, {
      position: 'absolute',
      left: `${rect.left - bounds.left}px`,
      top: `${rect.top - bounds.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      font,
      lineHeight: `${rect.height}px`,
      textTransform: transform,
      color,
      whiteSpace: 'pre',
      textAlign: 'left',
    })
    overlay.append(span)
    return { span, text, font, width: rect.width, uppercase: transform === 'uppercase' }
  })
  root.append(overlay)
  root.dataset.textTransition = exit ? 'exit' : 'enter'
  records.forEach(({ element }) => element.style.setProperty('color', 'transparent', 'important'))
  let timer = 0
  let finished = false
  const media = window.matchMedia(motionQuery)
  const finish = () => {
    if (finished) return
    finished = true
    clearTimeout(timer)
    records.forEach(({ element, color, priority }) => {
      if (color) element.style.setProperty('color', color, priority)
      else element.style.removeProperty('color')
    })
    overlay.remove()
    delete root.dataset.textTransition
    root.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', finish)
    document.removeEventListener('visibilitychange', finish)
    media.removeEventListener('change', finish)
  }
  const start = performance.now()
  const onScroll = (event: Event) => {
    const target = event.target
    if (target instanceof Element && scrollPositions.get(target) === target.scrollTop) return
    finish()
  }
  const duration = exit ? 220 : 850
  const tick = () => {
    const elapsed = performance.now() - start
    if (elapsed >= duration) return finish()
    const progress = Math.max(0, (elapsed - 120) / (duration - 120))
    pieces.forEach(({ span, text, font, width, uppercase }, index) => {
      const settled = !exit && index / pieces.length < progress
      let glyph =
        settled || !/[\p{L}\p{N}]/u.test(text)
          ? text
          : alphabet[Math.floor(Math.random() * alphabet.length)]
      if (!settled && !uppercase && text === text.toLowerCase()) glyph = glyph.toLowerCase()
      span.textContent = glyph
      const key = `${font}:${uppercase ? glyph.toUpperCase() : glyph}`
      if (!widths.has(key) && measureContext) {
        measureContext.font = font
        widths.set(key, measureContext.measureText(uppercase ? glyph.toUpperCase() : glyph).width)
      }
      span.style.transformOrigin = 'left center'
      span.style.transform = settled
        ? 'none'
        : `scaleX(${Math.min(1, width / (widths.get(key) || width))})`
    })
    timer = window.setTimeout(tick, 65)
  }
  root.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', finish)
  document.addEventListener('visibilitychange', finish)
  media.addEventListener('change', finish)
  tick()
  return finish
}

export function useModalTextTransition(rootRef: RefObject<HTMLDialogElement | null>, key: string) {
  const cancel = useRef<() => void>(() => {})
  const pending = useRef(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (rootRef.current?.open) cancel.current = scramble(rootRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(pending.current)
      cancel.current()
    }
  }, [rootRef, key])

  const cancelTransition = useCallback(() => {
    clearTimeout(pending.current)
    cancel.current()
  }, [])

  const transitionTo = useCallback(
    (commit: () => void) => {
      clearTimeout(pending.current)
      cancel.current()
      const root = rootRef.current
      if (!root || window.matchMedia(motionQuery).matches) return commit()
      cancel.current = scramble(root, true)
      pending.current = window.setTimeout(() => {
        cancel.current()
        commit()
      }, 220)
    },
    [rootRef],
  )
  return { transitionTo, cancelTransition }
}
