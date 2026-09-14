import { describe, expect, it } from 'vitest'

import {
  formatRussianPhoneInput,
  normalizeRussianPhone,
} from '@/lib/format-russian-phone'

describe('Russian phone formatting', () => {
  it('formats a number entered with 8', () => {
    expect(formatRussianPhoneInput('8 919 123 45 67')).toBe('+7 (919) 123-45-67')
  })

  it('formats a number entered with +7 identically', () => {
    expect(formatRussianPhoneInput('+7 919 123 45 67')).toBe('+7 (919) 123-45-67')
  })

  it('supports progressive masked input', () => {
    expect(formatRussianPhoneInput('8 919')).toBe('+7 (919)')
    expect(formatRussianPhoneInput('919123')).toBe('+7 (919) 123')
  })

  it('normalizes only complete Russian numbers', () => {
    expect(normalizeRussianPhone('8 (919) 123-45-67')).toBe('+7 (919) 123-45-67')
    expect(normalizeRussianPhone('+7 919')).toBeNull()
  })
})
