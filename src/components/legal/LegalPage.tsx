'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { LanguageSwitch, useSiteLanguage } from '@/components/ui/SiteLanguage'
import { RotatingSlogan } from '@/components/ui/RotatingSlogan'
import { LEGAL_EMAIL, LEGAL_HOME, legalDocuments, type LegalDocument } from '@/lib/legal/documents'
import { LegalLinks } from './LegalLinks'
import styles from './LegalPage.module.css'

function Paragraph({ text }: { text: string }) {
  return (
    <p data-legal-reveal>
      {text.split(/(https?:\/\/[^\s]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi).map((part, i) => {
        if (part === LEGAL_EMAIL)
          return (
            <a key={i} href={`mailto:${part}`}>
              {part}
            </a>
          )
        if (part.startsWith('https://')) {
          const url = part.replace(/\.$/, '')
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              {url}
              {part.endsWith('.') ? '.' : ''}
            </a>
          )
        }
        return part
      })}
    </p>
  )
}

export function LegalPage({ document: legal }: { document: LegalDocument }) {
  const { language } = useSiteLanguage()
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = host.current
    if (!root || !('IntersectionObserver' in window)) return
    const nodes = root.querySelectorAll<HTMLElement>('[data-legal-reveal], [data-legal-lines]')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    nodes.forEach((node) => {
      node.dataset.revealed = 'false'
    })
    // The lower 18% stays quiet: reveal only after content has entered the page.
    const createObserver = () =>
      new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              target.setAttribute('data-revealed', 'true')
              observer.unobserve(target)
            }
          })
        },
        { threshold: 0, rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.18)}px 0px` },
      )
    let observer = createObserver()
    const resize = () => {
      observer.disconnect()
      observer = createObserver()
      nodes.forEach((node) => {
        if (node.dataset.revealed !== 'true') observer.observe(node)
      })
    }
    const frame = requestAnimationFrame(() => {
      root.dataset.motionReady = 'true'
      nodes.forEach((node) => observer.observe(node))
    })
    // Keyboard navigation and in-page links must never land on invisible content.
    const revealTarget = (event?: FocusEvent) => {
      const target =
        event?.target instanceof Element
          ? event.target
          : document.getElementById(window.location.hash.slice(1))
      if (!target || !root.contains(target)) return
      nodes.forEach((node) => {
        if (node.contains(target) || target.contains(node)) {
          node.dataset.revealed = 'true'
          observer.unobserve(node)
        }
      })
    }
    const hashChange = () => revealTarget()
    const motionChange = () => {
      if (reduced.matches) {
        nodes.forEach((node) => {
          node.dataset.revealed = 'true'
        })
        observer.disconnect()
      }
    }
    revealTarget()
    root.addEventListener('focusin', revealTarget)
    window.addEventListener('hashchange', hashChange)
    window.addEventListener('resize', resize)
    reduced.addEventListener('change', motionChange)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      delete root.dataset.motionReady
      root.removeEventListener('focusin', revealTarget)
      window.removeEventListener('hashchange', hashChange)
      window.removeEventListener('resize', resize)
      reduced.removeEventListener('change', motionChange)
    }
  }, [legal.slug])

  return (
    <div className={styles.page} ref={host}>
      <a className={styles.skip} href="#legal-content">
        {language === 'ru' ? 'К документу' : 'Skip to document'}
      </a>
      <header className={styles.header}>
        <div className={styles.brandPanel}>
          <Link
            href={LEGAL_HOME}
            className={styles.brand}
            aria-label={language === 'ru' ? 'ВНЕ — на главную' : 'VNE — home'}
          >
            {language === 'ru' ? 'ВНЕ' : 'VNE'}
          </Link>
          <RotatingSlogan />
        </div>
        <div className={styles.headerActions}>
          <LanguageSwitch />
          <Link
            href={LEGAL_HOME}
            aria-label={language === 'ru' ? './home — на главную' : './home — back to home'}
          >
            <span>./home</span>
            <Image
              src="/assets/brand/vne-orbit-mark.svg"
              className={styles.homeLogo}
              width={24}
              height={28}
              alt=""
              aria-hidden="true"
            />
          </Link>
        </div>
      </header>
      <main className={styles.layout} id="legal-content">
        <aside className={styles.sidebar}>
          <span className={styles.meta} data-legal-reveal>
            {language === 'ru' ? 'ВНЕ / ПРАВОВАЯ ИНФОРМАЦИЯ' : 'VNE / LEGAL INFORMATION'}
          </span>
          <nav aria-label={language === 'ru' ? 'Документы' : 'Documents'}>
            {legalDocuments.map((doc) => (
              <Link
                href={`/${doc.slug}`}
                key={doc.slug}
                data-legal-lines
                aria-current={doc.slug === legal.slug ? 'page' : undefined}
              >
                <span className={styles.meta} data-legal-reveal>
                  {doc.number}
                </span>
                <span data-legal-reveal>{doc.title[language]}</span>
                <span aria-hidden="true" data-legal-reveal>
                  <ArrowIcon />
                </span>
              </Link>
            ))}
          </nav>
          <div className={styles.sidebarNote} data-legal-reveal>
            <span className={styles.meta}>
              {language === 'ru' ? 'ЕСТЬ ВОПРОСЫ?' : 'ANY QUESTIONS?'}
            </span>
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
          </div>
        </aside>
        <article className={styles.article} key={legal.slug}>
          <div className={styles.intro} data-legal-lines>
            <div className={styles.documentMeta} data-legal-reveal>
              <span>
                {language === 'ru' ? 'ДОКУМЕНТ' : 'DOCUMENT'} / {legal.number}
              </span>
              <span>{language === 'ru' ? 'РЕДАКЦИЯ' : 'VERSION'} / 12.09.2026</span>
            </div>
            <h1 data-legal-reveal>{legal.title[language]}</h1>
            <p className={styles.summary} data-legal-reveal>
              {legal.summary[language]}
            </p>
            <nav
              className={styles.contents}
              aria-label={language === 'ru' ? 'Содержание документа' : 'Document contents'}
            >
              {legal.sections.map((section, index) => (
                <a href={`#section-${index + 1}`} key={index} data-legal-lines>
                  <span className={styles.meta} data-legal-reveal>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span data-legal-reveal>{section.title[language]}</span>
                </a>
              ))}
            </nav>
          </div>
          {legal.sections.map((section, index) => (
            <section
              className={styles.section}
              id={`section-${index + 1}`}
              key={index}
              data-legal-section
              data-legal-lines
            >
              <span className={styles.sectionNumber} data-legal-reveal>
                {String(index + 1).padStart(2, '0')} /
              </span>
              <div>
                <h2 data-legal-reveal>{section.title[language]}</h2>
                {section.paragraphs.map((paragraph, i) => (
                  <Paragraph key={i} text={paragraph[language]} />
                ))}
              </div>
            </section>
          ))}
          <div className={styles.endnote} data-legal-lines>
            <span aria-hidden="true" data-legal-reveal>
              <ArrowIcon />
            </span>
            <a href={`mailto:${LEGAL_EMAIL}`} data-legal-reveal>
              {language === 'ru' ? 'Задать вопрос об этом документе' : 'Ask about this document'}
            </a>
          </div>
        </article>
      </main>
      <footer className={styles.footer}>
        <span className={styles.meta} data-legal-reveal>
          © 2026 {language === 'ru' ? 'ВНЕ / ДИЗАЙН-СТУДИЯ' : 'VNE / DESIGN STUDIO'}
        </span>
        <div data-legal-reveal>
          <LegalLinks />
        </div>
      </footer>
    </div>
  )
}
