'use client'

import { useEffect, useRef } from 'react'

import styles from './NoiseBackground.module.css'

type NoiseBackgroundProps = {
  className?: string
}

const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_pointerPresence;
uniform float u_time;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float grain(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int octave = 0; octave < 4; octave++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  vec2 pointer = (u_pointer * u_resolution.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);
  vec2 pointerDelta = p - pointer;
  float pointerDistance = length(pointerDelta);
  float pointerMask = u_pointerPresence
    * (1.0 - smoothstep(0.0, 0.58, pointerDistance));
  float ripple = sin(pointerDistance * 28.0 - u_time * 4.0);
  p -= pointerDelta / max(pointerDistance, 0.001)
    * ripple * pointerMask * 0.055;

  float time = u_time * 0.24;
  vec2 domain = vec2(
    fbm(p * 1.35 + vec2(time * 0.17, -time * 0.08)),
    fbm(p * 1.35 + vec2(5.2, 1.3) + vec2(-time * 0.11, time * 0.09))
  );
  p += (domain - 0.5) * 0.72;

  float curtain = fbm(vec2(
    p.x * 2.0 + time * 0.32,
    p.y * 0.64 - time * 0.12
  ) + 49.84);
  float band = fbm(vec2(
    p.x * 3.5 - time * 0.22,
    curtain * 3.2 + p.y * 0.38
  ));
  float field = clamp(
    band * 0.76 + curtain * 0.34 - abs(p.y) * 0.08,
    0.0,
    1.0
  );

  vec3 black = vec3(0.008, 0.009, 0.018);
  vec3 midnight = vec3(0.025, 0.045, 0.18);
  vec3 eldaBlue = vec3(0.188, 0.271, 0.745);
  vec3 coolWhite = vec3(0.94, 0.96, 1.0);

  vec3 colour = mix(black, midnight, smoothstep(0.10, 0.48, field));
  colour = mix(colour, eldaBlue, smoothstep(0.38, 0.72, field));
  colour = mix(colour, coolWhite, smoothstep(0.72, 0.98, field));

  float ribbon = smoothstep(0.025, 0.0, abs(field - 0.66));
  colour += eldaBlue * ribbon * 0.34;
  colour += mix(eldaBlue, coolWhite, 0.3) * pointerMask * 0.12;

  float vignette = smoothstep(0.42, 1.0, length(screenUv - 0.5) * 1.25);
  colour *= 1.0 - vignette * 0.34;
  colour += (grain(gl_FragCoord.xy + 49.84) - 0.5) * 0.105;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`

const MAX_RENDER_PIXELS = 1_500_000

export function NoiseBackground({ className = '' }: NoiseBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current

    if (!root || !canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      stencil: false,
    })

    if (!gl) return

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      return
    }

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer')
    const pointerPresenceLocation = gl.getUniformLocation(program, 'u_pointerPresence')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

    let layoutWidth = 1
    let layoutHeight = 1
    let targetX = 0.5
    let targetY = 0.5
    let pointerX = 0.5
    let pointerY = 0.5
    let targetPresence = 0
    let pointerPresence = 0
    let frame: number | null = null
    let lastTime: number | null = null
    let elapsed = 0
    let inView = false
    let documentVisible = document.visibilityState === 'visible'
    let disposed = false

    const resize = (width: number, height: number) => {
      layoutWidth = Math.max(width, 1)
      layoutHeight = Math.max(height, 1)

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const rawWidth = Math.max(1, Math.round(layoutWidth * dpr))
      const rawHeight = Math.max(1, Math.round(layoutHeight * dpr))
      const renderScale = Math.min(
        1,
        Math.sqrt(MAX_RENDER_PIXELS / Math.max(rawWidth * rawHeight, 1)),
      )
      const widthPx = Math.max(1, Math.round(rawWidth * renderScale))
      const heightPx = Math.max(1, Math.round(rawHeight * renderScale))

      if (canvas.width !== widthPx || canvas.height !== heightPx) {
        canvas.width = widthPx
        canvas.height = heightPx
        gl.viewport(0, 0, widthPx, heightPx)
      }
    }

    const canRender = () => inView && documentVisible && !disposed

    const requestRender = () => {
      if (frame === null && canRender()) frame = requestAnimationFrame(render)
    }

    const render = (now: number) => {
      frame = null
      if (!canRender()) return

      const delta = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const follow = 1 - Math.exp(-10 * delta)
      pointerX += (targetX - pointerX) * follow
      pointerY += (targetY - pointerY) * follow
      pointerPresence += (targetPresence - pointerPresence) * follow

      if (!motionPreference.matches) elapsed += delta

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(pointerLocation, pointerX, pointerY)
      gl.uniform1f(pointerPresenceLocation, pointerPresence)
      gl.uniform1f(timeLocation, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      const pointerSettling =
        Math.abs(targetX - pointerX) > 0.001 ||
        Math.abs(targetY - pointerY) > 0.001 ||
        Math.abs(targetPresence - pointerPresence) > 0.001

      if (!motionPreference.matches || pointerSettling) requestRender()
      else lastTime = null
    }

    const onPointerMove = (event: PointerEvent) => {
      targetX = Math.min(1, Math.max(0, event.offsetX / layoutWidth))
      targetY = 1 - Math.min(1, Math.max(0, event.offsetY / layoutHeight))
      targetPresence = 1
      requestRender()
    }

    const onPointerLeave = () => {
      targetPresence = 0
      requestRender()
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      resize(entry.contentRect.width, entry.contentRect.height)
      requestRender()
    })

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting)

        if (inView) requestRender()
        else if (frame !== null) {
          cancelAnimationFrame(frame)
          frame = null
          lastTime = null
        }
      },
      { rootMargin: '120px' },
    )

    const onVisibilityChange = () => {
      documentVisible = document.visibilityState === 'visible'

      if (documentVisible) requestRender()
      else if (frame !== null) {
        cancelAnimationFrame(frame)
        frame = null
        lastTime = null
      }
    }

    const onMotionPreferenceChange = () => {
      lastTime = null
      requestRender()
    }

    resizeObserver.observe(root)
    intersectionObserver.observe(root)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('pointercancel', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    motionPreference.addEventListener('change', onMotionPreferenceChange)

    return () => {
      disposed = true
      if (frame !== null) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointercancel', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      motionPreference.removeEventListener('change', onMotionPreferenceChange)
      if (buffer) gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
