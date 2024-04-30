import { ItemResponse, ListResponse } from '@platon/core/common'
import { CourseGroup, CourseMember } from '@platon/feature/course/common'
import { Observable } from 'rxjs'

export abstract class CourseGroupProvider {
  abstract list(courseId: string): Observable<ListResponse<CourseGroup>>

  abstract updateName(courseId: string, groupId: string, newName: string): Observable<CourseGroup>

  abstract listMembers(courseId: string, groupId: string): Observable<ListResponse<CourseMember>>

  abstract deleteMember(courseId: string, groupId: string, userId: string): Observable<void>

  abstract addMember(courseId: string, groupId: string, userId: string): Observable<void>

  abstract addCourseGroup(courseId: string): Observable<ItemResponse<CourseGroup>>

  abstract deleteGroup(courseId: string, groupId: string): Observable<void>
}
