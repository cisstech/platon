import { monogram } from './monogram'

describe('monogram', () => {
  it.each([
    ['Algorithmique et programmation 1', 'AP1'],
    ['Analyse 1', 'AN1'],
    ['Algèbre 1', 'AL1'],
    ['Programmation web', 'PW'],
    ['Java, L3', 'JA3'],
    ['Introduction à la programmation orientée objet', 'IPO'],
    ['2026', '2026'],
  ])('draws « %s » as %s', (name, expected) => {
    expect(monogram(name)).toBe(expected)
  })
})
