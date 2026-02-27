/**
 * Supported locale identifiers (BCP 47 language tag).
 */
export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | string

/**
 * Options for the `format` function.
 */
export interface FormatOptions {
  /**
   * Locale used for locale-aware tokens (e.g. month names).
   * @default 'en'
   */
  locale?: Locale
  /**
   * IANA time-zone name, e.g. 'Asia/Shanghai'.
   * When provided the date is shifted to that zone before formatting.
   */
  timezone?: string
  /**
   * Whether to pad single-digit values with a leading zero when using
   * non-padded tokens (H, m, s …).  Defaults to false.
   */
  pad?: boolean
}

/**
 * Options for the `fromNow` / `toNow` functions.
 */
export interface RelativeOptions {
  /** @default 'en' */
  locale?: Locale
  /**
   * Reference point in time. Defaults to `Date.now()`.
   */
  now?: Date | number
  /**
   * When true, the suffix/prefix ("ago" / "in") is omitted.
   * @default false
   */
  withoutSuffix?: boolean
}

/**
 * Options for the `formatDuration` function.
 */
export interface DurationOptions {
  /** @default 'en' */
  locale?: Locale
  /**
   * Largest unit to display.
   * @default 'years'
   */
  largest?: number
  /**
   * Separator between parts.
   * @default ' '
   */
  delimiter?: string
}

/**
 * A plain object representing a duration.
 */
export interface Duration {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
}

/**
 * Options for `parse`.
 */
export interface ParseOptions {
  /** Locale hint for month/day names. @default 'en' */
  locale?: Locale
  /** Reference year for two-digit years. @default current year */
  referenceYear?: number
}
