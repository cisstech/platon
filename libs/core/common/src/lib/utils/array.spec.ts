import { uniquifyBy } from './array'

describe('uniquifyBy', () => {
  it('should remove duplicate items based on rowId', () => {
    const array = [
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '1', name: 'Item 1' },
      { rowId: '3', name: 'Item 4' },
    ]

    const result = uniquifyBy(array, 'rowId')

    expect(result).toEqual([
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '3', name: 'Item 4' },
    ])
  })

  it('should return the same array if there are no duplicate items', () => {
    const array = [
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '3', name: 'Item 3' },
    ]

    const result = uniquifyBy(array, 'rowId')

    expect(result).toEqual(array)
  })

  it('should return an empty array if the input array is empty', () => {
    const array = [] as { rowId: string }[]

    const result = uniquifyBy(array, 'rowId')

    expect(result).toEqual([])
  })
})
import { uniquifyProperty } from './array'

describe('uniquifyProperty', () => {
  it('should remove duplicate items based on the specified property', () => {
    const array = [
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '3', name: 'Item 1' },
      { rowId: '4', name: 'Item 4' },
      { rowId: '5', name: 'Item 1' },
    ]

    const result = uniquifyProperty(array, 'name')
    expect(result).toEqual([
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '3', name: 'Item 1 (1)' },
      { rowId: '4', name: 'Item 4' },
      { rowId: '5', name: 'Item 1 (2)' },
    ])
  })

  it('should return the same array if there are no duplicate items', () => {
    const array = [
      { rowId: '1', name: 'Item 1' },
      { rowId: '2', name: 'Item 2' },
      { rowId: '3', name: 'Item 3' },
    ]

    const result = uniquifyProperty(array, 'name')

    expect(result).toEqual(array)
  })

  it('should return an empty array if the input array is empty', () => {
    const array = [] as { rowId: string }[]

    const result = uniquifyProperty(array, 'rowId')

    expect(result).toEqual([])
  })
})
