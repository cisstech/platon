import { inject, Injectable } from '@angular/core'
import { CourseService } from '@platon/feature/course/browser/shared'
import { Course, CourseSection, PlayableActivity, TaughtActivity } from '@platon/feature/course/common'
import { map, Observable } from 'rxjs'

/** The page of a course: the course, its sections, and its activities as its teacher or a student reads them. */
@Injectable({ providedIn: 'root' })
export class CourseApi {
  private readonly courses = inject(CourseService)

  /** The course, with its headcount and what the person may do with it. */
  course(id: string): Observable<Course> {
    return this.courses.find({ id, expands: ['permissions', 'statistic'] })
  }

  /** Its sections; the service only reads the identifier of the course it is given. */
  sections(id: string): Observable<CourseSection[]> {
    return this.courses.listSections({ id } as Course).pipe(map((response) => response.resources))
  }

  /** Its activities as its teacher reads them: their own dates, their participation, their copies to correct. */
  taught(id: string): Observable<TaughtActivity[]> {
    return this.courses.taughtActivities(id)
  }

  /** Its activities as a student plays them: their dates, their progress, their grade. */
  playable(id: string): Observable<PlayableActivity[]> {
    return this.courses.playableActivities(id)
  }
}
