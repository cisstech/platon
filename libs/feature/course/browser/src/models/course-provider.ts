import { ListResponse } from "@platon/core/common";
import { Course, CourseFilters, CourseMember, CourseMemberFilters, CreateCourse, UpdateCourse } from "@platon/feature/course/common";
import { Observable } from "rxjs";


export abstract class CourseProvider {
  abstract search(filters?: CourseFilters): Observable<ListResponse<Course>>;
  abstract findById(id: string): Observable<Course>;
  abstract update(id: string, input: UpdateCourse): Observable<Course>;
  abstract create(input: CreateCourse): Observable<Course>;

  // Members

  abstract findMember(course: Course, userId: string): Observable<CourseMember | undefined>;
  abstract deleteMember(course: Course, userId: string): Observable<void>;
  abstract searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>>;
}
