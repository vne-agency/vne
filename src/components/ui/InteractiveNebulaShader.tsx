'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface InteractiveNebulaShaderProps {
  hasActiveReminders?: boolean
  hasUpcomingReminders?: boolean
  disableCenterDimming?: boolean
  className?: string
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform float hasActiveReminders;
  uniform float hasUpcomingReminders;
  uniform float disableCenterDimming;
  varying vec2 vUv;

  #define t iTime

  mat2 rotate2d(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
  }

  float mapField(vec3 point) {
    point.xz *= rotate2d(t * 0.22);
    point.xy *= rotate2d(t * 0.16);
    vec3 wave = point * 2.0 + t * 0.55;

    return length(point + vec3(sin(t * 0.35))) * log(length(point) + 1.0)
      + sin(wave.x + sin(wave.z + sin(wave.y))) * 0.5
      - 1.0;
  }

  void mainImage(out vec4 outputColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - iResolution * 0.5) / min(iResolution.x, iResolution.y);
    vec2 pointer = (iMouse - 0.5) * iResolution / min(iResolution.x, iResolution.y);
    vec2 pointerDelta = uv - pointer;
    float pointerDistance = length(pointerDelta);
    float pointerInfluence = exp(-pointerDistance * 5.5);

    uv += normalize(pointerDelta + vec2(0.0001)) * pointerInfluence * 0.075;
    uv.x += 0.06;

    vec3 color = vec3(0.0);
    float depth = 2.5;

    for (int i = 0; i <= 5; i++) {
      vec3 point = vec3(0.0, 0.0, 5.0) + normalize(vec3(uv, -1.0)) * depth;
      float field = mapField(point);
      float ridge = clamp((field - mapField(point + 0.1)) * 0.5, -0.1, 1.0);

      vec3 cobalt = vec3(0.04, 0.28, 1.0);
      vec3 violet = vec3(0.68, 0.12, 1.0);
      vec3 pearl = vec3(1.0, 0.68, 0.38);
      vec3 coolPearl = vec3(0.35, 0.72, 1.0);

      vec3 accent = mix(cobalt, violet, smoothstep(-0.08, 0.32, ridge));
      accent = mix(accent, pearl, smoothstep(0.28, 0.78, ridge));
      accent = mix(accent, coolPearl, hasActiveReminders * 0.22);
      accent = mix(accent, pearl, hasUpcomingReminders * 0.18);

      float sheen = smoothstep(-0.02, 0.38, ridge);
      vec3 base = vec3(0.008, 0.018, 0.065) + accent * (0.2 + sheen * 6.2);
      color = color * base + smoothstep(2.65, 0.0, field) * 1.08 * base;
      depth += min(field, 1.0);
    }

    float cobaltAura = exp(-length(uv + vec2(0.02, 0.04)) * 2.8);
    float violetAura = exp(-length(uv - vec2(-0.22, -0.08)) * 5.0);
    color += vec3(0.025, 0.15, 1.0) * cobaltAura * 0.08;
    color += vec3(0.52, 0.04, 0.95) * violetAura * 0.065;
    color = pow(max(color * 1.5, 0.0), vec3(0.8));
    color = 1.0 - exp(-color * 1.2);

    // Keep the background almost black while retaining enough mid-tones for
    // the complete orb silhouette to read, not only its brightest ridges.
    color = max(color - vec3(0.54), 0.0) * 2.55;

    float distanceFromCenter = distance(fragCoord, iResolution * 0.5);
    float radius = min(iResolution.x, iResolution.y) * 0.5;
    float edgeLight = smoothstep(radius * 0.24, radius * 0.78, distanceFromCenter);
    float dimming = mix(mix(0.76, 1.0, edgeLight), 1.0, disableCenterDimming);

    color *= dimming;
    color *= 1.0 - smoothstep(0.42, 0.92, distance(vUv, vec2(0.5))) * 0.38;
    outputColor = vec4(color, 1.0);
  }

  void main() {
    mainImage(gl_FragColor, vUv * iResolution);
  }
`

export function InteractiveNebulaShader({
  hasActiveReminders = false,
  hasUpcomingReminders = false,
  disableCenterDimming = false,
  className = '',
}: InteractiveNebulaShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const startTime = performance.now()
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iMouse: { value: new THREE.Vector2(0.5, 0.5) },
      hasActiveReminders: { value: 0 },
      hasUpcomingReminders: { value: 0 },
      disableCenterDimming: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    const pointerTarget = new THREE.Vector2(0.5, 0.5)
    materialRef.current = material
    scene.add(mesh)

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isVisible = false

    const renderFrame = () => {
      uniforms.iTime.value = (performance.now() - startTime) / 1000
      uniforms.iMouse.value.lerp(pointerTarget, 0.075)
      renderer.render(scene, camera)
    }

    const syncAnimation = () => {
      const shouldAnimate = isVisible && !document.hidden && !reducedMotionQuery.matches
      renderer.setAnimationLoop(shouldAnimate ? renderFrame : null)
      if (!shouldAnimate) renderFrame()
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      const width = Math.max(1, Math.round(entry.contentRect.width))
      const height = Math.max(1, Math.round(entry.contentRect.height))
      renderer.setSize(width, height, false)
      uniforms.iResolution.value.set(width, height)
      renderFrame()
    })

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting)
        syncAnimation()
      },
      { rootMargin: '120px' },
    )

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerTarget.set(
        THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1),
        THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1),
      )
    }

    const resetPointer = () => pointerTarget.set(0.5, 0.5)
    const handleVisibilityChange = () => syncAnimation()
    const handleReducedMotionChange = () => syncAnimation()

    resizeObserver.observe(container)
    visibilityObserver.observe(container)
    container.addEventListener('pointermove', handlePointerMove, { passive: true })
    container.addEventListener('pointerleave', resetPointer)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    renderFrame()

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', resetPointer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      materialRef.current = null
      material.dispose()
      geometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    material.uniforms.hasActiveReminders.value = Number(hasActiveReminders)
    material.uniforms.hasUpcomingReminders.value = Number(hasUpcomingReminders)
    material.uniforms.disableCenterDimming.value = Number(disableCenterDimming)
  }, [hasActiveReminders, hasUpcomingReminders, disableCenterDimming])

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Динамическая абстрактная композиция в темно-синих и фиолетовых оттенках"
    />
  )
}

export default InteractiveNebulaShader
