import { describe, it, expect } from 'vitest'
import {
  startOf, endOf, add, subtract, isBefore, isAfter,
  isSameDay, isLeapYear, daysInMonth, isWeekend, unix, fromUnix, clampDate,
} from '../src/calendar'

const D = new Date(2026, 1, 27, 14, 30, 5, 0) // 2026-02-27 14:30:05

describe('startOf()', () => {
  it('year', () => {
    const r = startOf(D, 'year')
    expect(r.getFullYear()).toBe(2026)
    expect(r.getMonth()).toBe(0)
    expect(r.getDate()).toBe(1)
  })

  it('month', () => {
    const r = startOf(D, 'month')
    expect(r.getDate()).toBe(1)
    expect(r.getHours()).toBe(0)
  })

  it('day', () => {
    const r = startOf(D, 'day')
    expect(r.getHours()).toBe(0)
    expect(r.getMinutes()).toBe(0)
  })
})

describe('endOf()', () => {
  it('day', () => {
    const r = endOf(D, 'day')
    expect(r.getHours()).toBe(23)
    expect(r.getMinutes()).toBe(59)
    expect(r.getSeconds()).toBe(59)
    expect(r.getMilliseconds()).toBe(999)
  })

  it('month', () => {
    const r = endOf(D, 'month')
    expect(r.getDate()).toBe(28) // Feb 2026 (not leap)
  })
})

describe('add()', () => {
  it('adds days', () => {
    const r = add(D, 3, 'days')
    expect(r.getDate()).toBe(2)  // Mar 2
    expect(r.getMonth()).toBe(2)
  })

  it('adds months', () => {
    const r = add(D, 1, 'months')
    expect(r.getMonth()).toBe(2) // March
  })

  it('adds years', () => {
    const r = add(D, 1, 'years')
    expect(r.getFullYear()).toBe(2027)
  })
})

describe('subtract()', () => {
  it('subtracts days', () => {
    const r = subtract(D, 1, 'days')
    expect(r.getDate()).toBe(26)
  })
})

describe('isBefore() / isAfter()', () => {
  it('isBefore', () => {
    expect(isBefore(new Date(2025, 0, 1), D)).toBe(true)
    expect(isBefore(D, new Date(2025, 0, 1))).toBe(false)
  })

  it('isAfter', () => {
    expect(isAfter(D, new Date(2025, 0, 1))).toBe(true)
  })
})

describe('isSameDay()', () => {
  it('same day', () => {
    expect(isSameDay(D, new Date(2026, 1, 27, 23, 59))).toBe(true)
  })

  it('different day', () => {
    expect(isSameDay(D, new Date(2026, 1, 28))).toBe(false)
  })
})

describe('isLeapYear()', () => {
  it('2024 is leap', () => expect(isLeapYear(new Date(2024, 0, 1))).toBe(true))
  it('2026 is not leap', () => expect(isLeapYear(D)).toBe(false))
  it('2000 is leap', () => expect(isLeapYear(new Date(2000, 0, 1))).toBe(true))
  it('1900 is not leap', () => expect(isLeapYear(new Date(1900, 0, 1))).toBe(false))
})

describe('daysInMonth()', () => {
  it('Feb 2026 = 28', () => expect(daysInMonth(D)).toBe(28))
  it('Feb 2024 = 29', () => expect(daysInMonth(new Date(2024, 1, 1))).toBe(29))
  it('Jan = 31', () => expect(daysInMonth(new Date(2026, 0, 1))).toBe(31))
})

describe('isWeekend()', () => {
  it('Saturday is weekend', () => expect(isWeekend(new Date(2026, 1, 28))).toBe(true))
  it('Sunday is weekend', () => expect(isWeekend(new Date(2026, 2, 1))).toBe(true))
  it('Friday is not weekend', () => expect(isWeekend(D)).toBe(false))
})

describe('unix() / fromUnix()', () => {
  it('round-trip', () => {
    const ts = unix(D)
    expect(typeof ts).toBe('number')
    expect(fromUnix(ts).getTime()).toBe(Math.floor(D.getTime() / 1000) * 1000)
  })
})

describe('clampDate()', () => {
  const min = new Date(2026, 0, 1)
  const max = new Date(2026, 11, 31)

  it('clamps below min', () => {
    const r = clampDate(new Date(2025, 0, 1), min, max)
    expect(r.getTime()).toBe(min.getTime())
  })

  it('clamps above max', () => {
    const r = clampDate(new Date(2027, 0, 1), min, max)
    expect(r.getTime()).toBe(max.getTime())
  })

  it('keeps value in range', () => {
    const r = clampDate(D, min, max)
    expect(r.getTime()).toBe(D.getTime())
  })
})
