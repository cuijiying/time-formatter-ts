import type { ParseOptions } from './types'

// ─── Common ISO patterns ──────────────────────────────────────────────────────

// ISO 8601 full: 2026-02-27T14:30:00.000Z
const ISO_FULL = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(?:Z|([+-]\d{2}):?(\d{2}))?)?$/

// US-style: Feb 27, 2026 or February 27, 2026
const US_LONG = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?$/i

// DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD
const SLASH = /^(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?$/i

// Unix timestamp (number string)
const UNIX_S = /^\d{10}$/
const UNIX_MS = /^\d{13}$/

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8, sept: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
  // Chinese
  '一月': 0, '二月': 1, '三月': 2, '四月': 3, '五月': 4, '六月': 5,
  '七月': 6, '八月': 7, '九月': 8, '十月': 9, '十一月': 10, '十二月': 11,
}

function monthIndex(name: string): number {
  const idx = MONTH_MAP[name.toLowerCase()]
  if (idx === undefined) throw new RangeError(`Unknown month name: "${name}"`)
  return idx
}

function applyAmPm(hour: number, ampm: string | undefined): number {
  if (!ampm) return hour
  const upper = ampm.toUpperCase()
  if (upper === 'AM') return hour === 12 ? 0 : hour
  if (upper === 'PM') return hour === 12 ? 12 : hour + 12
  return hour
}

/**
 * Parse a date string into a `Date` object.
 *
 * Supports:
 * - ISO 8601 (with optional timezone offset)
 * - `YYYY-MM-DD`, `YYYY/MM/DD`
 * - `MM/DD/YYYY`, `DD-MM-YYYY`
 * - `Month DD, YYYY` (English month names)
 * - Unix timestamps (10-digit seconds, 13-digit ms)
 * - Native `Date` strings (fallback)
 *
 * @example
 * parse('2026-02-27')               // Date
 * parse('Feb 27, 2026 14:30')       // Date
 * parse('1740650000')               // Date (Unix seconds)
 */
export function parse(value: string, options: ParseOptions = {}): Date {
  const s = value.trim()

  // Unix timestamps
  if (UNIX_S.test(s)) return new Date(parseInt(s, 10) * 1000)
  if (UNIX_MS.test(s)) return new Date(parseInt(s, 10))

  // ISO 8601
  const iso = ISO_FULL.exec(s)
  if (iso) {
    const year = parseInt(iso[1]!)
    const month = parseInt(iso[2]!) - 1
    const day = parseInt(iso[3]!)
    const hour = iso[4] ? parseInt(iso[4]) : 0
    const min = iso[5] ? parseInt(iso[5]) : 0
    const sec = iso[6] ? parseInt(iso[6]) : 0
    const msStr = iso[7] ?? '0'
    const ms = parseInt(msStr.slice(0, 3).padEnd(3, '0'))
    // Timezone
    if (!iso[4] || s.endsWith('Z') || s.endsWith('z')) {
      return new Date(Date.UTC(year, month, day, hour, min, sec, ms))
    }
    if (iso[8] && iso[9]) {
      const offH = parseInt(iso[8])
      const offM = parseInt(iso[9])
      const offMs = (offH * 60 + (offH < 0 ? -offM : offM)) * 60_000
      return new Date(Date.UTC(year, month, day, hour, min, sec, ms) - offMs)
    }
    // No timezone → treat as local
    return new Date(year, month, day, hour, min, sec, ms)
  }

  // US-style: Feb 27, 2026
  const us = US_LONG.exec(s)
  if (us) {
    const month = monthIndex(us[1]!)
    const day = parseInt(us[2]!)
    const year = parseInt(us[3]!)
    const hour = applyAmPm(us[4] ? parseInt(us[4]) : 0, us[7])
    const min = us[5] ? parseInt(us[5]) : 0
    const sec = us[6] ? parseInt(us[6]) : 0
    return new Date(year, month, day, hour, min, sec)
  }

  // Slash / hyphen / dot separated
  const sl = SLASH.exec(s)
  if (sl) {
    const p1 = parseInt(sl[1]!)
    const p2 = parseInt(sl[2]!)
    const p3 = parseInt(sl[3]!)
    const hour = applyAmPm(sl[4] ? parseInt(sl[4]) : 0, sl[7])
    const min = sl[5] ? parseInt(sl[5]) : 0
    const sec = sl[6] ? parseInt(sl[6]) : 0

    let year: number, month: number, day: number
    if (p1 > 31) {
      // YYYY/MM/DD
      year = p1; month = p2 - 1; day = p3
    } else if (p3 > 31) {
      // MM/DD/YYYY or DD/MM/YYYY — assume MM/DD/YYYY (US) when p1 <= 12
      if (p1 <= 12) {
        month = p1 - 1; day = p2; year = p3
      } else {
        day = p1; month = p2 - 1; year = p3
      }
    } else {
      // All ambiguous; treat as YYYY/MM/DD
      year = p1; month = p2 - 1; day = p3
    }

    // Two-digit year expansion
    if (year < 100) {
      const ref = options.referenceYear ?? new Date().getFullYear()
      year += year <= ref % 100 ? Math.floor(ref / 100) * 100 : (Math.floor(ref / 100) - 1) * 100
    }
    return new Date(year, month, day, hour, min, sec)
  }

  // Native fallback
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d

  throw new RangeError(`Unable to parse date string: "${value}"`)
}

/**
 * Return `true` when the given string can be parsed into a valid date.
 */
export function isValidDateString(value: string, options?: ParseOptions): boolean {
  try {
    parse(value, options)
    return true
  } catch {
    return false
  }
}
