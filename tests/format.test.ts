import { describe, it, expect } from 'vitest'
import { format } from '../src/format'

const FIXED = new Date(2026, 1, 27, 14, 30, 5, 123) // 2026-02-27 14:30:05.123

describe('format()', () => {
  it('YYYY-MM-DD', () => {
    expect(format(FIXED, 'YYYY-MM-DD')).toBe('2026-02-27')
  })

  it('YY', () => {
    expect(format(FIXED, 'YY')).toBe('26')
  })

  it('HH:mm:ss', () => {
    expect(format(FIXED, 'HH:mm:ss')).toBe('14:30:05')
  })

  it('12-hour hh:mm A', () => {
    expect(format(FIXED, 'hh:mm A')).toBe('02:30 PM')
  })

  it('milliseconds SSS', () => {
    expect(format(FIXED, 'SSS')).toBe('123')
  })

  it('MMMM - full month name (en)', () => {
    expect(format(FIXED, 'MMMM')).toBe('February')
  })

  it('MMMM - full month name (zh-CN)', () => {
    expect(format(FIXED, 'MMMM', { locale: 'zh-CN' })).toBe('二月')
  })

  it('MMM - short month name (en)', () => {
    expect(format(FIXED, 'MMM')).toBe('Feb')
  })

  it('dddd - full weekday (en)', () => {
    // 2026-02-27 is a Friday
    expect(format(FIXED, 'dddd')).toBe('Friday')
  })

  it('ddd - short weekday (zh-CN)', () => {
    expect(format(FIXED, 'ddd', { locale: 'zh-CN' })).toBe('五')
  })

  it('escape sequences [...]', () => {
    expect(format(FIXED, '[Today is] YYYY-MM-DD')).toBe('Today is 2026-02-27')
  })

  it('Quarter Q', () => {
    expect(format(FIXED, 'Q')).toBe('1')
    expect(format(new Date(2026, 6, 1), 'Q')).toBe('3')
  })

  it('accepts number timestamp', () => {
    expect(format(FIXED.getTime(), 'YYYY')).toBe('2026')
  })

  it('accepts ISO string', () => {
    expect(format('2026-02-27T00:00:00.000Z', 'YYYY-MM-DD')).toMatch(/2026-02-\d{2}/)
  })

  it('ISO week WW', () => {
    // 2026-01-01 is in week 1
    expect(format(new Date(2026, 0, 1), 'WW')).toBe('01')
  })

  it('day of year DDD', () => {
    // Feb 27 = 31 (Jan) + 27 = day 58
    expect(format(FIXED, 'DDD')).toBe('058')
  })
})
