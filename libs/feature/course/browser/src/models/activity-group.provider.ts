import { ListResponse } from '@platon/core/common'
import { ActivityGroup } from '@platon/feature/course/common'
import { Observable } from 'rxjs'

export abstract class ActivityGroupProvider {
  abstract create(activityId: string, groupId: string): Observable<ActivityGroup>
  abstract update(activityId: string, groupsIds: string[]): Observable<ListResponse<ActivityGroup>>
  abstract search(activityId: string): Observable<ListResponse<ActivityGroup>>
  abstract delete(activityId: string, groupId: string): Observable<void>
}
