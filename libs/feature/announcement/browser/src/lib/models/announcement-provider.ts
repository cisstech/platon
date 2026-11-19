import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@platon/feature/announcement/common'
import { Observable } from 'rxjs'
import { ListResponse } from '@platon/core/common'

export abstract class AnnouncementProvider {
  abstract search(filters: AnnouncementFilters): Observable<ListResponse<Announcement>>
  abstract create(input: CreateAnnouncementInput): Observable<Announcement>
  abstract update(id: string, input: UpdateAnnouncementInput): Observable<Announcement>
  abstract delete(id: string): Observable<void>
  abstract getVisibleForUser(filter: AnnouncementFilters): Observable<ListResponse<Announcement>>
  abstract findByIdForUser(id: string): Observable<Announcement>
  abstract markAsRead(id: string): Observable<void>
}
