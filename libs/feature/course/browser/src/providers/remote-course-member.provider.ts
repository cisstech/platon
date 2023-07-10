import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import {
  Course,
  CourseMember,
  CourseMemberFilters,
  CreateCourseMember,
} from '@platon/feature/course/common'
import { Observable, map } from 'rxjs'
import { CourseMemberProvider } from '../models/course-member-provider'

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

  search(course: Course, filters?: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    let params = new HttpParams()

    if (filters?.search) {
      params = params.append('search', filters.search)
    }

    filters?.roles?.forEach((e) => {
      params = params.append('roles', e)
    })

    if (filters?.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters?.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    if (filters?.order) {
      params = params.append('order', filters.order.toString())
    }

    if (filters?.direction) {
      params = params.append('direction', filters.direction.toString())
    }

    return this.http.get<ListResponse<CourseMember>>(`/api/v1/courses/${course.id}/members`, {
      params,
    })
  }

  delete(member: CourseMember): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${member.courseId}/members/${member.id}`)
  }
}
