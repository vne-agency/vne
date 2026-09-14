'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import type { ServiceExperience } from './service-experience-data'
import styles from './ServiceSphereScene.module.css'

const RADIUS = 10
const LATITUDES = [1.3, 0.22, -0.22, -1.3]
const BLUE = '#3045be'
const INK = '#111111'
const PAPER = '#f4f3ef'

// Each vertex lies on the sphere, so both the typography and the grid curve
// around the viewer. The winding faces inward, towards the camera at its centre.
function createWallGeometry(longitude: number, top: number, bottom: number, panelAngle: number) {
  const columns = 32
  const rows = 20
  const positions: number[] = []
  const uv: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= rows; row++) {
    const v = row / rows
    const latitude = THREE.MathUtils.lerp(top, bottom, v)
    for (let column = 0; column <= columns; column++) {
      const u = column / columns
      const angle = longitude + (u - 0.5) * panelAngle
      positions.push(
        RADIUS * Math.cos(latitude) * Math.sin(angle),
        RADIUS * Math.sin(latitude),
        -RADIUS * Math.cos(latitude) * Math.cos(angle),
      )
      uv.push(u, 1 - v)
      if (row < rows && column < columns) {
        const index = row * (columns + 1) + column
        indices.push(index, index + columns + 1, index + 1)
        indices.push(index + 1, index + columns + 1, index + columns + 2)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  return geometry
}

function drawParagraph(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && context.measureText(next).width > width) {
      context.fillText(line, x, y)
      y += lineHeight
      line = word
    } else line = next
  }
  if (line) context.fillText(line, x, y)
}

