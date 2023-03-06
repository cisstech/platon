import { ListResponse } from "@platon/core/common";
import { Course, CourseActivity, CourseActivityFilters, CourseFilters, CourseMember, CourseMemberFilters, CourseSection, CreateCourse, CreateCourseActivity, CreateCourseMember, CreateCourseSection, UpdateCourse, UpdateCourseActivity, UpdateCourseSection } from "@platon/feature/course/common";
import { Observable } from "rxjs";


export abstract class CourseProvider {
  abstract search(filters?: CourseFilters): Observable<ListResponse<Course>>;
  abstract find(id: string): Observable<Course>;
  abstract update(id: string, input: UpdateCourse): Observable<Course>;
  abstract create(input: CreateCourse): Observable<Course>;

  // Members

  abstract createMember(course: Course, input: CreateCourseMember): Observable<ListResponse<CourseMember>>;
  abstract searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>>;
  abstract deleteMember(member: CourseMember): Observable<void>;

  // Sections

  abstract findSection(courseId: string, sectionId: string): Observable<CourseSection>;
  abstract listSections(course: Course): Observable<ListResponse<CourseSection>>;
  abstract createSection(course: Course, input: CreateCourseSection): Observable<CourseSection>;
  abstract updateSection(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection>;
  abstract deleteSection(section: CourseSection): Observable<void>;

  // Activities

  abstract findActivity(courseId: string, activityId: string): Observable<CourseActivity>;
  abstract listActivities(course: Course, filters?: CourseActivityFilters): Observable<ListResponse<CourseActivity>>;
  abstract createActivity(course: Course, input: CreateCourseActivity): Observable<CourseActivity>;
  abstract updateActivity(activity: CourseActivity, input: UpdateCourseActivity): Observable<CourseActivity>;
  abstract deleteActivity(activity: CourseActivity): Observable<void>;
}
