import { ListResponse } from '@platon/core/common'
import { Activity, ActivityFilters, Course, CreateActivity, UpdateActivity } from '@platon/feature/course/common'
import { Observable } from 'rxjs'

export abstract class ActivityProvider {
  abstract find(courseId: string, activityId: string): Observable<Activity>
  abstract search(course: Course, filters?: ActivityFilters): Observable<ListResponse<Activity>>
  abstract create(course: Course, input: CreateActivity): Observable<Activity>
  abstract update(activity: Activity, input: UpdateActivity): Observable<Activity>
  abstract updateOrder(course: Course, sortedActivityIds: string[]): Observable<void>
  abstract reload(activity: Activity, version?: string): Observable<Activity>
  abstract delete(activity: Activity, version?: string): Observable<void>
  abstract close(activity: Activity): Observable<Activity>
  abstract reopen(activity: Activity): Observable<Activity>
}
