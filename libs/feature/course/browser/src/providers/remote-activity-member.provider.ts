import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Activity, ActivityMember, CreateActivityMember } from '@platon/feature/course/common'
import { Observable, map } from 'rxjs'
import { ActivityMemberProvider } from '../models/activity-member.provider'

@Injectable()
export class RemoteActivityMemberProvider extends ActivityMemberProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  create(activity: Activity, input: CreateActivityMember): Observable<ActivityMember> {
    return this.http
      .post<ItemResponse<ActivityMember>>(`/api/v1/activities/${activity.id}/members`, input)
      .pipe(map((e) => e.resource))
  }
  update(
    activity: Activity,
    input: CreateActivityMember[]
  ): Observable<ListResponse<ActivityMember>> {
    return this.http.put<ListResponse<ActivityMember>>(
      `/api/v1/activities/${activity.id}/members`,
      input
    )
  }

  search(activity: Activity): Observable<ListResponse<ActivityMember>> {
    return this.http.get<ListResponse<ActivityMember>>(`/api/v1/activities/${activity.id}/members`)
  }

  delete(member: ActivityMember): Observable<void> {
    return this.http.delete<void>(`/api/v1/activities/${member.activityId}/members/${member.id}`)
  }
}
