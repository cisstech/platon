import { relativeTime } from './relative-time'

// A Monday afternoon, in the local time of the machine running the tests.
const now = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8, year = 2026) =>
  new Date(year, month, day, hours, minutes)
// Intl joins a number and its unit with a no-break space, of a width that varies between engines.
const words = (text: string) => text.replace(/\s/g, ' ')

describe('relativeTime', () => {
  it.each([
    [at(28, 14, 30), 'maintenant'],
    [at(28, 14, 12), 'il y a 18 min'],
    [at(28, 12, 30), 'il y a 2 h'],
    [at(28, 8, 0), 'il y a 6 h'],
    [at(27, 23, 50), 'hier'],
    [at(24, 10, 0), 'jeudi'],
    [at(12, 10, 0), '12 septembre'],
    [at(3, 10, 0, 11, 2025), '3 décembre 2025'],
  ])('says %s as « %s » in French', (date, expected) => {
    expect(words(relativeTime(date, 'fr-FR', now))).toBe(expected)
  })

  it('reads a date slightly ahead of the device clock as now', () => {
    expect(relativeTime(at(28, 14, 31), 'fr-FR', now)).toBe('maintenant')
  })

  it('reads an ISO string as well', () => {
    expect(relativeTime(at(27, 17, 0).toISOString(), 'fr-FR', now)).toBe('hier')
  })

  it('speaks the language of the locale', () => {
    expect(relativeTime(at(27, 17, 0), 'en-US', now)).toBe('yesterday')
  })
})
