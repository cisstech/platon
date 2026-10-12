import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { buildHttpParams } from '@platon/core/browser/shared'
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import {
  Activity,
  ActivityFilters,
  Course,
  CreateActivity,
  PlayableActivity,
  RestrictionList,
  TaughtActivity,
  UpdateActivity,
} from '@platon/feature/course/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ActivityProvider } from '../models/activity-provider'

@Injectable()
export class RemoteActivityProvider extends ActivityProvider {
  private readonly http = inject(HttpClient)

  find(courseId: string, activityId: string): Observable<Activity> {
    return this.http
      .get<ItemResponse<Activity>>(`/api/v1/courses/${courseId}/activities/${activityId}`)
      .pipe(map((response) => response.resource))
  }

  search(course: Course, filters?: ActivityFilters): Observable<ListResponse<Activity>> {
    filters = filters || {}
    const params = buildHttpParams(filters)

    return this.http.get<ListResponse<Activity>>(`/api/v1/courses/${course.id}/activities`, {
      params,
    })
  }

  create(course: Course, input: CreateActivity): Observable<Activity> {
    return this.http
      .post<ItemResponse<Activity>>(`/api/v1/courses/${course.id}/activities`, input)
      .pipe(map((response) => response.resource))
  }

  createActivities(course: Course, inputs: CreateActivity[]): Observable<ListResponse<Activity>> {
    return this.http
      .post<ListResponse<Activity>>(`/api/v1/courses/${course.id}/activities/batch`, { activities: inputs })
      .pipe(map((response) => response))
  }

  update(activity: Activity, input: UpdateActivity): Observable<Activity> {
    return this.http
      .patch<ItemResponse<Activity>>(`/api/v1/courses/${activity.courseId}/activities/${activity.id}`, input)
      .pipe(map((response) => response.resource))
  }

  updateOrder(course: Course, sortedActivityIds: string[]): Observable<void> {
    return this.http
      .patch<NoContentResponse>(`/api/v1/courses/${course.id}/activities/change-order`, sortedActivityIds)
      .pipe(map(() => undefined))
  }

  reload(activity: Activity, version?: string): Observable<Activity> {
    return this.http
      .put<ItemResponse<Activity>>(
        `/api/v1/courses/${activity.courseId}/activities/${activity.id}`,
        version ? { version } : {}
      )
      .pipe(map((response) => response.resource))
  }

  delete(activity: Activity): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${activity.courseId}/activities/${activity.id}`)
  }

  close(activity: Activity): Observable<Activity> {
    return this.http
      .post<ItemResponse<Activity>>(`/api/v1/courses/${activity.courseId}/activities/${activity.id}/close`, {})
      .pipe(map((response) => response.resource))
  }

  reopen(activity: Activity): Observable<Activity> {
    return this.http
      .post<ItemResponse<Activity>>(`/api/v1/courses/${activity.courseId}/activities/${activity.id}/reopen`, {})
      .pipe(map((response) => response.resource))
  }

  regenerateCode(activity: Activity): Observable<Activity> {
    return this.http
      .post<ItemResponse<Activity>>(
        `/api/v1/courses/${activity.courseId}/activities/${activity.id}/regenerate-code`,
        {}
      )
      .pipe(map((response) => response.resource))
  }

  updateRestrictions(activity: Activity, restrictions: RestrictionList[]): Observable<Activity> {
    return this.http
      .patch<ItemResponse<Activity>>(
        `/api/v1/courses/${activity.courseId}/activities/${activity.id}/restrictions`,
        restrictions
      )
      .pipe(map((response) => response.resource))
  }

  getCourseColors(courseId: string): Observable<number[]> {
    return this.http
      .get<ItemResponse<number[]>>(`/api/v1/courses/${courseId}/activities/colors`)
      .pipe(map((response) => response.resource))
  }

  playable(): Observable<PlayableActivity[]> {
    return this.http
      .get<ListResponse<PlayableActivity>>('/api/v1/activities/mine')
      .pipe(map((response) => response.resources))
  }

  taught(): Observable<TaughtActivity[]> {
    return this.http
      .get<ListResponse<TaughtActivity>>('/api/v1/activities/taught')
      .pipe(map((response) => response.resources))
  }
}
