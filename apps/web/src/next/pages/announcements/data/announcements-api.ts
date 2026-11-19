import { inject, Injectable } from '@angular/core'
import { AnnouncementService } from '@platon/feature/announcement/browser/shared'
import { Announcement } from '@platon/feature/announcement/common'
import { map, Observable } from 'rxjs'

/** How many announcements a page of the list holds. */
export const PAGE_SIZE = 20

export interface AnnouncementsSlice {
  readonly announcements: Announcement[]
  /** How many match, beyond this page. */
  readonly total: number
}

/** The announcements meant for the person: the list without their content, one with it, and their reading. */
@Injectable({ providedIn: 'root' })
export class AnnouncementsApi {
  private readonly service = inject(AnnouncementService)

  /** The most recent first, from `offset`; `search` looks in their titles and summaries, on the server. */
  page(search: string, offset: number): Observable<AnnouncementsSlice> {
    return this.service
      .getVisibleForUser({ ...(search ? { search } : {}), offset, limit: PAGE_SIZE })
      .pipe(map((response) => ({ announcements: response.resources, total: response.total })))
  }

  find(id: string): Observable<Announcement> {
    return this.service.findByIdForUser(id)
  }

  markAsRead(id: string): Observable<void> {
    return this.service.markAsRead(id)
  }
}
