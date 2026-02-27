# time-formatter

A lightweight, **zero-dependency** time formatting, parsing and manipulation library for JavaScript/TypeScript.

- ✅ **Format** dates with flexible token-based templates
- ✅ **Parse** date strings (ISO 8601, US-style, Unix timestamps, …)
- ✅ **Relative time** ("2 hours ago", "in 3 days")
- ✅ **Duration** formatting ("1 hour 30 minutes")
- ✅ **Calendar helpers** (add/subtract, startOf/endOf, isLeapYear, …)
- ✅ **Multi-locale** (en, zh-CN, zh-TW, ja, ko, fr, de, es, ru)
- ✅ **Timezone-aware** formatting via `Intl`
- ✅ Dual ESM + CJS package with full TypeScript types

---

## Installation

```bash
npm install time-formatter
# or
pnpm add time-formatter
# or
yarn add time-formatter
```

---

## Quick Start

```ts
import { format, fromNow, parse, formatDuration, add } from 'time-formatter'

// Format a date
format(new Date(), 'YYYY-MM-DD HH:mm:ss')
// → '2026-02-27 14:30:05'

// Relative time
fromNow(Date.now() - 5 * 60 * 1000)
// → '5 minutes ago'

// Parse a date string
parse('Feb 27, 2026 3:30 PM')
// → Date object

// Format a duration
formatDuration({ hours: 2, minutes: 30 })
// → '2 hours 30 minutes'

// Calendar ops
add(new Date(), 7, 'days')
// → Date 7 days from now
```

---

## API Reference

### `format(date, template, options?)`

Format a `Date`, timestamp or ISO string using a template.

```ts
format(new Date(), 'YYYY-MM-DD')                          // '2026-02-27'
format(new Date(), 'dddd, MMMM D, YYYY', { locale: 'zh-CN' }) // '星期五, 二月 27, 2026'
format(new Date(), 'HH:mm:ss [UTC]Z')                    // '14:30:05 UTC+08:00'
format(new Date(), 'YYYY/MM/DD', { timezone: 'Asia/Tokyo' })
```

#### Available Tokens

| Token  | Description                          | Example        |
|--------|--------------------------------------|----------------|
| `YYYY` | 4-digit year                         | `2026`         |
| `YY`   | 2-digit year                         | `26`           |
| `MMMM` | Full month name (locale)             | `February`     |
| `MMM`  | Short month name (locale)            | `Feb`          |
| `MM`   | Month, 2-digit                       | `02`           |
| `M`    | Month                                | `2`            |
| `DD`   | Day of month, 2-digit                | `27`           |
| `D`    | Day of month                         | `27`           |
| `DDD`  | Day of year, 3-digit                 | `058`          |
| `dddd` | Full weekday name (locale)           | `Friday`       |
| `ddd`  | Short weekday name (locale)          | `Fri`          |
| `d`    | Weekday number (0=Sun)               | `5`            |
| `HH`   | Hour (24h), 2-digit                  | `14`           |
| `H`    | Hour (24h)                           | `14`           |
| `hh`   | Hour (12h), 2-digit                  | `02`           |
| `h`    | Hour (12h)                           | `2`            |
| `mm`   | Minutes, 2-digit                     | `30`           |
| `m`    | Minutes                              | `30`           |
| `ss`   | Seconds, 2-digit                     | `05`           |
| `s`    | Seconds                              | `5`            |
| `SSS`  | Milliseconds, 3-digit                | `123`          |
| `A`    | AM/PM                                | `PM`           |
| `a`    | am/pm                                | `pm`           |
| `WW`   | ISO week number, 2-digit             | `09`           |
| `W`    | ISO week number                      | `9`            |
| `Q`    | Quarter (1-4)                        | `1`            |
| `Z`    | Timezone offset                      | `+08:00`       |
| `ZZ`   | Timezone offset (no colon)           | `+0800`        |
| `X`    | Unix timestamp (seconds)             | `1740650405`   |
| `x`    | Unix timestamp (ms)                  | `1740650405000`|

> Wrap literal text in `[...]` to escape tokens: `[Today is] YYYY-MM-DD` → `Today is 2026-02-27`

