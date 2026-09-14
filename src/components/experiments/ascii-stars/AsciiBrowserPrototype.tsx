'use client'

import { PlaybackIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useEffect, useId, useMemo, useReducer, useRef, useState } from 'react'

import styles from './AsciiBrowserPrototype.module.css'

import {
  createPrototype,
  defaultPrototypeState,
  reducePrototype,
  type PageId,
  type Plane,
  type PrototypeAction,
  type PrototypeHotspot,
} from './ascii-browser-model'

type PrototypeControls = {
  update: (planes: Plane[], page: PageId) => void
  reset: () => void
  highlight: (id: string | null) => void
  ambient: (enabled: boolean) => void
}

const pages = [
  { id: 0, label: 'Сайт', description: 'Главная страница: заголовок, визуал и услуги.' },
  { id: 1, label: 'Каталог', description: 'Каталог: фильтр коллекции и выбор объектов.' },
  { id: 2, label: 'Панель', description: 'Рабочая панель: меню, показатели и график активности.' },
] as const
const layerLabels = { structure: 'Структура', typography: 'Типографика', visual: 'Визуал' } as const
const panelLabels = { layers: 'Панель слоёв', component: 'Карточка компонента' } as const
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))
const rowHeight = 1.3
const initialPitch = -0.1
const initialYaw = -0.24
const assemblyTime = 850
export function AsciiBrowserPrototype() {
  const { t } = useSiteLanguage()

  const id = useId()
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<PrototypeControls | null>(null)
  const planeRefs = useRef(new Map<string, HTMLDivElement>())
  const hotspotRefs = useRef(new Map<string, HTMLButtonElement>())
  const elementsRef = useRef<HTMLDetailsElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const [state, dispatch] = useReducer(reducePrototype, defaultPrototypeState)
  const [ambient, setAmbient] = useState(true)
  const planes = useMemo(() => createPrototype(state), [state])
  const page = state.page

  const activate = (action: PrototypeAction) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null
    dispatch(action)
  }

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return
    const atlas = document.createElement('canvas')
    const atlasContext = atlas.getContext('2d')
    if (!atlasContext) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let scene = createPrototype(defaultPrototypeState)
    let activePage: PageId = 0
    let highlighted: string | null = null
    let width = 0
    let height = 0
    let ratio = 1
    let frame = 0
    let previousTime = 0
    let elapsed = 0
    let visible = false
    let disposed = false
    let ambientEnabled = true
    let pointerInside = false
    let focusInside = false
    let idlePhase = 0
    let pitch = initialPitch
    let yaw = initialYaw
    let targetPitch = pitch
    let targetYaw = yaw
    let drag: { id: number; x: number; y: number; started: boolean } | null = null
    const glyphSize = 20
    const colors = ['#22231f', '#73746a', '#947bac', '#f4f3ee', '#afb1a3', '#ceb4f5']

    function makeAtlas() {
      atlas.width = 95 * glyphSize * ratio
      atlas.height = colors.length * glyphSize * ratio
      atlasContext!.setTransform(ratio, 0, 0, ratio, 0, 0)
      atlasContext!.font = '600 16px "Courier New", monospace'
      atlasContext!.textAlign = 'center'
      atlasContext!.textBaseline = 'middle'
      colors.forEach((color, shade) => {
        atlasContext!.fillStyle = color
        for (let index = 0; index < 95; index++) {
          atlasContext!.fillText(
            String.fromCharCode(index + 32),
            (index + 0.5) * glyphSize,
            (shade + 0.5) * glyphSize,
          )
        }
      })
    }

    function schedule() {
      if (frame || !visible || disposed || document.hidden || !width || !height) return
      frame = requestAnimationFrame(render)
    }

    function paint() {
      const ctx = context!
      ctx.fillStyle = '#e8e7e3'
      ctx.fillRect(0, 0, width, height)
      const scale = Math.min(width / 119, height / 82)
      const cosX = Math.cos(pitch)
      const sinX = Math.sin(pitch)
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosZ = Math.cos(-0.055)
      const sinZ = Math.sin(-0.055)

      const project = (x: number, y: number, z: number) => {
        const rx = x * cosY + z * sinY
        const rz = z * cosY - x * sinY
        const ry = y * cosX - rz * sinX
        const depth = rz * cosX + y * sinX
        const perspective = 180 / (180 - depth)
        return {
          x: width / 2 + (rx * cosZ - ry * sinZ) * scale * perspective,
          y: height / 2 + (rx * sinZ + ry * cosZ) * scale * perspective,
          perspective,
          depth,
        }
      }
      const sprite = (character: string, shade: number, x: number, y: number, size: number) => {
        ctx.drawImage(
          atlas,
          (character.charCodeAt(0) - 32) * glyphSize * ratio,
          shade * glyphSize * ratio,
          glyphSize * ratio,
          glyphSize * ratio,
          x - size / 2,
          y - size / 2,
          size,
          size,
        )
      }

      ctx.globalAlpha = 0.35
      for (let y = 22; y < height; y += 32) {
        for (let x = 22; x < width; x += 32) sprite('.', 1, x, y, 8)
      }
      ctx.globalAlpha = 1
      const progress = media.matches ? 1 : clamp(elapsed / assemblyTime, 0, 1)
      const arrival = 1 - (1 - progress) ** 3
      const sorted = [...scene].sort(
        (a, b) => project(a.x, a.y, a.z).depth - project(b.x, b.y, b.z).depth,
      )

      sorted.forEach((plane, planeIndex) => {
        const halfWidth = plane.columns / 2
        const halfHeight = (plane.rows * rowHeight) / 2
        const float =
          media.matches || plane.id === 'main'
            ? 0
            : Math.sin(idlePhase * (plane.id === 'layers' ? 1 : -1)) * 1.8
        const z = plane.z + (1 - arrival) * 12 * planeIndex + float
        const corners = [
          project(plane.x - halfWidth, plane.y - halfHeight, z),
          project(plane.x + halfWidth, plane.y - halfHeight, z),
          project(plane.x + halfWidth, plane.y + halfHeight, z),
          project(plane.x - halfWidth, plane.y + halfHeight, z),
        ]
        ctx.fillStyle = plane.paper
        ctx.beginPath()
        corners.forEach((corner, index) =>
          index ? ctx.lineTo(corner.x, corner.y) : ctx.moveTo(corner.x, corner.y),
        )
        ctx.closePath()
        ctx.fill()
        const planeNode = planeRefs.current.get(plane.id)
        if (planeNode) {
          planeNode.style.clipPath = `polygon(${corners.map((point) => `${point.x}px ${point.y}px`).join(',')})`
          planeNode.style.zIndex = String(planeIndex + 1)
        }
        for (const hotspot of plane.hotspots) {
          const node = hotspotRefs.current.get(hotspot.id)
          if (!node) continue
          const left = plane.x + hotspot.column - halfWidth
          const top = plane.y + hotspot.row * rowHeight - halfHeight
          const right = left + hotspot.width
          const bottom = top + hotspot.height * rowHeight
          const points = [
            project(left, top, z),
            project(right, top, z),
            project(right, bottom, z),
            project(left, bottom, z),
          ]
          const x = Math.min(...points.map((point) => point.x))
          const y = Math.min(...points.map((point) => point.y))
          const buttonWidth = Math.max(...points.map((point) => point.x)) - x
          const buttonHeight = Math.max(...points.map((point) => point.y)) - y
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`
          node.style.width = `${buttonWidth}px`
          node.style.height = `${buttonHeight}px`
          node.style.clipPath = `polygon(${points.map((point) => `${point.x - x}px ${point.y - y}px`).join(',')})`
          if (highlighted === hotspot.id) {
            ctx.fillStyle = plane.dark ? '#ceb4f530' : '#947bac26'
            ctx.strokeStyle = plane.dark ? '#ceb4f5' : '#755b8c'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            points.forEach((point, index) =>
              index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
            )
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          }
        }
        for (const cell of plane.cells) {
          const edge =
            cell.x === 0 ||
            cell.x === plane.columns - 1 ||
            cell.y === 0 ||
            cell.y === plane.rows - 1
          const settled = edge ? 1 : arrival
          const jitter = (1 - settled) * 8
          const position = project(
            plane.x + cell.x - halfWidth + 0.5 + Math.sin(cell.x * 7 + cell.y * 11) * jitter,
            plane.y +
              (cell.y + 0.5) * rowHeight -
              halfHeight +
              Math.cos(cell.x * 3 + cell.y * 5) * jitter,
            z,
          )
          ctx.globalAlpha = edge ? 0.85 : 0.12 + settled * 0.88
          sprite(
            cell.character,
            cell.shade + (plane.dark ? 3 : 0),
            position.x,
            position.y,
            1.7 * scale * position.perspective,
          )
        }
        ctx.globalAlpha = 1
      })
      stage!.dataset.ready = 'true'
    }

    function render(time: number) {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const idle = ambientEnabled && !media.matches && !pointerInside && !focusInside && !drag
      // The ambient scene needs only 30fps; direct manipulation stays responsive.
      if (idle && elapsed >= assemblyTime && previousTime && time - previousTime < 32) {
        schedule()
        return
      }
      const delta = previousTime ? Math.min(time - previousTime, 64) : 16.667
      previousTime = time
      if (idle) idlePhase += (delta * Math.PI * 2) / 10000
      elapsed = media.matches ? assemblyTime : Math.min(assemblyTime, elapsed + delta)
      const follow = media.matches ? 1 : 1 - 0.78 ** (delta / 16.667)
      const restingPitch = targetPitch + (media.matches ? 0 : (Math.cos(idlePhase) - 1) * 0.018)
      const restingYaw = targetYaw + (media.matches ? 0 : Math.sin(idlePhase) * 0.055)
      pitch += (restingPitch - pitch) * follow
      yaw += (restingYaw - yaw) * follow
      const moving = Math.abs(restingPitch - pitch) + Math.abs(restingYaw - yaw) > 0.0001
      if (!moving) {
        pitch = restingPitch
        yaw = restingYaw
      }
      paint()
      stage!.dataset.motion = media.matches
        ? 'static'
        : idle
          ? 'idle'
          : moving || elapsed < assemblyTime
            ? 'moving'
            : 'settled'
      stage!.dataset.rotation = `${yaw.toFixed(3)},${pitch.toFixed(3)}`
      if (idle || moving || elapsed < assemblyTime) schedule()
      else previousTime = 0
    }

    function resize() {
      const nextWidth = Math.round(stage!.clientWidth)
      const nextHeight = Math.round(stage!.clientHeight)
      const nextRatio = Math.min(devicePixelRatio || 1, 2)
      if (!nextWidth || !nextHeight) return
      if (nextWidth === width && nextHeight === height && nextRatio === ratio) return
      width = nextWidth
      height = nextHeight
      ratio = nextRatio
      stage!.parentElement?.style.setProperty('--prototype-stage-height', `${height}px`)
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      makeAtlas()
      schedule()
    }

    function endDrag(event?: PointerEvent) {
      // Implicit touch capture belongs to the nested canvas until the horizontal
      // drag is promoted to the stage. Its bubbling loss is not the stage's loss.
      if (event?.type === 'lostpointercapture' && event.target !== stage) return
      const previous = drag
      drag = null
      if (previous && stage!.hasPointerCapture(previous.id))
        stage!.releasePointerCapture(previous.id)
      stage!.removeAttribute('data-dragging')
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return
      if (event.target instanceof Element && event.target.closest('button')) return
      const touch = event.pointerType !== 'mouse'
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, started: !touch }
      if (!touch) {
        stage.setPointerCapture(event.pointerId)
        stage.focus({ preventScroll: true })
        stage.dataset.dragging = 'true'
      }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return
      if (!drag.started) {
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return
        if (Math.abs(dy) >= Math.abs(dx)) {
          endDrag()
          return
        }
        drag.started = true
        stage.setPointerCapture(event.pointerId)
        stage.dataset.dragging = 'true'
      }
      targetYaw = clamp(targetYaw + (event.clientX - drag.x) * 0.005, -0.7, 0.7)
      targetPitch = clamp(targetPitch - (event.clientY - drag.y) * 0.005, -0.5, 0.5)
      drag.x = event.clientX
      drag.y = event.clientY
      schedule()
    }
    const reset = () => {
      idlePhase = 0
      targetPitch = initialPitch
      targetYaw = initialYaw
      schedule()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== stage) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return
      event.preventDefault()
      if (event.key === 'Home') reset()
      else {
        if (event.key === 'ArrowLeft') targetYaw = clamp(targetYaw - 0.12, -0.7, 0.7)
        if (event.key === 'ArrowRight') targetYaw = clamp(targetYaw + 0.12, -0.7, 0.7)
        if (event.key === 'ArrowUp') targetPitch = clamp(targetPitch - 0.1, -0.5, 0.5)
        if (event.key === 'ArrowDown') targetPitch = clamp(targetPitch + 0.1, -0.5, 0.5)
        schedule()
      }
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      endDrag()
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else schedule()
    }
    const onMotion = () => {
      elapsed = assemblyTime
      pitch = targetPitch
      yaw = targetYaw
      schedule()
    }
    const onPointerEnter = () => {
      pointerInside = true
      schedule()
    }
    const onPointerLeave = () => {
      pointerInside = false
      schedule()
    }
    const onFocusIn = () => {
      focusInside = true
      schedule()
    }
    const onFocusOut = (event: FocusEvent) => {
      focusInside = event.relatedTarget instanceof Node && stage.contains(event.relatedTarget)
      schedule()
    }
    controlsRef.current = {
      update(nextScene, nextPage) {
        scene = nextScene
        if (nextPage !== activePage) elapsed = media.matches ? assemblyTime : 0
        activePage = nextPage
        previousTime = 0
        stage.dataset.page = String(nextPage)
        schedule()
      },
      reset,
      highlight(nextHighlight) {
        highlighted = nextHighlight
        schedule()
      },
      ambient(enabled) {
        ambientEnabled = enabled
        schedule()
      },
    }

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
        else stop()
      },
      { threshold: 0.05 },
    )
    const observer = new ResizeObserver(resize)
    intersection.observe(stage)
    observer.observe(stage)
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointerenter', onPointerEnter)
    stage.addEventListener('pointerleave', onPointerLeave)
    stage.addEventListener('focusin', onFocusIn)
    stage.addEventListener('focusout', onFocusOut)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', endDrag)
    stage.addEventListener('pointercancel', endDrag)
    stage.addEventListener('lostpointercapture', endDrag)
    stage.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    resize()

    return () => {
      disposed = true
      stop()
      controlsRef.current = null
      observer.disconnect()
      intersection.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointerenter', onPointerEnter)
      stage.removeEventListener('pointerleave', onPointerLeave)
      stage.removeEventListener('focusin', onFocusIn)
      stage.removeEventListener('focusout', onFocusOut)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', endDrag)
      stage.removeEventListener('pointercancel', endDrag)
      stage.removeEventListener('lostpointercapture', endDrag)
      stage.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotion)
    }
  }, [])

  useEffect(() => {
    controlsRef.current?.update(planes, page)
    if (lastFocusRef.current && !lastFocusRef.current.isConnected) {
      stageRef.current?.focus({ preventScroll: true })
    }
    lastFocusRef.current = null
  }, [planes, page])

  useEffect(() => {
    const closeElements = (event: PointerEvent) => {
      const menu = elementsRef.current
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false
      }
    }
    document.addEventListener('pointerdown', closeElements)
    return () => document.removeEventListener('pointerdown', closeElements)
  }, [])

  const renderHotspot = (hotspot: PrototypeHotspot) => (
    <button
      key={hotspot.id}
      ref={(node) => {
        if (node) hotspotRefs.current.set(hotspot.id, node)
        else hotspotRefs.current.delete(hotspot.id)
      }}
      type="button"
      className={styles.hotspot}
      data-prototype-action={hotspot.id}
      aria-label={t(hotspot.label)}
      aria-pressed={hotspot.pressed}
      aria-expanded={hotspot.expanded}
      aria-controls={
        hotspot.action.type === 'toggle-contact'
          ? `${id}-contact`
          : hotspot.action.type === 'toggle-filter'
            ? `${id}-filter`
            : undefined
      }
      onClick={() => activate(hotspot.action)}
      onPointerEnter={() => controlsRef.current?.highlight(hotspot.id)}
      onPointerLeave={() => controlsRef.current?.highlight(null)}
      onFocus={() => controlsRef.current?.highlight(hotspot.id)}
      onBlur={() => controlsRef.current?.highlight(null)}
    />
  )

  return (
    <div className={styles.root} data-prototype-theme={state.theme}>
      <div
        ref={stageRef}
        className={styles.stage}
        role="region"
        aria-label={t('Интерактивный ASCII-прототип браузера')}
        aria-describedby={`${id}-instructions ${id}-description`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          if (state.contactOpen) activate({ type: 'toggle-contact' })
          if (state.filterOpen) activate({ type: 'toggle-filter' })
        }}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.interactions}>
          {planes.map((plane) => (
            <div
              key={plane.id}
              ref={(node) => {
                if (node) planeRefs.current.set(plane.id, node)
                else planeRefs.current.delete(plane.id)
              }}
              className={styles.plane}
              data-prototype-plane={plane.id}
              role="group"
              aria-label={t(plane.id === 'main' ? 'Окно прототипа' : panelLabels[plane.id])}
            >
              {t(plane.hotspots.filter((hotspot) => !hotspot.group).map(renderHotspot))}
              {plane.id === 'main' && (
                <>
                  <div id={`${id}-contact`} hidden={!state.contactOpen}>
                    {t(
                      plane.hotspots
                        .filter((hotspot) => hotspot.group === 'contact')
                        .map(renderHotspot),
                    )}
                  </div>
                  <div id={`${id}-filter`} hidden={!state.filterOpen}>
                    {t(
                      plane.hotspots
                        .filter((hotspot) => hotspot.group === 'filter')
                        .map(renderHotspot),
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.fallback}>
          <span>+ VNE / PROTOTYPE +</span>
          <strong>{t(pages[page].label)}</strong>
          <span>{t(pages[page].description)}</span>
        </div>
        <div className={styles.registration}>
          <span>VNE / INTERFACE LAB</span>
          <button
            className={styles.ambient}
            type="button"
            aria-label={t(
              ambient ? 'Приостановить движение прототипа' : 'Включить движение прототипа',
            )}
            onClick={() => {
              controlsRef.current?.ambient(!ambient)
              setAmbient(!ambient)
            }}
          >
            <span aria-hidden="true">
              {ambient ? '● LIVE / ' : '○ LIVE / '}
              <PlaybackIcon playing={ambient} />
            </span>
          </button>
          <span>0{t(page + 1)}—03</span>
        </div>
      </div>
      <div className={styles.controls}>
        <p id={`${id}-instructions`} className={styles.instructions}>
          {t(
            'Наведите и нажмите на элементы. Потяните фон, чтобы повернуть. Стрелки — поворот, Home — сброс.',
          )}
        </p>
        <div className={styles.buttons} role="group" aria-label={t('Макет прототипа')}>
          <div className={styles.primaryButtons}>
            {pages.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={page === entry.id}
                onClick={() => activate({ type: 'select-page', page: entry.id })}
              >
                {t(entry.label)}
              </button>
            ))}
            <button
              type="button"
              aria-label={t('Тёмная тема окна прототипа')}
              aria-pressed={state.theme === 'dark'}
              onClick={() => activate({ type: 'toggle-theme' })}
            >
              {t('Тема:')} {t(state.theme === 'dark' ? 'тёмная' : 'светлая')}
            </button>
          </div>
          <div className={styles.secondaryButtons}>
            <details
              className={styles.elements}
              ref={elementsRef}
              onToggle={(event) => {
                if (!event.currentTarget.open) return
                const options = event.currentTarget.querySelector('fieldset')
                if (!options) return
                const bounds = options.getBoundingClientRect()
                const viewport = window.visualViewport
                const top = viewport?.offsetTop ?? 0
                const bottom = top + (viewport?.height ?? window.innerHeight)
                // Controls can be near the top after a native swipe. Bring the
                // opening list into view instead of leaving its first rows offscreen.
                if (bounds.top < top || bounds.bottom > bottom)
                  options.scrollIntoView({ block: 'nearest', behavior: 'instant' })
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Escape') return
                event.currentTarget.open = false
                event.currentTarget.querySelector('summary')?.focus()
              }}
            >
              <summary>{t('Элементы')}</summary>
              <fieldset className={styles.elementOptions} data-lenis-prevent>
                <legend className={styles.description}>{t('Видимость элементов прототипа')}</legend>
                {(['layers', 'component'] as const).map((panel) => (
                  <label key={panel}>
                    <input
                      type="checkbox"
                      checked={state.panels[panel]}
                      onChange={() => activate({ type: 'toggle-panel', panel })}
                    />
                    {t(panelLabels[panel])}
                  </label>
                ))}
                {(['structure', 'typography', 'visual'] as const).map((layer) => (
                  <label key={layer}>
                    <input
                      type="checkbox"
                      checked={state.visible[layer]}
                      onChange={() => activate({ type: 'toggle-layer', layer })}
                    />
                    {t(layerLabels[layer])}
                  </label>
                ))}
                <div className={styles.elementActions}>
                  {planes.flatMap((plane) =>
                    plane.hotspots.map((hotspot) => (
                      <button
                        key={`${plane.id}-${hotspot.id}`}
                        type="button"
                        aria-pressed={hotspot.pressed}
                        aria-expanded={hotspot.expanded}
                        onClick={() => activate(hotspot.action)}
                      >
                        {t(hotspot.label)}
                      </button>
                    )),
                  )}
                </div>
              </fieldset>
            </details>
            <button
              type="button"
              className={styles.reset}
              aria-label={t('Сбросить прототип')}
              onClick={() => {
                activate({ type: 'reset' })
                controlsRef.current?.reset()
              }}
            >
              <span aria-hidden="true">↺</span>
            </button>
          </div>
        </div>
      </div>
      <p className={styles.description} id={`${id}-description`} aria-live="polite">
        {t(pages[page].description)} {t('Тема окна:')}{' '}
        {t(state.theme === 'dark' ? 'тёмная' : 'светлая')}.
        {t(state.contactOpen && ' Открыты направления проекта.')}
        {t(
          page === 1 &&
            ` ${t('Выбран объект')} ${state.selectedObject + 1}. ${t('Фильтр:')} ${t(state.filter === 'all' ? 'все' : 'новинки')}.`,
        )}
      </p>
    </div>
  )
}
