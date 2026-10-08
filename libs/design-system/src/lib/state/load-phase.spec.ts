import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { LoadStatus, hasFailed, isBusy, loadPhase, showsSkeleton, trackLoadPhase } from './load-phase'

describe('loadPhase', () => {
  it.each([
    ['idle', 0, 'idle'],
    ['ready', 12_000, 'ready'],
    ['error', 50, 'error'],
    ['loading', 0, 'quiet'],
    ['loading', 299, 'quiet'],
    ['loading', 300, 'skeleton'],
    ['loading', 9_999, 'skeleton'],
    ['loading', 10_000, 'slow'],
    ['loading', 29_999, 'slow'],
    ['loading', 30_000, 'timeout'],
  ] as const)('gives %s after %i ms: %s', (status, elapsed, phase) => {
    expect(loadPhase(status, elapsed)).toBe(phase)
  })

  it('keeps the page busy, then shows the skeleton, then an error', () => {
    expect(['quiet', 'skeleton', 'slow'].every((p) => isBusy(p as never))).toBe(true)
    expect(isBusy('timeout')).toBe(false)
    expect(showsSkeleton('quiet')).toBe(false)
    expect(showsSkeleton('slow')).toBe(true)
    expect(hasFailed('timeout')).toBe(true)
    expect(hasFailed('ready')).toBe(false)
  })
})

@Component({ template: '' })
class Host {
  readonly status = signal<LoadStatus>('idle')
  readonly attempt = signal(0)
  readonly phase = trackLoadPhase(this.status, this.attempt)
}

describe('trackLoadPhase', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  const setup = () => {
    const fixture = TestBed.createComponent(Host)
    const host = fixture.componentInstance
    const flush = () => fixture.detectChanges()
    return { fixture, host, flush }
  }

  it('moves on at 300 ms, 10 s and 30 s while it loads', () => {
    const { host, flush } = setup()
    host.status.set('loading')
    flush()
    expect(host.phase()).toBe('quiet')
    jest.advanceTimersByTime(300)
    expect(host.phase()).toBe('skeleton')
    jest.advanceTimersByTime(9_700)
    expect(host.phase()).toBe('slow')
    jest.advanceTimersByTime(20_000)
    expect(host.phase()).toBe('timeout')
  })

  it('stops the clock when the data arrives', () => {
    const { host, flush } = setup()
    host.status.set('loading')
    flush()
    jest.advanceTimersByTime(500)
    host.status.set('ready')
    flush()
    jest.advanceTimersByTime(30_000)
    expect(host.phase()).toBe('ready')
  })

  it('restarts the clock on a new attempt', () => {
    const { host, flush } = setup()
    host.status.set('loading')
    flush()
    jest.advanceTimersByTime(30_000)
    expect(host.phase()).toBe('timeout')
    host.attempt.update((n) => n + 1)
    flush()
    expect(host.phase()).toBe('quiet')
    jest.advanceTimersByTime(300)
    expect(host.phase()).toBe('skeleton')
  })

  it('clears its timers with its component', () => {
    const { fixture, host, flush } = setup()
    host.status.set('loading')
    flush()
    fixture.destroy()
    jest.advanceTimersByTime(30_000)
    expect(host.phase()).toBe('quiet')
  })
})
