import { TestBed } from '@angular/core/testing'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, TaughtActivity } from '@platon/feature/course/common'
import { Resource } from '@platon/feature/resource/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { of } from 'rxjs'
import { HomeApi } from './home-api'
import { TeacherHomeStore } from './teacher-home-store'

describe('TeacherHomeStore', () => {
  it('loads the activities taught, the corrections, the courses and the resources viewed, with the announcements', () => {
    const activities = [{ id: 'a1' } as TaughtActivity]
    const corrections = [{ activityId: 'a1' } as ActivityCorrectionSummary]
    const courses = [{ id: 'c1' } as Course]
    const viewed = [{ id: 'r1' } as Resource]
    const announcements = [{ id: 'n1' } as Announcement]
    const api = {
      taught: () => of(activities),
      corrections: () => of(corrections),
      courses: jest.fn(() => of(courses)),
      viewed: () => of(viewed),
      announcements: () => of(announcements),
      dismissedAnnouncements: () => new Set<string>(),
    }
    TestBed.configureTestingModule({ providers: [TeacherHomeStore, { provide: HomeApi, useValue: api }] })
    const store = TestBed.inject(TeacherHomeStore)

    store.load()

    expect(store.status()).toBe('ready')
    expect(store.data()).toEqual({ activities, corrections, courses, viewed, announcements })
    expect(api.courses).toHaveBeenCalledWith(['statistic'])
  })
})
