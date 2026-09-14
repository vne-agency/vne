'use client'

import { PlaybackIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import { useEffect, useId, useRef, useState } from 'react'

import styles from './AsciiOrbitMotion.module.css'

const duration = 12000
const tau = Math.PI * 2
const glyphs = '.:+*ox%#@'
const shades = ['#73766a', '#909386', '#afb1a3', '#cbcdc0', '#e0e1d5', '#f4f3ee']
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type Controls = {
  seek: (progress: number) => void
  pause: () => void
  toggle: () => void
  replay: () => void
}

function writeTimelineText(
  range: HTMLInputElement,
  output: HTMLOutputElement,
  progress: number,
  language: string,
) {
  const percent = Math.round(progress * 100)
  range.setAttribute('aria-valuetext', `${percent} ${language === 'en' ? 'percent' : 'процентов'}`)
  output.value = `${String(Math.floor((progress * duration) / 1000)).padStart(2, '0')} / 12 ${language === 'en' ? 'SEC' : 'СЕК'} · ${String(percent).padStart(3, '0')}%`
}

export function AsciiOrbitMotion() {
  const { t, language } = useSiteLanguage()

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLOutputElement>(null)
  const controlsRef = useRef<Controls | null>(null)
  const playbackRef = useRef({ progress: 0, playing: false, initialized: false })
  const [playing, setPlaying] = useState(false)
  const rangeId = useId()

  useEffect(() => {
    if (rangeRef.current && outputRef.current) {
      writeTimelineText(
        rangeRef.current,
        outputRef.current,
        Number(rangeRef.current.value) / 1000,
        language,
      )
    }
  }, [language])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const range = rangeRef.current
    const output = outputRef.current
    if (!host || !canvas || !range || !output) return
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const playback = playbackRef.current

    let width = 0
    let height = 0
    let columns = 0
    let rows = 0
    let cellX = 7
    let cellY = 10
    let depth = new Float32Array(0)
    let brightness = new Int8Array(0)
    let letters = new Uint8Array(0)
    let progress = playback.progress
    let frame = 0
    let resizeFrame = 0
    let lastTime = 0
    let lastOutput = -1
    let visible = false
    let disposed = false

    function writeProgress() {
      const value = Math.round(progress * 1000)
      if (value === lastOutput) return
      lastOutput = value
      range!.value = String(value)
      range!.style.setProperty('--orbit-progress', `${progress * 100}%`)
      writeTimelineText(range!, output!, progress, host!.dataset.language ?? 'ru')
    }

    function put(x: number, y: number, z: number, light: number, seed: number) {
      const col = Math.round(x / cellX)
      const row = Math.round(y / cellY)
      if (col < 0 || col >= columns || row < 0 || row >= rows) return
      const index = row * columns + col
      if (z < depth[index]) return
      depth[index] = z
      brightness[index] = clamp(Math.floor(light * shades.length), 0, shades.length - 1)
      letters[index] = clamp(Math.floor(light * 6 + seed * 3), 0, glyphs.length - 1)
    }

    function paint() {
      if (!width || !height || disposed) return
      const ctx = context!
      ctx.fillStyle = '#22231f'
      ctx.fillRect(0, 0, width, height)
      depth.fill(-Infinity)
      brightness.fill(-1)

      const phase = progress * tau
      // Leave space for the nearest orbit's perspective enlargement and labels.
      const scale = Math.min(width * 0.34, height * 0.29)
      const centerX = width / 2
      const centerY = height / 2

      // Each orbit has its own rotating 3D plane. Depth selects the frontmost
      // character in a cell, including where a ring passes behind the star.
      for (let ring = 0; ring < 5; ring++) {
        const radius = 1.15 + ring * 0.055
        const tilt = 0.55 + ring * 0.48 + Math.sin(phase + ring) * 0.22
        const turn = phase * (ring % 2 ? -1 : 1) + ring * 0.61
        const roll = -0.38 + ring * 0.48 + Math.sin(phase) * 0.14
        const cosTilt = Math.cos(tilt)
        const sinTilt = Math.sin(tilt)
        const cosTurn = Math.cos(turn)
        const sinTurn = Math.sin(turn)
        const cosRoll = Math.cos(roll)
        const sinRoll = Math.sin(roll)
        const samples = Math.ceil(scale * 5)

        for (let step = 0; step < samples; step++) {
          const angle = (step / samples) * tau
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const tiltedY = y * cosTilt
          const tiltedZ = y * sinTilt
          const turnedX = x * cosTurn + tiltedZ * sinTurn
          const z = -x * sinTurn + tiltedZ * cosTurn
          const rotatedX = turnedX * cosRoll - tiltedY * sinRoll
          const rotatedY = turnedX * sinRoll + tiltedY * cosRoll
          const perspective = 3.8 / (3.8 - z)
          const screenX = centerX + rotatedX * perspective * scale
          const screenY = centerY + rotatedY * perspective * scale
          const shimmer = Math.sin(angle * 9 - phase * 3 + ring) * 0.065
          const light = clamp(0.49 + z * 0.3 + shimmer, 0.16, 0.92)
          put(screenX, screenY, z, light, (Math.sin(angle * 17 + ring) + 1) / 2)

          // A moving bead makes the timeline's effect readable at every angle.
          const bead = Math.cos(angle - phase * (ring % 2 ? -2 : 2) - ring)
          if (bead > 0.9985) {
            put(screenX - cellX, screenY, z + 0.01, 0.94, 0.3)
            put(screenX + cellX, screenY, z + 0.01, 0.94, 0.3)
            put(screenX, screenY - cellY, z + 0.01, 0.8, 0.5)
            put(screenX, screenY + cellY, z + 0.01, 0.8, 0.5)
          }
        }
      }

      const starRadius = scale * (1.08 + Math.sin(phase * 2) * 0.035)
      const rotation = Math.sin(phase) * 0.13
      const cos = Math.cos(rotation)
      const sin = Math.sin(rotation)
      const firstCol = Math.max(0, Math.floor((centerX - starRadius) / cellX))
      const lastCol = Math.min(columns - 1, Math.ceil((centerX + starRadius) / cellX))
      const firstRow = Math.max(0, Math.floor((centerY - starRadius) / cellY))
      const lastRow = Math.min(rows - 1, Math.ceil((centerY + starRadius) / cellY))

      for (let row = firstRow; row <= lastRow; row++) {
        for (let col = firstCol; col <= lastCol; col++) {
          const px = (col * cellX - centerX) / starRadius
          const py = (row * cellY - centerY) / starRadius
          const x = px * cos - py * sin
          const y = px * sin + py * cos
          const surface = Math.abs(x) ** 0.58 + Math.abs(y) ** 0.58
          if (surface > 1) continue
          const z = 0.34 * (1 - surface) + 0.06
          const bevel = Math.sin((x - y) * 7 + phase) * 0.16
          const grain = (Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1
          const light = clamp(0.79 + bevel - surface * 0.17 + grain * 0.09, 0.28, 1)
          put(col * cellX, row * cellY, z, light, Math.abs(grain))
        }
      }

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let shade = 0; shade < shades.length; shade++) {
        ctx.fillStyle = shades[shade]
        for (let index = 0; index < brightness.length; index++) {
          if (brightness[index] !== shade) continue
          ctx.fillText(
            glyphs[letters[index]],
            (index % columns) * cellX,
            Math.floor(index / columns) * cellY,
          )
        }
      }
      writeProgress()
    }

    function schedule() {
      if (disposed || frame || !visible || document.hidden || !playback.playing) return
      frame = requestAnimationFrame(animate)
    }

    function animate(time: number) {
      frame = 0
      if (disposed || !visible || document.hidden || !playback.playing) return
      if (lastTime) progress = (progress + (time - lastTime) / duration) % 1
      lastTime = time
      playback.progress = progress
      paint()
      schedule()
    }

    function stopFrame() {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
    }

    function changePlaying(nextPlaying: boolean) {
      if (playback.playing !== nextPlaying) {
        playback.playing = nextPlaying
        setPlaying(nextPlaying)
      }
      stopFrame()
      schedule()
    }

    function resize() {
      resizeFrame = 0
      if (disposed) return
      const bounds = canvas!.getBoundingClientRect()
      width = Math.round(bounds.width)
      height = Math.round(bounds.height)
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      const fontSize = clamp(width / 90, 9, 11)
      cellX = fontSize * 0.72
      cellY = fontSize * 0.95
      columns = Math.ceil(width / cellX)
      rows = Math.ceil(height / cellY)
      depth = new Float32Array(columns * rows)
      brightness = new Int8Array(columns * rows)
      letters = new Uint8Array(columns * rows)
      context!.font = `${fontSize}px "Courier New", monospace`
      paint()
    }

    function visibilityChanged() {
      stopFrame()
      schedule()
    }

    function pause() {
      playback.initialized = true
      changePlaying(false)
    }

    function play(restart = false) {
      playback.initialized = true
      if (restart || progress >= 1) {
        progress = 0
        playback.progress = progress
        paint()
      }
      changePlaying(true)
    }

    function motionChanged() {
      if (media.matches) pause()
    }

    controlsRef.current = {
      seek(nextProgress) {
        pause()
        progress = clamp(nextProgress, 0, 1)
        playback.progress = progress
        paint()
      },
      pause,
      toggle() {
        if (playback.playing) pause()
        else play()
      },
      replay() {
        play(true)
      },
    }

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    })
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !playback.initialized) {
          playback.initialized = true
          if (!media.matches) play()
        }
        visibilityChanged()
      },
      { threshold: 0 },
    )
    resizeObserver.observe(canvas)
    intersectionObserver.observe(host)
    document.addEventListener('visibilitychange', visibilityChanged)
    media.addEventListener('change', motionChanged)
    resize()

    return () => {
      disposed = true
      stopFrame()
      cancelAnimationFrame(resizeFrame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', visibilityChanged)
      media.removeEventListener('change', motionChanged)
      controlsRef.current = null
    }
  }, [])

  return (
    <div className={styles.root} ref={hostRef} data-language={language}>
      <div className={styles.stage}>
        <div className={styles.coordinates} aria-hidden="true">
          <span>VNE / ORBITAL STUDY</span>
          <span>XYZ · 001</span>
        </div>
        <canvas
          className={styles.canvas}
          ref={canvasRef}
          role="img"
          aria-label={t(
            'Четырёхконечная звезда из символов в центре пяти объёмных вращающихся колец',
          )}
        />
        <span className={styles.stageNote} aria-hidden="true">
          {t('Форма следует за движением')}
        </span>
      </div>
      <div className={styles.controls}>
        <div className={styles.transport}>
          <button
            className={styles.controlButton}
            type="button"
            aria-label={t(playing ? 'Приостановить анимацию' : 'Воспроизвести анимацию')}
            title={t(playing ? 'Пауза' : 'Воспроизвести')}
            onClick={() => controlsRef.current?.toggle()}
          >
            <span aria-hidden="true">
              <PlaybackIcon playing={playing} />
            </span>
          </button>
          <button
            className={styles.controlButton}
            type="button"
            aria-label={t('Повторить анимацию с начала')}
            title={t('Повторить с начала')}
            onClick={() => controlsRef.current?.replay()}
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineHeading}>
            <label htmlFor={rangeId}>{t('Таймлайн')}</label>
            <output ref={outputRef} htmlFor={rangeId} aria-live="off">
              {t('00 / 12 СЕК · 000%')}
            </output>
          </div>
          <input
            className={styles.range}
            id={rangeId}
            ref={rangeRef}
            type="range"
            min="0"
            max="1000"
            step="1"
            defaultValue="0"
            aria-valuetext={t('0 процентов')}
            onChange={(event) => controlsRef.current?.seek(Number(event.target.value) / 1000)}
            onPointerDown={() => controlsRef.current?.pause()}
            onKeyDown={(event) => {
              if (
                [
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Home',
                  'End',
                  'PageUp',
                  'PageDown',
                ].includes(event.key)
              )
                controlsRef.current?.pause()
            }}
          />
        </div>
      </div>
    </div>
  )
}
