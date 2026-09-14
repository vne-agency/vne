'use client'

import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useEffect, useRef } from 'react'

import {
  createCaseInterface,
  type CaseInterfaceCell,
  type CaseInterfaceModel,
} from './ascii-case-interface-model'
import sprites from './ascii-case-sprites.json'
import styles from './AsciiCaseInterface.module.css'
import { caseInterfaceFreezeEvent, type CaseInterfacePose } from './case-interface-state'

const rowHeight = 1.3
const assemblyDuration = 1900
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function composeCells(model: CaseInterfaceModel) {
  const cells = new Map(model.cells.map((cell) => [cell.y * model.columns + cell.x, cell]))
  const put = (cell: CaseInterfaceCell) => {
    if (cell.x >= 0 && cell.x < model.columns && cell.y >= 0 && cell.y < model.rows)
      cells.set(cell.y * model.columns + cell.x, cell)
  }
  const mask = document.createElement('canvas')
  const context = mask.getContext('2d', { willReadFrequently: true })
  if (context) {
    for (const word of model.words) {
      const sample = 4
      mask.width = word.width * sample
      mask.height = word.height * sample
      context.font = `${word.weight ?? 600} 100px Arial, sans-serif`
      const metrics = context.measureText(word.text)
      const ascent = metrics.actualBoundingBoxAscent || 72
      const descent = metrics.actualBoundingBoxDescent || 1
      context.setTransform(
        mask.width / Math.max(1, metrics.width),
        0,
        0,
        mask.height / (ascent + descent),
        0,
        0,
      )
      context.fillText(word.text, 0, ascent)
      const pixels = context.getImageData(0, 0, mask.width, mask.height).data
      for (let y = 0; y < word.height; y++) {
        for (let x = 0; x < word.width; x++) {
          let coverage = 0
          for (let dy = 0; dy < sample; dy++) {
            for (let dx = 0; dx < sample; dx++)
              coverage += pixels[((y * sample + dy) * mask.width + x * sample + dx) * 4 + 3]
          }
          coverage /= sample * sample
          if (coverage > 32)
            put({ x: word.x + x, y: word.y + y, character: coverage > 150 ? '#' : '+', shade: 0 })
        }
      }
    }
  }
  for (const sprite of model.sprites) {
    const source = sprites[sprite.kind]
    for (let y = 0; y < sprite.height; y++) {
      const line =
        source[Math.min(source.length - 1, Math.floor((y / sprite.height) * source.length))]
      for (let x = 0; x < sprite.width; x++) {
        const character =
          line[Math.min(line.length - 1, Math.floor((x / sprite.width) * line.length))]
        if (character && character !== ' ')
          put({
            x: sprite.x + x,
            y: sprite.y + y,
            character,
            shade: '.:+'.includes(character) ? 1 : 0,
          })
      }
    }
  }
  for (const cell of model.overlays ?? []) {
    if (cell.character === ' ') cells.delete(cell.y * model.columns + cell.x)
    else put(cell)
  }
  return [...cells.values()]
}

