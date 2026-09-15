'use client'

import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'

import Script from 'next/script'
import Link from 'next/link'
import { LEGAL_VERSION } from '@/lib/legal/documents'
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react'

import { type LeadFormState, submitLeadAction } from '@/features/leads/submit-lead-action'
import { formatRussianPhoneInput } from '@/lib/format-russian-phone'
import { pricingGroups, pricingOffers } from '@/lib/pricing/catalog'

import styles from './LeadForm.module.css'

const initialLeadFormState: LeadFormState = { status: 'idle', message: '' }

type TurnstileStatus = 'idle' | 'loading' | 'ready' | 'error'

type TurnstileWindow = Window & {
  turnstile?: { reset: () => void }
  vneTurnstileReady?: () => void
  vneTurnstileError?: () => boolean
  vneTurnstileExpired?: () => void
}

function formatPhone(event: ChangeEvent<HTMLInputElement>) {
  event.currentTarget.value = formatRussianPhoneInput(event.currentTarget.value)
}

export function LeadForm({
  variant = 'default',
  selectedService,
  onServiceChange,
  pagePath = '/',
}: {
  variant?: 'default' | 'orbit'
  selectedService?: string
  onServiceChange?: (service: string) => void
  pagePath?: '/' | '/pricing'
}) {
  const { t, language } = useSiteLanguage()

  const [state, action, pending] = useActionState(submitLeadAction, initialLeadFormState)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [turnstileRequested, setTurnstileRequested] = useState(false)
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>('idle')
  const nameError = state.fieldErrors?.name?.[0]
  const phoneError = state.fieldErrors?.phone?.[0]
  const messageError = state.fieldErrors?.message?.[0]
  const budgetError = state.fieldErrors?.budget?.[0]
  const serviceError = state.fieldErrors?.service?.[0]

  useEffect(() => {
    if (state.status !== 'success') return

    formRef.current?.reset()
    successRef.current?.focus({ preventScroll: true })
  }, [state.status])

  useEffect(() => {
    if (state.status !== 'error') return
    const invalid = formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
    invalid?.focus()
  }, [state])

  useEffect(() => {
    if (!turnstileSiteKey || turnstileRequested) return
    const form = formRef.current
    if (!form) return

    const supportsIntersectionObserver = typeof globalThis.IntersectionObserver === 'function'
    if (!supportsIntersectionObserver) {
      const fallbackTimer = window.setTimeout(() => {
        setTurnstileStatus('loading')
        setTurnstileRequested(true)
      }, 0)
      return () => window.clearTimeout(fallbackTimer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setTurnstileStatus('loading')
        setTurnstileRequested(true)
        observer.disconnect()
      },
      { rootMargin: '800px 0px' },
    )
    observer.observe(form)
    return () => observer.disconnect()
  }, [turnstileRequested, turnstileSiteKey])

  useEffect(() => {
    if (!turnstileRequested) return
    const challengeWindow = window as TurnstileWindow
    challengeWindow.vneTurnstileReady = () => setTurnstileStatus('ready')
    challengeWindow.vneTurnstileError = () => {
      setTurnstileStatus('error')
      return true
    }
    challengeWindow.vneTurnstileExpired = () => setTurnstileStatus('loading')

    return () => {
      delete challengeWindow.vneTurnstileReady
      delete challengeWindow.vneTurnstileError
      delete challengeWindow.vneTurnstileExpired
    }
  }, [turnstileRequested])

  useEffect(() => {
    if (state.status !== 'error' || !turnstileRequested) return
    const challengeWindow = window as TurnstileWindow
    if (!challengeWindow.turnstile) return
    const resetTimer = window.setTimeout(() => {
      setTurnstileStatus('loading')
      challengeWindow.turnstile?.reset()
    }, 0)
    return () => window.clearTimeout(resetTimer)
  }, [state.status, turnstileRequested])

  const requestTurnstile = () => {
    if (!turnstileSiteKey || turnstileRequested) return
    setTurnstileStatus('loading')
    setTurnstileRequested(true)
  }

  const turnstileMessage =
    turnstileStatus === 'error'
      ? language === 'ru'
        ? 'Не удалось загрузить защиту формы. Обновите страницу или напишите нам напрямую.'
        : 'Form protection could not load. Refresh the page or contact us directly.'
      : turnstileStatus === 'ready'
        ? language === 'ru'
          ? 'Защита формы готова.'
          : 'Form protection is ready.'
        : language === 'ru'
          ? 'Защита формы загрузится при заполнении.'
          : 'Form protection will load when you start filling in the form.'

  return (
    <form
      ref={formRef}
      action={action}
      className={`${styles.form} ${variant === 'orbit' ? styles.orbit : ''}`}
      id="contact-form"
      aria-busy={pending}
      data-status={state.status}
      onFocusCapture={requestTurnstile}
    >
      {state.status === 'success' ? (
        <div
          ref={successRef}
          className={styles.successPanel}
          role="status"
          aria-live="polite"
          tabIndex={-1}
        >
          <span className={styles.successIcon} aria-hidden="true" />
          <span className={styles.successCopy}>
            <strong>{t('Заявка отправлена')}</strong>
            <span>{t('Спасибо! Скоро свяжемся с вами.')}</span>
          </span>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label htmlFor="lead-name">{t('Как к вам обращаться')}</label>
            <input
              id="lead-name"
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              minLength={2}
              maxLength={120}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'lead-name-error' : undefined}
              required
            />
            {nameError ? (
              <span id="lead-name-error" className={styles.fieldError}>
                {t(nameError)}
              </span>
            ) : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="lead-phone">{t('Телефон')}</label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              enterKeyHint="done"
              placeholder="+7 (___) ___-__-__"
              pattern="\+7 \([0-9]{3}\) [0-9]{3}-[0-9]{2}-[0-9]{2}"
              title={t('Введите российский номер в формате +7 (999) 999-99-99')}
              maxLength={18}
              onChange={formatPhone}
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? 'lead-phone-error' : undefined}
              required
            />
            {phoneError ? (
              <span id="lead-phone-error" className={styles.fieldError}>
                {t(phoneError)}
              </span>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="lead-service">{t('Услуга — необязательно')}</label>
            <select
              id="lead-service"
              data-lenis-prevent
              name="service"
              value={selectedService}
              defaultValue={selectedService === undefined ? '' : undefined}
              onChange={
                onServiceChange ? (event) => onServiceChange(event.target.value) : undefined
              }
              aria-invalid={Boolean(serviceError)}
              aria-describedby={serviceError ? 'lead-service-error' : undefined}
            >
              <option value="">{t('Помогите выбрать формат')}</option>
              {pricingGroups.map((group) => (
                <optgroup key={group.id} label={group.name[language]}>
                  {pricingOffers
                    .filter((offer) => offer.category === group.id)
                    .map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name[language]}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {serviceError && (
              <span id="lead-service-error" className={styles.fieldError}>
                {t(serviceError)}
              </span>
            )}
          </div>
          <div className={`${styles.field} ${styles.wideField}`}>
            <label htmlFor="lead-message">{t('Что нужно сделать?')}</label>
            <textarea
              id="lead-message"
              name="message"
              rows={3}
              required
              minLength={5}
              maxLength={3000}
              placeholder={t(
                'Например: нужна страница для одной услуги. Тексты и фотографии уже есть.',
              )}
              aria-invalid={Boolean(messageError)}
              aria-describedby={messageError ? 'lead-message-error' : undefined}
            />
            {messageError && (
              <span id="lead-message-error" className={styles.fieldError}>
                {t(messageError)}
              </span>
            )}
          </div>
          <div className={`${styles.field} ${styles.wideField}`}>
            <label htmlFor="lead-budget">{t('Ориентир по бюджету — необязательно')}</label>
            <input
              id="lead-budget"
              name="budget"
              type="text"
              maxLength={120}
              placeholder={t('До 40 000 ₽ или «нужна помощь с оценкой»')}
              aria-invalid={Boolean(budgetError)}
              aria-describedby={`lead-budget-help${budgetError ? ' lead-budget-error' : ''}`}
            />
            <span id="lead-budget-help" className={styles.helper}>
              {t(
                'Общий бюджет на задачу. Для поддержки можно указать сумму в месяц. Это ориентир, не согласие на цену.',
              )}
            </span>
            {budgetError && (
              <span id="lead-budget-error" className={styles.fieldError}>
                {t(budgetError)}
              </span>
            )}
          </div>
          <input type="hidden" name="pagePath" value={pagePath} />
          <input type="hidden" name="consentVersion" value={LEGAL_VERSION} />

          {turnstileSiteKey ? (
            <div className={styles.turnstile}>
              {turnstileRequested ? (
                <>
                  <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    async
                    defer
                    onError={() => setTurnstileStatus('error')}
                  />
                  <div
                    className="cf-turnstile"
                    data-sitekey={turnstileSiteKey}
                    data-theme="light"
                    data-callback="vneTurnstileReady"
                    data-error-callback="vneTurnstileError"
                    data-expired-callback="vneTurnstileExpired"
                    data-timeout-callback="vneTurnstileError"
                    data-unsupported-callback="vneTurnstileError"
                    data-retry="auto"
                    data-retry-interval="8000"
                  />
                </>
              ) : null}
              <p
                id="lead-turnstile-status"
                className={styles.turnstileStatus}
                data-state={turnstileStatus}
                role={turnstileStatus === 'error' ? 'alert' : 'status'}
              >
                {turnstileMessage}
              </p>
            </div>
          ) : null}

          <div className={styles.consent}>
            <label className={styles.consentToggle} htmlFor="lead-consent">
              <input
                id="lead-consent"
                type="checkbox"
                name="consent"
                required
                aria-labelledby="lead-consent-label"
              />
            </label>
            <span id="lead-consent-label">
              <label htmlFor="lead-consent">{language === 'ru' ? 'Даю ' : 'I consent to '}</label>
              <Link href="/consent" target="_blank" rel="noopener noreferrer">
                {language === 'ru' ? 'согласие на обработку данных' : 'the processing of my data'}
              </Link>
              {language === 'ru' ? ' для ответа на обращение. ' : ' for a response to my inquiry. '}
              <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                {language === 'ru' ? 'Политика' : 'Privacy policy'}
              </Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={pending || Boolean(turnstileSiteKey && turnstileStatus !== 'ready')}
            aria-describedby={
              turnstileSiteKey && turnstileStatus !== 'ready'
                ? 'lead-turnstile-status'
                : undefined
            }
            className={variant === 'orbit' ? styles.orbitSubmit : undefined}
          >
            {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
            <span>{t(pending ? 'Отправляем…' : 'Отправить заявку')}</span>
            {variant === 'orbit' ? (
              <span className={styles.submitArrow} aria-hidden="true">
                <ArrowIcon />
              </span>
            ) : null}
          </button>

          {state.status === 'error' ? (
            <p className={styles.status} role="alert" data-status="error">
              {t(state.message)}
            </p>
          ) : null}
        </>
      )}
    </form>
  )
}
