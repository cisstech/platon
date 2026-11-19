import { HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { Course, CourseSection, PlayableActivity, TaughtActivity } from '@platon/feature/course/common'
import { of, Subject, throwError } from 'rxjs'
import { CourseApi } from './course-api'
import { CourseStore } from './course-store'

const course = (update: boolean) => ({ id: 'ap1', name: 'AP1', permissions: { update, archive: true } } as Course)
const sections = [{ id: 's1', name: 'Semaine 1', order: 0 } as CourseSection]

describe('CourseStore', () => {
  let api: { course: jest.Mock; sections: jest.Mock; taught: jest.Mock; playable: jest.Mock }
  let store: CourseStore

  beforeEach(() => {
    api = {
      course: jest.fn(() => of(course(true))),
      sections: jest.fn(() => of(sections)),
      taught: jest.fn(() => of([{ id: 't1' } as TaughtActivity])),
      playable: jest.fn(() => of([{ id: 'p1' } as PlayableActivity])),
    }
    TestBed.configureTestingModule({ providers: [CourseStore, { provide: CourseApi, useValue: api }] })
    store = TestBed.inject(CourseStore)
  })

  it('loads the course, its sections, and its activities as its teacher reads them', () => {
    store.start('ap1')

    expect(store.status()).toBe('ready')
    expect(store.course()?.id).toBe('ap1')
    expect(store.sections()).toEqual(sections)
    expect(store.taught().map(({ id }) => id)).toEqual(['t1'])
    expect(api.playable).not.toHaveBeenCalled()
    expect(api.taught).toHaveBeenCalledWith('ap1')
  })

  it('loads the activities a student plays when the person may not change the course', () => {
    api.course.mockReturnValue(of(course(false)))

    store.start('ap1')

    expect(store.playable().map(({ id }) => id)).toEqual(['p1'])
    expect(api.taught).not.toHaveBeenCalled()
  })

  it.each([400, 403, 404])('says the course is missing when the server answers %s', (status) => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.course.mockReturnValue(throwError(() => new HttpErrorResponse({ status })))

    store.start('nope')

    expect(store.missing()).toBe(true)
    expect(store.status()).toBe('ready')
  })

  it('fails on any other refusal, and starts over on « Réessayer »', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.taught.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })))
    store.start('ap1')
    expect(store.status()).toBe('error')

    store.retry()

    expect(store.attempt()).toBe(1)
    expect(store.status()).toBe('ready')
  })

  it('starts each visit afresh: the route keeps the store from one visit to the next', () => {
    store.start('ap1')
    store.search.set('tp')
    store.state.set('opened')
    api.course.mockReturnValue(new Subject())

    store.start('an1')

    expect(store.course()).toBeUndefined()
    expect(store.sections()).toEqual([])
    expect(store.taught()).toEqual([])
    expect(store.filters()).toEqual({ search: '', state: 'all' })
  })

  it('forgets a load under way once the page is left', () => {
    const answer = new Subject<Course>()
    api.course.mockReturnValue(answer)
    store.start('ap1')

    store.stop()
    answer.next(course(true))

    expect(store.course()).toBeUndefined()
  })
})
