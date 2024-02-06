import { HttpParams } from '@angular/common/http'
import { buildExpandableHttpParams, buildHttpParams } from './utils'

describe('buildHttpParams', () => {
  it('should return an empty HttpParams object when input object is empty', () => {
    const object = {}
    const result = buildHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('')
  })

  it('should correctly build HttpParams object with string values', () => {
    const object = {
      param1: 'value1',
      param2: 'value2',
    }
    const result = buildHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param2=value2')
  })

  it('should correctly build HttpParams object with array values', () => {
    const object = {
      param1: ['value1', 'value2'],
      param2: ['value3'],
    }
    const result = buildHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param1=value2&param2=value3')
  })

  it('should ignore undefined values', () => {
    const object = {
      param1: 'value1',
      param2: undefined,
    }
    const result = buildHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1')
  })

  it('should set empty string for null values', () => {
    const object = {
      param1: 'value1',
      param2: null,
    }
    const result = buildHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('param1=value1&param2=')
  })
})

describe('buildExpandableHttpParams', () => {
  it('should return an empty HttpParams object when input object is null', () => {
    const object = null
    const result = buildExpandableHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('')
  })

  it('should return an empty HttpParams object when input object has no expands or selects', () => {
    const object = {}
    const result = buildExpandableHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('')
  })

  it('should correctly build HttpParams object with expands', () => {
    const object = {
      expands: ['expand1', 'expand2'],
    }
    const result = buildExpandableHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('expands=expand1,expand2')
  })

  it('should correctly build HttpParams object with selects', () => {
    const object = {
      selects: ['select1', 'select2'],
    }
    const result = buildExpandableHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('selects=select1,select2')
  })

  it('should correctly build HttpParams object with both expands and selects', () => {
    const object = {
      expands: ['expand1', 'expand2'],
      selects: ['select1', 'select2'],
    }
    const result = buildExpandableHttpParams(object)
    expect(result instanceof HttpParams).toBe(true)
    expect(result.toString()).toBe('expands=expand1,expand2&selects=select1,select2')
  })
})
