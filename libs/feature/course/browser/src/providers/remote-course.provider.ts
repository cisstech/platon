import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Course, CourseFilters, CreateCourse, UpdateCourse } from '@platon/feature/course/common'
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
    let params = new HttpParams()

    if (filters.search) {
      params = params.append('search', filters.search)
    }

    filters.members?.forEach((e) => {
      params = params.append('members', e)
    })

    if (filters.order) {
      params = params.append('order', filters.order)
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction)
    }

    if (filters.period) {
      params = params.append('period', filters.period.toString())
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    return this.http.get<ListResponse<Course>>(`/api/v1/courses`, { params })
  }

  find(id: string): Observable<Course> {
    return this.http.get<ItemResponse<Course>>(`/api/v1/courses/${id}`).pipe(map((response) => response.resource))
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.http
      .patch<ItemResponse<Course>>(`/api/v1/courses/${id}`, input)
      .pipe(map((response) => response.resource))
  }

  create(input: CreateCourse): Observable<Course> {
    return this.http.post<ItemResponse<Course>>('/api/v1/courses', input).pipe(map((response) => response.resource))
  }
}
