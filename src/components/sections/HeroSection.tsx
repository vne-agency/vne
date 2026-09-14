import Image from 'next/image'

import styles from './HeroSection.module.css'

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.statement}>
        <div className={styles.titleWrap}>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleLine}>
              <span>Дизайн,</span>
            </span>{' '}
            <span className={styles.titleLine}>
              <span>работающий</span>
            </span>{' '}
            <span className={styles.titleLine}>
              <span>на ваш</span>
            </span>
          </h1>
          <span className={styles.script} role="img" aria-label="бизнес">
            <Image
              src="/assets/home/hero-script-business.svg"
              alt=""
              width={585}
              height={182}
              className={styles.scriptImage}
              priority
            />
          </span>
        </div>
        <div className={styles.description}>
          <p>
            Создаем визуальные решения, которые привлекают внимание, отстраивают от конкурентов и
            помогают продавать.
          </p>
        </div>
      </div>
    </section>
  )
}