export function AsciiCaseInterface({
  slug,
  title,
  replayKey = 0,
  initiallyAssembled = false,
  initialPose,
}: {
  slug: string
  title: string
  replayKey?: number
  initiallyAssembled?: boolean
  initialPose?: CaseInterfacePose
}) {
  const { t } = useSiteLanguage()

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const replayRef = useRef<() => void>(() => {})
  const previousReplay = useRef(replayKey)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const context = canvas.getContext('2d', { alpha: false })
    const atlas = document.createElement('canvas')
    const atlasContext = atlas.getContext('2d')
    if (!context || !atlasContext) return
    const model = createCaseInterface(slug, title)
    const cells = composeCells(model)
    const glyphs = [...new Set([...cells.map((cell) => cell.character), '.', '+'])]
    const glyphIndex = new Map(glyphs.map((character, index) => [character, index]))
    const colors = model.dark
      ? ['#f4f3ee', '#909386', '#ceb4f5']
      : ['#22231f', '#85867c', '#947bac']
    const paper = model.dark ? '#22231f' : '#f4f3ee'
    const background = model.dark ? '#1c1d19' : '#e8e7e3'
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const spriteSize = 24
    let width = 0
    let height = 0
    let ratio = 1
    let elapsed = initiallyAssembled ? assemblyDuration : 0
    let lastTime = 0
    let frame = 0
    let resizeFrame = 0
    let visible = false
    let disposed = false
    let pointerBounds: DOMRect | null = null
    let yaw = initialPose?.yaw ?? -0.12
    let pitch = initialPose?.pitch ?? 0.06
    let targetYaw = yaw
    let targetPitch = pitch

    function makeAtlas() {
      atlas.width = glyphs.length * spriteSize * ratio
      atlas.height = colors.length * spriteSize * ratio
      atlasContext!.setTransform(ratio, 0, 0, ratio, 0, 0)
      atlasContext!.font = '600 18px "Courier New", monospace'
      atlasContext!.textAlign = 'center'
      atlasContext!.textBaseline = 'middle'
      colors.forEach((color, shade) => {
        atlasContext!.fillStyle = color
        glyphs.forEach((glyph, index) =>
          atlasContext!.fillText(glyph, (index + 0.5) * spriteSize, (shade + 0.5) * spriteSize),
        )
      })
    }

    function schedule() {
      if (!disposed && !frame && visible && !document.hidden && width && height)
        frame = requestAnimationFrame(render)
    }

    function paint() {
      const ctx = context!
      const scale = Math.min(width / (model.columns + 16), height / (model.rows * rowHeight + 16))
      const halfWidth = model.columns / 2
      const halfHeight = (model.rows * rowHeight) / 2
      const project = (x: number, y: number) => {
        const depth = -x * Math.sin(yaw) + y * Math.sin(pitch)
        const perspective = 340 / (340 - depth)
        return {
          x: width / 2 + (x * Math.cos(yaw) + y * 0.018) * scale * perspective,
          y: height / 2 + (y * Math.cos(pitch) - x * 0.018) * scale * perspective,
          perspective,
        }
      }
      ctx.fillStyle = background
      ctx.fillRect(0, 0, width, height)
      const progress = media.matches ? 1 : clamp(elapsed / assemblyDuration, 0, 1)
      const arrival = 1 - (1 - progress) ** 3
      const corners = [
        [-halfWidth, -halfHeight],
        [halfWidth, -halfHeight],
        [halfWidth, halfHeight],
        [-halfWidth, halfHeight],
      ].map(([x, y]) => project(x, y))
      ctx.globalAlpha = arrival
      ctx.fillStyle = paper
      ctx.beginPath()
      corners.forEach((point, index) =>
        index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
      )
      ctx.closePath()
      ctx.fill()
      for (const cell of cells) {
        const seed = (Math.sin(cell.x * 12.9898 + cell.y * 78.233) * 43758.5453) % 1
        const delay = Math.abs(seed) * 0.22
        const local = clamp((progress - delay) / (1 - delay), 0, 1)
        const settled = 1 - (1 - local) ** 3
        const x = cell.x - halfWidth + 0.5
        const y = (cell.y + 0.5) * rowHeight - halfHeight
        const point = project(
          x + (1 - settled) * Math.sin(seed * 90) * 18,
          y + (1 - settled) * Math.cos(seed * 80) * 12,
        )
        const size = 1.85 * scale * point.perspective
        ctx.globalAlpha = settled
        ctx.drawImage(
          atlas,
          glyphIndex.get(cell.character)! * spriteSize * ratio,
          cell.shade * spriteSize * ratio,
          spriteSize * ratio,
          spriteSize * ratio,
          point.x - size / 2,
          point.y - size / 2,
          size,
          size,
        )
      }
      ctx.globalAlpha = 1
      host!.dataset.ready = 'true'
      host!.dataset.yaw = String(yaw)
      host!.dataset.pitch = String(pitch)
    }

    function render(time: number) {
      frame = 0
      if (!visible || disposed || document.hidden) return
      const delta = lastTime ? Math.min(time - lastTime, 80) : 16.667
      lastTime = time
      elapsed = media.matches ? assemblyDuration : Math.min(assemblyDuration, elapsed + delta)
      const follow = media.matches ? 1 : 1 - 0.82 ** (delta / 16.667)
      yaw += (targetYaw - yaw) * follow
      pitch += (targetPitch - pitch) * follow
      const moving = Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) > 0.0001
      paint()
      host!.dataset.motion = media.matches
        ? 'static'
        : moving || elapsed < assemblyDuration
          ? 'assembling'
          : 'settled'
      if (moving || elapsed < assemblyDuration) schedule()
      else lastTime = 0
    }

    function resize() {
      resizeFrame = 0
      if (disposed) return
      const bounds = host!.getBoundingClientRect()
      pointerBounds = bounds
      width = Math.round(bounds.width)
      height = Math.round(bounds.height)
      ratio = Math.min(devicePixelRatio || 1, 2)
      canvas!.width = width * ratio
      canvas!.height = height * ratio
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      makeAtlas()
      schedule()
    }
    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
    }
    function visibilityChanged() {
      stop()
      schedule()
    }
    function pointerEnter() {
      pointerBounds = host!.getBoundingClientRect()
    }
    function pointerMove(event: PointerEvent) {
      if (host!.hasAttribute('data-transfer-hidden')) return
      if (event.pointerType !== 'mouse' || media.matches || !pointerBounds) return
      targetYaw = -0.12 + ((event.clientX - pointerBounds.left) / pointerBounds.width - 0.5) * 0.22
      targetPitch = 0.06 + ((event.clientY - pointerBounds.top) / pointerBounds.height - 0.5) * 0.16
      schedule()
    }
    function pointerLeave() {
      if (host!.hasAttribute('data-transfer-hidden')) return
      targetYaw = -0.12
      targetPitch = 0.06
      schedule()
    }
    replayRef.current = () => {
      elapsed = 0
      lastTime = 0
      schedule()
    }
    function freeze(event: Event) {
      const pose = (event as CustomEvent<CaseInterfacePose | undefined>).detail
      stop()
      elapsed = assemblyDuration
      yaw = targetYaw = pose?.yaw ?? yaw
      pitch = targetPitch = pose?.pitch ?? pitch
      paint()
      host!.dataset.motion = 'settled'
    }
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    })
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35
        visibilityChanged()
      },
      { threshold: [0, 0.35] },
    )
    resizeObserver.observe(host)
    intersectionObserver.observe(host)
    host.addEventListener('pointerenter', pointerEnter)
    host.addEventListener('pointermove', pointerMove)
    host.addEventListener('pointerleave', pointerLeave)
    host.addEventListener(caseInterfaceFreezeEvent, freeze)
    document.addEventListener('visibilitychange', visibilityChanged)
    media.addEventListener('change', visibilityChanged)
    resize()
    return () => {
      disposed = true
      stop()
      cancelAnimationFrame(resizeFrame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      host.removeEventListener('pointerenter', pointerEnter)
      host.removeEventListener('pointermove', pointerMove)
      host.removeEventListener('pointerleave', pointerLeave)
      host.removeEventListener(caseInterfaceFreezeEvent, freeze)
      document.removeEventListener('visibilitychange', visibilityChanged)
      media.removeEventListener('change', visibilityChanged)
      replayRef.current = () => {}
    }
  }, [slug, title, initiallyAssembled, initialPose])

  useEffect(() => {
    if (previousReplay.current === replayKey) return
    previousReplay.current = replayKey
    replayRef.current()
  }, [replayKey])

  return (
    <div className={styles.artwork} ref={hostRef} data-case-interface={slug}>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        role="img"
        aria-label={`${t('ASCII-миниатюра интерфейса')} ${t(title)}`}
      />
      <span className={styles.fallback} aria-hidden="true">
        {t(title)}
        <br />
        {t('[ ИНТЕРФЕЙС ПРОЕКТА ]')}
      </span>
    </div>
  )
}
