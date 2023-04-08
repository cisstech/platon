import { ListResponse } from "@platon/core/common";
import { Course, CourseSection, CreateCourseSection, UpdateCourseSection } from "@platon/feature/course/common";
import { Observable } from "rxjs";

export abstract class CourseSectionProvider {
  abstract find(courseId: string, sectionId: string): Observable<CourseSection>;
  abstract list(course: Course): Observable<ListResponse<CourseSection>>;
  abstract create(course: Course, input: CreateCourseSection): Observable<CourseSection>;
  abstract update(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection>;
  abstract delete(section: CourseSection): Observable<void>;
}
