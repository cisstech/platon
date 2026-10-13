import { HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { Course, CourseOrderings, PlayableActivity } from '@platon/feature/course/common'
import { of, Subject, throwError } from 'rxjs'
import { DEFAULT_FILTERS } from '../courses.vm'
import { CoursesApi } from './courses-api'
import { CoursesStore } from './courses-store'

const course = (id: string) => ({ id, name: id } as Course)
const activity = { id: 'a1', courseId: 'ap1' } as PlayableActivity

describe('CoursesStore', () => {
  let api: { mine: jest.Mock; platform: jest.Mock; activities: jest.Mock; archive: jest.Mock; create: jest.Mock }
  let store: CoursesStore

  beforeEach(() => {
    jest.useFakeTimers()
    api = {
      mine: jest.fn((_filters, archived: boolean) => of(archived ? [course('old')] : [course('ap1'), course('an1')])),
      platform: jest.fn(() => of({ courses: [course('p1'), course('p2')], total: 3 })),
      activities: jest.fn(() => of([activity])),
      archive: jest.fn(() => of({})),
      create: jest.fn((name: string) => of({ id: 'new', name } as Course)),
    }
    TestBed.configureTestingModule({ providers: [CoursesStore, { provide: CoursesApi, useValue: api }] })
    store = TestBed.inject(CoursesStore)
  })

  afterEach(() => jest.useRealTimers())

  it('loads the current and the archived courses of a student, with their activities', () => {
    store.start(DEFAULT_FILTERS, false)

    expect(store.status()).toBe('ready')
    expect(store.current().map(({ id }) => id)).toEqual(['ap1', 'an1'])
    expect(store.archived().map(({ id }) => id)).toEqual(['old'])
    expect(store.activities()).toEqual([activity])
  })

  it('does not load activities for a teacher, whose binders say the headcount', () => {
    store.start(DEFAULT_FILTERS, true)

    expect(api.activities).not.toHaveBeenCalled()
    expect(store.activities()).toBeUndefined()
  })

  it('searches once the person pauses, the activities loaded once', () => {
    store.start(DEFAULT_FILTERS, false)

    store.search('al')
    jest.advanceTimersByTime(200)
    store.search('algo')
    jest.advanceTimersByTime(300)

    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'algo' }), true)
    expect(api.mine).toHaveBeenCalledTimes(4)
    expect(api.activities).toHaveBeenCalledTimes(1)
  })

  it('sorts and limits at once', () => {
    store.start(DEFAULT_FILTERS, true)

    store.choose({ order: CourseOrderings.NAME, period: 7 })

    expect(store.filters()).toMatchObject({ order: CourseOrderings.NAME, period: 7 })
    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ order: CourseOrderings.NAME, period: 7 }), true)
  })

  it('moves between the current and the archived courses without loading them again', () => {
    store.start(DEFAULT_FILTERS, true)
    expect(store.listed().map(({ id }) => id)).toEqual(['ap1', 'an1'])

    store.choose({ tab: 'archived' })

    expect(api.mine).toHaveBeenCalledTimes(2)
    expect(store.listed().map(({ id }) => id)).toEqual(['old'])
  })

  it('clears the search and the period at once', () => {
    store.start({ ...DEFAULT_FILTERS, search: 'algo', period: 7 }, true)

    store.clearFilters()

    expect(store.filters()).toMatchObject({ search: '', period: 0 })
    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ search: '', period: 0 }), true)
  })

  it('loads the whole platform for an administrator, page after page', () => {
    store.start(DEFAULT_FILTERS, true)

    store.choose({ tab: 'platform' })
    expect(api.platform).toHaveBeenLastCalledWith(expect.objectContaining({ tab: 'platform' }), 0)
    expect(store.platform().map(({ id }) => id)).toEqual(['p1', 'p2'])
    expect(store.hasMore()).toBe(true)

    api.platform.mockReturnValue(of({ courses: [course('p3')], total: 3 }))
    store.loadMore()

    expect(api.platform).toHaveBeenLastCalledWith(expect.anything(), 2)
    expect(store.platform().map(({ id }) => id)).toEqual(['p1', 'p2', 'p3'])
    expect(store.hasMore()).toBe(false)
  })

  it('sends a search still waiting for its pause instead of the next page, which its first page replaces', () => {
    store.start({ ...DEFAULT_FILTERS, tab: 'platform' }, true)
    store.search('phys')

    expect(store.loadMore()).toBe(false)

    expect(api.platform).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'phys' }), 0)
    jest.advanceTimersByTime(300)
    expect(api.platform).toHaveBeenCalledTimes(2)
  })

  it('keeps the filters of the lists shown until the server answers the new ones', () => {
    store.start(DEFAULT_FILTERS, true)
    const answer = new Subject<Course[]>()
    api.mine.mockReturnValue(answer)

    store.choose({ search: 'zzz', period: 7 })

    expect(store.filters()).toMatchObject({ search: 'zzz', period: 7 })
    expect(store.applied()).toMatchObject({ search: '', period: 0 })
    answer.next([])
    answer.complete()
    expect(store.applied()).toMatchObject({ search: 'zzz', period: 7 })
  })

  it('loads nothing when the filters asked give the lists shown', () => {
    store.start(DEFAULT_FILTERS, true)

    store.choose({ ...DEFAULT_FILTERS, tab: 'archived' })

    expect(api.mine).toHaveBeenCalledTimes(2)
  })

  it('says the next page failed, and keeps the courses it has', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    store.start({ ...DEFAULT_FILTERS, tab: 'platform' }, true)
    api.platform.mockReturnValue(throwError(() => new Error('502')))

    store.loadMore()

    expect(store.more()).toBe('error')
    expect(store.platform()).toHaveLength(2)
  })

  it('archives a course at once, and brings it back', async () => {
    store.start(DEFAULT_FILTERS, false)

    expect(await store.archive(course('ap1'), true)).toBe(true)
    expect(api.archive).toHaveBeenCalledWith('ap1', true)
    expect(store.current().map(({ id }) => id)).toEqual(['an1'])
    expect(store.archived().map(({ id }) => id)).toEqual(['ap1', 'old'])

    expect(await store.archive(course('old'), false)).toBe(true)
    expect(store.current().map(({ id }) => id)).toEqual(['old', 'an1'])
  })

  it('loads the activities again once a student brings a course back, the course waiting for them meanwhile', async () => {
    store.start(DEFAULT_FILTERS, false)
    const refreshed = new Subject<PlayableActivity[]>()
    api.activities.mockReturnValue(refreshed)

    await store.archive(course('old'), false)
    expect(store.missing().has('old')).toBe(true)

    refreshed.next([activity, { id: 'a2', courseId: 'old' } as PlayableActivity])
    expect(store.missing().size).toBe(0)
    expect(store.activities()?.map(({ courseId }) => courseId)).toEqual(['ap1', 'old'])
  })

  it('does not load activities again when a course goes to the archives, or for a teacher', async () => {
    store.start(DEFAULT_FILTERS, false)
    await store.archive(course('ap1'), true)

    store.start(DEFAULT_FILTERS, true)
    await store.archive(course('old'), false)

    expect(api.activities).toHaveBeenCalledTimes(1)
  })

  it('puts a course back where it was when archiving fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.archive.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })))
    store.start(DEFAULT_FILTERS, false)

    expect(await store.archive(course('an1'), true)).toBe(false)
    expect(store.current().map(({ id }) => id)).toEqual(['ap1', 'an1'])
    expect(store.archived().map(({ id }) => id)).toEqual(['old'])
  })

  it('creates a course', async () => {
    store.start(DEFAULT_FILTERS, true)

    expect((await store.create('Algorithmique 2', 'L1')).id).toBe('new')
    expect(api.create).toHaveBeenCalledWith('Algorithmique 2', 'L1')
  })

  it('fails when the server refuses, and starts over on « Réessayer »', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.mine.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 403 })))
    store.start(DEFAULT_FILTERS, true)
    expect(store.status()).toBe('error')

    store.retry()

    expect(store.attempt()).toBe(1)
    expect(store.status()).toBe('ready')
  })

  it('starts each visit afresh: the route keeps the store from one visit to the next', () => {
    store.start(DEFAULT_FILTERS, false)
    api.mine.mockReturnValue(new Subject())

    store.start({ ...DEFAULT_FILTERS, search: 'algo' }, false)

    expect(store.loaded()).toBe(false)
    expect(store.current()).toEqual([])
    expect(store.archived()).toEqual([])
    expect(store.activities()).toBeUndefined()
    expect(store.filters().search).toBe('algo')
  })

  it('forgets a pending search once the page is left', () => {
    store.start(DEFAULT_FILTERS, true)
    store.search('algo')

    store.stop()
    jest.advanceTimersByTime(300)

    expect(api.mine).toHaveBeenCalledTimes(2)
  })
})
