import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { firstValueFrom } from 'rxjs'
import { ANNOUNCEMENT_PROVIDERS } from '../providers'
import { AnnouncementService } from './announcement.service'

describe('AnnouncementService', () => {
  let service: AnnouncementService
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ANNOUNCEMENT_PROVIDERS, provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(AnnouncementService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('marks an announcement read for the person signed in', async () => {
    const done = firstValueFrom(service.markAsRead('a1'))

    const request = http.expectOne('/api/v1/announcements/a1/read')
    expect(request.request.method).toBe('PATCH')
    request.flush(null)
    await done
  })
})
