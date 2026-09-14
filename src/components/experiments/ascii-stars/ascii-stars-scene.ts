import * as THREE from 'three'

import {
  asciiFragmentShader,
  screenVertexShader,
  sculptureFragmentShader,
  sculptureVertexShader,
} from './ascii-stars-shaders'

export type AsciiStarsSettings = {
  theme: 'light' | 'dark'
  mode: 'ascii' | 'dither'
  density: number
  speed: number
  paused: boolean
  scale?: number
  rotationZ?: number
  rotationX?: number
  rotationY?: number
  backgroundColor?: string
  foregroundColor?: string
}

export type AsciiStarsExportOptions = {
  size: 1024 | 2048 | 4096
  background: 'transparent' | 'theme'
}

// Four concave, swept starbursts share one elliptical ribbon. Its elliptical
// cross-section gives real normals, depth and occlusion rather than a flat mask.
function createOrbitGeometry() {
  const segments = 1152
  const sides = 24
  const positions: number[] = []
  const indices: number[] = []
  const stars = [
    { angle: 0.12, width: 0.54, reach: 0.85, outside: 0.25 },
    { angle: 1.84, width: 0.83, reach: 0.9, outside: 1 },
    { angle: 3.24, width: 0.48, reach: 0.85, outside: 0.25 },
    { angle: 4.98, width: 0.91, reach: 0.9, outside: 1 },
  ]

  for (let segment = 0; segment <= segments; segment++) {
    const angle = (segment / segments) * Math.PI * 2
    let width = 0.023
    let outerWidth = 0.023
    for (const star of stars) {
      const delta = Math.abs(Math.atan2(Math.sin(angle - star.angle), Math.cos(angle - star.angle)))
      const ray = star.width * Math.pow(Math.max(0, 1 - delta / star.reach), 3.5)
      width += ray
      outerWidth += ray * star.outside
    }
    for (let side = 0; side <= sides; side++) {
      const crossAngle = (side / sides) * Math.PI * 2
      const radial = Math.cos(crossAngle)
      const localWidth = radial > 0 ? outerWidth : width
      const sweptAngle = angle - radial * Math.abs(radial) * localWidth * 0.22
      const radius = localWidth * radial
      positions.push(
        (2.78 + radius) * Math.cos(sweptAngle),
        (1.43 + radius) * Math.sin(sweptAngle),
        Math.sin(crossAngle) * (0.008 + width * 0.28) + Math.sin(angle * 2) * 0.08,
      )
      if (segment < segments && side < sides) {
        const a = segment * (sides + 1) + side
        const b = a + sides + 1
        indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function createGlyphAtlas() {
  const glyphs = ' .,:;-=+*/ox%#@W'
  const canvas = document.createElement('canvas')
  canvas.width = 32 * 16
  canvas.height = 48
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Glyph canvas is unavailable')
  context.font = 'bold 40px "Courier New", monospace'
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  for (let i = 0; i < 16; i++) context.fillText(glyphs[i], i * 32 + 16, 25)
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

export function createAsciiStarsScene(
  host: HTMLDivElement,
  initialSettings: AsciiStarsSettings,
  onUnavailable: () => void,
  onReady?: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;'
  renderer.setClearColor(0x000000, 0)
  const geometry = createOrbitGeometry()
  const atlas = createGlyphAtlas()
  const material = new THREE.ShaderMaterial({
    vertexShader: sculptureVertexShader,
    fragmentShader: sculptureFragmentShader,
    uniforms: { uTime: { value: 0 } },
    side: THREE.DoubleSide,
  })
  const sculpture = new THREE.Mesh(geometry, material)
  const scene = new THREE.Scene()
  scene.add(sculpture)
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 30)
  camera.position.z = 10
  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  })
  const uniforms = {
    uScene: { value: target.texture },
    uGlyphs: { value: atlas },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uCell: { value: 6 },
    uMode: { value: 0 },
    uTransparent: { value: 0 },
    uExport: { value: 0 },
    // Values are display-space colors: the post-pass writes them directly.
    uPaper: { value: new THREE.Vector3(244 / 255, 243 / 255, 238 / 255) },
    uInk: { value: new THREE.Vector3(34 / 255, 35 / 255, 31 / 255) },
  }
  const postMaterial = new THREE.ShaderMaterial({
    vertexShader: screenVertexShader,
    fragmentShader: asciiFragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  })
  const screenGeometry = new THREE.PlaneGeometry(2, 2)
  const screen = new THREE.Scene()
  screen.add(new THREE.Mesh(screenGeometry, postMaterial))
  const screenCamera = new THREE.Camera()
  let settings = initialSettings
  let frame = 0
  let lastTime = 0
  let time = 0
  let inView = true
  let disposed = false
  let lost = false
  let hasRendered = false
  let width = 1
  let height = 1
  let pixelRatio = 1
  const pointer = new THREE.Vector2()
  const rotation = new THREE.Vector2()
  const orientation = new THREE.Quaternion()
  const automaticOrientation = new THREE.Quaternion()
  const automaticEuler = new THREE.Euler()
  const dragDelta = new THREE.Quaternion()
  const dragPrevious = new THREE.Vector3()
  const dragCurrent = new THREE.Vector3()
  const inertiaAxis = new THREE.Vector3()
  const keyboardAxis = new THREE.Vector3()
  let angularVelocity = 0
  let drag: { id: number; lastMove: number } | null = null
  let touchIntent: { id: number; x: number; y: number } | null = null

  const trackballPoint = (x: number, y: number, point: THREE.Vector3) => {
    const bounds = host.getBoundingClientRect()
    const radius = Math.min(width, height) * 0.5
    point.set((x - bounds.left - width / 2) / radius, (bounds.top + height / 2 - y) / radius, 0)
    const distance = point.lengthSq()
    point.z = distance <= 0.5 ? Math.sqrt(1 - distance) : 0.5 / Math.sqrt(distance)
    return point.normalize()
  }

  const draw = (now: number) => {
    frame = 0
    if (disposed || lost || document.hidden || !inView) return
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0
    lastTime = now
    const starting =
      !!host.closest('[data-startup-artwork]') && !!document.querySelector('[data-startup-loader]')
    if (!settings.paused && !drag && !starting) {
      time += delta * settings.speed * 2.0
      rotation.lerp(pointer, 1 - Math.exp(-delta * 4))
      if (angularVelocity > 0.015) {
        dragDelta.setFromAxisAngle(inertiaAxis, angularVelocity * delta)
        orientation.premultiply(dragDelta).normalize()
        angularVelocity *= Math.exp(-delta * 5)
      } else angularVelocity = 0
    }
    automaticEuler.set(
      -0.12 + (settings.rotationX ?? 0) + Math.sin(time * 0.36) * 0.14 + rotation.y,
      0.14 + (settings.rotationY ?? 0) + Math.sin(time * 0.27) * 0.2 + rotation.x,
      -0.1 + (settings.rotationZ ?? 0) + Math.sin(time * 0.18) * 0.055,
    )
    automaticOrientation.setFromEuler(automaticEuler)
    sculpture.quaternion.copy(orientation).multiply(automaticOrientation)
    material.uniforms.uTime.value = time
    renderer.setRenderTarget(target)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(screen, screenCamera)
    if (!hasRendered) {
      hasRendered = true
      onReady?.()
    }
    if (
      !starting &&
      !settings.paused &&
      !drag &&
      (settings.speed > 0 || angularVelocity > 0 || rotation.distanceToSquared(pointer) > 0.000001)
    ) {
      frame = requestAnimationFrame(draw)
    }
  }
  const invalidate = () => {
    if (!frame && !disposed && !lost && !document.hidden && inView)
      frame = requestAnimationFrame(draw)
  }
  // Read the actual hero frame synchronously, before WebGL clears its buffer.
  // The loader uses these exact glyphs and leaves this scene mounted throughout.
  const captureStartup = (event: Event) => {
    if (disposed || lost || !hasRendered) return
    renderer.setRenderTarget(target)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(screen, screenCamera)
    const receive = (event as CustomEvent<(source: HTMLCanvasElement, cell: number) => void>).detail
    receive(canvas, uniforms.uCell.value / pixelRatio)
  }
  const update = (next: AsciiStarsSettings) => {
    const wasPaused = settings.paused
    settings = next
    if (next.paused) angularVelocity = 0
    const light = next.theme === 'light'
    // The screen shader uses literal palette values, without scene lighting.
    const paper = new THREE.Color().setStyle(
      next.backgroundColor ?? (light ? '#f4f3ee' : '#22231f'),
      THREE.LinearSRGBColorSpace,
    )
    const ink = new THREE.Color().setStyle(
      next.foregroundColor ?? (light ? '#22231f' : '#f4f3ee'),
      THREE.LinearSRGBColorSpace,
    )
    uniforms.uPaper.value.set(paper.r, paper.g, paper.b)
    uniforms.uInk.value.set(ink.r, ink.g, ink.b)
    uniforms.uMode.value = next.mode === 'ascii' ? 0 : 1
    // CSS pixels keep glyphs readable at both ordinary and Retina resolutions.
    const mobileScale = width < 600 ? 0.8 : 1
    uniforms.uCell.value = (9.5 - next.density * 5.5) * mobileScale * pixelRatio
    const aspect = width / height
    const viewHeight = Math.max(5.65, 7.6 / aspect) / THREE.MathUtils.clamp(next.scale ?? 1, 0.5, 2)
    camera.left = (-viewHeight * aspect) / 2
    camera.right = (viewHeight * aspect) / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    if (wasPaused !== next.paused) lastTime = 0
    invalidate()
  }
  const resize = () => {
    width = Math.max(1, host.clientWidth)
    height = Math.max(1, host.clientHeight)
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    target.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio))
    renderer.getDrawingBufferSize(uniforms.uResolution.value)
    update(settings)
  }
  const exportPng = async ({ size, background }: AsciiStarsExportOptions): Promise<Blob> => {
    const gl = renderer.getContext()
    if (disposed || lost || gl.isContextLost()) {
      throw new Error('WebGL недоступен. Обновите страницу и попробуйте снова.')
    }
    if (!hasRendered) throw new Error('Изображение ещё загружается.')
    if (![1024, 2048, 4096].includes(size)) throw new Error('Неподдерживаемый размер изображения.')
    if (background !== 'transparent' && background !== 'theme') {
      throw new Error('Неподдерживаемый фон изображения.')
    }
    const maxSize = Math.min(
      renderer.capabilities.maxTextureSize,
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
    )
    if (size > maxSize) throw new Error('Этот размер недоступен на устройстве. Выберите меньший.')

    // Measure the current rotated vertices, not the unrotated bounding box.
    // The wider projected dimension occupies 82% of a centered square.
    sculpture.updateMatrixWorld(true)
    const bounds = new THREE.Box3()
    const vertex = new THREE.Vector3()
    const positions = geometry.getAttribute('position')
    for (let index = 0; index < positions.count; index++) {
      vertex.fromBufferAttribute(positions, index).applyMatrix4(sculpture.matrixWorld)
      bounds.expandByPoint(vertex)
    }
    const center = bounds.getCenter(new THREE.Vector3())
    const extent = bounds.getSize(new THREE.Vector3())
    const viewSize = Math.max(extent.x, extent.y) / 0.82
    const exportCamera = new THREE.OrthographicCamera(
      center.x - viewSize / 2,
      center.x + viewSize / 2,
      center.y + viewSize / 2,
      center.y - viewSize / 2,
      camera.near,
      camera.far,
    )
    // Shift the projection window so centering does not alter studio reflections.
    exportCamera.position.copy(camera.position)

    const previous = {
      target: renderer.getRenderTarget(),
      viewport: renderer.getViewport(new THREE.Vector4()),
      scissor: renderer.getScissor(new THREE.Vector4()),
      scissorTest: renderer.getScissorTest(),
      autoClear: renderer.autoClear,
      scene: uniforms.uScene.value,
      resolution: uniforms.uResolution.value.clone(),
      cell: uniforms.uCell.value,
      transparent: uniforms.uTransparent.value,
      exporting: uniforms.uExport.value,
    }
    let exportScene: THREE.WebGLRenderTarget | undefined
    let exportImage: THREE.WebGLRenderTarget | undefined
    const pixels = new Uint8Array(size * size * 4)
    try {
      exportScene = new THREE.WebGLRenderTarget(size, size, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
      })
      exportImage = new THREE.WebGLRenderTarget(size, size, {
        depthBuffer: false,
        stencilBuffer: false,
      })
      uniforms.uScene.value = exportScene.texture
      uniforms.uResolution.value.set(size, size)
      // Preserve glyph/dot density in world space, regardless of PNG resolution.
      uniforms.uCell.value =
        previous.cell * ((camera.top - camera.bottom) / previous.resolution.y) * (size / viewSize)
      uniforms.uTransparent.value = background === 'transparent' ? 1 : 0
      uniforms.uExport.value = 1
      renderer.autoClear = true
      renderer.setScissorTest(false)
      renderer.setRenderTarget(exportScene)
      renderer.render(scene, exportCamera)
      renderer.setRenderTarget(exportImage)
      renderer.render(screen, screenCamera)
      if (
        gl.isContextLost() ||
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
      ) {
        throw new Error('Не удалось создать PNG. Выберите меньший размер и попробуйте снова.')
      }
      renderer.readRenderTargetPixels(exportImage, 0, 0, size, size, pixels)
      if (gl.isContextLost()) throw new Error('Соединение с WebGL потеряно. Обновите страницу.')
    } finally {
      uniforms.uScene.value = previous.scene
      uniforms.uResolution.value.copy(previous.resolution)
      uniforms.uCell.value = previous.cell
      uniforms.uTransparent.value = previous.transparent
      uniforms.uExport.value = previous.exporting
      renderer.autoClear = previous.autoClear
      renderer.setRenderTarget(previous.target)
      renderer.setViewport(previous.viewport)
      renderer.setScissor(previous.scissor)
      renderer.setScissorTest(previous.scissorTest)
      exportScene?.dispose()
      exportImage?.dispose()
    }

    // WebGL readback starts at the bottom; ImageData starts at the top.
    const rowLength = size * 4
    const row = new Uint8Array(rowLength)
    for (let y = 0; y < size / 2; y++) {
      const top = y * rowLength
      const bottom = (size - y - 1) * rowLength
      row.set(pixels.subarray(top, top + rowLength))
      pixels.copyWithin(top, bottom, bottom + rowLength)
      pixels.set(row, bottom)
    }
    const output = document.createElement('canvas')
    output.width = size
    output.height = size
    const context = output.getContext('2d')
    if (!context) throw new Error('Не удалось подготовить PNG на этом устройстве.')
    context.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer), size, size), 0, 0)
    return new Promise<Blob>((resolve, reject) => {
      output.toBlob((blob) => {
        output.width = 0
        output.height = 0
        if (blob) resolve(blob)
        else reject(new Error('Не удалось сохранить PNG. Попробуйте ещё раз.'))
      }, 'image/png')
    })
  }
  const down = (event: PointerEvent) => {
    if (drag || touchIntent || !event.isPrimary || event.button !== 0 || lost) return
    // Let the browser keep vertical scrolling and pinch zoom. A touch only
    // becomes a trackball drag once it clearly travels horizontally.
    if (event.pointerType === 'touch') {
      touchIntent = { id: event.pointerId, x: event.clientX, y: event.clientY }
      return
    }
    event.preventDefault()
    angularVelocity = 0
    drag = { id: event.pointerId, lastMove: event.timeStamp }
    trackballPoint(event.clientX, event.clientY, dragPrevious)
    host.setPointerCapture(event.pointerId)
    host.dataset.dragging = 'true'
    host.focus({ preventScroll: true })
    invalidate()
  }
  const move = (event: PointerEvent) => {
    if (touchIntent && event.pointerId === touchIntent.id) {
      const dx = Math.abs(event.clientX - touchIntent.x)
      const dy = Math.abs(event.clientY - touchIntent.y)
      if (Math.max(dx, dy) < 8) return
      if (dy >= dx) {
        touchIntent = null
        return
      }
      if (dx < dy * 1.2) return
      angularVelocity = 0
      drag = { id: event.pointerId, lastMove: event.timeStamp }
      trackballPoint(touchIntent.x, touchIntent.y, dragPrevious)
      touchIntent = null
      host.setPointerCapture(event.pointerId)
      host.dataset.dragging = 'true'
    }
    if (drag) {
      if (event.pointerId !== drag.id) return
      trackballPoint(event.clientX, event.clientY, dragCurrent)
      dragDelta.setFromUnitVectors(dragPrevious, dragCurrent)
      orientation.premultiply(dragDelta).normalize()
      const angle = 2 * Math.acos(THREE.MathUtils.clamp(dragDelta.w, -1, 1))
      inertiaAxis.set(dragDelta.x, dragDelta.y, dragDelta.z)
      if (inertiaAxis.lengthSq() > 0.000001) {
        inertiaAxis.normalize()
        angularVelocity = Math.min(
          6,
          angle / Math.max(0.008, (event.timeStamp - drag.lastMove) / 1000),
        )
      }
      drag.lastMove = event.timeStamp
      dragPrevious.copy(dragCurrent)
      invalidate()
      return
    }
    if (event.pointerType !== 'mouse' || settings.paused) return
    const bounds = host.getBoundingClientRect()
    pointer.set(
      ((event.clientX - bounds.left) / width - 0.5) * 0.5,
      ((event.clientY - bounds.top) / height - 0.5) * 0.35,
    )
    invalidate()
  }
  const leave = () => {
    if (drag) return
    pointer.set(0, 0)
    invalidate()
  }
  const up = (event: PointerEvent) => {
    // Touch starts with implicit capture on the child canvas. Transferring it
    // to the host emits a bubbling lost event for that child, not our drag.
    if (event.type === 'lostpointercapture' && event.target !== host) return
    if (touchIntent?.id === event.pointerId) touchIntent = null
    if (!drag || event.pointerId !== drag.id) return
    if (event.type !== 'pointerup' || event.timeStamp - drag.lastMove > 100 || settings.paused) {
      angularVelocity = 0
    }
    drag = null
    delete host.dataset.dragging
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
    pointer.set(0, 0)
    lastTime = 0
    invalidate()
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || drag) return
    switch (event.key) {
      case 'ArrowLeft':
        keyboardAxis.set(0, -1, 0)
        break
      case 'ArrowRight':
        keyboardAxis.set(0, 1, 0)
        break
      case 'ArrowUp':
        keyboardAxis.set(-1, 0, 0)
        break
      case 'ArrowDown':
        keyboardAxis.set(1, 0, 0)
        break
      case 'Home':
        orientation.identity()
        pointer.set(0, 0)
        rotation.set(0, 0)
        angularVelocity = 0
        time = 0
        event.preventDefault()
        invalidate()
        return
      default:
        return
    }
    event.preventDefault()
    angularVelocity = 0
    dragDelta.setFromAxisAngle(keyboardAxis, event.shiftKey ? 0.3 : 0.12)
    orientation.premultiply(dragDelta).normalize()
    invalidate()
  }
  const cancelDrag = () => {
    touchIntent = null
    if (drag) {
      const id = drag.id
      drag = null
      delete host.dataset.dragging
      if (host.hasPointerCapture(id)) host.releasePointerCapture(id)
    }
    angularVelocity = 0
    pointer.set(0, 0)
    lastTime = 0
    invalidate()
  }
  const visibility = () => {
    lastTime = 0
    if (document.hidden) {
      cancelDrag()
      cancelAnimationFrame(frame)
      frame = 0
    } else invalidate()
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelDrag()
    cancelAnimationFrame(frame)
    frame = 0
    onUnavailable()
  }
  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    lastTime = 0
    if (inView) invalidate()
    else {
      cancelAnimationFrame(frame)
      frame = 0
    }
  })
  host.appendChild(canvas)
  host.addEventListener('vne-startup-capture', captureStartup)
  window.addEventListener('vne-startup-complete', invalidate)
  resizeObserver.observe(host)
  intersectionObserver.observe(host)
  host.addEventListener('pointermove', move)
  host.addEventListener('pointerdown', down)
  host.addEventListener('pointerup', up)
  host.addEventListener('pointercancel', up)
  host.addEventListener('lostpointercapture', up)
  host.addEventListener('pointerleave', leave)
  host.addEventListener('keydown', keydown)
  window.addEventListener('blur', cancelDrag)
  canvas.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', visibility)
  resize()

  return {
    update,
    exportPng,
    dispose() {
      disposed = true
      cancelDrag()
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      host.removeEventListener('vne-startup-capture', captureStartup)
      window.removeEventListener('vne-startup-complete', invalidate)
      intersectionObserver.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerdown', down)
      host.removeEventListener('pointerup', up)
      host.removeEventListener('pointercancel', up)
      host.removeEventListener('lostpointercapture', up)
      host.removeEventListener('pointerleave', leave)
      host.removeEventListener('keydown', keydown)
      window.removeEventListener('blur', cancelDrag)
      canvas.removeEventListener('webglcontextlost', contextLost)
      document.removeEventListener('visibilitychange', visibility)
      geometry.dispose()
      material.dispose()
      atlas.dispose()
      target.dispose()
      screenGeometry.dispose()
      postMaterial.dispose()
      renderer.dispose()
      if (!lost) renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
