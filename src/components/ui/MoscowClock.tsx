'use client'

import { useEffect, useState } from 'react'
import { useSiteLanguage } from './SiteLanguage'

const moscowFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function formatMoscowDateTime(date: Date, language: string) {
  const values = Object.fromEntries(
    moscowFormatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return `${values.day}.${values.month}.${values.year} ${values.hour}:${values.minute}:${values.second} ${language === 'en' ? 'MSK' : 'МСК'}`
}

export function MoscowClock() {
  const { language } = useSiteLanguage()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const update = () => setNow(new Date())
    const initialSync = window.setTimeout(update, 0)
    const interval = window.setInterval(update, 1000)

    return () => {
      window.clearTimeout(initialSync)
      window.clearInterval(interval)
    }
  }, [])

  return (
    <time dateTime={now.toISOString()} suppressHydrationWarning>
      {formatMoscowDateTime(now, language)}
    </time>
  )
}
