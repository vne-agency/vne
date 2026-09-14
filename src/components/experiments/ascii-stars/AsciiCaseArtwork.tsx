'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useEffect, useRef } from 'react'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import styles from './AsciiCaseArtwork.module.css'

type Particle = {
  x: number
  y: number
  originX: number
  originY: number
  delay: number
  bend: number
  glyph: number
  shade: number
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
}

const glyphs = '.:/+*x=#'
const assemblyDuration = 2200
const completeAt = 3000
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const ease = (value: number) => 1 - (1 - value) ** 3

function randomSequence(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function titleLines(title: string) {
  const words = title.toLocaleUpperCase('ru-RU').trim().split(/\s+/)
  const lines: string[] = []
  for (const word of words) {
    // The project name is never truncated, including longer CMS titles.
    for (let start = 0; start < word.length; start += 12) lines.push(word.slice(start, start + 12))
  }
  return lines.length ? lines : ['VNE']
}

export function AsciiCaseArtwork({
  title,
  index,
  replayKey = 0,
}: {
  title: string
  index: number
  replayKey?: number
}) {
  const { t } = useSiteLanguage()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const replayRef = useRef<() => void>(() => {})

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const context = canvas.getContext('2d', { alpha: false })
    const mask = document.createElement('canvas')
    const maskContext = mask.getContext('2d', { willReadFrequently: true })
    const atlas = document.createElement('canvas')
    const atlasContext = atlas.getContext('2d')
    if (!context || !maskContext || !atlasContext) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const light = index % 2 === 1
    const background = light ? '#f4f3ee' : '#22231f'
    const colors = light ? ['#22231f', '#55574d', '#78638e'] : ['#f4f3ee', '#c4c6b8', '#ceb4f5']
    let width = 0
    let height = 0
    let cell = 5
    let spriteSize = 10
    let ratio = 1
    let particles: Particle[] = []
    let elapsed = 0
    let lastTime = 0
    let frame = 0
    let resizeFrame = 0
    let visible = false
    let disposed = false
    let entered = false
    let pointer = { x: -1000, y: -1000, active: false }

    function schedule() {
      if (frame || disposed || !visible || document.hidden || !particles.length) return
      frame = requestAnimationFrame(render)
    }

    function render(time: number) {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const delta = lastTime ? Math.min(time - lastTime, 40) : 16.667
      lastTime = time
      elapsed = media.matches ? completeAt : Math.min(completeAt, elapsed + delta)
      const moving = paint(delta / 16.667)
      host!.dataset.motion = media.matches
        ? 'static'
        : elapsed < completeAt
          ? 'assembling'
          : 'settled'
      if (elapsed < completeAt || moving) schedule()
      else lastTime = 0
    }

    function paint(dt: number) {
      context!.fillStyle = background
      context!.fillRect(0, 0, width, height)

      // A quiet registration grid holds the composition while particles arrive.
      context!.fillStyle = light ? '#d6d5cd' : '#3d3f36'
      for (let y = 24; y < height; y += 32) {
        for (let x = 24; x < width; x += 32) context!.fillRect(x, y, 1, 1)
      }

      let moving = false
      const radius = Math.min(width * 0.2, 76)
      const spring = 0.075 * dt
      const damping = 0.78 ** dt
      for (const particle of particles) {
        const progress = clamp((elapsed - particle.delay) / assemblyDuration, 0, 1)
        const travel = ease(progress)
        const arc = Math.sin(progress * Math.PI) * particle.bend
        const x = particle.originX + (particle.x - particle.originX) * travel + arc
        const y = particle.originY + (particle.y - particle.originY) * travel - arc * 0.45

        if (!media.matches) {
          const dx = x + particle.offsetX - pointer.x
          const dy = y + particle.offsetY - pointer.y
          const distance = Math.hypot(dx, dy)
          if (pointer.active && distance < radius && distance > 0.01) {
            const force = (1 - distance / radius) ** 2 * 1.8 * dt
            particle.velocityX += (dx / distance) * force
            particle.velocityY += (dy / distance) * force
          }
          particle.velocityX = (particle.velocityX - particle.offsetX * spring) * damping
          particle.velocityY = (particle.velocityY - particle.offsetY * spring) * damping
          particle.offsetX += particle.velocityX * dt
          particle.offsetY += particle.velocityY * dt
          if (Math.abs(particle.velocityX) + Math.abs(particle.velocityY) > 0.025) moving = true
        }

        // Glyph sprites avoid thousands of fillText calls in every animation frame.
        context!.globalAlpha = 0.2 + travel * 0.8
        context!.drawImage(
          atlas,
          particle.glyph * spriteSize * ratio,
          particle.shade * spriteSize * ratio,
          spriteSize * ratio,
          spriteSize * ratio,
          x + particle.offsetX - spriteSize / 2,
          y + particle.offsetY - spriteSize / 2,
          spriteSize,
          spriteSize,
        )
      }
      context!.globalAlpha = 1
      return moving
    }

    function rebuild() {
      if (disposed) return
      const bounds = host!.getBoundingClientRect()
      const nextWidth = Math.round(bounds.width)
      const nextHeight = Math.round(bounds.height)
      if (!nextWidth || !nextHeight) return
      const nextRatio = Math.min(window.devicePixelRatio || 1, 2)
      if (nextWidth === width && nextHeight === height && ratio === nextRatio && particles.length)
        return
      width = nextWidth
      height = nextHeight
      ratio = nextRatio
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      cell = clamp(width / 125, 2.6, 7)
      spriteSize = Math.ceil(cell * 2)

      mask.width = width
      mask.height = height
      const lines = titleLines(title)
      let fontSize = Math.min((height * 0.56) / lines.length, width * 0.27)
      maskContext!.font = `800 ${fontSize}px "Onest Variable", Arial, sans-serif`
      const longest = Math.max(...lines.map((line) => maskContext!.measureText(line).width))
      fontSize *= Math.min(1, (width * 0.88) / Math.max(1, longest))
      maskContext!.font = `800 ${fontSize}px "Onest Variable", Arial, sans-serif`
      maskContext!.textAlign = 'center'
      maskContext!.fillStyle = '#fff'
      const metrics = maskContext!.measureText(lines[0])
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.75
      const descent = metrics.actualBoundingBoxDescent || 0
      const lineHeight = fontSize * 1.06
      const blockHeight = ascent + descent + lineHeight * (lines.length - 1)
      const baseline = (height - blockHeight) / 2 + ascent
      lines.forEach((line, lineIndex) =>
        maskContext!.fillText(line, width / 2, baseline + lineIndex * lineHeight),
      )
      const maskData = maskContext!.getImageData(0, 0, width, height).data

      atlas.width = spriteSize * glyphs.length * ratio
      atlas.height = spriteSize * colors.length * ratio
      atlasContext!.setTransform(ratio, 0, 0, ratio, 0, 0)
      atlasContext!.font = `700 ${cell * 1.35}px "Courier New", monospace`
      atlasContext!.textAlign = 'center'
      atlasContext!.textBaseline = 'middle'
      colors.forEach((color, shade) => {
        atlasContext!.fillStyle = color
        Array.from(glyphs).forEach((glyph, glyphIndex) => {
          atlasContext!.fillText(glyph, (glyphIndex + 0.5) * spriteSize, (shade + 0.5) * spriteSize)
        })
      })

      const random = randomSequence((index + 1) * 1729 + title.length)
      particles = []
      for (let y = cell / 2; y < height; y += cell) {
        for (let x = cell / 2; x < width; x += cell) {
          if (maskData[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 100) continue
          const angle = random() * Math.PI * 2
          const radius = (0.25 + random() * 0.5) * Math.hypot(width, height)
          const shade = random()
          particles.push({
            x,
            y,
            originX: width / 2 + Math.cos(angle) * radius,
            originY: height / 2 + Math.sin(angle) * radius * 0.6,
            delay: (x / width) * 420 + random() * 350,
            bend: (random() - 0.5) * height * 0.45,
            glyph: Math.floor(random() * glyphs.length),
            shade: shade > 0.96 ? 2 : shade > 0.78 ? 1 : 0,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
          })
        }
      }
      if (media.matches) elapsed = completeAt
      paint(1)
      host!.dataset.ready = 'true'
      host!.dataset.particleCount = String(particles.length)
      schedule()
    }

    function replay() {
      elapsed = media.matches ? completeAt : 0
      lastTime = 0
      pointer.active = false
      for (const particle of particles) {
        particle.offsetX = 0
        particle.offsetY = 0
        particle.velocityX = 0
        particle.velocityY = 0
      }
      schedule()
    }
    replayRef.current = replay

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          if (!entered) {
            entered = true
            replay()
          }
          lastTime = 0
          schedule()
        } else {
          cancelAnimationFrame(frame)
          frame = 0
          lastTime = 0
          pointer.active = false
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(host)

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(rebuild)
    })
    resizeObserver.observe(host)

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || media.matches) return
      const bounds = host.getBoundingClientRect()
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true }
      schedule()
    }
    const onPointerLeave = () => {
      pointer.active = false
      schedule()
    }
    const onVisibility = () => {
      lastTime = 0
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else schedule()
    }
    const onMotion = () => {
      if (media.matches) elapsed = completeAt
      pointer.active = false
      for (const particle of particles) {
        particle.offsetX = 0
        particle.offsetY = 0
        particle.velocityX = 0
        particle.velocityY = 0
      }
      schedule()
    }
    host.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    document.fonts
      .load('800 64px "Onest Variable"', title)
      .then(() => {
        if (!disposed) {
          // Re-sample if the intended font arrived after ResizeObserver's first pass.
          width = 0
          rebuild()
        }
      })
      .catch(() => rebuild())
    rebuild()

    return () => {
      disposed = true
      replayRef.current = () => {}
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      resizeObserver.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotion)
    }
  }, [title, index])

  useEffect(() => {
    if (replayKey > 0) replayRef.current()
  }, [replayKey])

  return (
    <div
      ref={hostRef}
      className={styles.artwork}
      data-tone={index % 2 === 1 ? 'light' : 'dark'}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={styles.fallback}>{title}</span>
      <div className={styles.registration}>
        <span>+</span>
        <span>VNE / {String(index + 1).padStart(2, '0')}</span>
        <span>+</span>
      </div>
      <div className={styles.signature}>
        <span>{t('ОТ ИДЕИ К ФОРМЕ')}</span>
        <span>
          <ArrowIcon />
        </span>
      </div>
    </div>
  )
}
