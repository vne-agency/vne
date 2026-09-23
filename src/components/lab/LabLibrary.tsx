'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { labTools } from '@/lib/lab/catalog'
import { LabHeader } from './LabHeader'
import styles from './LabLibrary.module.css'

export function LabLibrary() {
  const { language } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)

  return (
    <div className={styles.library}>
      <LabHeader />
      <main id="lab-content" data-language-particle-text>
        <section className={styles.intro} aria-labelledby="lab-title">
          <div className={styles.introSide}>
            <span>VNE / LAB</span>
            <span>
              {copy('Инструменты для визуальных экспериментов', 'Tools for visual experiments')}
            </span>
          </div>
          <div className={styles.introMain}>
            <h1 id="lab-title">{copy('Форма — это материал.', 'Form is a material.')}</h1>
            <p>
              {copy(
                'Здесь можно взять своё изображение, изменить его характер и сразу унести результат в проект.',
                'Bring your own image, change its character, and take the result straight into your project.',
              )}
            </p>
          </div>
          <span className={styles.introIndex} aria-hidden="true">
            / 01
          </span>
        </section>

        <section className={styles.tools} aria-labelledby="tools-title">
          <div className={styles.sectionHeading}>
            <h2 id="tools-title">{copy('Библиотека инструментов', 'Tool library')}</h2>
            <span>
              {String(labTools.length).padStart(2, '0')} {copy('доступен', 'available')}
            </span>
          </div>
          {labTools.map((tool) => (
            <article className={styles.tool} key={tool.id}>
              <div className={styles.toolInfo}>
                <div className={styles.toolMeta}>
                  <span>
                    {tool.number} / {copy('инструмент', 'tool')}
                  </span>
                  <span className={styles.available}>
                    <span aria-hidden="true" />
                    {copy('Доступен', 'Available')}
                  </span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description[language]}</p>
                <div className={styles.toolBottom}>
                  <span className={styles.formats}>
                    {tool.formats.join(' + ')} <span aria-hidden="true">→</span> PNG
                  </span>
                  <Link href={tool.href} className={styles.openTool}>
                    {copy('Открыть инструмент', 'Open the tool')} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
              <div className={styles.toolVisual} aria-hidden="true">
                <div className={styles.visualTop}>
                  <span>INPUT / IMAGE</span>
                  <span>OUTPUT / FORM</span>
                </div>
                <div className={styles.visualGrid}>
                  <div className={styles.glyphPlane}>
                    <span className={styles.glyphMark}>@</span>
                    <span className={styles.visualLabel}>ASCII</span>
                  </div>
                  <div className={styles.ditherPlane}>
                    <span className={styles.ditherMark} />
                    <span className={styles.visualLabel}>DITHER</span>
                  </div>
                </div>
                <p>{copy('Две фактуры. Одно изображение.', 'Two textures. One image.')}</p>
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.note} aria-label={copy('О лаборатории', 'About the lab')}>
          <div>
            <span className={styles.noteLabel}>LOCAL / IN BROWSER</span>
            <p>
              {copy(
                'Ваш файл обрабатывается в браузере. Он не отправляется на сервер.',
                'Your file is processed in the browser. It is not sent to a server.',
              )}
            </p>
          </div>
          <div>
            <span className={styles.noteLabel}>EXPERIMENT / ORBIT</span>
            <p>
              {copy(
                'Посмотреть предыдущий визуальный эксперимент лаборатории.',
                'Explore an earlier visual experiment from the lab.',
              )}
            </p>
            <Link href="/lab/orbit" className={styles.noteLink}>
              <span className={styles.linkLabel}>{copy('Открыть Orbit', 'Open Orbit')}</span>
              <span className={styles.linkArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </aside>
      </main>
      <footer className={styles.footer}>
        <span>ВНЕ.lab</span>
        <span data-language-particle-text>
          {copy('Исследуем форму через действие.', 'Exploring form through making.')}
        </span>
      </footer>
    </div>
  )
}
