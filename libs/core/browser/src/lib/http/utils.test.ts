// TODO: fix jest config

/* import { buildParams } from './utils'
import { HttpParams } from '@angular/common/http'

describe('buildParams', () => {
  it('should return an empty HttpParams object when input object is empty', () => {
    const object = {}
    const result = buildParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('')
  })

  it('should correctly build HttpParams object with string values', () => {
    const object = {
      param1: 'value1',
      param2: 'value2',
    }
    const result = buildParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param2=value2')
  })

  it('should correctly build HttpParams object with array values', () => {
    const object = {
      param1: ['value1', 'value2'],
      param2: ['value3'],
    }
    const result = buildParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param1=value2&param2=value3')
  })

  it('should ignore undefined values', () => {
    const object = {
      param1: 'value1',
      param2: undefined,
    }
    const result = buildParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1')
  })

  it('should set empty string for null values', () => {
    const object = {
      param1: 'value1',
      param2: null,
    }
    const result = buildParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param2=')
  })
})
 */
