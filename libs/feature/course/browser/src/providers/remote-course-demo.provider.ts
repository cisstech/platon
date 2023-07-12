import { Injectable } from '@angular/core'
import { CourseDemoProvider } from '../models/course-demo-provider'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, map, of, throwError } from 'rxjs'
import { CourseDemo, CourseDemoAccessResponse, CourseDemoGetResponse } from '@platon/feature/course/common'
import { ItemResponse } from '@platon/core/common'
import { Optional } from 'typescript-optional'

@Injectable()
export class RemoteCourseDemoProvider extends CourseDemoProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  override access(uri: string): Observable<CourseDemoAccessResponse> {
    return this.http
      .get<ItemResponse<CourseDemoAccessResponse>>('/api/v1/courses/demo/access/' + uri)
      .pipe(map((response) => response.resource))
  }
  override create(courseId: string): Observable<CourseDemo> {
    return this.http
      .post<ItemResponse<CourseDemo>>('/api/v1/courses/demo', { courseId })
      .pipe(map((response) => response.resource))
  }

  override get(courseId: string): Observable<Optional<CourseDemo>> {
    return this.http.get<ItemResponse<CourseDemoGetResponse>>('/api/v1/courses/demo/' + courseId).pipe(
      map((response) => {
        if (response.resource.demoExists) {
          const resource = response.resource as Required<CourseDemoGetResponse>
          return Optional.ofNonNull(resource.demo)
        } else {
          return Optional.empty()
        }
      })
    )
  }
  override delete(courseId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/demo/${courseId}`)
  }
}
