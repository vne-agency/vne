import Image from 'next/image'

import InteractiveNebulaShader from '@/components/ui/InteractiveNebulaShader'
import { ParallaxMedia } from '@/components/ui/MotionPrimitives'

import styles from './ServicesSection.module.css'

const motionTags = ['video editing', 'motion design']
const designTags = ['promotion', 'ux/ui', 'web design', 'graphic design']

export function ServicesSection() {
  return (
    <section className={styles.section} id="directions" aria-labelledby="directions-title">
      <h2 id="directions-title" className="srOnly">
        Направления работы
      </h2>
      <div className={styles.grid}>
        <div className={`${styles.column} ${styles.motionColumn}`}>
          <div className={`${styles.tags} ${styles.motionTags}`}>
            {motionTags.map((tag) => (
              <span key={tag} className={`${styles.tag} ${styles.tagDark}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className={styles.cardReveal}>
            <article className={styles.card}>
              <ParallaxMedia className={styles.parallaxMedia} distance={34}>
                <InteractiveNebulaShader className={styles.nebulaShader} />
              </ParallaxMedia>
              <p className={`${styles.caption} ${styles.captionLight}`}>
                Visual magnetism. Your product in motion.
              </p>
            </article>
          </div>
        </div>

        <div className={`${styles.column} ${styles.designColumn}`}>
          <div className={`${styles.tags} ${styles.tagsEnd} ${styles.designTags}`}>
            {designTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className={styles.cardReveal}>
            <article className={styles.card}>
              <ParallaxMedia className={styles.parallaxMedia} distance={-30}>
                <Image
                  src="/assets/home/services-design.png"
                  alt="Стеклянная абстрактная конструкция для направления web design"
                  fill
                  sizes="(max-width: 800px) 100vw, 50vw"
                  className={`${styles.image} ${styles.rotatedImage}`}
                  priority
                />
              </ParallaxMedia>
              <p className={styles.caption}>Aesthetics and conversion</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
