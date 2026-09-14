'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Image from 'next/image'
import { useLenis } from 'lenis/react'
import { useCallback, useState } from 'react'

import { CaseModal, type CaseHomeSection } from '@/components/cases/CaseModal'
import { Stagger, StaggerItem } from '@/components/ui/MotionPrimitives'
import { Reveal } from '@/components/ui/Reveal'
import { fallbackCases, type CaseItem } from '@/lib/cases/catalog'

import styles from './CasesSection.module.css'

export type { CaseItem } from '@/lib/cases/catalog'

export function CasesSection({ items = fallbackCases }: { items?: readonly CaseItem[] }) {
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null)
  const lenis = useLenis()
  const closeCase = useCallback(
    (section?: CaseHomeSection) => {
      setActiveCase(null)
      if (!section) return
      requestAnimationFrame(() => {
        const target = document.getElementById(section)
        if (!target) return
        const scrollTarget =
          section === 'contact' ? (document.getElementById('contact-form') ?? target) : target
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
        if (lenis) {
          lenis.resize()
          lenis.scrollTo(scrollTarget, { offset: section === 'contact' ? -24 : 0 })
        } else {
          scrollTarget.scrollIntoView({
            block: 'start',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant'
              : 'smooth',
          })
        }
      })
    },
    [lenis],
  )

  return (
    <>
      <section className={styles.section} id="cases" aria-labelledby="cases-title">
        <Reveal className={styles.heading}>
          <h2 id="cases-title" className="srOnly">
            Наши кейсы
          </h2>
          <Image
            src="/assets/home/cases-title.svg"
            alt=""
            aria-hidden="true"
            width={845}
            height={95}
          />
        </Reveal>

        <div className={styles.list}>
          {items.map((item, index) => (
            <Stagger
              key={item.slug}
              className={styles.caseRow}
              delay={index * 0.03}
              stagger={0.1}
              amount={0.22}
            >
              <StaggerItem
                className={`${styles.media} ${item.number ? styles.mediaBlue : ''}`}
                x={index % 2 === 0 ? -24 : 24}
                y={0}
              >
                <button
                  type="button"
                  onClick={() => setActiveCase(item)}
                  className={styles.mediaButton}
                  aria-label={`Смотреть кейс ${item.projectName}`}
                  aria-haspopup="dialog"
                >
                  {item.number ? (
                    <>
                      <Image
                        src={item.preview}
                        alt=""
                        fill
                        sizes="(max-width: 800px) 100vw, 70vw"
                        className={styles.previewImage}
                      />
                      <Image
                        src={item.number}
                        alt=""
                        width={40}
                        height={179}
                        className={styles.number}
                      />
                    </>
                  ) : (
                    <div className={styles.imageMedia}>
                      <Image
                        src={item.image ?? item.preview}
                        alt={item.previewAlt ?? ''}
                        fill
                        sizes="(max-width: 800px) 100vw, 70vw"
                        className={styles.caseImage}
                      />
                    </div>
                  )}
                  <span className={styles.casePrompt} aria-hidden="true">
                    <span>смотреть кейс</span>
                    <span className={styles.promptArrow}>
                      <ArrowIcon />
                    </span>
                  </span>
                </button>
              </StaggerItem>

              <StaggerItem as="article" className={styles.details} x={24} y={0}>
                <div>
                  <p className={styles.projectName}>{item.projectName}</p>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
                <button
                  type="button"
                  onClick={() => setActiveCase(item)}
                  className={styles.learnMore}
                  aria-label={`Learn more — кейс ${item.projectName}`}
                  aria-haspopup="dialog"
                >
                  learn more
                </button>
              </StaggerItem>
            </Stagger>
          ))}
        </div>
      </section>
      {activeCase && <CaseModal initialItem={activeCase} items={items} onClose={closeCase} />}
    </>
  )
}
