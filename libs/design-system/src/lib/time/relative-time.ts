import { HOUR, MINUTE, daysBetween, formatsOf, toDate } from './calendar'

/**
 * When something happened, in the language of `locale`, through the Intl APIs of the browser. In
 * French: « maintenant », « il y a 18 min », « il y a 2 h », « hier », « jeudi », « 12 septembre »,
 * « 3 décembre 2025 ». A date slightly ahead reads as now: the clocks of the server and of the device
 * never quite agree.
 */
export const relativeTime = (value: Date | string, locale: string, now = new Date()): string => {
  const date = toDate(value)
  const { relative, weekday } = formatsOf(locale)
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
  return calendarDay(date, locale, now)
}

/** A day of the calendar: « 22 septembre », with the year when it is not this one. */
export const calendarDay = (value: Date | string, locale: string, now = new Date()): string => {
  const date = toDate(value)
  const { dayMonth, dayMonthYear } = formatsOf(locale)
  return date.getFullYear() === now.getFullYear() ? dayMonth.format(date) : dayMonthYear.format(date)
}

/** A day of the calendar in a narrow column: « 27 sept. », with the year when it is not this one. */
export const shortCalendarDay = (value: Date | string, locale: string, now = new Date()): string => {
  const date = toDate(value)
  const { dayShortMonth, dayShortMonthYear } = formatsOf(locale)
  return date.getFullYear() === now.getFullYear() ? dayShortMonth.format(date) : dayShortMonthYear.format(date)
}

/** A day of the calendar with its year, whatever the year: « 25 septembre 2026 ». */
export const fullCalendarDay = (value: Date | string, locale: string): string =>
  formatsOf(locale).dayMonthYear.format(toDate(value))
