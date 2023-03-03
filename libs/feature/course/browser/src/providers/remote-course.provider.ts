import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { Course, CourseFilters, CourseMember, CourseMemberFilters, CreateCourse, UpdateCourse } from "@platon/feature/course/common";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
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

  findById(id: string): Observable<Course> {
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

  findMember(course: Course, userId: string): Observable<CourseMember | undefined> {
    return this.http.get<ItemResponse<CourseMember>>(
      `/api/v1/courses/${course.id}/members/${userId}`
    ).pipe(
      map(response => response.resource),
      catchError(() => {
        return of(undefined);
      })
    );
  }

  deleteMember(course: Course, userId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${course.id}/members/${userId}`
    );
  }

  searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    let params = new HttpParams();
    if (filters.search) {
      params = params.append('search', filters.search);
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    if (filters.order) {
      params = params.append('order', filters.order.toString());
    }

    return this.http.get<ListResponse<CourseMember>>(
      `/api/v1/courses/${course.id}/members`, {
      params
    });
  }
}
