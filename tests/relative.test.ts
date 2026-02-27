import { describe, it, expect } from 'vitest'
import { fromNow, diffIn } from '../src/relative'

const NOW = new Date('2026-02-27T12:00:00Z')

function ref(offsetSec: number) {
  return new Date(NOW.getTime() + offsetSec * 1000)
}

describe('fromNow()', () => {
  it('a few seconds ago', () => {
    const result = fromNow(ref(-10), { now: NOW, locale: 'en' })
    expect(result).toBe('a few seconds ago')
  })

  it('in a minute', () => {
    const result = fromNow(ref(60), { now: NOW, locale: 'en' })
    expect(result).toBe('in a minute')
  })

  it('5 minutes ago', () => {
    const result = fromNow(ref(-5 * 60), { now: NOW, locale: 'en' })
    expect(result).toBe('5 minutes ago')
  })

  it('in 2 hours', () => {
    const result = fromNow(ref(2 * 3600), { now: NOW, locale: 'en' })
    expect(result).toBe('in 2 hours')
  })

  it('3 days ago', () => {
    const result = fromNow(ref(-3 * 86400), { now: NOW, locale: 'en' })
    expect(result).toBe('3 days ago')
  })

  it('Chinese locale - 前', () => {
    const result = fromNow(ref(-5 * 60), { now: NOW, locale: 'zh-CN' })
    expect(result).toContain('前')
  })

  it('withoutSuffix', () => {
    const result = fromNow(ref(-5 * 60), { now: NOW, locale: 'en', withoutSuffix: true })
    expect(result).toBe('5 minutes')
  })
})

describe('diffIn()', () => {
  it('seconds', () => {
    const a = new Date('2026-02-27T12:00:10Z')
    const b = new Date('2026-02-27T12:00:00Z')
    expect(diffIn(a, b, 'seconds')).toBe(10)
  })

  it('days', () => {
    const a = new Date('2026-03-06T00:00:00Z')
    const b = new Date('2026-02-27T00:00:00Z')
    expect(diffIn(a, b, 'days')).toBe(7)
  })

  it('months', () => {
    const a = new Date('2026-05-01')
    const b = new Date('2026-02-01')
    expect(diffIn(a, b, 'months')).toBe(3)
  })
})
