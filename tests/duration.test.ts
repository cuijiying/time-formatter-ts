import { describe, it, expect } from 'vitest'
import { formatDuration, formatMs, msToDuration, durationToMs } from '../src/duration'

describe('formatDuration()', () => {
  it('basic en', () => {
    expect(formatDuration({ hours: 2, minutes: 30 })).toBe('2 hours 30 minutes')
  })

  it('singular', () => {
    expect(formatDuration({ hours: 1, minutes: 1 })).toBe('1 hour 1 minute')
  })

  it('zh-CN locale', () => {
    expect(formatDuration({ days: 3, hours: 2 }, { locale: 'zh-CN' })).toBe('3 天 2 小时')
  })

  it('largest limit', () => {
    expect(formatDuration({ years: 1, months: 2, days: 3 }, { largest: 2 })).toBe('1 year 2 months')
  })

  it('custom delimiter', () => {
    expect(formatDuration({ hours: 1, minutes: 30 }, { delimiter: ', ' })).toBe('1 hour, 30 minutes')
  })

  it('empty duration returns 0 seconds', () => {
    expect(formatDuration({})).toBe('0 seconds')
  })
})

describe('formatMs()', () => {
  it('1 hour 1 minute 1 second', () => {
    expect(formatMs(3661000)).toBe('1 hour 1 minute 1 second')
  })

  it('largest: 2', () => {
    expect(formatMs(3661000, { largest: 2 })).toBe('1 hour 1 minute')
  })
})

describe('msToDuration()', () => {
  it('converts correctly', () => {
    const d = msToDuration(90061000)
    expect(d.days).toBe(1)
    expect(d.hours).toBe(1)
    expect(d.minutes).toBe(1)
    expect(d.seconds).toBe(1)
  })
})

describe('durationToMs()', () => {
  it('converts hours and minutes', () => {
    expect(durationToMs({ hours: 1, minutes: 30 })).toBe(5_400_000)
  })

  it('round-trips through msToDuration', () => {
    const ms = 3_661_000
    expect(durationToMs(msToDuration(ms))).toBe(ms)
  })
})
