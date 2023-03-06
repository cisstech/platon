import { Injectable } from "@angular/core";
import { ListResponse } from "@platon/core/common";
import { Course, CourseActivity, CourseActivityFilters, CourseFilters, CourseMember, CourseMemberFilters, CourseSection, CreateCourse, CreateCourseActivity, CreateCourseMember, CreateCourseSection, UpdateCourse, UpdateCourseActivity, UpdateCourseSection } from "@platon/feature/course/common";
import { Observable } from "rxjs";
import { CourseProvider } from "../models/course-provider";

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(
    private readonly provider: CourseProvider
  ) { }

  search(filters?: CourseFilters): Observable<ListResponse<Course>> {
    return this.provider.search(filters);
  }

  find(id: string): Observable<Course> {
    return this.provider.find(id);
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.provider.update(id, input);
  }

  create(input: CreateCourse): Observable<Course> {
    return this.provider.create(input);

  }


  // Members

  createMember(course: Course, input: CreateCourseMember): Observable<ListResponse<CourseMember>> {
    return this.provider.createMember(course, input);
  }

  searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    return this.provider.searchMembers(course, filters);
  }

  deleteMember(member: CourseMember): Observable<void> {
    return this.provider.deleteMember(member);
  }

  // Sections

  findSection(courseId: string, sectionId: string): Observable<CourseSection> {
    return this.provider.findSection(courseId, sectionId);
  }

  listSections(course: Course): Observable<ListResponse<CourseSection>> {
    return this.provider.listSections(course);
  }

  createSection(course: Course, input: CreateCourseSection): Observable<CourseSection> {
    return this.provider.createSection(course, input);
  }

  updateSection(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection> {
    return this.provider.updateSection(section, input);
  }

  deleteSection(section: CourseSection): Observable<void> {
    return this.provider.deleteSection(section);
  }

  // Activities
  findActivity(courseId: string, activityId: string): Observable<CourseActivity> {
    return this.provider.findActivity(courseId, activityId);
  }

  listActivities(course: Course, filters?: CourseActivityFilters): Observable<ListResponse<CourseActivity>> {
    return this.provider.listActivities(course, filters);
  }

  createActivity(course: Course, input: CreateCourseActivity): Observable<CourseActivity> {
    return this.provider.createActivity(course, input);
  }

  updateActivity(activity: CourseActivity, input: UpdateCourseActivity): Observable<CourseActivity> {
    return this.provider.updateActivity(activity, input);
  }

  deleteActivity(activity: CourseActivity): Observable<void> {
    return this.provider.deleteActivity(activity);
  }
}