function createWallTexture(service: ServiceExperience, column: number, row: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = row === 1 ? 448 : 768
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')

  const accent = (row === 0 && column === 1) || (row === 2 && column === 4)
  const light = (column + row) % 2 === 1 && !accent
  const foreground = light ? INK : PAPER
  context.fillStyle = accent ? BLUE : light ? PAPER : INK
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = light ? 'rgba(17,17,17,0.3)' : 'rgba(244,243,239,0.4)'
  context.lineWidth = 2
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
  context.fillStyle = foreground
  if (row === 1) {
    const step = service.steps[column - 1]
    const heading = column === 0 ? service.title : step ? step.title : 'Результат'
    const description =
      column === 0 ? service.description : step ? step.description : service.outcome
    context.textBaseline = 'middle'
    context.font = '500 16px "Onest Variable", Arial, sans-serif'
    context.fillText(service.label, 44, 34)
    context.textAlign = 'right'
    context.fillText(
      step
        ? `ЭТАП ${String(column).padStart(2, '0')} / ${String(service.steps.length).padStart(2, '0')}`
        : column === 0
          ? 'ОБЗОР / 360°'
          : 'НА ВЫХОДЕ',
      980,
      34,
    )
    context.textAlign = 'left'
    const maxSize = column === 0 ? 104 : 66
    context.font = `750 ${maxSize}px "Onest Variable", Arial, sans-serif`
    const size = Math.min(
      maxSize,
      (maxSize * 920) / context.measureText(heading.toUpperCase()).width,
    )
    context.font = `750 ${size}px "Onest Variable", Arial, sans-serif`
    const headingFont = context.font
    const headingBackground = column === 0 ? context.getImageData(30, 60, 964, 120) : null
    const headingText = heading.toUpperCase()
    const headingLetters = Array.from(headingText).map((letter, index) => ({
      letter,
      x: 44 + context.measureText(headingText.slice(0, index)).width,
      width: context.measureText(letter).width,
    }))
    context.fillText(heading.toUpperCase(), 44, 122)
    context.font = '450 26px "Onest Variable", Arial, sans-serif'
    drawParagraph(context, description, 44, 194, 910, 34)
    if (step) {
      context.font = '500 15px "Onest Variable", Arial, sans-serif'
      context.fillText(step.items ? 'ЧТО ВХОДИТ' : 'НА ВЫХОДЕ', 44, 338)
      context.font = '550 23px "Onest Variable", Arial, sans-serif'
      drawParagraph(context, step.deliverable ?? step.items?.join('; ') ?? '', 44, 368, 910, 29)
    }
    context.font = '500 15px "Onest Variable", Arial, sans-serif'
    context.fillText(column === 0 ? 'ОТ ЗАДАЧИ ДО ЗАПУСКА →' : 'VNE / НАШИ УСЛУГИ', 44, 420)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    if (headingBackground) {
      texture.userData.paintIntro = (progress: number) => {
        context.putImageData(headingBackground, 30, 60)
        context.font = headingFont
        context.textAlign = 'left'
        context.fillStyle = foreground
        if (progress >= 1) context.fillText(headingText, 44, 122)
        else
          headingLetters.forEach(({ letter, x, width }, index) => {
            const settled = index / headingLetters.length < Math.max(0, (progress - 0.15) / 0.85)
            const alphabet = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ'
            context.fillText(
              settled || !/[\p{L}\p{N}]/u.test(letter)
                ? letter
                : alphabet[Math.floor(Math.random() * alphabet.length)],
              x,
              122,
              Math.max(1, width),
            )
          })
        texture.needsUpdate = true
      }
    }
    return texture
  }
  context.textBaseline = 'middle'
  context.font = '500 20px "Onest Variable", Arial, sans-serif'
  context.fillText(service.label, 44, 54)
  context.textAlign = 'right'
  context.fillText(`${String(column + 1).padStart(2, '0')} / 360°`, 980, 54)
  context.textAlign = 'left'

  const word =
    service.wallWords[(column + (row === 1 ? 0 : row === 0 ? 2 : 4)) % service.wallWords.length]
  context.font = '900 180px "Onest Variable", Arial, sans-serif'
  const fontSize = Math.min(180, (920 / context.measureText(word).width) * 180)
  context.font = `900 ${fontSize}px "Onest Variable", Arial, sans-serif`
  context.textAlign = 'center'
  if (row === 0 && !accent) {
    context.strokeStyle = foreground
    context.lineWidth = 2
    context.strokeText(word, 512, 385)
  } else {
    context.fillText(word, 512, 385)
  }

  // A simple drawn mark keeps all the artwork sharp and local to the scene.
  context.save()
  context.translate(512, row === 1 ? 570 : 590)
  context.strokeStyle = foreground
  context.lineWidth = 3
  for (let ray = 0; ray < 8; ray++) {
    context.rotate(Math.PI / 4)
    context.beginPath()
    context.moveTo(14, 0)
    context.lineTo(48, 0)
    context.stroke()
  }
  context.restore()
  context.font = '500 22px "Onest Variable", Arial, sans-serif'
  context.textAlign = 'left'
  context.fillText(service.items[(column + row) % service.items.length].toUpperCase(), 44, 714)
  context.textAlign = 'right'
  context.fillText('ВНЕ ↗', 980, 714)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function ServiceSphereScene({
  service,
  onUnavailable,
  viewRequest,
}: {
  service: ServiceExperience
  onUnavailable: () => void
  viewRequest: { panel: number }
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const focusPanelRef = useRef<((panel: number) => void) | null>(null)
  const requestRef = useRef(viewRequest)

  useEffect(() => {
    requestRef.current = viewRequest
    focusPanelRef.current?.(viewRequest.panel)
  }, [viewRequest])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let renderer: THREE.WebGLRenderer | undefined
    let animationFrame = 0
    let removeListeners = () => {}
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.MeshBasicMaterial[] = []
    const textures: THREE.CanvasTexture[] = []

    async function initialise() {
      await document.fonts.load('900 100px "Onest Variable"')
      if (disposed || !host) return

      const scene = new THREE.Scene()
      const panelCount = service.steps.length + 2
      const panelAngle = (Math.PI * 2) / panelCount
      scene.background = new THREE.Color(INK)
      const camera = new THREE.PerspectiveCamera(74, 1, 0.1, 30)
      // The viewer stays at the centre; only the direction of their gaze changes.
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      const canvas = renderer.domElement
      canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)

      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < panelCount; column++) {
          const geometry = createWallGeometry(
            column * panelAngle,
            LATITUDES[row],
            LATITUDES[row + 1],
            panelAngle,
          )
          const texture = createWallTexture(service, column, row)
          texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
          const material = new THREE.MeshBasicMaterial({ map: texture })
          geometries.push(geometry)
          textures.push(texture)
          materials.push(material)
          scene.add(new THREE.Mesh(geometry, material))
        }
      }

      let rect = host.getBoundingClientRect()
      let yaw = -0.12
      let pitch = 0.08
      let targetYaw = 0
      let targetPitch = 0
      let baseYaw = 0
      let basePitch = 0
      let previousTime = 0
      const introStart = performance.now()
      let introDone = false
      let introFrame = -1
      const introTexture = textures.find((texture) => texture.userData.paintIntro)
      let visible = true
      let pointer: { id: number; x: number; y: number; yaw: number; pitch: number } | null = null
      const direction = new THREE.Vector3()
      const clampPitch = (value: number) => THREE.MathUtils.clamp(value, -0.85, 0.85)

      const render = (time: number) => {
        animationFrame = 0
        if (disposed || !visible || document.hidden || !renderer) return
        const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60
        previousTime = time
        if (!introDone) {
          const progress = Math.min(1, (time - introStart) / 850)
          const frame = Math.floor((time - introStart) / 65)
          if (frame !== introFrame || progress === 1) {
            introTexture?.userData.paintIntro(progress)
            introFrame = frame
          }
          introDone = progress === 1
        }
        const damping = 1 - Math.exp(-delta * 8)
        yaw += (targetYaw - yaw) * damping
        pitch += (targetPitch - pitch) * damping
        camera.lookAt(
          direction.set(
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            -Math.cos(yaw) * Math.cos(pitch),
          ),
        )
        renderer.render(scene, camera)

        // Stop drawing when the camera settles; pointer input requests the next frame.
        if (!introDone || Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) > 0.0001) {
          animationFrame = requestAnimationFrame(render)
        } else {
          previousTime = 0
        }
      }
      const invalidate = () => {
        if (!animationFrame && !disposed && visible && !document.hidden) {
          animationFrame = requestAnimationFrame(render)
        }
      }
      focusPanelRef.current = (panel) => {
        const angle = panel * panelAngle
        const fullTurn = Math.PI * 2
        targetYaw = angle + Math.round((yaw - angle) / fullTurn) * fullTurn
        targetPitch = 0
        baseYaw = targetYaw
        basePitch = 0
        invalidate()
      }
      const resize = () => {
        rect = host.getBoundingClientRect()
        // Layout dimensions exclude the dialog's entrance transform. CSS owns
        // the canvas size so opening during that transition cannot leave gaps.
        const width = host.clientWidth
        const height = host.clientHeight
        if (!width || !height || !renderer) return
        // Cap horizontal FOV too: a fixed vertical FOV caused extreme edge
        // stretching on wide, shallow laptop and desktop viewports.
        camera.aspect = width / height
        camera.fov = Math.min(
          74,
          THREE.MathUtils.radToDeg(
            2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(50)) / camera.aspect),
          ),
        )
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
        invalidate()
      }
      const refreshBounds = () => {
        rect = host.getBoundingClientRect()
      }
      const move = (event: PointerEvent) => {
        if (pointer?.id === event.pointerId) {
          targetYaw = pointer.yaw - ((event.clientX - pointer.x) / rect.width) * 2.5
          targetPitch = clampPitch(
            pointer.pitch + ((event.clientY - pointer.y) / rect.height) * 1.5,
          )
        } else if (!pointer && event.pointerType === 'mouse') {
          targetYaw = baseYaw + ((event.clientX - rect.left) / rect.width - 0.5) * 1.25
          targetPitch = clampPitch(
            basePitch - ((event.clientY - rect.top) / rect.height - 0.5) * 0.65,
          )
        } else {
          return
        }
        invalidate()
      }
      const down = (event: PointerEvent) => {
        if (!event.isPrimary || event.button !== 0 || pointer) return
        refreshBounds()
        pointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          yaw: targetYaw,
          pitch: targetPitch,
        }
        host.setPointerCapture(event.pointerId)
        host.dataset.dragging = 'true'
        host.focus({ preventScroll: true })
      }
      const up = (event: PointerEvent) => {
        if (pointer?.id !== event.pointerId) return
        baseYaw = targetYaw
        basePitch = targetPitch
        if (event.pointerType === 'mouse') {
          baseYaw -= ((event.clientX - rect.left) / rect.width - 0.5) * 1.25
          basePitch += ((event.clientY - rect.top) / rect.height - 0.5) * 0.65
        }
        pointer = null
        delete host.dataset.dragging
        if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
      }
      const keydown = (event: KeyboardEvent) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        switch (event.key) {
          case 'ArrowLeft':
            targetYaw -= 0.22
            break
          case 'ArrowRight':
            targetYaw += 0.22
            break
          case 'ArrowUp':
            targetPitch = clampPitch(targetPitch + 0.15)
            break
          case 'ArrowDown':
            targetPitch = clampPitch(targetPitch - 0.15)
            break
          case 'Home':
            targetYaw = Math.round(targetYaw / (Math.PI * 2)) * Math.PI * 2
            targetPitch = 0
            break
          default:
            return
        }
        event.preventDefault()
        baseYaw = targetYaw
        basePitch = targetPitch
        invalidate()
      }
      const visibility = () => {
        previousTime = 0
        if (document.hidden) {
          cancelAnimationFrame(animationFrame)
          animationFrame = 0
        } else invalidate()
      }
      const contextLost = (event: Event) => {
        event.preventDefault()
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
        if (!disposed) onUnavailable()
      }
      const resizeObserver = new ResizeObserver(resize)
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) invalidate()
        else {
          cancelAnimationFrame(animationFrame)
          animationFrame = 0
          previousTime = 0
        }
      })
      resizeObserver.observe(host)
      intersectionObserver.observe(host)
      host.addEventListener('pointerenter', refreshBounds)
      host.addEventListener('pointermove', move)
      host.addEventListener('pointerdown', down)
      host.addEventListener('pointerup', up)
      host.addEventListener('pointercancel', up)
      host.addEventListener('lostpointercapture', up)
      host.addEventListener('keydown', keydown)
      canvas.addEventListener('webglcontextlost', contextLost)
      document.addEventListener('visibilitychange', visibility)
      removeListeners = () => {
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        host.removeEventListener('pointerenter', refreshBounds)
        host.removeEventListener('pointermove', move)
        host.removeEventListener('pointerdown', down)
        host.removeEventListener('pointerup', up)
        host.removeEventListener('pointercancel', up)
        host.removeEventListener('lostpointercapture', up)
        host.removeEventListener('keydown', keydown)
        canvas.removeEventListener('webglcontextlost', contextLost)
        document.removeEventListener('visibilitychange', visibility)
      }
      resize()
      focusPanelRef.current(requestRef.current.panel)
    }

    void initialise().catch(() => {
      if (!disposed) onUnavailable()
    })

    return () => {
      disposed = true
      focusPanelRef.current = null
      cancelAnimationFrame(animationFrame)
      removeListeners()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      const contextLost = renderer?.getContext().isContextLost()
      renderer?.dispose()
      if (!contextLost) renderer?.forceContextLoss()
      renderer?.domElement.remove()
    }
  }, [service, onUnavailable])

  return (
    <div
      ref={hostRef}
      className={styles.scene}
      role="region"
      aria-label={`Панорама: ${service.title}. Осмотритесь мышью, перетаскиванием или клавишами со стрелками. Home — исходный вид.`}
      tabIndex={0}
      data-lenis-prevent
    />
  )
}
