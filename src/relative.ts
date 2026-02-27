import type { RelativeOptions, Locale } from './types'
import { toDate } from './utils'

// ─── Locale messages ──────────────────────────────────────────────────────────

type Messages = {
  future: (v: string) => string
  past: (v: string) => string
  s: string
  m: string
  mm: (n: number) => string
  h: string
  hh: (n: number) => string
  d: string
  dd: (n: number) => string
  M: string
  MM: (n: number) => string
  y: string
  yy: (n: number) => string
}

const MESSAGES: Record<string, Messages> = {
  en: {
    future: v => `in ${v}`,
    past: v => `${v} ago`,
    s: 'a few seconds',
    m: 'a minute',
    mm: n => `${n} minutes`,
    h: 'an hour',
    hh: n => `${n} hours`,
    d: 'a day',
    dd: n => `${n} days`,
    M: 'a month',
    MM: n => `${n} months`,
    y: 'a year',
    yy: n => `${n} years`,
  },
  'zh-CN': {
    future: v => `${v}后`,
    past: v => `${v}前`,
    s: '几秒',
    m: '1 分钟',
    mm: n => `${n} 分钟`,
    h: '1 小时',
    hh: n => `${n} 小时`,
    d: '1 天',
    dd: n => `${n} 天`,
    M: '1 个月',
    MM: n => `${n} 个月`,
    y: '1 年',
    yy: n => `${n} 年`,
  },
  'zh-TW': {
    future: v => `${v}後`,
    past: v => `${v}前`,
    s: '幾秒',
    m: '1 分鐘',
    mm: n => `${n} 分鐘`,
    h: '1 小時',
    hh: n => `${n} 小時`,
    d: '1 天',
    dd: n => `${n} 天`,
    M: '1 個月',
    MM: n => `${n} 個月`,
    y: '1 年',
    yy: n => `${n} 年`,
  },
  ja: {
    future: v => `${v}後`,
    past: v => `${v}前`,
    s: '数秒',
    m: '1 分',
    mm: n => `${n} 分`,
    h: '1 時間',
    hh: n => `${n} 時間`,
    d: '1 日',
    dd: n => `${n} 日`,
    M: '1 ヶ月',
    MM: n => `${n} ヶ月`,
    y: '1 年',
    yy: n => `${n} 年`,
  },
  ko: {
    future: v => `${v} 후`,
    past: v => `${v} 전`,
    s: '몇 초',
    m: '1분',
    mm: n => `${n}분`,
    h: '1시간',
    hh: n => `${n}시간`,
    d: '하루',
    dd: n => `${n}일`,
    M: '한 달',
    MM: n => `${n}달`,
    y: '일 년',
    yy: n => `${n}년`,
  },
  fr: {
    future: v => `dans ${v}`,
    past: v => `il y a ${v}`,
    s: 'quelques secondes',
    m: 'une minute',
    mm: n => `${n} minutes`,
    h: 'une heure',
    hh: n => `${n} heures`,
    d: 'un jour',
    dd: n => `${n} jours`,
    M: 'un mois',
    MM: n => `${n} mois`,
    y: 'un an',
    yy: n => `${n} ans`,
  },
  de: {
    future: v => `in ${v}`,
    past: v => `vor ${v}`,
    s: 'ein paar Sekunden',
    m: 'einer Minute',
    mm: n => `${n} Minuten`,
    h: 'einer Stunde',
    hh: n => `${n} Stunden`,
    d: 'einem Tag',
    dd: n => `${n} Tagen`,
    M: 'einem Monat',
    MM: n => `${n} Monaten`,
    y: 'einem Jahr',
    yy: n => `${n} Jahren`,
  },
  es: {
    future: v => `en ${v}`,
    past: v => `hace ${v}`,
    s: 'unos segundos',
    m: 'un minuto',
    mm: n => `${n} minutos`,
    h: 'una hora',
    hh: n => `${n} horas`,
    d: 'un día',
    dd: n => `${n} días`,
    M: 'un mes',
    MM: n => `${n} meses`,
    y: 'un año',
    yy: n => `${n} años`,
  },
  ru: {
    future: v => `через ${v}`,
    past: v => `${v} назад`,
    s: 'несколько секунд',
    m: 'минуту',
    mm: n => `${n} минут`,
    h: 'час',
    hh: n => `${n} часов`,
    d: 'день',
    dd: n => `${n} дней`,
    M: 'месяц',
    MM: n => `${n} месяцев`,
    y: 'год',
    yy: n => `${n} лет`,
  },
}

function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[locale.split('-')[0]!] ?? MESSAGES['en']!
}

function thresholds(diffSec: number, msg: Messages): string {
  const abs = Math.abs(diffSec)
  if (abs < 45)   return msg.s
  if (abs < 90)   return msg.m
  if (abs < 2700) return msg.mm(Math.round(abs / 60))   // < 45 min
  if (abs < 5400) return msg.h                           // < 90 min
  if (abs < 79200)  return msg.hh(Math.round(abs / 3600))  // < 22 h
  if (abs < 129600) return msg.d                         // < 36 h
  if (abs < 2160000) return msg.dd(Math.round(abs / 86400)) // < 25 d
  if (abs < 3888000) return msg.M                        // < 45 d
  if (abs < 31536000) return msg.MM(Math.round(abs / 2592000)) // < 365 d
  if (abs < 47304000) return msg.y                       // < 18 mo
  return msg.yy(Math.round(abs / 31536000))
}

/**
 * Return a human-readable relative time string ("2 hours ago", "in 3 days").
 *
 * @example
 * fromNow(Date.now() - 5 * 60 * 1000)          // 'in 5 minutes' (future if negative)
 * fromNow(someDate, { locale: 'zh-CN' })        // '5 分钟前'
 */
export function fromNow(
  date: Date | number | string,
  options: RelativeOptions = {},
): string {
  const d = toDate(date)
  const now = options.now != null ? toDate(options.now) : new Date()
  const locale = options.locale ?? 'en'
  const msg = getMessages(locale)
  const diffSec = (d.getTime() - now.getTime()) / 1000
  const label = thresholds(diffSec, msg)

  if (options.withoutSuffix) return label
  return diffSec >= 0 ? msg.future(label) : msg.past(label)
}

/**
 * Returns how long ago a date was ("3 days ago").
 * Sugar around `fromNow` with the reference point swapped.
 */
export function toNow(
  date: Date | number | string,
  options: RelativeOptions = {},
): string {
  return fromNow(date, options)
}

/**
 * Returns the difference between two dates as a Duration object.
 */
export function diffIn(
  dateA: Date | number | string,
  dateB: Date | number | string,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'seconds',
): number {
  const a = toDate(dateA)
  const b = toDate(dateB)
  const diffMs = a.getTime() - b.getTime()

  switch (unit) {
    case 'seconds': return Math.trunc(diffMs / 1_000)
    case 'minutes': return Math.trunc(diffMs / 60_000)
    case 'hours':   return Math.trunc(diffMs / 3_600_000)
    case 'days':    return Math.trunc(diffMs / 86_400_000)
    case 'weeks':   return Math.trunc(diffMs / 604_800_000)
    case 'months': {
      const months = (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
      return months
    }
    case 'years':   return a.getFullYear() - b.getFullYear()
    default:        return Math.trunc(diffMs / 1_000)
  }
}
