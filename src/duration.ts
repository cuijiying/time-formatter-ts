import type { Duration, DurationOptions, Locale } from './types'

// ─── Locale unit labels ───────────────────────────────────────────────────────

type UnitLabels = {
  year: [string, string]    // [singular, plural]
  month: [string, string]
  week: [string, string]
  day: [string, string]
  hour: [string, string]
  minute: [string, string]
  second: [string, string]
  millisecond: [string, string]
}

const UNIT_LABELS: Record<string, UnitLabels> = {
  en: {
    year: ['year', 'years'],
    month: ['month', 'months'],
    week: ['week', 'weeks'],
    day: ['day', 'days'],
    hour: ['hour', 'hours'],
    minute: ['minute', 'minutes'],
    second: ['second', 'seconds'],
    millisecond: ['millisecond', 'milliseconds'],
  },
  'zh-CN': {
    year: ['年', '年'],
    month: ['个月', '个月'],
    week: ['周', '周'],
    day: ['天', '天'],
    hour: ['小时', '小时'],
    minute: ['分钟', '分钟'],
    second: ['秒', '秒'],
    millisecond: ['毫秒', '毫秒'],
  },
  'zh-TW': {
    year: ['年', '年'],
    month: ['個月', '個月'],
    week: ['週', '週'],
    day: ['天', '天'],
    hour: ['小時', '小時'],
    minute: ['分鐘', '分鐘'],
    second: ['秒', '秒'],
    millisecond: ['毫秒', '毫秒'],
  },
  ja: {
    year: ['年', '年'],
    month: ['ヶ月', 'ヶ月'],
    week: ['週間', '週間'],
    day: ['日', '日'],
    hour: ['時間', '時間'],
    minute: ['分', '分'],
    second: ['秒', '秒'],
    millisecond: ['ミリ秒', 'ミリ秒'],
  },
  ko: {
    year: ['년', '년'],
    month: ['달', '달'],
    week: ['주', '주'],
    day: ['일', '일'],
    hour: ['시간', '시간'],
    minute: ['분', '분'],
    second: ['초', '초'],
    millisecond: ['밀리초', '밀리초'],
  },
  fr: {
    year: ['an', 'ans'],
    month: ['mois', 'mois'],
    week: ['semaine', 'semaines'],
    day: ['jour', 'jours'],
    hour: ['heure', 'heures'],
    minute: ['minute', 'minutes'],
    second: ['seconde', 'secondes'],
    millisecond: ['milliseconde', 'millisecondes'],
  },
  de: {
    year: ['Jahr', 'Jahre'],
    month: ['Monat', 'Monate'],
    week: ['Woche', 'Wochen'],
    day: ['Tag', 'Tage'],
    hour: ['Stunde', 'Stunden'],
    minute: ['Minute', 'Minuten'],
    second: ['Sekunde', 'Sekunden'],
    millisecond: ['Millisekunde', 'Millisekunden'],
  },
  es: {
    year: ['año', 'años'],
    month: ['mes', 'meses'],
    week: ['semana', 'semanas'],
    day: ['día', 'días'],
    hour: ['hora', 'horas'],
    minute: ['minuto', 'minutos'],
    second: ['segundo', 'segundos'],
    millisecond: ['milisegundo', 'milisegundos'],
  },
  ru: {
    year: ['год', 'лет'],
    month: ['месяц', 'месяцев'],
    week: ['неделя', 'недель'],
    day: ['день', 'дней'],
    hour: ['час', 'часов'],
    minute: ['минута', 'минут'],
    second: ['секунда', 'секунд'],
    millisecond: ['миллисекунда', 'миллисекунд'],
  },
}

function getLabels(locale: Locale): UnitLabels {
  return UNIT_LABELS[locale] ?? UNIT_LABELS[locale.split('-')[0]!] ?? UNIT_LABELS['en']!
}

function unitStr(value: number, labels: [string, string]): string {
  return `${value} ${value === 1 ? labels[0] : labels[1]}`
}

type UnitKey = keyof UnitLabels

// Maps UnitKey (singular) to Duration key (plural/singular as in type)
const UNIT_KEY_MAP: Record<UnitKey, keyof Duration> = {
  year: 'years',
  month: 'months',
  week: 'weeks',
  day: 'days',
  hour: 'hours',
  minute: 'minutes',
  second: 'seconds',
  millisecond: 'milliseconds',
}

const UNIT_ORDER: UnitKey[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond']

/**
 * Format a `Duration` object into a human-readable string.
 *
 * @example
 * formatDuration({ hours: 2, minutes: 30 })                   // '2 hours 30 minutes'
 * formatDuration({ days: 1, hours: 3 }, { locale: 'zh-CN' }) // '1 天 3 小时'
 * formatDuration({ years: 1, months: 2 }, { largest: 1 })    // '1 year'
 */
export function formatDuration(duration: Duration, options: DurationOptions = {}): string {
  const locale = options.locale ?? 'en'
  const largest = options.largest ?? UNIT_ORDER.length
  const delimiter = options.delimiter ?? ' '
  const labels = getLabels(locale)

  const parts: string[] = []

  for (const unit of UNIT_ORDER) {
    if (parts.length >= largest) break
    const durationKey = UNIT_KEY_MAP[unit]
    const value = duration[durationKey]
    if (value != null && value !== 0) {
      parts.push(unitStr(Math.abs(Math.round(value)), labels[unit]))
    }
  }

  return parts.length > 0 ? parts.join(delimiter) : unitStr(0, labels['second'])
}

/**
 * Convert milliseconds into a `Duration` object.
 *
 * @example
 * msToDuration(90061000) // { hours: 25, minutes: 1, seconds: 1 }
 */
export function msToDuration(ms: number): Duration {
  const abs = Math.abs(ms)
  const days = Math.floor(abs / 86_400_000)
  const hours = Math.floor((abs % 86_400_000) / 3_600_000)
  const minutes = Math.floor((abs % 3_600_000) / 60_000)
  const seconds = Math.floor((abs % 60_000) / 1_000)
  const milliseconds = abs % 1_000
  return { days, hours, minutes, seconds, milliseconds }
}

/**
 * Convert a `Duration` object to total milliseconds.
 *
 * @example
 * durationToMs({ hours: 1, minutes: 30 }) // 5400000
 */
export function durationToMs(duration: Duration): number {
  return (
    (duration.years ?? 0) * 365 * 86_400_000 +
    (duration.months ?? 0) * 30 * 86_400_000 +
    (duration.weeks ?? 0) * 7 * 86_400_000 +
    (duration.days ?? 0) * 86_400_000 +
    (duration.hours ?? 0) * 3_600_000 +
    (duration.minutes ?? 0) * 60_000 +
    (duration.seconds ?? 0) * 1_000 +
    (duration.milliseconds ?? 0)
  )
}

/**
 * Format a duration given in milliseconds directly.
 *
 * @example
 * formatMs(3661000)                      // '1 hour 1 minute 1 second'
 * formatMs(3661000, { largest: 2 })      // '1 hour 1 minute'
 */
export function formatMs(ms: number, options: DurationOptions = {}): string {
  return formatDuration(msToDuration(ms), options)
}
