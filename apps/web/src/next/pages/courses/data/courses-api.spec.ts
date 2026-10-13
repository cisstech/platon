import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor } from '@platon/core/browser/shared'
import { COURSE_PROVIDERS } from '@platon/feature/course/browser/shared'
import { CourseOrderings } from '@platon/feature/course/common'
import { firstValueFrom } from 'rxjs'
import { CoursesApi } from './courses-api'

const at = '2026-09-26T07:00:00.000Z'
const filters = { search: '', order: CourseOrderings.UPDATED_AT, period: 0, tab: 'current' as const }

describe('CoursesApi', () => {
  let http: HttpTestingController
  let api: CoursesApi

  const list = (url: string, resources: object[], total = resources.length) =>
    http.expectOne(url).flush({ success: true, statusCode: 200, resources, total })

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
    api = TestBed.inject(CoursesApi)
  })

  afterEach(() => http.verify())

  it('loads the current courses of the person, with their headcount and what they may do', async () => {
    const courses = firstValueFrom(api.mine(filters, false))
    list('/api/v1/courses?order=UPDATED_AT&archived=false&expands=statistic&expands=permissions', [
      { id: 'c1', updatedAt: at },
    ])

    expect(await courses).toEqual([{ id: 'c1', updatedAt: new Date(at) }])
  })

  it('searches, sorts and limits to a period, the archived courses too', async () => {
    const courses = firstValueFrom(
      api.mine({ ...filters, search: ' algo ', order: CourseOrderings.NAME, period: 7 }, true)
    )
    list('/api/v1/courses?search=algo&order=NAME&period=7&archived=true&expands=statistic&expands=permissions', [])

    expect(await courses).toEqual([])
  })

  it('loads every course of the platform, by pages of 20', async () => {
    const page = firstValueFrom(api.platform(filters, 20))
    list(
      '/api/v1/courses?order=UPDATED_AT&showAll=true&offset=20&limit=20&expands=statistic&expands=permissions',
      [{ id: 'c21' }],
      21
    )

    expect(await page).toEqual({ courses: [{ id: 'c21' }], total: 21 })
  })

  it('archives a course for the person, and back', async () => {
    const done = firstValueFrom(api.archive('c1', true))
    const request = http.expectOne('/api/v1/courses/c1/members/me')
    expect(request.request.method).toBe('PATCH')
    expect(request.request.body).toEqual({ archived: true })
    request.flush({ success: true, statusCode: 200, resource: {} })
    await done
  })

  it('creates a course from its name and description', async () => {
    const created = firstValueFrom(api.create('Algorithmique 2', 'Licence 1, semestre 2.'))
    const request = http.expectOne('/api/v1/courses')
    expect(request.request.method).toBe('POST')
    expect(request.request.body).toMatchObject({ name: 'Algorithmique 2', desc: 'Licence 1, semestre 2.' })
    request.flush({ success: true, statusCode: 201, resource: { id: 'c9', name: 'Algorithmique 2' } })

    expect((await created).id).toBe('c9')
  })
})
