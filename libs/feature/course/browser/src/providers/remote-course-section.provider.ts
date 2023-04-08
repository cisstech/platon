import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { Course, CourseSection, CreateCourseSection, UpdateCourseSection } from "@platon/feature/course/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CourseSectionProvider } from "../models/course-section-provider";

@Injectable()
export class RemoteCourseSectionProvider extends CourseSectionProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  find(courseId: string, sectionId: string): Observable<CourseSection> {
    return this.http.get<ItemResponse<CourseSection>>(
      `/api/v1/courses/${courseId}/sections/${sectionId}`
    ).pipe(
      map(response => response.resource)
    );
  }

  list(course: Course): Observable<ListResponse<CourseSection>> {
    return this.http.get<ListResponse<CourseSection>>(`/api/v1/courses/${course.id}/sections`);
  }

  create(course: Course, input: CreateCourseSection): Observable<CourseSection> {
    return this.http.post<ItemResponse<CourseSection>>(`/api/v1/courses/${course.id}/sections`, input).pipe(
      map(response => response.resource)
    );
  }

  update(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection> {
    return this.http.patch<ItemResponse<CourseSection>>(
      `/api/v1/courses/${section.courseId}/sections/${section.id}`, input
    ).pipe(
      map(response => response.resource)
    );
  }

  delete(section: CourseSection): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${section.courseId}/sections/${section.id}`
    );
  }
}
