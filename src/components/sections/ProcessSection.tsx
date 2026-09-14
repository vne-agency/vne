import Image from 'next/image'

import { Stagger, StaggerItem } from '@/components/ui/MotionPrimitives'
import { NoiseBackground } from '@/components/ui/NoiseBackground'
import { Reveal } from '@/components/ui/Reveal'

import styles from './ProcessSection.module.css'

const stages = ['Аудит и бриф', 'Прототип и UX', 'Дизайн и верстка', 'Поддержка и рост']

export function ProcessSection() {
  return (
    <section className={styles.section} id="process" aria-labelledby="process-title">
      <Reveal className={styles.banner}>
        <NoiseBackground />
        <p>From concept to solid launch</p>
      </Reveal>

      <Reveal className={styles.heading}>
        <h2 id="process-title" className="srOnly">
          Этапы и поддержка
        </h2>
        <Image
          src="/assets/home/support-title.svg"
          alt=""
          aria-hidden="true"
          width={845}
          height={95}
        />
      </Reveal>

      <Reveal className={styles.intro} direction="right" distance={28}>
        <p>
          Прозрачный пайплайн: фиксируем сроки на старте, берем на себя всю техническую рутину и
          остаемся на связи после релиза.
        </p>
      </Reveal>

      <Stagger className={styles.content} stagger={0.12}>
        <StaggerItem className={styles.stages} x={24} y={0}>
          <h3>Этапы</h3>
          <Stagger as="ul" stagger={0.055} amount={0.4}>
            {stages.map((stage) => (
              <StaggerItem key={stage} as="li" y={9}>
                {stage}
              </StaggerItem>
            ))}
          </Stagger>
        </StaggerItem>
        <StaggerItem as="p" className={styles.description} x={24} y={0}>
          Постоянное сопровождение и развитие проекта. После запуска мы не оставляем вас один на
          один с сайтом. Контролируем стабильность работы, оперативно вносим правки, добавляем новые
          разделы и помогаем масштабировать функционал по мере роста бизнеса.
        </StaggerItem>
      </Stagger>
    </section>
  )
}
