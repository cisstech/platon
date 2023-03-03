import { Injectable } from "@angular/core";
import { ListResponse } from "@platon/core/common";
import { Course, CourseFilters, CourseMember, CourseMemberFilters, CreateCourse, UpdateCourse } from "@platon/feature/course/common";
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

  findById(id: string): Observable<Course> {
    return this.provider.findById(id);
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.provider.update(id, input);
  }

  create(input: CreateCourse): Observable<Course> {
    return this.provider.create(input);

  }


  // Members

  findMember(course: Course, userId: string): Observable<CourseMember | undefined> {
    return this.provider.findMember(course, userId);
  }

  deleteMember(course: Course, userId: string): Observable<void> {
    return this.provider.deleteMember(course, userId);
  }

  searchMembers(course: Course, filters: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    return this.provider.searchMembers(course, filters);
  }
}
