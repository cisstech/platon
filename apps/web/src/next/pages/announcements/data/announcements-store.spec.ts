import { HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { Announcement } from '@platon/feature/announcement/common'
import { of, Subject, throwError } from 'rxjs'
import { AnnouncementsApi, AnnouncementsSlice } from './announcements-api'
import { AnnouncementsStore } from './announcements-store'

const NOW = new Date(2026, 8, 28, 14, 30)
const announcement = (id: string, values: Partial<Announcement> = {}) =>
  ({ id, title: id, description: '', createdAt: new Date(2026, 8, 27, 9), active: true, ...values } as Announcement)
const pageOf = (announcements: Announcement[], total = announcements.length): AnnouncementsSlice => ({
  announcements,
  total,
})

describe('AnnouncementsStore', () => {
  let api: { page: jest.Mock; find: jest.Mock; markAsRead: jest.Mock }
  let store: AnnouncementsStore

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    api = {
      page: jest.fn(() => of(pageOf([announcement('a1'), announcement('a2', { readAt: NOW })], 21))),
      find: jest.fn((id: string) => of({ ...announcement(id), data: { blocks: [] } })),
      markAsRead: jest.fn(() => of(undefined)),
    }
    TestBed.configureTestingModule({ providers: [AnnouncementsStore, { provide: AnnouncementsApi, useValue: api }] })
    store = TestBed.inject(AnnouncementsStore)
  })

  afterEach(() => jest.useRealTimers())

  it('loads the first page, and how many there are', () => {
    store.start(() => undefined)

    expect(api.page).toHaveBeenCalledWith('', 0)
    expect(store.status()).toBe('ready')
    expect(store.loaded()).toBe(true)
    expect(store.announcements().map(({ id }) => id)).toEqual(['a1', 'a2'])
    expect(store.total()).toBe(21)
  })

  it('opens the announcement the arrival names, once the list is there', () => {
    const arrival = jest.fn(() => 'a1')

    store.start(arrival)

    expect(arrival).toHaveBeenCalledWith([expect.objectContaining({ id: 'a1' }), expect.objectContaining({ id: 'a2' })])
    expect(store.openedId()).toBe('a1')
    expect(store.contents().get('a1')).toEqual({ status: 'ready', announcement: expect.objectContaining({ id: 'a1' }) })
  })

  it('decides the arrival once: a search opens nothing', () => {
    const arrival = jest.fn(() => undefined)
    store.start(arrival)

    store.searchFor('maint')
    jest.advanceTimersByTime(300)

    expect(arrival).toHaveBeenCalledTimes(1)
  })

  it('marks an unread announcement read when it opens, at once on the page, once', () => {
    store.start(() => undefined)

    store.open('a1')
    store.open('a1')

    expect(store.read()).toEqual(new Set(['a1']))
    expect(api.markAsRead).toHaveBeenCalledTimes(1)
    expect(api.markAsRead).toHaveBeenCalledWith('a1')
  })

  it('does not mark again an announcement already read', () => {
    store.start(() => undefined)

    store.open('a2')

    expect(api.markAsRead).not.toHaveBeenCalled()
  })

  it('keeps an announcement read on the page when the server fails to hear of it', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.markAsRead.mockReturnValue(throwError(() => new Error('502')))
    store.start(() => undefined)

    store.open('a1')

    expect(store.read()).toEqual(new Set(['a1']))
  })

  it('loads the content of an announcement once, and again after a failure', () => {
    api.find.mockReturnValueOnce(throwError(() => new Error('502')))
    store.start(() => undefined)

    store.open('a1')
    expect(store.contents().get('a1')).toEqual({ status: 'error' })

    store.retryContent('a1')
    expect(store.contents().get('a1')?.status).toBe('ready')

    store.open('a2')
    store.open('a1')
    expect(api.find).toHaveBeenCalledTimes(3)
  })

  it('shows the content loading meanwhile', () => {
    const late = new Subject<Announcement>()
    api.find.mockReturnValue(late)
    store.start(() => undefined)

    store.open('a1')

    expect(store.contents().get('a1')).toEqual({ status: 'loading' })
  })

  it('closes the open announcement', () => {
    store.start(() => 'a1')

    store.close()

    expect(store.openedId()).toBeUndefined()
  })

  it('searches once the person pauses, from the first page', () => {
    store.start(() => undefined)
    api.page.mockReturnValue(of(pageOf([announcement('m1')])))

    store.searchFor('mai')
    jest.advanceTimersByTime(200)
    store.searchFor('maint')
    jest.advanceTimersByTime(299)
    expect(api.page).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(1)

    expect(api.page).toHaveBeenLastCalledWith('maint', 0)
    expect(api.page).toHaveBeenCalledTimes(2)
    expect(store.search()).toBe('maint')
    expect(store.announcements().map(({ id }) => id)).toEqual(['m1'])
  })

  it('clears the search at once', () => {
    store.start(() => undefined)
    store.searchFor('maint')

    store.clearSearch()

    expect(store.search()).toBe('')
    expect(api.page).toHaveBeenLastCalledWith('', 0)
    jest.advanceTimersByTime(300)
    expect(api.page).toHaveBeenCalledTimes(2)
  })

  it('adds the next page after the ones it has', () => {
    store.start(() => undefined)
    api.page.mockReturnValue(of(pageOf([announcement('a3')], 21)))

    store.loadMore()

    expect(api.page).toHaveBeenLastCalledWith('', 2)
    expect(store.announcements().map(({ id }) => id)).toEqual(['a1', 'a2', 'a3'])
    expect(store.more()).toBe('idle')
  })

  it('says the next page failed, and keeps the ones it has', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    store.start(() => undefined)
    api.page.mockReturnValue(throwError(() => new Error('502')))

    store.loadMore()

    expect(store.more()).toBe('error')
    expect(store.announcements()).toHaveLength(2)
  })

  it('fails when the server refuses, and starts over on « Réessayer »', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.page.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 403 })))
    store.start(() => undefined)
    expect(store.status()).toBe('error')

    store.retry()

    expect(store.attempt()).toBe(1)
    expect(store.status()).toBe('ready')
  })

  it('knows which search its list answers, apart from the search being typed', () => {
    store.start(() => undefined)
    api.page.mockReturnValue(of(pageOf([])))

    store.searchFor('examen')
    expect(store.searched()).toBe('')
    jest.advanceTimersByTime(300)
    expect(store.searched()).toBe('examen')

    store.searchFor('')
    expect(store.searched()).toBe('examen')
  })

  it('starts each visit afresh: the route keeps the store from one visit to the next', () => {
    store.start(() => 'a1')
    store.searchFor('examen')
    jest.advanceTimersByTime(300)
    api.page.mockReturnValue(new Subject())

    store.start(() => undefined)

    expect(store.announcements()).toEqual([])
    expect(store.total()).toBe(0)
    expect(store.searched()).toBe('')
    expect(store.contents().size).toBe(0)
    expect(store.read().size).toBe(0)
    expect(store.more()).toBe('idle')
  })

  it('forgets a pending search once the page is left', () => {
    store.start(() => undefined)
    store.searchFor('maint')

    store.stop()
    jest.advanceTimersByTime(300)

    expect(api.page).toHaveBeenCalledTimes(1)
  })
})
