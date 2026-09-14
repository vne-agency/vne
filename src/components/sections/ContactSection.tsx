import Image from 'next/image'

import { MoscowClock } from '@/components/ui/MoscowClock'
import { Reveal } from '@/components/ui/Reveal'

import { LeadForm } from './LeadForm'
import styles from './ContactSection.module.css'

const contacts = [
  { label: 'telegram', icon: '/assets/home/icon-telegram.svg' },
  { label: 'whatsapp', icon: '/assets/home/icon-whatsapp.svg' },
] as const

export function ContactSection({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <section
      className={`${styles.section} ${fullWidth ? styles.fullWidth : ''}`}
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className={styles.frame}>
        <Reveal className={styles.date} direction="down" distance={18}>
          <MoscowClock />
        </Reveal>
        <Reveal className={styles.heading}>
          <h2 id="contact-title" className="srOnly">
            Свяжись с нами
          </h2>
          <Image
            src="/assets/home/contact-title.svg"
            alt=""
            aria-hidden="true"
            width={827}
            height={95}
          />
        </Reveal>

        <div className={styles.body}>
          <Reveal className={styles.visual} direction="right" distance={30}>
            <div className={styles.imageFrame}>
              <Image
                src="/assets/home/contact-image.png"
                alt="Абстрактная черно-белая бумажная композиция"
                fill
                sizes="(max-width: 800px) 100vw, 36vw"
                className={styles.contactImage}
              />
            </div>
          </Reveal>

          <div className={styles.content}>
            <div className={styles.copyGrid}>
              <Reveal className={styles.copyPrimary} direction="right" distance={24}>
                <p>
                  Обсудим ваш проект, зафиксируем цели и предложим сильное решение. Напишите нам
                  напрямую.
                </p>
              </Reveal>
              <Reveal className={styles.copySecondary} direction="left" distance={24} delay={0.08}>
                <p>Бесплатно проконсультируем и поможем выбрать вектор развития.</p>
              </Reveal>
            </div>

            <div className={styles.actions}>
              <Reveal className={styles.formReveal} direction="right" distance={24}>
                <LeadForm />
              </Reveal>
              <Reveal className={styles.contacts} direction="left" distance={24} delay={0.08}>
                <address className={styles.contactsInner}>
                  {contacts.map((contact) => (
                    <div key={contact.label} className={styles.contactRow}>
                      <span>{contact.label}</span>
                      <Image src={contact.icon} alt="" width={24} height={24} />
                    </div>
                  ))}
                  <a className={styles.contactRow} href="mailto:hello_elda@yandex.ru">
                    <span>hello_elda@yandex.ru</span>
                    <Image
                      src="/assets/home/icon-email.svg"
                      alt=""
                      width={20}
                      height={16}
                      className={styles.emailIcon}
                    />
                  </a>
                </address>
              </Reveal>
            </div>
          </div>
        </div>

        <Reveal className={styles.motto} direction="right" distance={16} delay={0.12}>
          <p>Structure. Order. Intent.</p>
        </Reveal>
      </div>
    </section>
  )
}
