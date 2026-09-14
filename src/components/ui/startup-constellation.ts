type IntroOptions = {
  overlay: HTMLElement
  wordmark: HTMLElement
  backdrop: HTMLElement
  scene?: HTMLElement
  complete: () => void
}

// A single measured frame of the live hero becomes a field of glyph tiles.
// No second WebGL scene, different camera, or independently rotating duplicate.
export function assembleStartupConstellation({
  overlay,
  wordmark,
  backdrop,
  scene,
  complete,
}: IntroOptions) {
  const artwork = document.querySelector<HTMLElement>('[data-startup-artwork]')
  const host = artwork?.querySelector<HTMLElement>('[data-renderer="webgl"]')
  const logo = document.querySelector<HTMLElement>('[data-startup-wordmark]')
  if (!host || !logo || !artwork) return null
  const bounds = host.getBoundingClientRect()
  const destination = logo.getBoundingClientRect()
  const source = wordmark.getBoundingClientRect()
  if (bounds.bottom < 0 || bounds.top >= innerHeight || destination.top < 0) return null

  // These are the positions of the letters that are currently flying in the
  // loader, not a new random cloud. Freeze/measure once before dissolving them.
  const origins: { x: number; y: number }[] = []
  const range = document.createRange()
  scene?.querySelectorAll<HTMLElement>('[data-loader-row]').forEach((row) => {
    const node = row.firstChild
    if (!node || node.nodeType !== Node.TEXT_NODE) return
    const rect = row.getBoundingClientRect()
    if (rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth)
      return
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const glyph = range.getBoundingClientRect()
      if (
        glyph.right > 0 &&
        glyph.left < innerWidth &&
        glyph.bottom > 0 &&
        glyph.top < innerHeight
      ) {
        origins.push({ x: glyph.left, y: glyph.top + glyph.height * 0.4 })
      }
    }
  })

  const atlas = document.createElement('canvas')
  atlas.width = Math.round(bounds.width)
  atlas.height = Math.round(bounds.height)
  const ink = atlas.getContext('2d', { willReadFrequently: true })
  if (!ink) return null
  let cell = 6
  let captured = false
  host.dispatchEvent(
    new CustomEvent('vne-startup-capture', {
      detail: (canvas: HTMLCanvasElement, size: number) => {
        ink.drawImage(canvas, 0, 0, atlas.width, atlas.height)
        cell = size
        captured = true
      },
    }),
  )
  if (!captured) return null

  const pixels = ink.getImageData(0, 0, atlas.width, atlas.height)
  // Convert the shader's paper/ink blend into transparent, anti-aliased ink.
  for (let i = 0; i < pixels.data.length; i += 4) {
    const coverage = Math.max(0, Math.min(1, (pixels.data[i] - 34) / 210))
    pixels.data[i] = 244
    pixels.data[i + 1] = 243
    pixels.data[i + 2] = 238
    pixels.data[i + 3] = Math.round(coverage * 255)
  }
  ink.putImageData(pixels, 0, 0)
  const darkAtlas = document.createElement('canvas')
  darkAtlas.width = atlas.width
  darkAtlas.height = atlas.height
  const darkInk = darkAtlas.getContext('2d')
  if (!darkInk) return null
  darkInk.drawImage(atlas, 0, 0)
  darkInk.globalCompositeOperation = 'source-in'
  darkInk.fillStyle = '#22231f'
  darkInk.fillRect(0, 0, atlas.width, atlas.height)

  const tiles: {
    x: number
    y: number
    w: number
    h: number
    dx: number
    dy: number
    delay: number
  }[] = []
  const noise = (n: number) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return v - Math.floor(v)
  }
  // Sample small tiles from the actual glyph atlas, preserving letters and symbols.
  const size = Math.max(5, Math.ceil(cell * 1.5))
  for (let y = 0; y < atlas.height; y += size) {
    for (let x = 0; x < atlas.width; x += size) {
      const w = Math.min(size, atlas.width - x)
      const h = Math.min(size, atlas.height - y)
      let visible = false
      for (let yy = y; yy < y + h && !visible; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (pixels.data[(yy * atlas.width + xx) * 4 + 3] > 45) {
            visible = true
            break
          }
        }
      }
      if (!visible) continue
      const index = tiles.length
      const origin = origins[Math.floor(noise(index + 41) * origins.length)]
      tiles.push({
        x,
        y,
        w,
        h,
        dx: (origin?.x ?? noise(index + 1) * innerWidth) - bounds.left - x,
        dy: (origin?.y ?? noise(index + 9) * innerHeight) - bounds.top - y,
        delay: noise(index + 17) * 0.2,
      })
    }
  }
  if (!tiles.length) return null

  const canvas = document.createElement('canvas')
  const ratio = Math.min(devicePixelRatio || 1, 1.5)
  canvas.width = Math.round(innerWidth * ratio)
  canvas.height = Math.round(innerHeight * ratio)
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.startupParticles = ''
  const context = canvas.getContext('2d')
  if (!context) return null
  context.scale(ratio, ratio)
  overlay.insertBefore(canvas, overlay.firstChild?.nextSibling ?? null)
  const animations: Animation[] = []
  const revealElements = [...document.querySelectorAll<HTMLElement>('[data-startup-reveal]')]
  let frame = 0
  let disposed = false
  let elapsed = 0
  let previous = performance.now()
  let docked = false
  let revealed = false
  overlay.dataset.phase = 'assembling'
  if (scene)
    animations.push(
      scene.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 320,
        fill: 'forwards',
        easing: 'ease-out',
      }),
    )
  const dock = () => {
    docked = true
    overlay.dataset.phase = 'constellation-docking'
    animations.push(
      wordmark.animate(
        [
          { transform: 'none', color: '#22231f' },
          {
            transform: `translate(${destination.left - source.left}px, ${destination.top - source.top}px) scale(${destination.width / source.width}, ${destination.height / source.height})`,
            color: '#22231f',
          },
        ],
        { duration: 1050, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' },
      ),
    )
  }
  const draw = (now: number) => {
    if (disposed) return
    const delta = now - previous
    previous = now
    if (!document.hidden) elapsed += Math.min(delta, 64)
    if (elapsed < 2100) {
      const progress = Math.max(0, Math.min(1, (elapsed - 280) / 1720))
      context.clearRect(0, 0, innerWidth, innerHeight)
      for (const [index, tile] of tiles.entries()) {
        const p = Math.max(0, Math.min(1, (progress - tile.delay) / (1 - tile.delay)))
        const remaining = (1 - p) ** 3
        const scatter = Math.sin(Math.min(1, elapsed / 1800) * Math.PI) * remaining
        const x =
          bounds.left + tile.x + tile.dx * remaining + (noise(index + 4) - 0.5) * 110 * scatter
        const y =
          bounds.top + tile.y + tile.dy * remaining + (noise(index + 8) - 0.5) * 90 * scatter
        context.globalAlpha = Math.min(1, elapsed / 320)
        context.drawImage(darkAtlas, tile.x, tile.y, tile.w, tile.h, x, y, tile.w, tile.h)
      }
    } else if (!docked) dock()
    if (elapsed >= 2900 && !revealed) {
      revealed = true
      overlay.dataset.phase = 'hero-reveal'
      host.dataset.startupAssembled = ''
      animations.push(
        backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 850,
          easing: 'ease-in-out',
          fill: 'forwards',
        }),
      )
      animations.push(
        canvas.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 850,
          easing: 'ease-in-out',
          fill: 'forwards',
        }),
      )
      logo.dataset.startupAssembled = ''
      animations.push(
        wordmark.animate([{ opacity: 1 }, { opacity: 0 }], {
          delay: 250,
          duration: 600,
          fill: 'forwards',
        }),
      )
      revealElements.forEach((element, index) => {
        element.dataset.startupShow = ''
        // Opacity composes with the hero's existing scroll transforms.
        animations.push(
          element.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 750,
            delay: Math.min(index * 55, 330),
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'forwards',
          }),
        )
      })
    }
    if (elapsed >= 4150) {
      complete()
      return
    }
    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)
  const abort = () => complete()
  window.addEventListener('resize', abort, { once: true })
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', abort, { once: true })
  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    animations.forEach((animation) => animation.cancel())
    canvas.remove()
    delete host.dataset.startupAssembled
    delete logo.dataset.startupAssembled
    revealElements.forEach((element) => {
      delete element.dataset.startupShow
    })
    window.removeEventListener('resize', abort)
    motion.removeEventListener('change', abort)
  }
}
