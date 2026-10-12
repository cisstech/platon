import { NO_BREAK_SPACE } from '../text/text'
import { daysBetween, formatsOf, toDate } from './calendar'

/** Where a coming moment falls: today, tomorrow, within the week, or later. */
export type UpcomingDay = 'today' | 'tomorrow' | 'week' | 'later'

/** A coming moment, in pieces a sentence puts together: « ce soir à 23 h 59 », « jeudi à 18 h ». */
export interface Upcoming {
  readonly day: UpcomingDay
  /** The weekday within the week (« jeudi »), the day later (« lundi 12 octobre »); empty today and tomorrow. */
  readonly date: string
  readonly time: string
  /** From 18 h: « ce soir » rather than « aujourd'hui ». */
  readonly evening: boolean
}

const EVENING = 18

/**
 * The time of a moment: « 18 h », « 8 h 05 » in French, as typography wants it; the clock of the
 * locale elsewhere (« 6:00 PM »).
 */
export const clockTime = (value: Date | string, locale: string): string => {
  const date = toDate(value)
  if (!locale.toLowerCase().startsWith('fr')) return formatsOf(locale).clock.format(date)
  const minutes = date.getMinutes()
  const hour = `${date.getHours()}${NO_BREAK_SPACE}h`
  return minutes ? `${hour}${NO_BREAK_SPACE}${String(minutes).padStart(2, '0')}` : hour
}

/**
 * When something will happen, in the language of `locale`. A moment already past reads as today:
 * what is still open closes at the latest now.
 */
export const upcomingTime = (value: Date | string, locale: string, now = new Date()): Upcoming => {
  const date = toDate(value)
  const { weekday } = formatsOf(locale)
  const days = Math.max(0, daysBetween(now, date))
  const time = clockTime(date, locale)
  const evening = date.getHours() >= EVENING

  if (days === 0) return { day: 'today', date: '', time, evening }
  if (days === 1) return { day: 'tomorrow', date: '', time, evening }
  if (days < 7) return { day: 'week', date: weekday.format(date), time, evening }
  return { day: 'later', date: longDate(date, locale, now), time, evening }
}

/** The day, as a page header says it: « lundi 28 septembre », with the year when it is not this one. */
export const longDate = (value: Date | string, locale: string, now = new Date()): string => {
  const date = toDate(value)
  const { weekdayDayMonth, weekdayDayMonthYear } = formatsOf(locale)
  return date.getFullYear() === now.getFullYear() ? weekdayDayMonth.format(date) : weekdayDayMonthYear.format(date)
}

/**
 * A duration given in seconds: minutes under an hour (« 45 min »), hours and minutes under ten hours
 * (« 1 h 30 min »), hours beyond (« 41 h »).
 */
export const durationText = (seconds: number, locale: string): string => {
  const { hours, minutes } = formatsOf(locale)
  const total = Math.floor(seconds / 60)
  const hourCount = Math.floor(total / 60)
  const minuteCount = total % 60
  if (!hourCount) return minutes.format(minuteCount)
  if (hourCount >= 10 || !minuteCount) return hours.format(hourCount)
  return `${hours.format(hourCount)} ${minutes.format(minuteCount)}`
}
