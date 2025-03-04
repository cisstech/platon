import { ListResponse } from '@platon/core/common'
import {
  Course,
  CourseMember,
  CourseMemberFilters,
  CourseMemberRoles,
  CreateCourseMember,
} from '@platon/feature/course/common'
import { Observable } from 'rxjs'

export abstract class CourseMemberProvider {
  abstract create(course: Course, input: CreateCourseMember): Observable<CourseMember>
  abstract updateRole(member: CourseMember, role: CourseMemberRoles): Observable<CourseMember>
  abstract search(course: Course | string, filters?: CourseMemberFilters): Observable<ListResponse<CourseMember>>
  abstract delete(member: CourseMember): Observable<void>
}
