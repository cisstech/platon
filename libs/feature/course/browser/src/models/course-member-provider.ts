import { ListResponse } from "@platon/core/common";
import { Course, CourseMember, CourseMemberFilters, CreateCourseMember } from "@platon/feature/course/common";
import { Observable } from "rxjs";


export abstract class CourseMemberProvider {
  abstract create(course: Course, input: CreateCourseMember): Observable<CourseMember>;
  abstract search(course: Course, filters?: CourseMemberFilters): Observable<ListResponse<CourseMember>>;
  abstract delete(member: CourseMember): Observable<void>;
}
