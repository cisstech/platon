import { HttpErrorResponse } from '@angular/common/http'
import { defer, NEVER, Observable, of, throwError } from 'rxjs'
import { patiently } from './patiently'

describe('patiently', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  const run = <T>(source: Observable<T>) => {
    const seen: { value?: T; error?: unknown } = {}
    source
      .pipe(patiently())
      .subscribe({ next: (value) => (seen.value = value), error: (error) => (seen.error = error) })
    return seen
  }

  it('tries a failure that may pass again, after a short wait', () => {
    let calls = 0
    const seen = run(defer(() => (++calls < 3 ? throwError(() => new Error('502')) : of('ok'))))

    jest.advanceTimersByTime(1_000)
    expect(seen.value).toBeUndefined()
    jest.advanceTimersByTime(2_000)

    expect(seen.value).toBe('ok')
    expect(calls).toBe(3)
  })

  it('fails at once on a refusal of the server', () => {
    let calls = 0
    const seen = run(defer(() => (++calls, throwError(() => new HttpErrorResponse({ status: 403 })))))

    expect(seen.error).toBeInstanceOf(HttpErrorResponse)
    expect(calls).toBe(1)
  })

  it('gives up at 30 s, when the page says it failed', () => {
    const seen = run(NEVER)

    jest.advanceTimersByTime(29_999)
    expect(seen.error).toBeUndefined()
    jest.advanceTimersByTime(1)

    expect(seen.error).toBeDefined()
  })
})
