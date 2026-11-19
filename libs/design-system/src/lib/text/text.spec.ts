import { capitalize, withoutAccents } from './text'

describe('capitalize', () => {
  it('puts the first letter of a sentence upper case, by the rules of the locale', () => {
    expect(capitalize('lundi 28 septembre', 'fr-FR')).toBe('Lundi 28 septembre')
    expect(capitalize('istanbul', 'tr-TR')).toBe('İstanbul')
    expect(capitalize('', 'fr-FR')).toBe('')
  })
})

describe('withoutAccents', () => {
  it('drops the accents and keeps the letters', () => {
    expect(withoutAccents('Récursivité, à côté, Noël')).toBe('Recursivite, a cote, Noel')
  })
})
