import { TestBed } from '@angular/core/testing'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { of } from 'rxjs'
import { HomeApi, HomeFigures } from './home-api'
import { StudentHomeStore } from './student-home-store'

describe('StudentHomeStore', () => {
  it('loads the activities, the copies, the courses and the figures of the student, with the announcements', () => {
    const activities = [{ id: 'a1' } as PlayableActivity]
    const copies = [{ sessionId: 's1' } as RecentCopy]
    const courses = [{ id: 'c1' } as Course]
    const figures: HomeFigures = { averageScore: 78, successRate: 71, timeSpent: 3600 }
    const announcements = [{ id: 'n1' } as Announcement]
    const api = {
      activities: () => of(activities),
      copies: () => of(copies),
      courses: () => of(courses),
      figures: () => of(figures),
      announcements: () => of(announcements),
    }
    TestBed.configureTestingModule({ providers: [StudentHomeStore, { provide: HomeApi, useValue: api }] })
    const store = TestBed.inject(StudentHomeStore)

    store.load()

    expect(store.status()).toBe('ready')
    expect(store.data()).toEqual({ activities, copies, courses, figures, announcements })
  })
})
