import type { FormatOptions } from './types'
import {
  toDate,
  pad,
  getMonthShort,
  getMonthLong,
  getWeekdayShort,
  getWeekdayLong,
  isoWeek,
  dayOfYear,
} from './utils'

// ─── Token map ───────────────────────────────────────────────────────────────
//
// Tokens are processed longest-first to avoid partial matches.
//
// YYYY  – 4-digit year
// YY    – 2-digit year
// MMMM  – full month name
// MMM   – short month name
// MM    – 2-digit month (01-12)
// M     – month (1-12)
// DD    – 2-digit day of month (01-31)
// D     – day of month (1-31)
// dddd  – full weekday name
// ddd   – short weekday name
// dd    – 2-char weekday (locale)
// d     – weekday number (0=Sun)
// HH    – 24h hour 00-23
// H     – 24h hour 0-23
// hh    – 12h hour 01-12
// h     – 12h hour 1-12
// mm    – minutes 00-59
// m     – minutes 0-59
// ss    – seconds 00-59
// s     – seconds 0-59
// SSS   – milliseconds 000-999
// SS    – tens of ms 00-99
// S     – hundreds of ms 0-9
// A     – AM/PM
// a     – am/pm
// X     – Unix timestamp (seconds)
// x     – Unix timestamp (ms)
// WW    – ISO week 01-53
// W     – ISO week 1-53
// DDD   – day of year 001-366
// Q     – quarter (1-4)
// ZZ    – timezone offset +0800
// Z     – timezone offset +08:00

const TOKEN_REGEX = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|DDD|DD|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|SS|S|A|a|X|x|WW|W|Q|ZZ|Z/g

interface DateParts {
  year: number
  month: number   // 0-11
  date: number    // 1-31
  hour: number    // 0-23
  minute: number  // 0-59
  second: number  // 0-59
  ms: number      // 0-999
  day: number     // 0-6 (Sun=0)
  offset: number  // tz offset in minutes
}

function extractParts(d: Date, timezone?: string): DateParts {
  if (timezone) {
    try {
      // Use Intl to get locale parts for the requested zone
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]))
      const year = parseInt(parts['year']!)
      const month = parseInt(parts['month']!) - 1
      const date = parseInt(parts['date']!)
      let hour = parseInt(parts['hour']!)
      if (hour === 24) hour = 0
      const minute = parseInt(parts['minute']!)
      const second = parseInt(parts['second']!)
      // Reconstruct a local Date to calculate weekday / week etc.
      const shifted = new Date(year, month, date, hour, minute, second, d.getMilliseconds())
      // Offset: diff between UTC and target zone in minutes
      const utcMs = d.getTime()
      const localMs = Date.UTC(year, month, date, hour, minute, second, d.getMilliseconds())
      const offset = (localMs - utcMs) / 60_000
      return {
        year,
        month,
        date,
        hour,
        minute,
        second,
        ms: d.getMilliseconds(),
        day: shifted.getDay(),
        offset,
      }
    } catch {
      // Fallback: use local date parts
    }
  }
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    date: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    ms: d.getMilliseconds(),
    day: d.getDay(),
    offset: -d.getTimezoneOffset(),
  }
}

function tzString(offset: number, colon: boolean): string {
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const h = pad(Math.floor(abs / 60))
  const m = pad(abs % 60)
  return colon ? `${sign}${h}:${m}` : `${sign}${h}${m}`
}

function replaceToken(token: string, parts: DateParts, locale: string): string {
  const { year, month, date, hour, minute, second, ms, day, offset } = parts
  const h12 = hour % 12 === 0 ? 12 : hour % 12

  switch (token) {
    case 'YYYY': return String(year)
    case 'YY':   return String(year).slice(-2)
    case 'MMMM': return getMonthLong(month, locale)
    case 'MMM':  return getMonthShort(month, locale)
    case 'MM':   return pad(month + 1)
    case 'M':    return String(month + 1)
    case 'DD':   return pad(date)
    case 'D':    return String(date)
    case 'dddd': return getWeekdayLong(day, locale)
    case 'ddd':  return getWeekdayShort(day, locale)
    case 'dd':   return getWeekdayShort(day, locale).slice(0, 2)
    case 'd':    return String(day)
    case 'HH':   return pad(hour)
    case 'H':    return String(hour)
    case 'hh':   return pad(h12)
    case 'h':    return String(h12)
    case 'mm':   return pad(minute)
    case 'm':    return String(minute)
    case 'ss':   return pad(second)
    case 's':    return String(second)
    case 'SSS':  return pad(ms, 3)
    case 'SS':   return pad(Math.floor(ms / 10))
    case 'S':    return String(Math.floor(ms / 100))
    case 'A':    return hour < 12 ? 'AM' : 'PM'
    case 'a':    return hour < 12 ? 'am' : 'pm'
    case 'X':    return String(Math.floor(Date.now() / 1000))
    case 'x':    return String(Date.now())
    case 'WW':   {
      const tmp = new Date(year, month, date)
      return pad(isoWeek(tmp))
    }
    case 'W': {
      const tmp = new Date(year, month, date)
      return String(isoWeek(tmp))
    }
    case 'DDD': {
      const tmp = new Date(year, month, date)
      return pad(dayOfYear(tmp), 3)
    }
    case 'Q':   return String(Math.ceil((month + 1) / 3))
    case 'ZZ':  return tzString(offset, false)
    case 'Z':   return tzString(offset, true)
    default:    return token
  }
}

/**
 * Format a date using a template string.
 *
 * @example
 * format(new Date(), 'YYYY-MM-DD HH:mm:ss')          // '2026-02-27 14:30:00'
 * format(new Date(), 'dddd, MMMM D, YYYY', { locale: 'zh-CN' })
 * format(new Date(), 'YYYY/MM/DD', { timezone: 'Asia/Shanghai' })
 */
export function format(
  date: Date | number | string,
  template: string,
  options: FormatOptions = {},
): string {
  const d = toDate(date)
  const locale = options.locale ?? 'en'
  const parts = extractParts(d, options.timezone)

  return template.replace(TOKEN_REGEX, (match, escaped: string | undefined) => {
    // [...] — escaped literal
    if (escaped !== undefined) return escaped
    return replaceToken(match, parts, locale)
  })
}
