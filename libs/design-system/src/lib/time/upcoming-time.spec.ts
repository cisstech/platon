import { calendarDay } from './relative-time'
import { clockTime, durationText, longDate, upcomingTime } from './upcoming-time'

// A Monday afternoon, in the local time of the machine running the tests.
const now = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8, year = 2026) =>
  new Date(year, month, day, hours, minutes)
// Intl joins a number and its unit with a no-break space, of a width that varies between engines.
const words = (text: string) => text.replace(/\s/g, ' ')

describe('upcomingTime', () => {
  it.each([
    [at(28, 16, 0), { day: 'today', date: '', time: '16 h', evening: false }],
    [at(28, 23, 59), { day: 'today', date: '', time: '23 h 59', evening: true }],
    [at(29, 8, 0), { day: 'tomorrow', date: '', time: '8 h', evening: false }],
    [at(1, 18, 0, 9), { day: 'week', date: 'jeudi', time: '18 h', evening: true }],
    [at(12, 8, 30, 9), { day: 'later', date: 'lundi 12 octobre', time: '8 h 30', evening: false }],
    [at(5, 10, 0, 0, 2027), { day: 'later', date: 'mardi 5 janvier 2027', time: '10 h', evening: false }],
  ])('says %s as its day and its time in French', (date, expected) => {
    const upcoming = upcomingTime(date, 'fr-FR', now)
    expect({ ...upcoming, time: words(upcoming.time) }).toEqual(expected)
  })

  it('reads a moment already past as today', () => {
    expect(upcomingTime(at(28, 9, 0), 'fr-FR', now).day).toBe('today')
  })

  it('reads an ISO string as well', () => {
    expect(upcomingTime(at(29, 8, 0).toISOString(), 'fr-FR', now).day).toBe('tomorrow')
  })
})

describe('clockTime', () => {
  it('writes the hour the French way, with its minutes only when there are some', () => {
    expect(words(clockTime(at(28, 18, 0), 'fr-FR'))).toBe('18 h')
    expect(words(clockTime(at(28, 8, 5), 'fr-FR'))).toBe('8 h 05')
  })

  it('keeps the clock of the locale elsewhere', () => {
    expect(words(clockTime(at(28, 18, 0), 'en-US'))).toBe('6:00 PM')
  })
})

describe('longDate', () => {
  it('says the day of the week and the date, with the year only when it is not this one', () => {
    expect(longDate(now, 'fr-FR', now)).toBe('lundi 28 septembre')
    expect(longDate(at(5, 10, 0, 0, 2027), 'fr-FR', now)).toBe('mardi 5 janvier 2027')
  })
})

describe('calendarDay', () => {
  it('says the date, with the year only when it is not this one', () => {
    expect(calendarDay(at(22, 10, 0), 'fr-FR', now)).toBe('22 septembre')
    expect(calendarDay(at(3, 10, 0, 11, 2025), 'fr-FR', now)).toBe('3 décembre 2025')
  })
})

describe('durationText', () => {
  it.each([
    [45 * 60, '45 min'],
    [90 * 60, '1 h 30 min'],
    [2 * 3600, '2 h'],
    [41 * 3600 + 20 * 60, '41 h'],
    [20, '0 min'],
  ])('says %i seconds as « %s »', (seconds, expected) => {
    expect(words(durationText(seconds, 'fr-FR'))).toBe(expected)
  })
})
