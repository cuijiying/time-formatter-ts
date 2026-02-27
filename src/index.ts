/**
 * time-formatter
 * A lightweight, zero-dependency time formatting and manipulation library.
 *
 * @packageDocumentation
 */

// Core formatting
export { format } from './format'

// Parsing
export { parse, isValidDateString } from './parse'

// Relative time
export { fromNow, toNow, diffIn } from './relative'

// Duration
export { formatDuration, formatMs, msToDuration, durationToMs } from './duration'

// Calendar utilities
export {
  startOf,
  endOf,
  add,
  subtract,
  isBefore,
  isAfter,
  isSameDay,
  isLeapYear,
  daysInMonth,
  isToday,
  isWeekend,
  unix,
  fromUnix,
  clampDate,
} from './calendar'

// Types
export type {
  Locale,
  FormatOptions,
  RelativeOptions,
  DurationOptions,
  Duration,
  ParseOptions,
} from './types'

// Utility (re-export useful helpers)
export { toDate, isValidDate } from './utils'
