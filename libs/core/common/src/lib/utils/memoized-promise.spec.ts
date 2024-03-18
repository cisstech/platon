import { MemoizedPromise } from './memoized-promise'

describe('MemoizedPromise', () => {
  it('should execute the asynchronous operation and return the result', async () => {
    const executor = jest.fn().mockResolvedValue('result')
    const memoizedPromise = new MemoizedPromise(executor)

    const result = await memoizedPromise.execute()

    expect(executor).toHaveBeenCalledTimes(1)
    expect(result).toBe('result')
  })

  it('should cache the result and return it on subsequent calls', async () => {
    const executor = jest.fn().mockResolvedValue('result')
    const memoizedPromise = new MemoizedPromise(executor)

    await memoizedPromise.execute()
    const result = await memoizedPromise.execute()

    expect(executor).toHaveBeenCalledTimes(1)
    expect(result).toBe('result')
  })

  it('should throw an error if the asynchronous operation throws an error', async () => {
    const error = new Error('Async operation failed')
    const executor = jest.fn().mockRejectedValue(error)
    const memoizedPromise = new MemoizedPromise(executor)

    await expect(memoizedPromise.execute()).rejects.toThrowError(error)
  })

  it('should handle concurrent calls', async () => {
    const executor = jest.fn().mockResolvedValue('result')
    const memoizedPromise = new MemoizedPromise(executor)

    const results = await Promise.all([memoizedPromise.execute(), memoizedPromise.execute()])

    expect(executor).toHaveBeenCalledTimes(1)
    expect(results).toEqual(['result', 'result'])
  })
})