#### Options

| Option     | Type     | Default | Description                                |
|------------|----------|---------|--------------------------------------------|
| `locale`   | `string` | `'en'`  | Locale for month/weekday names             |
| `timezone` | `string` | –       | IANA time zone (e.g. `'Asia/Shanghai'`)    |

---

### `parse(value, options?)`

Parse a date string into a `Date`.

```ts
parse('2026-02-27T14:30:00.000Z')  // ISO 8601
parse('2026-02-27')                 // Date only
parse('Feb 27, 2026 3:30 PM')       // US-style
parse('02/27/2026')                 // MM/DD/YYYY
parse('1740650405')                 // Unix seconds (10 digits)
parse('1740650405000')              // Unix ms (13 digits)
```

### `isValidDateString(value)`

Returns `true` if the string can be parsed into a valid date.

---

### `fromNow(date, options?)` / `toNow(date, options?)`

Return a human-readable relative time string.

```ts
fromNow(Date.now() - 30_000)                      // 'a few seconds ago'
fromNow(Date.now() + 3600_000)                    // 'in an hour'
fromNow(someDate, { locale: 'zh-CN' })            // '5 分钟前'
fromNow(someDate, { withoutSuffix: true })        // '5 minutes'
```

### `diffIn(dateA, dateB, unit)`

Calculate the difference between two dates in the given unit.

```ts
diffIn(new Date(), someDate, 'days')   // → number (signed)
diffIn(a, b, 'months')
```

Units: `'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'`

---

### `formatDuration(duration, options?)`

Format a `Duration` object as a string.

```ts
formatDuration({ hours: 2, minutes: 30 })
// → '2 hours 30 minutes'

formatDuration({ days: 1, hours: 3 }, { locale: 'zh-CN' })
// → '1 天 3 小时'

formatDuration({ years: 1, months: 2, days: 3 }, { largest: 2 })
// → '1 year 2 months'

formatDuration({ hours: 1, minutes: 30 }, { delimiter: ', ' })
// → '1 hour, 30 minutes'
```

### `formatMs(ms, options?)`

Format a millisecond value as a duration string.

```ts
formatMs(3661000)              // '1 hour 1 minute 1 second'
formatMs(3661000, { largest: 2 }) // '1 hour 1 minute'
```

### `msToDuration(ms)` / `durationToMs(duration)`

Convert between milliseconds and `Duration` objects.

---

### Calendar Helpers

```ts
import { startOf, endOf, add, subtract, isBefore, isAfter,
         isSameDay, isLeapYear, daysInMonth, isToday, isWeekend,
         unix, fromUnix, clampDate } from 'time-formatter'

startOf(new Date(), 'month')       // first moment of the month
endOf(new Date(), 'day')           // 23:59:59.999 today
add(new Date(), 7, 'days')         // 7 days from now
subtract(new Date(), 1, 'months')  // 1 month ago
isBefore(a, b)                     // boolean
isAfter(a, b)                      // boolean
isSameDay(a, b)                    // boolean
isLeapYear(new Date(2024, 0, 1))   // true
daysInMonth(new Date())            // e.g. 28
isToday(new Date())                // true
isWeekend(new Date())              // boolean
unix(new Date())                   // seconds since epoch
fromUnix(1740650405)               // Date
clampDate(date, min, max)          // Date clamped to [min, max]
```

`startOf` / `endOf` units: `'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'`

`add` / `subtract` units: `'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'`

---

## Supported Locales

| Code    | Language           |
|---------|--------------------|
| `en`    | English (default)  |
| `zh-CN` | 简体中文            |
| `zh-TW` | 繁體中文            |
| `ja`    | 日本語              |
| `ko`    | 한국어              |
| `fr`    | Français           |
| `de`    | Deutsch            |
| `es`    | Español            |
| `ru`    | Русский            |

---

## Publishing to npm

1. Update `name` and `author` in `package.json`
2. Login: `npm login`
3. Publish: `npm publish --access public`

---

## Development

```bash
npm test              # run tests (vitest)
npm run test:watch    # watch mode
npm run build         # build ESM + CJS bundles
npm run typecheck     # type check without emitting
```

---

## License

MIT
