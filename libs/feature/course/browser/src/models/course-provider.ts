import { ListResponse } from '@platon/core/common'
import { Course, CourseFilters, CreateCourse, FindCourse, UpdateCourse } from '@platon/feature/course/common'
import { Observable } from 'rxjs'

export abstract class CourseProvider {
  abstract search(filters?: CourseFilters): Observable<ListResponse<Course>>
  abstract find(input: FindCourse): Observable<Course>
  abstract update(id: string, input: UpdateCourse): Observable<Course>
  abstract create(input: CreateCourse): Observable<Course>
}
