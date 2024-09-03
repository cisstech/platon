import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { buildExpandableHttpParams, buildHttpParams } from '@platon/core/browser'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Course, FindCourse, CourseFilters, CreateCourse, UpdateCourse } from '@platon/feature/course/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { CourseProvider } from '../models/course-provider'

@Injectable()
export class RemoteCourseProvider extends CourseProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  search(filters?: CourseFilters): Observable<ListResponse<Course>> {
    filters = filters || {}
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<Course>>(`/api/v1/courses`, { params })
  }

  find(input: FindCourse): Observable<Course> {
    const params = buildExpandableHttpParams(input)

    return this.http
      .get<ItemResponse<Course>>(`/api/v1/courses/${input.id}`, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    const params = buildExpandableHttpParams(input)
    return this.http
      .patch<ItemResponse<Course>>(`/api/v1/courses/${id}`, input, { params })
      .pipe(map((response) => response.resource))
  }

  delete(course: Course): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${course.id}`)
  }

  create(input: CreateCourse): Observable<Course> {
    const params = buildExpandableHttpParams(input)

    return this.http
      .post<ItemResponse<Course>>('/api/v1/courses', input, {
        params,
      })
      .pipe(map((response) => response.resource))
  }
}
