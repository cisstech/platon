import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor } from '@platon/core/browser/shared'
import { ANNOUNCEMENT_PROVIDERS } from '@platon/feature/announcement/browser/shared'
import { firstValueFrom } from 'rxjs'
import { AnnouncementsApi } from './announcements-api'

const at = '2026-09-25T07:00:00.000Z'

describe('AnnouncementsApi', () => {
  let http: HttpTestingController
  let api: AnnouncementsApi

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DateConversionInterceptor, multi: true },
        ANNOUNCEMENT_PROVIDERS,
      ],
    })
    http = TestBed.inject(HttpTestingController)
    api = TestBed.inject(AnnouncementsApi)
  })

  afterEach(() => http.verify())

  it('loads a page of 20 announcements meant for the person, with how many there are', async () => {
    const page = firstValueFrom(api.page('', 0))
    http
      .expectOne('/api/v1/announcements/visible?offset=0&limit=20')
      .flush({ success: true, statusCode: 200, resources: [{ id: 'a1', createdAt: at }], total: 21 })

    expect(await page).toEqual({ announcements: [{ id: 'a1', createdAt: new Date(at) }], total: 21 })
  })

  it('searches all of them on the server, page after page', async () => {
    const page = firstValueFrom(api.page('maintenance', 20))
    http
      .expectOne('/api/v1/announcements/visible?search=maintenance&offset=20&limit=20')
      .flush({ success: true, statusCode: 200, resources: [], total: 20 })

    expect(await page).toEqual({ announcements: [], total: 20 })
  })

  it('loads one announcement with its content', async () => {
    const found = firstValueFrom(api.find('a1'))
    http
      .expectOne('/api/v1/announcements/visible/a1')
      .flush({ success: true, statusCode: 200, resource: { id: 'a1', data: { blocks: [] } } })

    expect(await found).toEqual({ id: 'a1', data: { blocks: [] } })
  })

  it('marks an announcement read', async () => {
    const done = firstValueFrom(api.markAsRead('a1'))

    const request = http.expectOne('/api/v1/announcements/a1/read')
    expect(request.request.method).toBe('PATCH')
    request.flush(null)
    await done
  })
})
