import { inject, Injectable } from '@angular/core'
import { CourseService } from '@platon/feature/course/browser/shared'
import { Course, CourseFilters, PlayableActivity } from '@platon/feature/course/common'
import { map, Observable } from 'rxjs'
import { CourseListFilters } from '../courses.vm'

/** How many courses of the whole platform a page holds. */
export const PAGE_SIZE = 20

/** What every course of the list comes with: its headcount and what the person may do with it. */
const EXPANDS: CourseFilters['expands'] = ['statistic', 'permissions']

const queryOf = (filters: CourseListFilters): CourseFilters => {
  const search = filters.search.trim()
  return {
    ...(search ? { search } : {}),
    order: filters.order,
    ...(filters.period ? { period: filters.period } : {}),
  }
}

/** The list of courses: the person's, the platform's for an administrator, archiving, creating. */
@Injectable({ providedIn: 'root' })
export class CoursesApi {
  private readonly courses = inject(CourseService)

  /** The courses of the person, current or archived for themselves. */
  mine(filters: CourseListFilters, archived: boolean): Observable<Course[]> {
    return this.courses
      .search({ ...queryOf(filters), archived, expands: EXPANDS })
      .pipe(map((response) => response.resources))
  }

  /** A page of every course of the platform, for an administrator. */
  platform(filters: CourseListFilters, offset: number): Observable<{ courses: Course[]; total: number }> {
    return this.courses
      .search({ ...queryOf(filters), showAll: true, offset, limit: PAGE_SIZE, expands: EXPANDS })
      .pipe(map((response) => ({ courses: response.resources, total: response.total })))
  }

  /** The activities of a student in every course, for their progress and deadlines. */
  activities(): Observable<PlayableActivity[]> {
    return this.courses.playableActivities()
  }

  /** Archives a course for the person only, or brings it back. */
  archive(courseId: string, archived: boolean): Observable<unknown> {
    return this.courses.archiveMember(courseId, archived)
  }

  create(name: string, desc: string): Observable<Course> {
    return this.courses.create({ name, desc })
  }
}
