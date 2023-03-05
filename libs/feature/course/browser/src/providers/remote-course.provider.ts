import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { Course, CourseActivity, CourseActivityFilters, CourseFilters, CourseMember, CourseMemberFilters, CourseSection, CreateCourse, CreateCourseActivity, CreateCourseMember, CreateCourseSection, UpdateCourse, UpdateCourseActivity, UpdateCourseSection } from "@platon/feature/course/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CourseProvider } from "../models/course-provider";

@Injectable()
export class RemoteCourseProvider extends CourseProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  search(filters?: CourseFilters): Observable<ListResponse<Course>> {
    filters = filters || {};
    let params = new HttpParams();

    if (filters.search) {
      params = params.append('search', filters.search);
    }

    filters.members?.forEach(e => {
      params = params.append('members', e);
    });

    if (filters.order) {
      params = params.append('order', filters.order);
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction);
    }

    if (filters.period) {
      params = params.append('period', filters.period.toString());
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    return this.http.get<ListResponse<Course>>(`/api/v1/courses`, { params });
  }

  find(id: string): Observable<Course> {
    return this.http.get<ItemResponse<Course>>(`/api/v1/courses/${id}`).pipe(
      map(response => response.resource)
    );
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.http.patch<ItemResponse<Course>>(`/api/v1/courses/${id}`, input).pipe(
      map(response => response.resource)
    );
  }

  create(input: CreateCourse): Observable<Course> {
    return this.http.post<ItemResponse<Course>>('/api/v1/courses', input).pipe(
      map(response => response.resource)
    );
  }


  // Members
  createMember(course: Course, input: CreateCourseMember): Observable<ListResponse<CourseMember>> {
    return this.http.post<ListResponse<CourseMember>>(`/api/v1/courses/${course.id}/members`, input);
  }

  searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    let params = new HttpParams();

    if (filters.search) {
      params = params.append('search', filters.search);
    }

    filters.roles?.forEach(e => {
      params = params.append('roles', e);
    });

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    if (filters.order) {
      params = params.append('order', filters.order.toString());
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction.toString());
    }

    return this.http.get<ListResponse<CourseMember>>(
      `/api/v1/courses/${course.id}/members`, {
      params
    });
  }

  deleteMember(member: CourseMember): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${member.courseId}/members/${member.id}`
    );
  }

  // Sections

  findSection(courseId: string, sectionId: string): Observable<CourseSection> {
    return this.http.get<ItemResponse<CourseSection>>(
      `/api/v1/courses/${courseId}/sections/${sectionId}`
    ).pipe(
      map(response => response.resource)
    );
  }

  listSections(course: Course): Observable<ListResponse<CourseSection>> {
    return this.http.get<ListResponse<CourseSection>>(`/api/v1/courses/${course.id}/sections`);
  }

  createSection(course: Course, input: CreateCourseSection): Observable<CourseSection> {
    return this.http.post<ItemResponse<CourseSection>>(`/api/v1/courses/${course.id}/sections`, input).pipe(
      map(response => response.resource)
    );
  }

  updateSection(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection> {
    return this.http.patch<ItemResponse<CourseSection>>(
      `/api/v1/courses/${section.courseId}/sections/${section.id}`, input
    ).pipe(
      map(response => response.resource)
    );
  }

  deleteSection(section: CourseSection): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${section.courseId}/sections/${section.id}`
    );
  }

  // Activities

  listActivities(course: Course, filters?: CourseActivityFilters): Observable<ListResponse<CourseActivity>> {
    filters = filters || {};
    let params = new HttpParams();

    if (filters.sectionId) {
      params = params.append('sectionId', filters.sectionId);
    }


    return this.http.get<ListResponse<CourseActivity>>(
      `/api/v1/courses/${course.id}/activities`, { params }
    );
  }

  createActivity(course: Course, input: CreateCourseActivity): Observable<CourseActivity> {
    return this.http.post<ItemResponse<CourseActivity>>(`/api/v1/courses/${course.id}/activities`, input).pipe(
      map(response => response.resource)
    );
  }

  updateActivity(activity: CourseActivity, input: UpdateCourseActivity): Observable<CourseActivity> {
    return this.http.patch<ItemResponse<CourseActivity>>(
      `/api/v1/courses/${activity.courseId}/activities/${activity.id}`, input
    ).pipe(
      map(response => response.resource)
    );
  }

  deleteActivity(activity: CourseActivity): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${activity.courseId}/activities/${activity.id}`
    );
  }
}
