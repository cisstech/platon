import { Injectable } from '@angular/core'
import { ActivityGroupProvider } from '../models/activity-group.provider'
import { HttpClient } from '@angular/common/http'
import { ActivityGroup } from '@platon/feature/course/common'
import { Observable } from 'rxjs'
import { ListResponse } from '@platon/core/common'

@Injectable()
export class RemoteActivityGroupProvider extends ActivityGroupProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  create(activityId: string, groupId: string): Observable<ActivityGroup> {
    return this.http.post<ActivityGroup>(`/api/v1/activities/${activityId}/groups`, groupId)
  }

  update(activityId: string, groupsIds: string[]): Observable<ListResponse<ActivityGroup>> {
    return this.http.put<ListResponse<ActivityGroup>>(`/api/v1/activities/${activityId}/groups`, groupsIds)
  }

  search(activityId: string): Observable<ListResponse<ActivityGroup>> {
    return this.http.get<ListResponse<ActivityGroup>>(`/api/v1/activities/${activityId}/groups`)
  }

  delete(activityId: string, groupId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/activities/${activityId}/groups/${groupId}`)
  }
}
