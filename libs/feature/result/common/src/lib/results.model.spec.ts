import { ValueAverage, calculateAverage, emptyValueAverage } from './results.model'

describe('emptyValueAverage', () => {
  it('should return an object with sum, avg, and count set to 0', () => {
    const result = emptyValueAverage()
    expect(result.sum).toBe(0)
    expect(result.avg).toBe(0)
    expect(result.count).toBe(0)
  })
})

describe('calculateAverage', () => {
  it('should return 0 when count is 0', () => {
    const value: ValueAverage = {
      sum: 0,
      avg: 0,
      count: 0,
    }
    const result = calculateAverage(value)
    expect(result).toBe(0)
    expect(value.avg).toBe(0)
  })

  it('should calculate the average with the given precision', () => {
    const value: ValueAverage = {
      sum: 10,
      avg: 0,
      count: 4,
    }
    const precision = 2
    const result = calculateAverage(value, precision)
    expect(result).toBe(2.5)
    expect(value.avg).toBe(2.5)
  })

  it('should calculate the average without precision', () => {
    const value: ValueAverage = {
      sum: 15,
      avg: 0,
      count: 3,
    }
    const result = calculateAverage(value)
    expect(result).toBe(5)
    expect(value.avg).toBe(5)
  })

  it('should calculate the average with rate', () => {
    const value: ValueAverage = {
      sum: 0.1,
      avg: 0,
      count: 2,
      isRate: true,
    }
    const result = calculateAverage(value)
    expect(result).toBe(5)
    expect(value.avg).toBe(5)
  })
})
