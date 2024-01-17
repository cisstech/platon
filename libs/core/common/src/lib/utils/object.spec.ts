import { deepMerge } from './object'

describe('deepMerge', () => {
  it('should merge the source object into the target object', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 }, e: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
  })

  it('should replace existing values in the target object when replace flag is true', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { c: 3 }, e: 4 }
    const result = deepMerge(target, source, true)
    expect(result).toEqual({ a: 1, b: { c: 3 }, e: 4 })
  })

  it('should not replace existing values in the target object when replace flag is false', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { c: 3 }, e: 4 }
    const result = deepMerge(target, source, false)
    expect(result).toEqual({ a: 1, b: { c: 3 }, e: 4 })
  })

  it('should handle arrays correctly', () => {
    const target = { a: [1, 2], b: { c: [3, 4] } }
    const source = { a: [5, 6], b: { c: [7, 8] }, d: [9] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [5, 6], b: { c: [7, 8] }, d: [9] })
  })

  it('should handle null and undefined values correctly', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { c: null }, d: undefined }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { c: null }, d: undefined })
  })
})
