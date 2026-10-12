import { plural } from './plural'

describe('plural', () => {
  it('keeps the singular up to one, as French does', () => {
    expect([0, 1, 2, 12].map((count) => `${count} ${plural(count, 'exercice', 'exercices')}`)).toEqual([
      '0 exercice',
      '1 exercice',
      '2 exercices',
      '12 exercices',
    ])
  })
})
