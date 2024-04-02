/**
 * Represents a memoized promise that caches the result of an asynchronous operation.
 * The promise is executed only once and subsequent calls return the cached result.
 * @example
 * ```ts
 * const memoizedPromise = new MemoizedPromise(() => fetch('https://example.com/data'))
 * const result = await memoizedPromise.execute()
 * ```
 * @template T - The type of the result returned by the asynchronous operation.
 */
export class MemoizedPromise<T> {
  private promise: Promise<void> | undefined
  private result!: T
  private error: Error | undefined

  /**
   * Creates a new instance of the MemoizedPromise class.
   *
   * @param executor - A function that returns a promise representing the asynchronous operation.
   */
  constructor(private readonly executor: () => Promise<T>) {}

  /**
   * Executes the asynchronous operation and returns the result.
   * If the operation has already been executed, the cached result is returned.
   *
   * @returns A promise that resolves to the result of the asynchronous operation.
   * @throws If the asynchronous operation throws an error.
   */
  async execute(): Promise<T> {
    if (!this.promise) {
      this.promise = (async () => {
        try {
          this.result = await this.executor()
        } catch (error) {
          this.error = error as Error
        }
      })()
    }

    // Wait for the promise to resolve or reject
    await this.promise

    if (this.error) {
      throw this.error
    }

    return this.result
  }
}
