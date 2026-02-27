import { toDate } from './utils'

/**
 * Returns the start of the given unit for a date.
 *
 * @example
 * startOf(new Date(), 'month') // first day of current month at midnight
 */
export function startOf(
  date: Date | number | string,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second',
): Date {
  const d = toDate(date)
  switch (unit) {
    case 'year':   return new Date(d.getFullYear(), 0, 1)
    case 'month':  return new Date(d.getFullYear(), d.getMonth(), 1)
    case 'week': {
      const day = d.getDay()
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
    }
    case 'day':    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    case 'hour':   return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours())
    case 'minute': return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
    case 'second': return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds())
  }
}

/**
 * Returns the end of the given unit for a date (last ms).
 *
 * @example
 * endOf(new Date(), 'day') // today 23:59:59.999
 */
export function endOf(
  date: Date | number | string,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second',
): Date {
  const d = toDate(date)
  switch (unit) {
    case 'year':   return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
    case 'month':  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    case 'week': {
      const day = d.getDay()
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 6, 23, 59, 59, 999)
    }
    case 'day':    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    case 'hour':   return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 59, 59, 999)
    case 'minute': return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 59, 999)
    case 'second': return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), 999)
  }
}

/**
 * Add a specific number of time units to a date.
 *
 * @example
 * add(new Date(), 3, 'days')  // 3 days from now
 * add(new Date(), -1, 'months') // 1 month ago
 */
export function add(
  date: Date | number | string,
  amount: number,
  unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds',
): Date {
  const d = toDate(date)
  switch (unit) {
    case 'years': {
      const r = new Date(d)
      r.setFullYear(r.getFullYear() + amount)
      return r
    }
    case 'months': {
      const r = new Date(d)
      r.setMonth(r.getMonth() + amount)
      return r
    }
    case 'weeks':        return new Date(d.getTime() + amount * 604_800_000)
    case 'days':         return new Date(d.getTime() + amount * 86_400_000)
    case 'hours':        return new Date(d.getTime() + amount * 3_600_000)
    case 'minutes':      return new Date(d.getTime() + amount * 60_000)
    case 'seconds':      return new Date(d.getTime() + amount * 1_000)
    case 'milliseconds': return new Date(d.getTime() + amount)
  }
}

/**
 * Subtract a specific number of time units from a date.
 */
export function subtract(
  date: Date | number | string,
  amount: number,
  unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds',
): Date {
  return add(date, -amount, unit)
}

/**
 * Return true if `dateA` is before `dateB`.
 */
export function isBefore(dateA: Date | number | string, dateB: Date | number | string): boolean {
  return toDate(dateA).getTime() < toDate(dateB).getTime()
}

/**
 * Return true if `dateA` is after `dateB`.
 */
export function isAfter(dateA: Date | number | string, dateB: Date | number | string): boolean {
  return toDate(dateA).getTime() > toDate(dateB).getTime()
}

/**
 * Return true if two dates represent the same calendar day.
 */
export function isSameDay(dateA: Date | number | string, dateB: Date | number | string): boolean {
  const a = toDate(dateA)
  const b = toDate(dateB)
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

/**
 * Return true if the year of the given date is a leap year.
 */
export function isLeapYear(date: Date | number | string): boolean {
  const year = toDate(date).getFullYear()
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Return the number of days in the month of the given date.
 */
export function daysInMonth(date: Date | number | string): number {
  const d = toDate(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/**
 * Return true if `date` is today.
 */
export function isToday(date: Date | number | string): boolean {
  return isSameDay(date, new Date())
}

/**
 * Return true if `date` falls on a weekend (Saturday or Sunday).
 */
export function isWeekend(date: Date | number | string): boolean {
  const day = toDate(date).getDay()
  return day === 0 || day === 6
}

/**
 * Return the Unix timestamp in seconds.
 */
export function unix(date: Date | number | string): number {
  return Math.floor(toDate(date).getTime() / 1000)
}

/**
 * Create a Date from a Unix timestamp (seconds).
 */
export function fromUnix(ts: number): Date {
  return new Date(ts * 1000)
}

/**
 * Clamp a date between min and max.
 */
export function clampDate(
  date: Date | number | string,
  min: Date | number | string,
  max: Date | number | string,
): Date {
  const t = toDate(date).getTime()
  const tMin = toDate(min).getTime()
  const tMax = toDate(max).getTime()
  return new Date(Math.min(Math.max(t, tMin), tMax))
}
