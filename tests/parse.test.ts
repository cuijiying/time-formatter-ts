import { describe, it, expect } from 'vitest'
import { parse, isValidDateString } from '../src/parse'

describe('parse()', () => {
  it('ISO 8601 with Z', () => {
    const d = parse('2026-02-27T00:00:00.000Z')
    expect(d.toISOString()).toBe('2026-02-27T00:00:00.000Z')
  })

  it('ISO 8601 date only (treated as local)', () => {
    const d = parse('2026-02-27')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(27)
  })

  it('ISO with timezone offset +08:00', () => {
    const d = parse('2026-02-27T08:00:00+08:00')
    expect(d.toISOString()).toBe('2026-02-27T00:00:00.000Z')
  })

  it('US-style: Feb 27, 2026', () => {
    const d = parse('Feb 27, 2026')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(27)
  })

  it('US-style with time and AM/PM', () => {
    const d = parse('Feb 27, 2026 3:30 PM')
    expect(d.getHours()).toBe(15)
    expect(d.getMinutes()).toBe(30)
  })

  it('YYYY/MM/DD slash format', () => {
    const d = parse('2026/02/27')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(1)
  })

  it('MM/DD/YYYY', () => {
    const d = parse('02/27/2026')
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(27)
  })

  it('Unix seconds (10 digits)', () => {
    const ts = Math.floor(new Date('2026-02-27T00:00:00Z').getTime() / 1000)
    const d = parse(String(ts))
    expect(d.toISOString()).toBe('2026-02-27T00:00:00.000Z')
  })

  it('Unix ms (13 digits)', () => {
    const ts = new Date('2026-02-27T00:00:00Z').getTime()
    const d = parse(String(ts))
    expect(d.toISOString()).toBe('2026-02-27T00:00:00.000Z')
  })

  it('throws on invalid date', () => {
    expect(() => parse('not-a-date')).toThrow(RangeError)
  })
})

describe('isValidDateString()', () => {
  it('returns true for valid string', () => {
    expect(isValidDateString('2026-02-27')).toBe(true)
  })

  it('returns false for invalid string', () => {
    expect(isValidDateString('hello world')).toBe(false)
  })
})
