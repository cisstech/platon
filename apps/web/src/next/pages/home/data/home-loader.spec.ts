import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Announcement } from '@platon/feature/announcement/common'
import { forkJoin, map, NEVER, Observable, of, Subject, throwError, timer } from 'rxjs'
import { HomeApi } from './home-api'
import { HomeLoader } from './home-loader'

interface Data {
  readonly first: string[]
  readonly second: string[]
  readonly announcements: Announcement[]
}

const announcements = [{ id: 'n1' } as Announcement]

const sources = {
  first: jest.fn<Observable<string[]>, []>(),
  second: jest.fn<Observable<string[]>, []>(),
}

@Injectable()
class Loader extends HomeLoader<Data> {
  protected sources(): Observable<Data> {
    return forkJoin({ first: sources.first(), second: sources.second(), announcements: this.announcements() })
  }
}

describe('HomeLoader', () => {
  let api: { announcements: jest.Mock; markAnnouncementRead: jest.Mock }
  let loader: Loader

  /** Fails the next `times` calls of a source, then answers. */
  const failing = <T>(times: number, value: T) => {
    let calls = 0
    return (): Observable<T> => (++calls <= times ? throwError(() => new Error('502')) : of(value))
  }

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 8, 28, 14, 30) })
    sources.first.mockReset().mockReturnValue(of(['f1']))
    sources.second.mockReset().mockReturnValue(of(['s1']))
    api = {
      announcements: jest.fn(() => of(announcements)),
      markAnnouncementRead: jest.fn(() => of(undefined)),
    }
    TestBed.configureTestingModule({ providers: [Loader, { provide: HomeApi, useValue: api }] })
    loader = TestBed.inject(Loader)
  })

  afterEach(() => jest.useRealTimers())

  it('loads its sources together', () => {
    loader.load()

    expect(loader.status()).toBe('ready')
    expect(loader.data()).toEqual({ first: ['f1'], second: ['s1'], announcements })
  })

  it('stays loading until every source answers', () => {
    const late = new Subject<string[]>()
    sources.second.mockReturnValue(late)

    loader.load()
    expect(loader.status()).toBe('loading')

    late.next(['s1'])
    late.complete()
    expect(loader.status()).toBe('ready')
  })

  it('tries again, silently, after a failure', () => {
    sources.second.mockImplementation(failing(2, ['s1']))

    loader.load()
    expect(loader.status()).toBe('loading')
    jest.advanceTimersByTime(1_000)
    expect(loader.status()).toBe('loading')
    jest.advanceTimersByTime(2_000)

    expect(loader.status()).toBe('ready')
    expect(sources.second).toHaveBeenCalledTimes(3)
    expect(loader.attempt()).toBe(0)
  })

  it('lets a slow source answer, up to 30 s', () => {
    sources.first.mockReturnValue(timer(12_000).pipe(map(() => ['f1'])))

    loader.load()
    jest.advanceTimersByTime(11_999)
    expect(loader.status()).toBe('loading')
    jest.advanceTimersByTime(1)

    expect(loader.status()).toBe('ready')
    expect(sources.first).toHaveBeenCalledTimes(1)
  })

  it('does not try again what the server refuses', () => {
    sources.second.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })))

    loader.load()

    expect(loader.status()).toBe('error')
    expect(sources.second).toHaveBeenCalledTimes(1)
  })

  it('gives up at 30 s, when the page says it failed', () => {
    sources.first.mockReturnValue(throwError(() => new Error('502')))

    loader.load()
    jest.advanceTimersByTime(29_999)
    expect(loader.status()).toBe('loading')
    jest.advanceTimersByTime(1)

    expect(loader.status()).toBe('error')
  })

  it('drops a try that answers once it gave up', () => {
    const late = new Subject<string[]>()
    sources.first.mockReturnValue(late)

    loader.load()
    jest.advanceTimersByTime(30_000)
    late.next(['f1'])
    late.complete()

    expect(loader.status()).toBe('error')
  })

  it('does without the announcements when they alone fail', () => {
    api.announcements.mockReturnValue(throwError(() => new Error('502')))

    loader.load()

    expect(loader.status()).toBe('ready')
    expect(loader.data()?.announcements).toEqual([])
  })

  it('does not wait more than 3 s for the announcements', () => {
    api.announcements.mockReturnValue(NEVER)

    loader.load()
    jest.advanceTimersByTime(3_000)

    expect(loader.status()).toBe('ready')
    expect(loader.data()?.announcements).toEqual([])
  })

  it('stops loading when the page is gone', () => {
    const late = new Subject<string[]>()
    sources.first.mockReturnValue(late)

    loader.load()
    loader.stop()
    late.next(['f1'])
    late.complete()

    expect(loader.status()).toBe('loading')
  })

  it('starts over on « Réessayer », dropping what an earlier load answers late', () => {
    const late = new Subject<string[]>()
    sources.first.mockReturnValueOnce(late)
    loader.load()

    loader.retry()
    late.next(['late'])

    expect(loader.attempt()).toBe(1)
    expect(loader.data()?.first).toEqual(['f1'])
  })

  it('closes an announcement for good: read at once on the page, and on the server', () => {
    loader.load()

    loader.dismissAnnouncement('n1')

    expect(api.markAnnouncementRead).toHaveBeenCalledWith('n1')
    expect(loader.read()).toEqual(new Set(['n1']))
  })

  it('keeps an announcement closed on the page when the server fails to hear of it', () => {
    api.markAnnouncementRead.mockReturnValue(throwError(() => new Error('502')))
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    loader.load()

    loader.dismissAnnouncement('n1')

    expect(loader.read()).toEqual(new Set(['n1']))
  })
})
