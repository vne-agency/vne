const RUSSIAN_PHONE_DIGITS = 11

function getNormalizedDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  const nationalDigits = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits
  return `7${nationalDigits}`.slice(0, RUSSIAN_PHONE_DIGITS)
}

export function formatRussianPhoneInput(value: string) {
  const digits = getNormalizedDigits(value)
  if (!digits) return ''

  const national = digits.slice(1)
  let formatted = '+7'

  if (national.length > 0) formatted += ` (${national.slice(0, 3)}`
  if (national.length >= 3) formatted += ')'
  if (national.length > 3) formatted += ` ${national.slice(3, 6)}`
  if (national.length > 6) formatted += `-${national.slice(6, 8)}`
  if (national.length > 8) formatted += `-${national.slice(8, 10)}`

  return formatted
}

export function normalizeRussianPhone(value: string) {
  const digits = getNormalizedDigits(value)
  if (digits.length !== RUSSIAN_PHONE_DIGITS) return null

  return formatRussianPhoneInput(digits)
}
