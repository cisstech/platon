import { listOf } from './list-of'

describe('listOf', () => {
  it('joins names the French way, « et » before the last one', () => {
    expect(listOf([])).toBe('')
    expect(listOf(['Julien Lefèvre'])).toBe('Julien Lefèvre')
    expect(listOf(['Julien Lefèvre', 'Léa Fontaine'])).toBe('Julien Lefèvre et Léa Fontaine')
    expect(listOf(['A', 'B', 'C'])).toBe('A, B et C')
  })
})
