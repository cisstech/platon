import { closingDue, openingDue, when } from './due'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 8, day, hours, minutes)
const LOCALE = 'fr-FR'
const words = (text: string) => text.replace(/\s/g, ' ')

describe('when', () => {
  it.each([
    [at(28, 23, 59), 'Ferme ce soir à 23 h 59'],
    [at(28, 16, 0), "Ferme aujourd'hui à 16 h"],
    [at(29, 9, 0), 'Ferme demain à 9 h'],
    [at(1 + 30, 10, 0), 'Ferme jeudi à 10 h'],
    [at(12 + 30, 8, 0), 'Ferme le lundi 12 octobre à 8 h'],
  ])('says %s as « %s »', (date, expected) => {
    expect(words(when('Ferme', date, NOW, LOCALE))).toBe(expected)
  })
})

describe('closingDue and openingDue', () => {
  it('warns of a closing within a day, and says an opening in information', () => {
    expect(closingDue(at(28, 23, 59), NOW, LOCALE)).toMatchObject({ dueTone: 'warning', dueIcon: 'schedule' })
    expect(closingDue(at(30, 23, 59), NOW, LOCALE).dueTone).toBe('neutral')
    expect(openingDue(at(30, 10, 0), NOW, LOCALE)).toMatchObject({ dueTone: 'info', dueIcon: 'event' })
  })
})
