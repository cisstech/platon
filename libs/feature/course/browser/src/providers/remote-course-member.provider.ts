import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { buildHttpParams } from '@platon/core/browser'
import { ItemResponse, ListResponse } from '@platon/core/common'
import {
  Course,
  CourseMember,
  CourseMemberFilters,
  CourseMemberRoles,
  CreateCourseMember,
  UpdateCourseMemberRole,
} from '@platon/feature/course/common'
import { Observable, map } from 'rxjs'
import { CourseMemberProvider } from '../models/course-member-provider'

const getId = (course: Course | string): string => {
  return typeof course === 'string' ? course : course.id
}

@Injectable()
export class RemoteCourseMemberProvider extends CourseMemberProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  create(course: Course, input: CreateCourseMember): Observable<CourseMember> {
    return this.http
      .post<ItemResponse<CourseMember>>(`/api/v1/courses/${course.id}/members`, input)
      .pipe(map((e) => e.resource))
  }

  updateRole(member: CourseMember, role: CourseMemberRoles): Observable<CourseMember> {
    const input: UpdateCourseMemberRole = {
      id: member.id,
      role,
    }
    return this.http
      .patch<ItemResponse<CourseMember>>(`/api/v1/courses/${member.courseId}/members`, input)
      .pipe(map((e) => e.resource))
  }

  search(course: Course | string, filters?: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<CourseMember>>(`/api/v1/courses/${getId(course)}/members`, {
      params,
    })
  }

  delete(member: CourseMember): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${member.courseId}/members/${member.id}`)
  }
}
