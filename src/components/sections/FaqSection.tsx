import { FaqItem } from './FaqItem'
import { faqQuestions } from './faq-data'
import styles from './FaqSection.module.css'

export function FaqSection() {
  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-title">
      <h2 className={styles.heading} id="faq-title">
        Частые вопросы
      </h2>
      <div className={styles.list}>
        {faqQuestions.map(({ question, answer, animation }) => (
          <FaqItem question={question} answer={answer} animation={animation} key={question} />
        ))}
      </div>
    </section>
  )
}
