import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor } from '@platon/core/browser/shared'
import { ANNOUNCEMENT_PROVIDERS } from '@platon/feature/announcement/browser/shared'
import { COURSE_PROVIDERS } from '@platon/feature/course/browser/shared'
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser/shared'
import { RESULT_PROVIDERS } from '@platon/feature/result/browser/shared'
import { firstValueFrom } from 'rxjs'
import { HomeApi } from './home-api'

const at = '2026-10-12T08:00:00.000Z'

describe('HomeApi', () => {
  let http: HttpTestingController
  let api: HomeApi

  const list = (url: string, resources: object[]) =>
    http.expectOne(url).flush({ success: true, statusCode: 200, resources, total: resources.length })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DateConversionInterceptor, multi: true },
        COURSE_PROVIDERS,
        RESULT_PROVIDERS,
        RESOURCE_PROVIDERS,
        ANNOUNCEMENT_PROVIDERS,
      ],
    })
    http = TestBed.inject(HttpTestingController)
    api = TestBed.inject(HomeApi)
  })

  afterEach(() => http.verify())

  it('loads the activities the person plays, with their dates', async () => {
    const activities = firstValueFrom(api.activities())
    list('/api/v1/activities/mine', [{ id: 'a1', closeAt: at }])

    expect(await activities).toEqual([{ id: 'a1', closeAt: new Date(at) }])
  })

  it('loads the last copies the person terminated', async () => {
    const copies = firstValueFrom(api.copies())
    list('/api/v1/results/recent', [{ sessionId: 's1', terminatedAt: at, status: 'graded', grade: 82 }])

    expect(await copies).toEqual([{ sessionId: 's1', terminatedAt: new Date(at), status: 'graded', grade: 82 }])
  })

  it('loads the courses the person follows, by name, without the archived ones', async () => {
    const courses = firstValueFrom(api.courses())
    list('/api/v1/courses?archived=false&order=NAME', [{ id: 'c1', name: 'AP1' }])

    expect(await courses).toEqual([{ id: 'c1', name: 'AP1' }])
  })

  it('loads the three figures over all the courses: mean, success and time spent', async () => {
    const figures = firstValueFrom(api.figures())
    http.expectOne('/api/v1/results/dashboard').flush({
      user: { 'session.average-score': 78, 'session.success-rate': 71, 'session.total-duration': 147600 },
    })

    expect(await figures).toEqual({ averageScore: 78, successRate: 71, timeSpent: 147600 })
  })

  it('loads the activities of the courses the person teaches', async () => {
    const activities = firstValueFrom(api.taught())
    list('/api/v1/activities/taught', [{ id: 'a1', openAt: at, studentCount: 302 }])

    expect(await activities).toEqual([{ id: 'a1', openAt: new Date(at), studentCount: 302 }])
  })

  it('loads the copies to correct, activity by activity', async () => {
    const corrections = firstValueFrom(api.corrections())
    list('/api/v1/results/corrections/summary', [{ activityId: 'a1', pendingCopies: 2, lastSubmittedAt: at }])

    expect(await corrections).toEqual([{ activityId: 'a1', pendingCopies: 2, lastSubmittedAt: new Date(at) }])
  })

  it('loads the courses with their students and teachers counted', async () => {
    const courses = firstValueFrom(api.courses(['statistic']))
    list('/api/v1/courses?archived=false&order=NAME&expands=statistic', [{ id: 'c1', name: 'AP1' }])

    expect(await courses).toEqual([{ id: 'c1', name: 'AP1' }])
  })

  it('loads the resources the person viewed last, with when', async () => {
    const viewed = firstValueFrom(api.viewed())
    list('/api/v1/resources?views=true', [{ id: 'r1', name: 'Recherche dichotomique', viewedAt: at }])

    expect(await viewed).toEqual([{ id: 'r1', name: 'Recherche dichotomique', viewedAt: new Date(at) }])
  })

  it('loads the active announcements the person may see', async () => {
    const announcements = firstValueFrom(api.announcements())
    list('/api/v1/announcements/visible?active=true', [{ id: 'n1', title: 'Maintenance', createdAt: at }])

    expect(await announcements).toEqual([{ id: 'n1', title: 'Maintenance', createdAt: new Date(at) }])
  })

  it('marks an announcement read on the server', async () => {
    const done = firstValueFrom(api.markAnnouncementRead('n1'))

    const request = http.expectOne('/api/v1/announcements/n1/read')
    expect(request.request.method).toBe('PATCH')
    request.flush(null)
    await done
  })
})
