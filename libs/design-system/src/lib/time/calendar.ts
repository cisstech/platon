export const MINUTE = 60_000
export const HOUR = 60 * MINUTE

interface Formats {
  readonly relative: Intl.RelativeTimeFormat
  readonly weekday: Intl.DateTimeFormat
  readonly dayMonth: Intl.DateTimeFormat
  readonly dayMonthYear: Intl.DateTimeFormat
  readonly weekdayDayMonth: Intl.DateTimeFormat
  readonly weekdayDayMonthYear: Intl.DateTimeFormat
  readonly clock: Intl.DateTimeFormat
  readonly hours: Intl.NumberFormat
  readonly minutes: Intl.NumberFormat
}

// Building an Intl formatter is costly next to formatting with it.
const formats = new Map<string, Formats>()

/** The Intl formatters of a locale, built once. */
export const formatsOf = (locale: string): Formats => {
  let found = formats.get(locale)
  if (!found) {
    found = {
      relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      dayMonth: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }),
      dayMonthYear: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayDayMonth: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
      weekdayDayMonthYear: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      clock: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
      hours: new Intl.NumberFormat(locale, { style: 'unit', unit: 'hour', unitDisplay: 'short' }),
      minutes: new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' }),
    }
    formats.set(locale, found)
  }
  return found
}

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** Calendar days, not periods of 24 h: 23:50 is « hier » at 00:10. */
export const daysBetween = (from: Date, to: Date) => Math.round((startOfDay(to) - startOfDay(from)) / (24 * HOUR))

export const toDate = (value: Date | string) => (typeof value === 'string' ? new Date(value) : value)
