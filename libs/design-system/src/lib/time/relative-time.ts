const MINUTE = 60_000
const HOUR = 60 * MINUTE

interface Formats {
  readonly relative: Intl.RelativeTimeFormat
  readonly weekday: Intl.DateTimeFormat
  readonly dayMonth: Intl.DateTimeFormat
  readonly dayMonthYear: Intl.DateTimeFormat
}

// Building an Intl formatter is costly next to formatting with it.
const formats = new Map<string, Formats>()

const formatsOf = (locale: string): Formats => {
  let found = formats.get(locale)
  if (!found) {
    found = {
      relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      dayMonth: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }),
      dayMonthYear: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
    }
    formats.set(locale, found)
  }
  return found
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** Calendar days, not periods of 24 h: 23:50 is « hier » at 00:10. */
const daysBetween = (from: Date, to: Date) => Math.round((startOfDay(to) - startOfDay(from)) / (24 * HOUR))

/**
 * When something happened, in the language of `locale`, through the Intl APIs of the browser. In
 * French: « maintenant », « il y a 18 min », « il y a 2 h », « hier », « jeudi », « 12 septembre »,
 * « 3 décembre 2025 ». A date slightly ahead reads as now: the clocks of the server and of the device
 * never quite agree.
 */
export const relativeTime = (value: Date | string, locale: string, now = new Date()): string => {
  const date = typeof value === 'string' ? new Date(value) : value
  const { relative, weekday, dayMonth, dayMonthYear } = formatsOf(locale)
  const elapsed = Math.max(0, now.getTime() - date.getTime())
  const days = daysBetween(date, now)

  if (elapsed < MINUTE) return relative.format(0, 'second')
  if (days <= 0) {
    return elapsed < HOUR
      ? relative.format(-Math.floor(elapsed / MINUTE), 'minute')
      : relative.format(-Math.floor(elapsed / HOUR), 'hour')
  }
  if (days === 1) return relative.format(-1, 'day')
  if (days < 7) return weekday.format(date)
  return date.getFullYear() === now.getFullYear() ? dayMonth.format(date) : dayMonthYear.format(date)
}
