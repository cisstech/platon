import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AnnouncementProvider } from '../models/announcement-provider'
import { CreatedResponse, ItemResponse, ListResponse } from '@platon/core/common'
import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@platon/feature/announcement/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { buildHttpParams } from '@platon/core/browser/shared'

@Injectable()
export class RemoteAnnouncementProvider extends AnnouncementProvider {
  private readonly http = inject(HttpClient)
  private readonly API_BASE_PATH = '/api/v1/announcements'

  constructor() {
    super()
  }

  search(filters: AnnouncementFilters = {}): Observable<ListResponse<Announcement>> {
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<Announcement>>(`${this.API_BASE_PATH}`, { params })
  }

  create(input: CreateAnnouncementInput): Observable<Announcement> {
    return this.http
      .post<CreatedResponse<Announcement>>(this.API_BASE_PATH, input)
      .pipe(map((response) => response.resource))
  }

  update(id: string, input: UpdateAnnouncementInput): Observable<Announcement> {
    const params = buildHttpParams(input)
    return this.http
      .patch<ItemResponse<Announcement>>(`${this.API_BASE_PATH}/${id}`, input, { params })
      .pipe(map((response) => response.resource))
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_PATH}/${id}`)
  }

  getVisibleForUser(filters: AnnouncementFilters = {}): Observable<ListResponse<Announcement>> {
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<Announcement>>(`${this.API_BASE_PATH}/visible`, { params })
  }

  findById(id: string): Observable<Announcement> {
    return this.http
      .get<ItemResponse<Announcement>>(`${this.API_BASE_PATH}/${id}`)
      .pipe(map((response) => response.resource))
  }

  findByIdForUser(id: string): Observable<Announcement> {
    return this.http
      .get<ItemResponse<Announcement>>(`${this.API_BASE_PATH}/visible/${id}`)
      .pipe(map((response) => response.resource))
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE_PATH}/${id}/read`, {})
  }
}
