import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor } from '@platon/core/browser/shared'
import { COURSE_PROVIDERS } from '@platon/feature/course/browser/shared'
import { firstValueFrom } from 'rxjs'
import { CourseApi } from './course-api'

const at = '2026-09-26T07:00:00.000Z'

describe('CourseApi', () => {
  let http: HttpTestingController
  let api: CourseApi

  const list = (url: string, resources: object[]) =>
    http.expectOne(url).flush({ success: true, statusCode: 200, resources, total: resources.length })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DateConversionInterceptor, multi: true },
        COURSE_PROVIDERS,
      ],
    })
    http = TestBed.inject(HttpTestingController)
    api = TestBed.inject(CourseApi)
  })

  afterEach(() => http.verify())

  it('loads the course with its headcount and what the person may do', async () => {
    const course = firstValueFrom(api.course('ap1'))
    http
      .expectOne('/api/v1/courses/ap1?expands=permissions,statistic')
      .flush({ success: true, statusCode: 200, resource: { id: 'ap1', createdAt: at } })

    expect((await course).createdAt).toEqual(new Date(at))
  })

  it('loads its sections, and its activities for its teacher or for a student, with their dates', async () => {
    const sections = firstValueFrom(api.sections('ap1'))
    list('/api/v1/courses/ap1/sections', [{ id: 's1', name: 'Semaine 1', order: 0 }])
    const taught = firstValueFrom(api.taught('ap1'))
    list('/api/v1/activities/taught?course=ap1', [{ id: 'a1', closeAt: at }])
    const playable = firstValueFrom(api.playable('ap1'))
    list('/api/v1/activities/mine?course=ap1', [{ id: 'a1', closeAt: at }])

    expect((await sections).map(({ name }) => name)).toEqual(['Semaine 1'])
    expect((await taught)[0].closeAt).toEqual(new Date(at))
    expect((await playable)[0].closeAt).toEqual(new Date(at))
  })
})
