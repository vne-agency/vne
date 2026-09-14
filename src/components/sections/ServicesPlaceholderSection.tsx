'use client'

import dynamic from 'next/dynamic'
import { useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { serviceExperiences, type ServiceExperience } from './service-experience-data'
import styles from './ServicesPlaceholderSection.module.css'

const ServiceExperienceDialog = dynamic(() =>
  import('./ServiceExperienceDialog').then((module) => module.ServiceExperienceDialog),
)

export function ServicesPlaceholderSection() {
  const [selection, setService] = useState<ServiceExperience | null>(null)
  const service = serviceExperiences.find((entry) => entry.id === selection?.id)
  const lenis = useLenis()
  const reducedMotion = useReducedMotion()

  const closeExperience = (contact = false) => {
    setService(null)
    if (!contact) return
    // Wait for the dialog to restore page scrolling before moving to the form.
    requestAnimationFrame(() => {
      const target = document.getElementById('contact-form') ?? document.getElementById('contact')
      if (!target) return
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      if (lenis && !reducedMotion) {
        lenis.resize()
        lenis.scrollTo(target, { offset: -24, force: true })
      } else target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
    })
  }

  return (
    <section className={styles.section} id="services" aria-labelledby="services-title">
      <h2 className={styles.heading} id="services-title">
        Наши услуги
      </h2>
      <div className={styles.grid}>
        {serviceExperiences.map((entry, index) => (
          <article className={styles.card} key={entry.id} aria-labelledby={`service-${entry.id}`}>
            <span className={styles.number} aria-hidden="true">
              0{index + 1} /
            </span>
            <h3 className={styles.title} id={`service-${entry.id}`}>
              {entry.title}
            </h3>
            <button
              className={styles.more}
              type="button"
              aria-label={`Подробнее: ${entry.title}`}
              aria-haspopup="dialog"
              onClick={() => setService(entry)}
            >
              Подробнее
            </button>
          </article>
        ))}
      </div>
      {service && <ServiceExperienceDialog service={service} onClose={closeExperience} />}
    </section>
  )
}
