'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './RotatingSlogan.module.css'

const slogans = [
  { lang: 'ru', text: 'За пределами привычного.' },
  { lang: 'en', text: 'Design beyond the expected.' },
  { lang: 'ja', text: '常識の、その先へ。' },
  { lang: 'zh', text: '让创意成为现实。' },
  { lang: 'ko', text: '아이디어를 현실로.' },
  { lang: 'fr', text: 'Le design fait la différence.' },
  { lang: 'de', text: 'Ideen werden Wirklichkeit.' },
  { lang: 'es', text: 'Ideas que cobran vida.' },
  { lang: 'ru', text: 'От идеи к сильному результату.' },
]

export function RotatingSlogan() {
  const [index, setIndex] = useState(0)
  const [distorting, setDistorting] = useState(false)
  const hostRef = useRef<HTMLSpanElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null)
  const filterId = `slogan-distortion-${useId().replace(/:/g, '')}`
  useEffect(() => {
    let frame = 0
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = window.setInterval(() => {
      const host = hostRef.current
      if (
        document.hidden ||
        !host ||
        !host.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      )
        return
      if (media.matches) {
        setIndex((current) => (current + 1) % slogans.length)
        return
      }
      setDistorting(true)
      const start = performance.now()
      let swapped = false
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 800)
        if (!swapped && progress >= 0.45) {
          swapped = true
          setIndex((current) => (current + 1) % slogans.length)
        }
        displacementRef.current?.setAttribute('scale', String(Math.sin(progress * Math.PI) * 22))
        if (progress < 1 && !media.matches && !document.hidden) frame = requestAnimationFrame(tick)
        else {
          displacementRef.current?.setAttribute('scale', '0')
          setDistorting(false)
        }
      }
      frame = requestAnimationFrame(tick)
    }, 5000)
    return () => {
      window.clearInterval(timer)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <span
      ref={hostRef}
      className={styles.slogan}
      aria-live="off"
      data-rotating-slogan
      data-distorting={distorting}
    >
      <svg className={styles.filter} aria-hidden="true" focusable="false">
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-60%"
            width="140%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.028 0.18"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {slogans.map((slogan, position) => (
        <span
          key={position}
          lang={slogan.lang}
          data-active={position === index}
          aria-hidden={position !== index}
          style={distorting && position === index ? { filter: `url(#${filterId})` } : undefined}
        >
          {slogan.text}
        </span>
      ))}
    </span>
  )
}
